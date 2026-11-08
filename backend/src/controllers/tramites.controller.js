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


function fechaValida(valor) {

  if (
    typeof valor !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(valor)
  ) {
    return false;
  }

  const fecha =
    new Date(
      `${valor}T00:00:00.000Z`
    );

  if (
    Number.isNaN(
      fecha.getTime()
    )
  ) {
    return false;
  }

  return (
    fecha.toISOString()
      .slice(0, 10) === valor
  );
}


// ============================================================
// REGISTRAR TRÁMITE
// HU-026
// ============================================================

async function registrarTramite(
  req,
  res
) {

  const cliente =
    await pool.connect();

  try {

    const usuarioId =
      req.usuario?.usuarioId;


    if (
      !usuarioId ||
      !idValido(usuarioId)
    ) {

      return res.status(401).json({
        ok: false,
        mensaje:
          'Usuario no autenticado'
      });
    }


    const {
      documentoId,
      entidadEmisoraId,
      numeroExpediente,
      fechaInicio,
      responsableUsuarioId,
      observaciones
    } = req.body;


    // ========================================================
    // VALIDAR DOCUMENTO
    // ========================================================

    if (
      !idValido(documentoId)
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El documento es obligatorio y debe ser válido'
      });
    }


    // ========================================================
    // VALIDAR ENTIDAD
    // ========================================================

    if (
      !idValido(entidadEmisoraId)
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'La entidad emisora es obligatoria y debe ser válida'
      });
    }


    // ========================================================
    // VALIDAR EXPEDIENTE
    // ========================================================

    if (
      typeof numeroExpediente !== 'string' ||
      numeroExpediente.trim().length === 0
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El número de expediente es obligatorio'
      });
    }


    if (
      numeroExpediente.trim().length > 120
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El número de expediente no puede superar 120 caracteres'
      });
    }


    // ========================================================
    // VALIDAR FECHA
    // ========================================================

    if (
      !fechaValida(fechaInicio)
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'La fecha de inicio no es válida'
      });
    }


    // ========================================================
    // VALIDAR RESPONSABLE
    // ========================================================

    if (
      !idValido(
        responsableUsuarioId
      )
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El responsable es obligatorio y debe ser válido'
      });
    }


    // ========================================================
    // VALIDAR OBSERVACIONES
    // ========================================================

    const observacionesLimpias =
      typeof observaciones === 'string'
        ? observaciones.trim()
        : '';


    if (
      observacionesLimpias.length >
      1500
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'Las observaciones no pueden superar 1500 caracteres'
      });
    }


    // ========================================================
    // INICIAR TRANSACCIÓN
    // ========================================================

    await cliente.query(
      'BEGIN'
    );


    // ========================================================
    // COMPROBAR DOCUMENTO
    // ========================================================

    const resultadoDocumento =
      await cliente.query(
        `
          SELECT
            id,
            codigo_interno,
            numero_documento,
            condicion_registro

          FROM documentos

          WHERE id = $1

          LIMIT 1

          FOR UPDATE;
        `,
        [
          Number(documentoId)
        ]
      );


    if (
      resultadoDocumento.rowCount === 0
    ) {

      await cliente.query(
        'ROLLBACK'
      );

      return res.status(404).json({
        ok: false,
        mensaje:
          'El documento no existe'
      });
    }


    const documento =
      resultadoDocumento.rows[0];


    if (
      documento.condicion_registro !==
      'ACTIVO'
    ) {

      await cliente.query(
        'ROLLBACK'
      );

      return res.status(409).json({
        ok: false,
        mensaje:
          'No se puede registrar un trámite para un documento archivado o anulado'
      });
    }


    // ========================================================
    // COMPROBAR ENTIDAD EMISORA
    // ========================================================

    const resultadoEntidad =
      await cliente.query(
        `
          SELECT
            id,
            nombre

          FROM entidades_emisoras

          WHERE id = $1
            AND activo = TRUE

          LIMIT 1;
        `,
        [
          Number(
            entidadEmisoraId
          )
        ]
      );


    if (
      resultadoEntidad.rowCount === 0
    ) {

      await cliente.query(
        'ROLLBACK'
      );

      return res.status(400).json({
        ok: false,
        mensaje:
          'La entidad emisora no existe o se encuentra inactiva'
      });
    }


    // ========================================================
    // COMPROBAR RESPONSABLE
    // ========================================================

    const resultadoResponsable =
      await cliente.query(
        `
          SELECT
            id,
            nombres,
            apellidos

          FROM usuarios

          WHERE id = $1
            AND activo = TRUE

          LIMIT 1;
        `,
        [
          Number(
            responsableUsuarioId
          )
        ]
      );


    if (
      resultadoResponsable.rowCount ===
      0
    ) {

      await cliente.query(
        'ROLLBACK'
      );

      return res.status(400).json({
        ok: false,
        mensaje:
          'El responsable no existe o se encuentra inactivo'
      });
    }


    // ========================================================
    // COMPROBAR ESTADO INICIAL
    // ========================================================

    const resultadoEstado =
      await cliente.query(
        `
          SELECT
            codigo,
            nombre

          FROM tramite_estados

          WHERE codigo = 'PENDIENTE'
            AND activo = TRUE

          LIMIT 1;
        `
      );


    if (
      resultadoEstado.rowCount === 0
    ) {

      await cliente.query(
        'ROLLBACK'
      );

      return res.status(500).json({
        ok: false,
        mensaje:
          'No se encuentra configurado el estado inicial del trámite'
      });
    }


    // ========================================================
    // REGISTRAR TRÁMITE
    // ========================================================

    const resultadoTramite =
      await cliente.query(
        `
          INSERT INTO tramites (
            documento_id,
            entidad_emisora_id,
            numero_expediente,
            fecha_inicio,
            fecha_finalizacion,
            responsable_usuario_id,
            estado_codigo,
            observaciones,
            creado_por
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            NULL,
            $5,
            'PENDIENTE',
            $6,
            $7
          )
          RETURNING
            id,
            documento_id,
            entidad_emisora_id,
            numero_expediente,
            fecha_inicio,
            fecha_finalizacion,
            responsable_usuario_id,
            estado_codigo,
            observaciones,
            creado_por,
            fecha_creacion,
            fecha_actualizacion;
        `,
        [
          Number(documentoId),
          Number(entidadEmisoraId),
          numeroExpediente.trim(),
          fechaInicio,
          Number(
            responsableUsuarioId
          ),
          observacionesLimpias ||
            null,
          Number(usuarioId)
        ]
      );


    const tramite =
      resultadoTramite.rows[0];


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
        'TRAMITE_REGISTRADO',

      modulo:
        'TRAMITES',

      descripcion:
        `Se registró el trámite ${tramite.id} para el documento ${documento.codigo_interno}`,

      entidad:
        'tramites',

      registroId:
        tramite.id,

      datosAnteriores:
        null,

      datosNuevos: {

        documentoId:
          tramite.documento_id,

        entidadEmisoraId:
          tramite.entidad_emisora_id,

        numeroExpediente:
          tramite.numero_expediente,

        fechaInicio:
          tramite.fecha_inicio,

        responsableUsuarioId:
          tramite.responsable_usuario_id,

        estado:
          tramite.estado_codigo,

        observaciones:
          tramite.observaciones
      },

      ip:
        req.ip,

      userAgent:
        req.headers[
          'user-agent'
        ]
    });


    // ========================================================
    // RESPUESTA
    // ========================================================

    return res.status(201).json({

      ok: true,

      mensaje:
        'Trámite registrado correctamente',

      tramite: {

        id:
          tramite.id,

        documentoId:
          tramite.documento_id,

        entidadEmisoraId:
          tramite.entidad_emisora_id,

        numeroExpediente:
          tramite.numero_expediente,

        fechaInicio:
          tramite.fecha_inicio,

        fechaFinalizacion:
          tramite.fecha_finalizacion,

        responsableUsuarioId:
          tramite.responsable_usuario_id,

        estado:
          tramite.estado_codigo,

        observaciones:
          tramite.observaciones,

        creadoPor:
          tramite.creado_por,

        fechaCreacion:
          tramite.fecha_creacion
      }
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
        'Error realizando rollback de trámite:',
        errorRollback
      );
    }


    console.error(
      'Error registrando trámite:',
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
  registrarTramite
};