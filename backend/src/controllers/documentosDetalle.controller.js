const pool = require('../config/database');

const {
  recalcularEstadosDocumentos
} = require(
  '../services/vigenciaDocumentos.service'
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
// OBTENER DETALLE DEL DOCUMENTO
// ============================================================

async function obtenerDetalleDocumento(
  req,
  res
) {
  try {

    const documentoId =
      Number(req.params.id);


    // ========================================================
    // VALIDAR ID
    // ========================================================

    if (
      !idValido(
        documentoId
      )
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El identificador del documento no es válido'
      });
    }


    // ========================================================
    // RECALCULAR VIGENCIA
    // ========================================================

    await recalcularEstadosDocumentos();


    // ========================================================
    // CONSULTAR INFORMACIÓN GENERAL
    // ========================================================

    const resultadoDocumento =
      await pool.query(
        `
          SELECT
            d.id,
            d.codigo_interno,
            d.numero_documento,
            d.numero_expediente,
            d.fecha_emision,
            d.fecha_vencimiento,
            d.estado,
            d.observaciones,
            d.fecha_creacion,
            d.fecha_actualizacion,

            t.id
              AS tienda_id,

            t.nombre
              AS tienda_nombre,

            td.id
              AS tipo_documento_id,

            td.nombre
              AS tipo_documento_nombre,

            td.categoria
              AS tipo_documento_categoria,

            td.descripcion
              AS tipo_documento_descripcion,

            ee.id
              AS entidad_emisora_id,

            ee.nombre
              AS entidad_emisora_nombre,

            ee.ruc
              AS entidad_emisora_ruc,

            u.id
              AS responsable_id,

            u.nombres
              AS responsable_nombres,

            u.apellidos
              AS responsable_apellidos,

            r.id
              AS regla_id,

            r.version
              AS regla_version,

            r.tipo_vigencia,

            r.duracion_valor,

            r.duracion_unidad,

            r.requiere_renovacion,

            r.umbral_por_vencer_dias,

            r.umbral_critico_dias

          FROM documentos d

          INNER JOIN tiendas t
            ON t.id =
               d.tienda_id

          INNER JOIN tipos_documento td
            ON td.id =
               d.tipo_documento_id

          INNER JOIN entidades_emisoras ee
            ON ee.id =
               d.entidad_emisora_id

          INNER JOIN usuarios u
            ON u.id =
               d.responsable_usuario_id

          INNER JOIN
            tipo_documento_reglas_vigencia r
            ON r.id =
               d.regla_vigencia_id

          WHERE d.id = $1

          LIMIT 1;
        `,
        [
          documentoId
        ]
      );


    // ========================================================
    // DOCUMENTO NO ENCONTRADO
    // ========================================================

    if (
      resultadoDocumento.rowCount ===
      0
    ) {
      return res.status(404).json({
        ok: false,
        mensaje:
          'Documento no encontrado'
      });
    }


    const fila =
      resultadoDocumento.rows[0];


    // ========================================================
    // CONSULTAR ARCHIVOS ADJUNTOS
    // ========================================================

    const resultadoArchivos =
      await pool.query(
        `
          SELECT
            da.id,
            da.nombre_original,
            da.nombre_interno,
            da.mime_type,
            da.tamano_bytes,
            da.hash_sha256,
            da.fecha_carga,

            u.id
              AS usuario_id,

            u.nombres
              AS usuario_nombres,

            u.apellidos
              AS usuario_apellidos

          FROM documento_archivos da

          INNER JOIN usuarios u
            ON u.id =
               da.cargado_por

          WHERE da.documento_id = $1

          ORDER BY
            da.fecha_carga DESC,
            da.id DESC;
        `,
        [
          documentoId
        ]
      );


    // ========================================================
    // FORMATEAR ARCHIVOS
    // ========================================================

    const archivos =
      resultadoArchivos.rows.map(
        (archivo) => ({
          id:
            archivo.id,

          nombreOriginal:
            archivo.nombre_original,

          nombreInterno:
            archivo.nombre_interno,

          mimeType:
            archivo.mime_type,

          tamanoBytes:
            Number(
              archivo.tamano_bytes
            ),

          hashSha256:
            archivo.hash_sha256,

          fechaCarga:
            archivo.fecha_carga,

          cargadoPor: {
            id:
              archivo.usuario_id,

            nombres:
              archivo.usuario_nombres,

            apellidos:
              archivo.usuario_apellidos
          }
        })
      );


    // ========================================================
    // RESPUESTA
    // ========================================================

    return res.status(200).json({
      ok: true,

      documento: {
        id:
          fila.id,

        codigoInterno:
          fila.codigo_interno,

        numeroDocumento:
          fila.numero_documento,

        numeroExpediente:
          fila.numero_expediente,

        fechaEmision:
          fila.fecha_emision,

        fechaVencimiento:
          fila.fecha_vencimiento,

        estado:
          fila.estado,

        observaciones:
          fila.observaciones,

        fechaCreacion:
          fila.fecha_creacion,

        fechaActualizacion:
          fila.fecha_actualizacion,


        tienda: {
          id:
            fila.tienda_id,

          nombre:
            fila.tienda_nombre
        },


        tipoDocumento: {
          id:
            fila.tipo_documento_id,

          nombre:
            fila.tipo_documento_nombre,

          categoria:
            fila.tipo_documento_categoria,

          descripcion:
            fila.tipo_documento_descripcion
        },


        entidadEmisora: {
          id:
            fila.entidad_emisora_id,

          nombre:
            fila.entidad_emisora_nombre,

          ruc:
            fila.entidad_emisora_ruc
        },


        responsable: {
          id:
            fila.responsable_id,

          nombres:
            fila.responsable_nombres,

          apellidos:
            fila.responsable_apellidos
        },


        reglaVigencia: {
          id:
            fila.regla_id,

          version:
            fila.regla_version,

          tipoVigencia:
            fila.tipo_vigencia,

          duracionValor:
            fila.duracion_valor,

          duracionUnidad:
            fila.duracion_unidad,

          requiereRenovacion:
            fila.requiere_renovacion,

          umbralPorVencerDias:
            fila.umbral_por_vencer_dias,

          umbralCriticoDias:
            fila.umbral_critico_dias
        },


        archivos,

        tramites: [],

        renovaciones: []
      }
    });

  } catch (error) {

    console.error(
      'Error obteniendo detalle del documento:',
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
  obtenerDetalleDocumento
};