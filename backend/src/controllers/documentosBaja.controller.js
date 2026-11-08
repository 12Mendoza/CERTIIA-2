const pool = require('../config/database');

const {
  registrarEvento
} = require('../services/auditoria.service');


// ============================================================
// UTILIDADES
// ============================================================

function idValido(valor) {

  const id =
    Number(valor);

  return (
    Number.isInteger(id) &&
    id > 0
  );
}


function textoLimpio(valor) {

  if (
    valor === undefined ||
    valor === null
  ) {
    return '';
  }

  return String(valor).trim();
}


// ============================================================
// ARCHIVAR O ANULAR DOCUMENTO
// HU-025
// ============================================================

async function cambiarCondicionDocumento(
  req,
  res
) {

  const cliente =
    await pool.connect();


  try {

    const documentoId =
      Number(
        req.params.id
      );


    const usuarioId =
      req.usuario?.usuarioId;


    if (
      !idValido(documentoId)
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El identificador del documento no es válido.'
      });
    }


    if (
      !idValido(usuarioId)
    ) {

      return res.status(401).json({
        ok: false,
        mensaje:
          'No se pudo identificar al usuario autenticado.'
      });
    }


    // ========================================================
    // VALIDAR CUERPO
    // ========================================================

    const accion =
      textoLimpio(
        req.body?.accion
      ).toUpperCase();


    const motivo =
      textoLimpio(
        req.body?.motivo
      );


    if (
      ![
        'ARCHIVAR',
        'ANULAR'
      ].includes(accion)
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'La acción debe ser ARCHIVAR o ANULAR.'
      });
    }


    if (!motivo) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'Debe indicar el motivo de la operación.'
      });
    }


    if (
      motivo.length < 5
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El motivo debe contener al menos 5 caracteres.'
      });
    }


    if (
      motivo.length > 1000
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El motivo no puede superar los 1000 caracteres.'
      });
    }


    const nuevaCondicion =
      accion === 'ARCHIVAR'
        ? 'ARCHIVADO'
        : 'ANULADO';


    // ========================================================
    // TRANSACCIÓN
    // ========================================================

    await cliente.query(
      'BEGIN'
    );


    // ========================================================
    // BLOQUEAR Y CONSULTAR DOCUMENTO
    // ========================================================

    const resultadoDocumento =
      await cliente.query(
        `
          SELECT
            id,
            codigo_interno,
            numero_documento,
            estado,
            condicion_registro,
            motivo_baja,
            fecha_baja,
            baja_por

          FROM documentos

          WHERE id = $1

          FOR UPDATE;
        `,
        [
          documentoId
        ]
      );


    if (
      resultadoDocumento.rowCount ===
      0
    ) {

      await cliente.query(
        'ROLLBACK'
      );


      return res.status(404).json({
        ok: false,
        mensaje:
          'El documento no existe.'
      });
    }


    const documentoAnterior =
      resultadoDocumento.rows[0];


    // ========================================================
    // VALIDAR ESTADO LÓGICO ACTUAL
    // ========================================================

    if (
      documentoAnterior.condicion_registro !==
      'ACTIVO'
    ) {

      await cliente.query(
        'ROLLBACK'
      );


      return res.status(409).json({
        ok: false,
        mensaje:
          `El documento ya se encuentra ${String(
            documentoAnterior.condicion_registro
          ).toLowerCase()}.`
      });
    }


    // ========================================================
    // ACTUALIZAR SIN ELIMINAR
    // ========================================================

    const resultadoActualizacion =
      await cliente.query(
        `
          UPDATE documentos

          SET
            condicion_registro = $1,
            motivo_baja = $2,
            fecha_baja = NOW(),
            baja_por = $3

          WHERE id = $4

          RETURNING
            id,
            codigo_interno,
            numero_documento,
            estado,
            condicion_registro,
            motivo_baja,
            fecha_baja,
            baja_por;
        `,
        [
          nuevaCondicion,
          motivo,
          usuarioId,
          documentoId
        ]
      );


    const documentoNuevo =
      resultadoActualizacion.rows[0];


    await cliente.query(
      'COMMIT'
    );


    // ========================================================
    // AUDITORÍA
    // ========================================================

    await registrarEvento({

      usuarioId,

      evento:
        nuevaCondicion ===
        'ARCHIVADO'
          ? 'DOCUMENTO_ARCHIVADO'
          : 'DOCUMENTO_ANULADO',

      modulo:
        'DOCUMENTOS',

      descripcion:
        nuevaCondicion ===
        'ARCHIVADO'
          ? `Se archivó el documento ${documentoNuevo.codigo_interno}. Motivo: ${motivo}`
          : `Se anuló el documento ${documentoNuevo.codigo_interno}. Motivo: ${motivo}`,

      entidad:
        'documentos',

      registroId:
        documentoId,

      datosAnteriores: {
        condicionRegistro:
          documentoAnterior.condicion_registro,

        motivoBaja:
          documentoAnterior.motivo_baja,

        fechaBaja:
          documentoAnterior.fecha_baja,

        bajaPor:
          documentoAnterior.baja_por
      },

      datosNuevos: {
        condicionRegistro:
          documentoNuevo.condicion_registro,

        motivoBaja:
          documentoNuevo.motivo_baja,

        fechaBaja:
          documentoNuevo.fecha_baja,

        bajaPor:
          documentoNuevo.baja_por
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
        nuevaCondicion ===
        'ARCHIVADO'
          ? 'Documento archivado correctamente.'
          : 'Documento anulado correctamente.',

      documento: {

        id:
          documentoNuevo.id,

        codigoInterno:
          documentoNuevo.codigo_interno,

        numeroDocumento:
          documentoNuevo.numero_documento,

        estado:
          documentoNuevo.estado,

        condicionRegistro:
          documentoNuevo.condicion_registro,

        motivoBaja:
          documentoNuevo.motivo_baja,

        fechaBaja:
          documentoNuevo.fecha_baja,

        bajaPor:
          documentoNuevo.baja_por
      }
    });

  } catch (error) {

    try {

      await cliente.query(
        'ROLLBACK'
      );

    } catch (
      rollbackError
    ) {

      console.error(
        'Error haciendo rollback:',
        rollbackError
      );
    }


    console.error(
      'Error archivando/anulando documento:',
      error
    );


    return res.status(500).json({
      ok: false,
      mensaje:
        'Error interno al cambiar la condición del documento.'
    });

  } finally {

    cliente.release();
  }
}


// ============================================================
// EXPORTAR
// ============================================================

module.exports = {
  cambiarCondicionDocumento
};