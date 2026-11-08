const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const pool = require('../config/database');
const { registrarEvento } = require('../services/auditoria.service');


const DIRECTORIO_ARCHIVOS = path.join(
  __dirname,
  '../../uploads/documentos'
);


const esPdfReal = (buffer) => {
  if (!buffer || buffer.length < 5) {
    return false;
  }

  return buffer.subarray(0, 5).toString('utf8') === '%PDF-';
};


const adjuntarArchivoDocumento = async (req, res) => {
  const client = await pool.connect();

  let rutaAbsolutaCreada = null;

  try {
    const documentoId = Number(req.params.id);
    const usuarioId = req.usuario.usuarioId;


    if (!Number.isInteger(documentoId) || documentoId <= 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El documento indicado no es válido.'
      });
    }


    if (!req.file) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Debe seleccionar un archivo PDF.'
      });
    }


    if (
      req.file.mimetype !== 'application/pdf' ||
      !esPdfReal(req.file.buffer)
    ) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El archivo seleccionado no corresponde a un PDF válido.'
      });
    }


    await client.query('BEGIN');


    const documentoResultado = await client.query(
      `
        SELECT
          id,
          codigo_interno,
          numero_documento
        FROM documentos
        WHERE id = $1
        LIMIT 1
      `,
      [documentoId]
    );


    if (documentoResultado.rowCount === 0) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        ok: false,
        mensaje: 'El documento no existe.'
      });
    }


    const documento = documentoResultado.rows[0];


    const hashSha256 = crypto
      .createHash('sha256')
      .update(req.file.buffer)
      .digest('hex');


    const identificadorArchivo = crypto.randomUUID();

    const nombreInterno =
      `${documento.codigo_interno}_${identificadorArchivo}.pdf`;


    await fs.promises.mkdir(
      DIRECTORIO_ARCHIVOS,
      {
        recursive: true
      }
    );


    const rutaAbsoluta = path.join(
      DIRECTORIO_ARCHIVOS,
      nombreInterno
    );


    const rutaRelativa =
      `uploads/documentos/${nombreInterno}`;


    await fs.promises.writeFile(
      rutaAbsoluta,
      req.file.buffer,
      {
        flag: 'wx'
      }
    );


    rutaAbsolutaCreada = rutaAbsoluta;


    const archivoResultado = await client.query(
      `
        INSERT INTO documento_archivos (
          documento_id,
          nombre_original,
          nombre_interno,
          mime_type,
          tamano_bytes,
          hash_sha256,
          ruta_archivo,
          cargado_por
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8
        )
        RETURNING
          id,
          documento_id,
          nombre_original,
          nombre_interno,
          mime_type,
          tamano_bytes,
          hash_sha256,
          ruta_archivo,
          cargado_por,
          fecha_carga
      `,
      [
        documentoId,
        req.file.originalname,
        nombreInterno,
        req.file.mimetype,
        req.file.size,
        hashSha256,
        rutaRelativa,
        usuarioId
      ]
    );


    await client.query('COMMIT');


    const archivo = archivoResultado.rows[0];


    try {
      await registrarEvento({
        usuarioId,
        evento: 'ARCHIVO_DOCUMENTO_ADJUNTADO',
        modulo: 'DOCUMENTOS',
        descripcion:
          `Se adjuntó el archivo digital al documento ${documento.codigo_interno}.`,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
    } catch (errorAuditoria) {
      console.error(
        'No se pudo registrar la auditoría del archivo:',
        errorAuditoria
      );
    }


    return res.status(201).json({
      ok: true,
      mensaje: 'Archivo adjuntado correctamente.',
      archivo: {
        id: archivo.id,
        documentoId: archivo.documento_id,
        nombreOriginal: archivo.nombre_original,
        nombreInterno: archivo.nombre_interno,
        mimeType: archivo.mime_type,
        tamanoBytes: Number(archivo.tamano_bytes),
        hashSha256: archivo.hash_sha256,
        fechaCarga: archivo.fecha_carga
      }
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (_) {
      // La transacción puede haber finalizado previamente.
    }


    if (rutaAbsolutaCreada) {
      try {
        await fs.promises.unlink(rutaAbsolutaCreada);
      } catch (_) {
        // El archivo puede no existir.
      }
    }


    console.error(
      'Error al adjuntar archivo de documento:',
      error
    );


    return res.status(500).json({
      ok: false,
      mensaje: 'No se pudo adjuntar el archivo del documento.'
    });
  } finally {
    client.release();
  }
};


module.exports = {
  adjuntarArchivoDocumento
};