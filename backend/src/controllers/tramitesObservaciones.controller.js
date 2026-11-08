const pool =
  require('../config/database');

const {
  registrarEvento
} = require(
  '../services/auditoria.service'
);


// ============================================================
// UTILIDADES
// ============================================================

function idValido(valor) {

  const numero =
    Number(valor);

  return (
    Number.isInteger(numero) &&
    numero > 0
  );
}


// ============================================================
// LISTAR OBSERVACIONES Y SUBSANACIONES
// HU-028
// ============================================================

async function listarObservacionesTramite(
  req,
  res
) {

  try {

    const tramiteId =
      Number(req.params.id);


    if (
      !idValido(tramiteId)
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El identificador del trámite no es válido'
      });
    }


    const tramiteResultado =
      await pool.query(
        `
          SELECT
            id,
            numero_expediente,
            estado_codigo

          FROM tramites

          WHERE id = $1

          LIMIT 1;
        `,
        [
          tramiteId
        ]
      );


    if (
      tramiteResultado.rowCount === 0
    ) {

      return res.status(404).json({
        ok: false,
        mensaje:
          'El trámite no existe'
      });
    }


    const observacionesResultado =
      await pool.query(
        `
          SELECT
            o.id,
            o.tramite_id,
            o.descripcion,
            o.fecha_observacion,
            o.estado,

            o.responsable_usuario_id,

            u.nombres
              AS responsable_nombres,

            u.apellidos
              AS responsable_apellidos,

            o.fecha_creacion,
            o.fecha_actualizacion

          FROM tramite_observaciones o

          INNER JOIN usuarios u
            ON u.id =
               o.responsable_usuario_id

          WHERE
            o.tramite_id = $1

          ORDER BY
            o.fecha_observacion DESC,
            o.id DESC;
        `,
        [
          tramiteId
        ]
      );


    const observaciones = [];


    for (
      const observacion
      of observacionesResultado.rows
    ) {

      const subsanacionesResultado =
        await pool.query(
          `
            SELECT
              s.id,
              s.observacion_id,
              s.descripcion,
              s.fecha_subsanacion,

              s.responsable_usuario_id,

              u.nombres
                AS responsable_nombres,

              u.apellidos
                AS responsable_apellidos,

              s.fecha_creacion

            FROM tramite_subsanaciones s

            INNER JOIN usuarios u
              ON u.id =
                 s.responsable_usuario_id

            WHERE
              s.observacion_id = $1

            ORDER BY
              s.fecha_subsanacion DESC,
              s.id DESC;
          `,
          [
            observacion.id
          ]
        );


      observaciones.push({

        id:
          observacion.id,

        tramiteId:
          observacion.tramite_id,

        descripcion:
          observacion.descripcion,

        fechaObservacion:
          observacion.fecha_observacion,

        estado:
          observacion.estado,

        responsable: {

          id:
            observacion.responsable_usuario_id,

          nombreCompleto:
            `${observacion.responsable_nombres} ${observacion.responsable_apellidos}`
        },

        fechaCreacion:
          observacion.fecha_creacion,

        fechaActualizacion:
          observacion.fecha_actualizacion,

        subsanaciones:
          subsanacionesResultado.rows.map(
            (subsanacion) => ({

              id:
                subsanacion.id,

              observacionId:
                subsanacion.observacion_id,

              descripcion:
                subsanacion.descripcion,

              fechaSubsanacion:
                subsanacion.fecha_subsanacion,

              responsable: {

                id:
                  subsanacion.responsable_usuario_id,

                nombreCompleto:
                  `${subsanacion.responsable_nombres} ${subsanacion.responsable_apellidos}`
              },

              fechaCreacion:
                subsanacion.fecha_creacion
            })
          )
      });
    }


    return res.status(200).json({

      ok: true,

      tramite: {

        id:
          tramiteResultado.rows[0].id,

        numeroExpediente:
          tramiteResultado.rows[0]
            .numero_expediente,

        estado:
          tramiteResultado.rows[0]
            .estado_codigo
      },

      observaciones
    });


  } catch (error) {

    console.error(
      'Error listando observaciones:',
      error
    );


    return res.status(500).json({
      ok: false,
      mensaje:
        'Error interno del servidor'
    });
  }
}


// ============================================================
// REGISTRAR OBSERVACIÓN
// HU-028
// ============================================================

async function registrarObservacion(
  req,
  res
) {

  const cliente =
    await pool.connect();


  try {

    const usuarioId =
      req.usuario?.usuarioId;


    const tramiteId =
      Number(req.params.id);


    if (
      !idValido(usuarioId)
    ) {

      return res.status(401).json({
        ok: false,
        mensaje:
          'Usuario no autenticado'
      });
    }


    if (
      !idValido(tramiteId)
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El identificador del trámite no es válido'
      });
    }


    const descripcion =
      typeof req.body.descripcion === 'string'
        ? req.body.descripcion.trim()
        : '';


    if (
      !descripcion
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'La descripción de la observación es obligatoria'
      });
    }


    if (
      descripcion.length > 1500
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'La observación no puede superar 1500 caracteres'
      });
    }


    await cliente.query(
      'BEGIN'
    );


    // ========================================================
    // OBTENER Y BLOQUEAR TRÁMITE
    // ========================================================

    const tramiteResultado =
      await cliente.query(
        `
          SELECT
            id,
            numero_expediente,
            estado_codigo

          FROM tramites

          WHERE id = $1

          FOR UPDATE;
        `,
        [
          tramiteId
        ]
      );


    if (
      tramiteResultado.rowCount === 0
    ) {

      await cliente.query(
        'ROLLBACK'
      );


      return res.status(404).json({
        ok: false,
        mensaje:
          'El trámite no existe'
      });
    }


    const tramite =
      tramiteResultado.rows[0];


    const estadosPermitidos = [
      'PENDIENTE',
      'EN_TRAMITE',
      'OBSERVADO',
      'SUBSANADO'
    ];


    if (
      !estadosPermitidos.includes(
        tramite.estado_codigo
      )
    ) {

      await cliente.query(
        'ROLLBACK'
      );


      return res.status(409).json({
        ok: false,
        mensaje:
          'El trámite se encuentra en un estado que no permite registrar nuevas observaciones'
      });
    }


    // ========================================================
    // REGISTRAR OBSERVACIÓN
    // ========================================================

    const observacionResultado =
      await cliente.query(
        `
          INSERT INTO tramite_observaciones (
            tramite_id,
            descripcion,
            responsable_usuario_id,
            creado_por
          )
          VALUES (
            $1,
            $2,
            $3,
            $3
          )
          RETURNING
            id,
            tramite_id,
            descripcion,
            fecha_observacion,
            responsable_usuario_id,
            estado,
            fecha_creacion;
        `,
        [
          tramiteId,
          descripcion,
          Number(usuarioId)
        ]
      );


    const observacion =
      observacionResultado.rows[0];


    // ========================================================
    // ACTUALIZAR ESTADO A OBSERVADO CUANDO CORRESPONDA
    // ========================================================

    if (
      tramite.estado_codigo !==
      'OBSERVADO'
    ) {

      await cliente.query(
        `
          UPDATE tramites

          SET
            estado_codigo =
              'OBSERVADO',

            fecha_actualizacion =
              NOW()

          WHERE id = $1;
        `,
        [
          tramiteId
        ]
      );


      await cliente.query(
        `
          INSERT INTO tramite_estado_historial (
            tramite_id,
            estado_anterior_codigo,
            estado_nuevo_codigo,
            comentario,
            usuario_id
          )
          VALUES (
            $1,
            $2,
            'OBSERVADO',
            $3,
            $4
          );
        `,
        [
          tramiteId,
          tramite.estado_codigo,
          `Observación registrada: ${descripcion}`,
          Number(usuarioId)
        ]
      );
    }


    await cliente.query(
      'COMMIT'
    );


    // ========================================================
    // AUDITORÍA
    // ========================================================

    await registrarEvento({

      usuarioId:
        Number(usuarioId),

      evento:
        'TRAMITE_OBSERVACION_REGISTRADA',

      modulo:
        'TRAMITES',

      descripcion:
        `Se registró una observación en el trámite ${tramiteId}`,

      entidad:
        'tramite_observaciones',

      registroId:
        observacion.id,

      datosAnteriores:
        null,

      datosNuevos: {

        tramiteId,

        descripcion,

        estado:
          'ABIERTA'
      },

      ip:
        req.ip,

      userAgent:
        req.headers[
          'user-agent'
        ]
    });


    return res.status(201).json({

      ok: true,

      mensaje:
        'Observación registrada correctamente',

      observacion: {

        id:
          observacion.id,

        tramiteId:
          observacion.tramite_id,

        descripcion:
          observacion.descripcion,

        fechaObservacion:
          observacion.fecha_observacion,

        responsableUsuarioId:
          observacion.responsable_usuario_id,

        estado:
          observacion.estado
      },

      estadoTramite:
        'OBSERVADO'
    });


  } catch (error) {

    try {

      await cliente.query(
        'ROLLBACK'
      );

    } catch (
      errorRollback
    ) {

      console.error(
        'Error realizando rollback:',
        errorRollback
      );
    }


    console.error(
      'Error registrando observación:',
      error
    );


    return res.status(500).json({
      ok: false,
      mensaje:
        'Error interno del servidor'
    });


  } finally {

    cliente.release();
  }
}


// ============================================================
// REGISTRAR SUBSANACIÓN
// HU-028
// ============================================================

async function registrarSubsanacion(
  req,
  res
) {

  const cliente =
    await pool.connect();


  try {

    const usuarioId =
      req.usuario?.usuarioId;


    const observacionId =
      Number(
        req.params.observacionId
      );


    if (
      !idValido(usuarioId)
    ) {

      return res.status(401).json({
        ok: false,
        mensaje:
          'Usuario no autenticado'
      });
    }


    if (
      !idValido(observacionId)
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El identificador de la observación no es válido'
      });
    }


    const descripcion =
      typeof req.body.descripcion === 'string'
        ? req.body.descripcion.trim()
        : '';


    if (
      !descripcion
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'La descripción de la subsanación es obligatoria'
      });
    }


    if (
      descripcion.length > 1500
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'La subsanación no puede superar 1500 caracteres'
      });
    }


    await cliente.query(
      'BEGIN'
    );


    // ========================================================
    // OBTENER OBSERVACIÓN
    // ========================================================

    const observacionResultado =
      await cliente.query(
        `
          SELECT
            o.id,
            o.tramite_id,
            o.descripcion,
            o.estado,

            t.estado_codigo
              AS estado_tramite

          FROM tramite_observaciones o

          INNER JOIN tramites t
            ON t.id =
               o.tramite_id

          WHERE
            o.id = $1

          FOR UPDATE;
        `,
        [
          observacionId
        ]
      );


    if (
      observacionResultado.rowCount === 0
    ) {

      await cliente.query(
        'ROLLBACK'
      );


      return res.status(404).json({
        ok: false,
        mensaje:
          'La observación no existe'
      });
    }


    const observacion =
      observacionResultado.rows[0];


    if (
      observacion.estado !==
      'ABIERTA'
    ) {

      await cliente.query(
        'ROLLBACK'
      );


      return res.status(409).json({
        ok: false,
        mensaje:
          'La observación ya fue subsanada'
      });
    }


    // ========================================================
    // REGISTRAR SUBSANACIÓN
    // ========================================================

    const subsanacionResultado =
      await cliente.query(
        `
          INSERT INTO tramite_subsanaciones (
            observacion_id,
            descripcion,
            responsable_usuario_id,
            creado_por
          )
          VALUES (
            $1,
            $2,
            $3,
            $3
          )
          RETURNING
            id,
            observacion_id,
            descripcion,
            fecha_subsanacion,
            responsable_usuario_id,
            fecha_creacion;
        `,
        [
          observacionId,
          descripcion,
          Number(usuarioId)
        ]
      );


    const subsanacion =
      subsanacionResultado.rows[0];


    // ========================================================
    // CERRAR OBSERVACIÓN
    // ========================================================

    await cliente.query(
      `
        UPDATE tramite_observaciones

        SET
          estado =
            'SUBSANADA',

          fecha_actualizacion =
            NOW()

        WHERE id = $1;
      `,
      [
        observacionId
      ]
    );


    // ========================================================
    // VERIFICAR SI QUEDAN OBSERVACIONES ABIERTAS
    // ========================================================

    const abiertasResultado =
      await cliente.query(
        `
          SELECT
            COUNT(*)::INTEGER
              AS total

          FROM tramite_observaciones

          WHERE
            tramite_id = $1
            AND estado = 'ABIERTA';
        `,
        [
          observacion.tramite_id
        ]
      );


    const abiertas =
      abiertasResultado.rows[0]
        .total;


    let estadoTramite =
      observacion.estado_tramite;


    // ========================================================
    // SI YA NO HAY OBSERVACIONES ABIERTAS -> SUBSANADO
    // ========================================================

    if (
      abiertas === 0 &&
      observacion.estado_tramite ===
        'OBSERVADO'
    ) {

      await cliente.query(
        `
          UPDATE tramites

          SET
            estado_codigo =
              'SUBSANADO',

            fecha_actualizacion =
              NOW()

          WHERE id = $1;
        `,
        [
          observacion.tramite_id
        ]
      );


      await cliente.query(
        `
          INSERT INTO tramite_estado_historial (
            tramite_id,
            estado_anterior_codigo,
            estado_nuevo_codigo,
            comentario,
            usuario_id
          )
          VALUES (
            $1,
            'OBSERVADO',
            'SUBSANADO',
            $2,
            $3
          );
        `,
        [
          observacion.tramite_id,
          `Subsanación registrada: ${descripcion}`,
          Number(usuarioId)
        ]
      );


      estadoTramite =
        'SUBSANADO';
    }


    await cliente.query(
      'COMMIT'
    );


    // ========================================================
    // AUDITORÍA
    // ========================================================

    await registrarEvento({

      usuarioId:
        Number(usuarioId),

      evento:
        'TRAMITE_SUBSANACION_REGISTRADA',

      modulo:
        'TRAMITES',

      descripcion:
        `Se registró una subsanación para la observación ${observacionId}`,

      entidad:
        'tramite_subsanaciones',

      registroId:
        subsanacion.id,

      datosAnteriores: {

        observacionId,

        estadoObservacion:
          'ABIERTA'
      },

      datosNuevos: {

        observacionId,

        descripcion,

        estadoObservacion:
          'SUBSANADA',

        estadoTramite
      },

      ip:
        req.ip,

      userAgent:
        req.headers[
          'user-agent'
        ]
    });


    return res.status(201).json({

      ok: true,

      mensaje:
        'Subsanación registrada correctamente',

      subsanacion: {

        id:
          subsanacion.id,

        observacionId:
          subsanacion.observacion_id,

        descripcion:
          subsanacion.descripcion,

        fechaSubsanacion:
          subsanacion.fecha_subsanacion,

        responsableUsuarioId:
          subsanacion.responsable_usuario_id
      },

      estadoObservacion:
        'SUBSANADA',

      estadoTramite
    });


  } catch (error) {

    try {

      await cliente.query(
        'ROLLBACK'
      );

    } catch (
      errorRollback
    ) {

      console.error(
        'Error realizando rollback:',
        errorRollback
      );
    }


    console.error(
      'Error registrando subsanación:',
      error
    );


    return res.status(500).json({
      ok: false,
      mensaje:
        'Error interno del servidor'
    });


  } finally {

    cliente.release();
  }
}


// ============================================================
// EXPORTAR
// ============================================================

module.exports = {
  listarObservacionesTramite,
  registrarObservacion,
  registrarSubsanacion
};