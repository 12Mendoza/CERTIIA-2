const pool =
  require('../config/database');


// ============================================================
// LISTAR TRÁMITES
// HU-027
// ============================================================

async function listarTramites(
  req,
  res
) {

  try {

    const resultado =
      await pool.query(
        `
          SELECT
            t.id,

            t.numero_expediente,

            t.fecha_inicio,

            t.fecha_finalizacion,

            t.estado_codigo,

            t.observaciones,

            t.fecha_creacion,

            t.fecha_actualizacion,

            d.id
              AS documento_id,

            d.codigo_interno
              AS documento_codigo,

            d.numero_documento
              AS documento_numero,

            ti.id
              AS tienda_id,

            ti.nombre
              AS tienda_nombre,

            td.id
              AS tipo_documento_id,

            td.nombre
              AS tipo_documento_nombre,

            ee.id
              AS entidad_emisora_id,

            ee.nombre
              AS entidad_emisora_nombre,

            u.id
              AS responsable_id,

            u.nombres
              AS responsable_nombres,

            u.apellidos
              AS responsable_apellidos,

            te.nombre
              AS estado_nombre

          FROM tramites t

          INNER JOIN documentos d
            ON d.id =
               t.documento_id

          INNER JOIN tiendas ti
            ON ti.id =
               d.tienda_id

          INNER JOIN tipos_documento td
            ON td.id =
               d.tipo_documento_id

          INNER JOIN entidades_emisoras ee
            ON ee.id =
               t.entidad_emisora_id

          INNER JOIN usuarios u
            ON u.id =
               t.responsable_usuario_id

          INNER JOIN tramite_estados te
            ON te.codigo =
               t.estado_codigo

          ORDER BY
            t.fecha_actualizacion DESC,
            t.id DESC;
        `
      );


    const tramites =
      resultado.rows.map(
        (fila) => ({

          id:
            fila.id,

          numeroExpediente:
            fila.numero_expediente,

          fechaInicio:
            fila.fecha_inicio,

          fechaFinalizacion:
            fila.fecha_finalizacion,

          estado:
            fila.estado_codigo,

          estadoNombre:
            fila.estado_nombre,

          observaciones:
            fila.observaciones,

          fechaCreacion:
            fila.fecha_creacion,

          fechaActualizacion:
            fila.fecha_actualizacion,

          documento: {

            id:
              fila.documento_id,

            codigoInterno:
              fila.documento_codigo,

            numeroDocumento:
              fila.documento_numero
          },

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
              fila.tipo_documento_nombre
          },

          entidadEmisora: {

            id:
              fila.entidad_emisora_id,

            nombre:
              fila.entidad_emisora_nombre
          },

          responsable: {

            id:
              fila.responsable_id,

            nombres:
              fila.responsable_nombres,

            apellidos:
              fila.responsable_apellidos,

            nombreCompleto:
              `${fila.responsable_nombres} ${fila.responsable_apellidos}`
          }
        })
      );


    return res.status(200).json({

      ok: true,

      total:
        tramites.length,

      tramites
    });


  } catch (error) {

    console.error(
      'Error listando trámites:',
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
// OBTENER HISTORIAL DE ESTADOS
// HU-027
// ============================================================

async function obtenerHistorialTramite(
  req,
  res
) {

  try {

    const tramiteId =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(
        tramiteId
      ) ||
      tramiteId <= 0
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El identificador del trámite no es válido'
      });
    }


    const existeTramite =
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
      existeTramite.rowCount === 0
    ) {

      return res.status(404).json({
        ok: false,
        mensaje:
          'El trámite no existe'
      });
    }


    const resultado =
      await pool.query(
        `
          SELECT
            h.id,

            h.estado_anterior_codigo,

            ea.nombre
              AS estado_anterior_nombre,

            h.estado_nuevo_codigo,

            en.nombre
              AS estado_nuevo_nombre,

            h.comentario,

            h.usuario_id,

            u.nombres
              AS usuario_nombres,

            u.apellidos
              AS usuario_apellidos,

            h.fecha_cambio

          FROM tramite_estado_historial h

          LEFT JOIN tramite_estados ea
            ON ea.codigo =
               h.estado_anterior_codigo

          INNER JOIN tramite_estados en
            ON en.codigo =
               h.estado_nuevo_codigo

          INNER JOIN usuarios u
            ON u.id =
               h.usuario_id

          WHERE
            h.tramite_id = $1

          ORDER BY
            h.fecha_cambio DESC,
            h.id DESC;
        `,
        [
          tramiteId
        ]
      );


    const historial =
      resultado.rows.map(
        (fila) => ({

          id:
            fila.id,

          estadoAnterior:
            fila.estado_anterior_codigo,

          estadoAnteriorNombre:
            fila.estado_anterior_nombre,

          estadoNuevo:
            fila.estado_nuevo_codigo,

          estadoNuevoNombre:
            fila.estado_nuevo_nombre,

          comentario:
            fila.comentario,

          usuarioId:
            fila.usuario_id,

          usuario:
            `${fila.usuario_nombres} ${fila.usuario_apellidos}`,

          fecha:
            fila.fecha_cambio
        })
      );


    return res.status(200).json({

      ok: true,

      tramite: {

        id:
          existeTramite.rows[0].id,

        numeroExpediente:
          existeTramite.rows[0]
            .numero_expediente,

        estado:
          existeTramite.rows[0]
            .estado_codigo
      },

      historial
    });


  } catch (error) {

    console.error(
      'Error obteniendo historial del trámite:',
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
  listarTramites,
  obtenerHistorialTramite
};