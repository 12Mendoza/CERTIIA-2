const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const pool = require('../config/database');

const {
  registrarEvento
} = require('../services/auditoria.service');


// ============================================================
// UTILIDADES
// ============================================================

function idValido(valor) {
  const numero = Number(valor);

  return (
    Number.isInteger(numero) &&
    numero > 0
  );
}


function nombreSeguro(nombre) {
  return String(
    nombre || 'documento.pdf'
  )
    .replace(/[\r\n"]/g, '')
    .replace(/[\\/:*?<>|]/g, '_');
}


function calcularHashArchivo(
  rutaArchivo
) {
  return new Promise(
    (resolve, reject) => {

      const hash =
        crypto.createHash(
          'sha256'
        );

      const stream =
        fs.createReadStream(
          rutaArchivo
        );


      stream.on(
        'error',
        reject
      );


      stream.on(
        'data',
        (fragmento) => {
          hash.update(
            fragmento
          );
        }
      );


      stream.on(
        'end',
        () => {
          resolve(
            hash.digest(
              'hex'
            )
          );
        }
      );
    }
  );
}


// ============================================================
// OBTENER ARCHIVO DOCUMENTAL
// ============================================================

async function obtenerArchivoDocumento(
  req,
  res
) {

  try {

    const documentoId =
      Number(
        req.params.id
      );

    const archivoId =
      Number(
        req.params.archivoId
      );


    if (
      !idValido(
        documentoId
      ) ||
      !idValido(
        archivoId
      )
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El identificador solicitado no es válido'
      });
    }


    // ========================================================
    // CONSULTAR METADATOS
    // ========================================================

    const resultado =
      await pool.query(
        `
          SELECT
            da.id,
            da.documento_id,
            da.nombre_original,
            da.nombre_interno,
            da.mime_type,
            da.tamano_bytes,
            da.hash_sha256,
            da.fecha_carga,

            d.codigo_interno

          FROM documento_archivos da

          INNER JOIN documentos d
            ON d.id =
               da.documento_id

          WHERE
            da.id = $1
            AND da.documento_id = $2

          LIMIT 1;
        `,
        [
          archivoId,
          documentoId
        ]
      );


    if (
      resultado.rowCount ===
      0
    ) {
      return res.status(404).json({
        ok: false,
        mensaje:
          'El archivo solicitado no existe'
      });
    }


    const archivo =
      resultado.rows[0];


    // ========================================================
    // CONSTRUIR RUTA INTERNAMENTE
    // ========================================================

    const directorioDocumentos =
      path.resolve(
        __dirname,
        '../../uploads/documentos'
      );


    const rutaArchivo =
      path.join(
        directorioDocumentos,
        path.basename(
          archivo.nombre_interno
        )
      );


    // ========================================================
    // VALIDAR EXISTENCIA FÍSICA
    // ========================================================

    if (
      !fs.existsSync(
        rutaArchivo
      )
    ) {
      return res.status(404).json({
        ok: false,
        mensaje:
          'El archivo documental no está disponible'
      });
    }


    // ========================================================
    // VALIDAR INTEGRIDAD SHA-256
    // ========================================================

    const hashActual =
      await calcularHashArchivo(
        rutaArchivo
      );


    if (
      hashActual !==
      archivo.hash_sha256
    ) {

      await registrarEvento({
        usuarioId:
          req.usuario?.usuarioId ||
          null,

        evento:
          'DOCUMENTO_ARCHIVO_INTEGRIDAD_FALLIDA',

        modulo:
          'DOCUMENTOS',

        descripcion:
          `Falló la verificación de integridad del archivo ${archivo.id} asociado al documento ${archivo.codigo_interno}`,

        entidad:
          'documento_archivos',

        registroId:
          archivo.id,

        ip:
          req.ip,

        userAgent:
          req.headers[
            'user-agent'
          ]
      });


      return res.status(409).json({
        ok: false,
        mensaje:
          'No se pudo entregar el archivo porque falló su verificación de integridad'
      });
    }


    // ========================================================
    // MODO VISUALIZAR O DESCARGAR
    // ========================================================

    const descargar =
      String(
        req.query.descargar ||
        ''
      ) === '1';


    const nombreOriginal =
      nombreSeguro(
        archivo.nombre_original
      );


    res.setHeader(
      'Content-Type',
      archivo.mime_type ||
      'application/pdf'
    );


    res.setHeader(
      'Content-Length',
      archivo.tamano_bytes
    );


    res.setHeader(
      'X-Content-Type-Options',
      'nosniff'
    );


    res.setHeader(
      'Cache-Control',
      'private, no-store'
    );


    res.setHeader(
      'Content-Disposition',
      descargar
        ? `attachment; filename="${nombreOriginal}"`
        : `inline; filename="${nombreOriginal}"`
    );


    // ========================================================
    // AUDITORÍA
    // ========================================================

    await registrarEvento({
      usuarioId:
        req.usuario?.usuarioId ||
        null,

      evento:
        descargar
          ? 'DOCUMENTO_ARCHIVO_DESCARGADO'
          : 'DOCUMENTO_ARCHIVO_VISUALIZADO',

      modulo:
        'DOCUMENTOS',

      descripcion:
        descargar
          ? `Se descargó el archivo ${nombreOriginal} del documento ${archivo.codigo_interno}`
          : `Se visualizó el archivo ${nombreOriginal} del documento ${archivo.codigo_interno}`,

      entidad:
        'documento_archivos',

      registroId:
        archivo.id,

      ip:
        req.ip,

      userAgent:
        req.headers[
          'user-agent'
        ]
    });


    // ========================================================
    // ENTREGAR ARCHIVO
    // ========================================================

    const stream =
      fs.createReadStream(
        rutaArchivo
      );


    stream.on(
      'error',
      (error) => {

        console.error(
          'Error enviando archivo documental:',
          error
        );


        if (
          !res.headersSent
        ) {
          res.status(500).json({
            ok: false,
            mensaje:
              'No se pudo entregar el archivo'
          });
        } else {
          res.destroy();
        }
      }
    );


    stream.pipe(
      res
    );

  } catch (error) {

    console.error(
      'Error consultando archivo documental:',
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
// EXPORTAR
// ============================================================

module.exports = {
  obtenerArchivoDocumento
};