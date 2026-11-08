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
// TRANSICIONES PERMITIDAS
// HU-027
// ============================================================

const TRANSICIONES_PERMITIDAS = {

  PENDIENTE: [
    'EN_TRAMITE',
    'OBSERVADO',
    'RECHAZADO'
  ],

  EN_TRAMITE: [
    'OBSERVADO',
    'APROBADO',
    'RECHAZADO'
  ],

  OBSERVADO: [
    'SUBSANADO',
    'RECHAZADO'
  ],

  SUBSANADO: [
    'EN_TRAMITE',
    'APROBADO',
    'RECHAZADO'
  ],

  APROBADO: [
    'EMITIDO'
  ],

  RECHAZADO: [],

  EMITIDO: []
};


// ============================================================
// ACTUALIZAR ESTADO DEL TRÁMITE
// HU-027
// ============================================================

async function actualizarEstadoTramite(
  req,
  res
) {

  const cliente =
    await pool.connect();

  try {

    // ========================================================
    // USUARIO AUTENTICADO
    // ========================================================

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


    // ========================================================
    // ID DEL TRÁMITE
    // ========================================================

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


    // ========================================================
    // DATOS RECIBIDOS
    // ========================================================

    const {
      estadoCodigo,
      comentario
    } = req.body;


    const estadoNuevo =
      typeof estadoCodigo === 'string'
        ? estadoCodigo
            .trim()
            .toUpperCase()
        : '';


    const comentarioLimpio =
      typeof comentario === 'string'
        ? comentario.trim()
        : '';


    if (
      !estadoNuevo
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'Debe seleccionar el nuevo estado'
      });
    }


    if (
      !comentarioLimpio
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El comentario del cambio es obligatorio'
      });
    }


    if (
      comentarioLimpio.length > 1500
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El comentario no puede superar 1500 caracteres'
      });
    }


    // ========================================================
    // INICIAR TRANSACCIÓN
    // ========================================================

    await cliente.query(
      'BEGIN'
    );


    // ========================================================
    // OBTENER TRÁMITE Y BLOQUEAR REGISTRO
    // ========================================================

    const resultadoTramite =
      await cliente.query(
        `
          SELECT
            t.id,
            t.documento_id,
            t.numero_expediente,
            t.estado_codigo,
            t.fecha_inicio,
            t.fecha_finalizacion,
            t.responsable_usuario_id

          FROM tramites t

          WHERE t.id = $1

          FOR UPDATE;
        `,
        [
          tramiteId
        ]
      );


    if (
      resultadoTramite.rowCount === 0
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


    const tramiteActual =
      resultadoTramite.rows[0];


    const estadoAnterior =
      tramiteActual.estado_codigo;


    // ========================================================
    // VALIDAR QUE EL ESTADO NUEVO EXISTA Y ESTÉ ACTIVO
    // ========================================================

    const resultadoEstado =
      await cliente.query(
        `
          SELECT
            codigo,
            nombre,
            orden

          FROM tramite_estados

          WHERE codigo = $1
            AND activo = TRUE

          LIMIT 1;
        `,
        [
          estadoNuevo
        ]
      );


    if (
      resultadoEstado.rowCount === 0
    ) {

      await cliente.query(
        'ROLLBACK'
      );


      return res.status(400).json({
        ok: false,
        mensaje:
          'El estado seleccionado no existe o está inactivo'
      });
    }


    // ========================================================
    // EVITAR EL MISMO ESTADO
    // ========================================================

    if (
      estadoAnterior ===
      estadoNuevo
    ) {

      await cliente.query(
        'ROLLBACK'
      );


      return res.status(400).json({
        ok: false,
        mensaje:
          'El trámite ya se encuentra en ese estado'
      });
    }


    // ========================================================
    // VALIDAR TRANSICIÓN
    // ========================================================

    const permitidos =
      TRANSICIONES_PERMITIDAS[
        estadoAnterior
      ] || [];


    if (
      !permitidos.includes(
        estadoNuevo
      )
    ) {

      await cliente.query(
        'ROLLBACK'
      );


      return res.status(409).json({
        ok: false,
        mensaje:
          `No se permite cambiar el trámite de ${estadoAnterior} a ${estadoNuevo}`,
        estadoActual:
          estadoAnterior,
        estadosPermitidos:
          permitidos
      });
    }


    // ========================================================
    // FECHA DE FINALIZACIÓN
    // ========================================================

    const esEstadoFinal =
      estadoNuevo === 'EMITIDO' ||
      estadoNuevo === 'RECHAZADO';


    // ========================================================
    // ACTUALIZAR TRÁMITE
    // ========================================================

    const resultadoActualizacion =
      await cliente.query(
        `
          UPDATE tramites

          SET
            estado_codigo = $1,

            fecha_finalizacion =
              CASE
                WHEN $2 = TRUE
                  THEN CURRENT_DATE
                ELSE fecha_finalizacion
              END,

            fecha_actualizacion =
              NOW()

          WHERE id = $3

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
          estadoNuevo,
          esEstadoFinal,
          tramiteId
        ]
      );


    const tramiteActualizado =
      resultadoActualizacion.rows[0];


    // ========================================================
    // REGISTRAR HISTORIAL DEL CAMBIO
    // ========================================================

    const resultadoHistorial =
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
            $3,
            $4,
            $5
          )
          RETURNING
            id,
            tramite_id,
            estado_anterior_codigo,
            estado_nuevo_codigo,
            comentario,
            usuario_id,
            fecha_cambio;
        `,
        [
          tramiteId,
          estadoAnterior,
          estadoNuevo,
          comentarioLimpio,
          Number(usuarioId)
        ]
      );


    const historial =
      resultadoHistorial.rows[0];


    // ========================================================
    // CONFIRMAR
    // ========================================================

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
        'TRAMITE_ESTADO_ACTUALIZADO',

      modulo:
        'TRAMITES',

      descripcion:
        `Se actualizó el trámite ${tramiteId} de ${estadoAnterior} a ${estadoNuevo}`,

      entidad:
        'tramites',

      registroId:
        tramiteId,

      datosAnteriores: {

        estado:
          estadoAnterior,

        fechaFinalizacion:
          tramiteActual.fecha_finalizacion
      },

      datosNuevos: {

        estado:
          estadoNuevo,

        fechaFinalizacion:
          tramiteActualizado.fecha_finalizacion,

        comentario:
          comentarioLimpio
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

    return res.status(200).json({

      ok: true,

      mensaje:
        'Estado del trámite actualizado correctamente',

      tramite: {

        id:
          tramiteActualizado.id,

        documentoId:
          tramiteActualizado.documento_id,

        entidadEmisoraId:
          tramiteActualizado.entidad_emisora_id,

        numeroExpediente:
          tramiteActualizado.numero_expediente,

        fechaInicio:
          tramiteActualizado.fecha_inicio,

        fechaFinalizacion:
          tramiteActualizado.fecha_finalizacion,

        responsableUsuarioId:
          tramiteActualizado.responsable_usuario_id,

        estado:
          tramiteActualizado.estado_codigo,

        observaciones:
          tramiteActualizado.observaciones,

        fechaActualizacion:
          tramiteActualizado.fecha_actualizacion
      },

      cambio: {

        id:
          historial.id,

        estadoAnterior:
          historial.estado_anterior_codigo,

        estadoNuevo:
          historial.estado_nuevo_codigo,

        comentario:
          historial.comentario,

        usuarioId:
          historial.usuario_id,

        fecha:
          historial.fecha_cambio
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
        'Error realizando rollback:',
        errorRollback
      );
    }


    console.error(
      'Error actualizando estado del trámite:',
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
  actualizarEstadoTramite
};