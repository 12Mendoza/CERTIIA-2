const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const pool =
  require('../config/database');

const {
  registrarEvento
} = require(
  '../services/auditoria.service'
);


// ============================================================
// CONFIGURACIÓN
// ============================================================

const MAX_ARCHIVO_BYTES =
  10 * 1024 * 1024;

const DIRECTORIO_EVIDENCIAS =
  path.resolve(
    __dirname,
    '../../uploads/tramites'
  );


// ============================================================
// MULTER EN MEMORIA
// ============================================================

const multerEvidencia =
  multer({

    storage:
      multer.memoryStorage(),

    limits: {
      fileSize:
        MAX_ARCHIVO_BYTES,
      files:
        1
    }
  })
  .single('archivo');


// ============================================================
// MIDDLEWARE CONTROLADO
// ============================================================

function subirEvidenciaMiddleware(
  req,
  res,
  next
) {

  multerEvidencia(
    req,
    res,
    (error) => {

      if (!error) {

        return next();
      }


      if (
        error instanceof
        multer.MulterError
      ) {

        if (
          error.code ===
          'LIMIT_FILE_SIZE'
        ) {

          return res.status(400).json({
            ok: false,
            mensaje:
              'El archivo no puede superar 10 MB'
          });
        }


        return res.status(400).json({
          ok: false,
          mensaje:
            'El archivo enviado no es válido'
        });
      }


      console.error(
        'Error procesando evidencia:',
        error
      );


      return res.status(500).json({
        ok: false,
        mensaje:
          'Error procesando el archivo'
      });
    }
  );
}


// ============================================================
// UTILIDADES
// ============================================================

function idValido(
  valor
) {

  const numero =
    Number(valor);

  return (
    Number.isInteger(numero) &&
    numero > 0
  );
}


function obtenerExtension(
  nombre
) {

  return path
    .extname(
      nombre || ''
    )
    .toLowerCase();
}


function esPdfReal(
  buffer
) {

  if (
    !Buffer.isBuffer(buffer) ||
    buffer.length < 5
  ) {
    return false;
  }


  return (
    buffer
      .subarray(
        0,
        5
      )
      .toString(
        'ascii'
      ) === '%PDF-'
  );
}


function calcularHashSha256(
  buffer
) {

  return crypto
    .createHash(
      'sha256'
    )
    .update(
      buffer
    )
    .digest(
      'hex'
    );
}


function nombreOriginalSeguro(
  nombre
) {

  return path
    .basename(
      nombre || 'evidencia.pdf'
    )
    .replace(
      /[\r\n"]/g,
      ''
    )
    .slice(
      0,
      255
    );
}


// ============================================================
// VALIDAR EVENTO RELACIONADO
// ============================================================

async function validarEventoRelacionado({
  cliente,
  tramiteId,
  observacionId,
  subsanacionId
}) {

  if (
    observacionId &&
    subsanacionId
  ) {

    return {
      ok: false,
      mensaje:
        'La evidencia no puede asociarse simultáneamente a una observación y una subsanación'
    };
  }


  if (
    observacionId
  ) {

    const resultado =
      await cliente.query(
        `
          SELECT
            id,
            tramite_id

          FROM tramite_observaciones

          WHERE id = $1

          LIMIT 1;
        `,
        [
          observacionId
        ]
      );


    if (
      resultado.rowCount === 0
    ) {

      return {
        ok: false,
        mensaje:
          'La observación seleccionada no existe'
      };
    }


    if (
      Number(
        resultado.rows[0]
          .tramite_id
      ) !==
      Number(
        tramiteId
      )
    ) {

      return {
        ok: false,
        mensaje:
          'La observación no pertenece al trámite indicado'
      };
    }
  }


  if (
    subsanacionId
  ) {

    const resultado =
      await cliente.query(
        `
          SELECT
            s.id,
            o.tramite_id

          FROM tramite_subsanaciones s

          INNER JOIN tramite_observaciones o
            ON o.id =
               s.observacion_id

          WHERE s.id = $1

          LIMIT 1;
        `,
        [
          subsanacionId
        ]
      );


    if (
      resultado.rowCount === 0
    ) {

      return {
        ok: false,
        mensaje:
          'La subsanación seleccionada no existe'
      };
    }


    if (
      Number(
        resultado.rows[0]
          .tramite_id
      ) !==
      Number(
        tramiteId
      )
    ) {

      return {
        ok: false,
        mensaje:
          'La subsanación no pertenece al trámite indicado'
      };
    }
  }


  return {
    ok: true
  };
}


// ============================================================
// REGISTRAR EVIDENCIA
// HU-029
// ============================================================

async function registrarEvidencia(
  req,
  res
) {

  const cliente =
    await pool.connect();


  let rutaArchivoGuardado =
    null;


  try {

    const usuarioId =
      req.usuario?.usuarioId;


    const tramiteId =
      Number(
        req.params.id
      );


    if (
      !idValido(
        usuarioId
      )
    ) {

      return res.status(401).json({
        ok: false,
        mensaje:
          'Usuario no autenticado'
      });
    }


    if (
      !idValido(
        tramiteId
      )
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El identificador del trámite no es válido'
      });
    }


    // ========================================================
    // VALIDAR ARCHIVO
    // ========================================================

    if (
      !req.file
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'Debe seleccionar un archivo PDF'
      });
    }


    const extension =
      obtenerExtension(
        req.file.originalname
      );


    if (
      extension !== '.pdf'
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'Solo se permiten archivos PDF'
      });
    }


    if (
      req.file.mimetype !==
      'application/pdf'
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El tipo MIME del archivo no es válido'
      });
    }


    if (
      !esPdfReal(
        req.file.buffer
      )
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El contenido del archivo no corresponde a un PDF válido'
      });
    }


    if (
      req.file.size <= 0 ||
      req.file.size >
        MAX_ARCHIVO_BYTES
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El tamaño del archivo no es válido'
      });
    }


    // ========================================================
    // DATOS OPCIONALES
    // ========================================================

    const descripcion =
      typeof req.body.descripcion ===
        'string'
        ? req.body.descripcion.trim()
        : '';


    if (
      descripcion.length > 500
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'La descripción no puede superar 500 caracteres'
      });
    }


    const observacionId =
      req.body.observacionId
        ? Number(
            req.body.observacionId
          )
        : null;


    const subsanacionId =
      req.body.subsanacionId
        ? Number(
            req.body.subsanacionId
          )
        : null;


    if (
      observacionId &&
      !idValido(
        observacionId
      )
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'La observación indicada no es válida'
      });
    }


    if (
      subsanacionId &&
      !idValido(
        subsanacionId
      )
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'La subsanación indicada no es válida'
      });
    }


    // ========================================================
    // TRANSACCIÓN
    // ========================================================

    await cliente.query(
      'BEGIN'
    );


    // ========================================================
    // VALIDAR TRÁMITE
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
      tramiteResultado.rowCount ===
      0
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


    if (
      tramite.estado_codigo ===
        'EMITIDO' ||
      tramite.estado_codigo ===
        'RECHAZADO'
    ) {

      await cliente.query(
        'ROLLBACK'
      );


      return res.status(409).json({
        ok: false,
        mensaje:
          'No se pueden adjuntar nuevas evidencias a un trámite finalizado'
      });
    }


    // ========================================================
    // VALIDAR EVENTO RELACIONADO
    // ========================================================

    const validacionEvento =
      await validarEventoRelacionado({

        cliente,

        tramiteId,

        observacionId,

        subsanacionId
      });


    if (
      !validacionEvento.ok
    ) {

      await cliente.query(
        'ROLLBACK'
      );


      return res.status(400).json({
        ok: false,
        mensaje:
          validacionEvento.mensaje
      });
    }


    // ========================================================
    // CREAR NOMBRE INTERNO Y HASH
    // ========================================================

    const hashSha256 =
      calcularHashSha256(
        req.file.buffer
      );


    const nombreInterno =
      `${crypto.randomUUID()}.pdf`;


    const nombreOriginal =
      nombreOriginalSeguro(
        req.file.originalname
      );


    // ========================================================
    // CREAR DIRECTORIO
    // ========================================================

    await fsp.mkdir(
      DIRECTORIO_EVIDENCIAS,
      {
        recursive: true
      }
    );


    rutaArchivoGuardado =
      path.join(
        DIRECTORIO_EVIDENCIAS,
        nombreInterno
      );


    // ========================================================
    // GUARDAR ARCHIVO FÍSICO
    // ========================================================

    await fsp.writeFile(
      rutaArchivoGuardado,
      req.file.buffer,
      {
        flag: 'wx'
      }
    );


    // ========================================================
    // GUARDAR METADATOS
    // ========================================================

    const resultado =
      await cliente.query(
        `
          INSERT INTO tramite_evidencias (
            tramite_id,
            observacion_id,
            subsanacion_id,
            nombre_original,
            nombre_interno,
            ruta_relativa,
            mime_type,
            extension,
            tamano_bytes,
            hash_sha256,
            descripcion,
            subido_por
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11,
            $12
          )
          RETURNING
            id,
            tramite_id,
            observacion_id,
            subsanacion_id,
            nombre_original,
            mime_type,
            extension,
            tamano_bytes,
            hash_sha256,
            descripcion,
            subido_por,
            fecha_subida;
        `,
        [
          tramiteId,
          observacionId,
          subsanacionId,
          nombreOriginal,
          nombreInterno,
          `tramites/${nombreInterno}`,
          'application/pdf',
          '.pdf',
          req.file.size,
          hashSha256,
          descripcion || null,
          Number(usuarioId)
        ]
      );


    const evidencia =
      resultado.rows[0];


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
        'TRAMITE_EVIDENCIA_ADJUNTADA',

      modulo:
        'TRAMITES',

      descripcion:
        `Se adjuntó evidencia al trámite ${tramiteId}`,

      entidad:
        'tramite_evidencias',

      registroId:
        evidencia.id,

      datosAnteriores:
        null,

      datosNuevos: {

        tramiteId:
          evidencia.tramite_id,

        observacionId:
          evidencia.observacion_id,

        subsanacionId:
          evidencia.subsanacion_id,

        nombreOriginal:
          evidencia.nombre_original,

        mimeType:
          evidencia.mime_type,

        tamanoBytes:
          evidencia.tamano_bytes,

        hashSha256:
          evidencia.hash_sha256
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
        'Evidencia adjuntada correctamente',

      evidencia: {

        id:
          evidencia.id,

        tramiteId:
          evidencia.tramite_id,

        observacionId:
          evidencia.observacion_id,

        subsanacionId:
          evidencia.subsanacion_id,

        nombreOriginal:
          evidencia.nombre_original,

        mimeType:
          evidencia.mime_type,

        extension:
          evidencia.extension,

        tamanoBytes:
          evidencia.tamano_bytes,

        hashSha256:
          evidencia.hash_sha256,

        descripcion:
          evidencia.descripcion,

        subidoPor:
          evidencia.subido_por,

        fechaSubida:
          evidencia.fecha_subida
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
        'Error realizando rollback de evidencia:',
        errorRollback
      );
    }


    // ========================================================
    // LIMPIAR ARCHIVO HUÉRFANO
    // ========================================================

    if (
      rutaArchivoGuardado
    ) {

      try {

        await fsp.unlink(
          rutaArchivoGuardado
        );

      } catch (
        errorEliminar
      ) {

        if (
          errorEliminar.code !==
          'ENOENT'
        ) {

          console.error(
            'No se pudo eliminar archivo huérfano:',
            errorEliminar
          );
        }
      }
    }


    console.error(
      'Error registrando evidencia:',
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
// LISTAR EVIDENCIAS DE UN TRÁMITE
// HU-029
// ============================================================

async function listarEvidencias(
  req,
  res
) {

  try {

    const tramiteId =
      Number(
        req.params.id
      );


    if (
      !idValido(
        tramiteId
      )
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El identificador del trámite no es válido'
      });
    }


    const resultado =
      await pool.query(
        `
          SELECT
            e.id,
            e.tramite_id,
            e.observacion_id,
            e.subsanacion_id,
            e.nombre_original,
            e.mime_type,
            e.extension,
            e.tamano_bytes,
            e.hash_sha256,
            e.descripcion,
            e.fecha_subida,

            u.id
              AS usuario_id,

            u.nombres
              AS usuario_nombres,

            u.apellidos
              AS usuario_apellidos

          FROM tramite_evidencias e

          INNER JOIN usuarios u
            ON u.id =
               e.subido_por

          WHERE
            e.tramite_id = $1
            AND e.activo = TRUE

          ORDER BY
            e.fecha_subida DESC,
            e.id DESC;
        `,
        [
          tramiteId
        ]
      );


    const evidencias =
      resultado.rows.map(
        (fila) => ({

          id:
            fila.id,

          tramiteId:
            fila.tramite_id,

          observacionId:
            fila.observacion_id,

          subsanacionId:
            fila.subsanacion_id,

          nombreOriginal:
            fila.nombre_original,

          mimeType:
            fila.mime_type,

          extension:
            fila.extension,

          tamanoBytes:
            Number(
              fila.tamano_bytes
            ),

          hashSha256:
            fila.hash_sha256,

          descripcion:
            fila.descripcion,

          fechaSubida:
            fila.fecha_subida,

          usuario: {

            id:
              fila.usuario_id,

            nombreCompleto:
              `${fila.usuario_nombres} ${fila.usuario_apellidos}`
          }
        })
      );


    return res.status(200).json({

      ok: true,

      total:
        evidencias.length,

      evidencias
    });


  } catch (error) {

    console.error(
      'Error listando evidencias:',
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
// VISUALIZAR / DESCARGAR EVIDENCIA
// HU-029
// ============================================================

async function obtenerArchivoEvidencia(
  req,
  res
) {

  try {

    const evidenciaId =
      Number(
        req.params.evidenciaId
      );


    if (
      !idValido(
        evidenciaId
      )
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El identificador de la evidencia no es válido'
      });
    }


    const resultado =
      await pool.query(
        `
          SELECT
            id,
            tramite_id,
            nombre_original,
            nombre_interno,
            mime_type,
            tamano_bytes,
            hash_sha256

          FROM tramite_evidencias

          WHERE
            id = $1
            AND activo = TRUE

          LIMIT 1;
        `,
        [
          evidenciaId
        ]
      );


    if (
      resultado.rowCount === 0
    ) {

      return res.status(404).json({
        ok: false,
        mensaje:
          'La evidencia no existe'
      });
    }


    const evidencia =
      resultado.rows[0];


    const rutaFisica =
      path.join(
        DIRECTORIO_EVIDENCIAS,
        evidencia.nombre_interno
      );


    // ========================================================
    // COMPROBAR EXISTENCIA
    // ========================================================

    try {

      await fsp.access(
        rutaFisica,
        fs.constants.R_OK
      );

    } catch {

      return res.status(404).json({
        ok: false,
        mensaje:
          'El archivo de evidencia no está disponible'
      });
    }


    // ========================================================
    // VERIFICAR INTEGRIDAD
    // ========================================================

    const contenido =
      await fsp.readFile(
        rutaFisica
      );


    const hashActual =
      calcularHashSha256(
        contenido
      );


    if (
      hashActual !==
      evidencia.hash_sha256
    ) {

      return res.status(409).json({
        ok: false,
        mensaje:
          'La verificación de integridad del archivo falló'
      });
    }


    const descargar =
      String(
        req.query.descargar || ''
      ) === '1';


    const nombreDescarga =
      nombreOriginalSeguro(
        evidencia.nombre_original
      );


    res.setHeader(
      'Content-Type',
      'application/pdf'
    );


    res.setHeader(
      'X-Content-Type-Options',
      'nosniff'
    );


    res.setHeader(
      'Content-Length',
      contenido.length
    );


    res.setHeader(
      'Content-Disposition',
      `${
        descargar
          ? 'attachment'
          : 'inline'
      }; filename="${nombreDescarga}"`
    );


    return res.send(
      contenido
    );


  } catch (error) {

    console.error(
      'Error obteniendo evidencia:',
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
  subirEvidenciaMiddleware,
  registrarEvidencia,
  listarEvidencias,
  obtenerArchivoEvidencia
};