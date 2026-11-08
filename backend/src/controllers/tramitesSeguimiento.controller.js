const pool =
  require('../config/database');


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


function calcularDuracion(
  fechaInicio,
  fechaFin
) {

  if (!fechaInicio) {

    return {
      milisegundos: 0,
      horas: 0,
      dias: 0
    };
  }


  const inicio =
    new Date(fechaInicio);


  const fin =
    fechaFin
      ? new Date(fechaFin)
      : new Date();


  if (
    Number.isNaN(
      inicio.getTime()
    ) ||
    Number.isNaN(
      fin.getTime()
    )
  ) {

    return {
      milisegundos: 0,
      horas: 0,
      dias: 0
    };
  }


  const diferencia =
    Math.max(
      0,
      fin.getTime() -
      inicio.getTime()
    );


  return {

    milisegundos:
      diferencia,

    horas:
      Number(
        (
          diferencia /
          (
            1000 *
            60 *
            60
          )
        ).toFixed(2)
      ),

    dias:
      Number(
        (
          diferencia /
          (
            1000 *
            60 *
            60 *
            24
          )
        ).toFixed(2)
      )
  };
}


// ============================================================
// CONSULTAR SEGUIMIENTO
// HU-030
// ============================================================

async function obtenerSeguimientoTramite(
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


    // ========================================================
    // DATOS PRINCIPALES DEL TRÁMITE
    // ========================================================

    const tramiteResultado =
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

            te.nombre
              AS estado_nombre,

            d.id
              AS documento_id,

            d.codigo_interno
              AS documento_codigo_interno,

            d.numero_documento
              AS documento_numero,

            ti.id
              AS tienda_id,

            ti.nombre
              AS tienda_nombre,

            ee.id
              AS entidad_id,

            ee.nombre
              AS entidad_nombre,

            u.id
              AS responsable_id,

            u.nombres
              AS responsable_nombres,

            u.apellidos
              AS responsable_apellidos

          FROM tramites t

          INNER JOIN tramite_estados te
            ON te.codigo =
               t.estado_codigo

          INNER JOIN documentos d
            ON d.id =
               t.documento_id

          LEFT JOIN tiendas ti
            ON ti.id =
               d.tienda_id

          INNER JOIN entidades_emisoras ee
            ON ee.id =
               t.entidad_emisora_id

          INNER JOIN usuarios u
            ON u.id =
               t.responsable_usuario_id

          WHERE t.id = $1

          LIMIT 1;
        `,
        [
          tramiteId
        ]
      );


    if (
      tramiteResultado.rowCount ===
      0
    ) {

      return res.status(404).json({
        ok: false,
        mensaje:
          'El trámite no existe'
      });
    }


    const fila =
      tramiteResultado.rows[0];


    // ========================================================
    // HISTORIAL DE ESTADOS
    // ========================================================

    const estadosResultado =
      await pool.query(
        `
          SELECT
            h.id,
            h.estado_anterior_codigo,
            h.estado_nuevo_codigo,
            h.comentario,
            h.fecha_cambio,

            u.id
              AS usuario_id,

            u.nombres
              AS usuario_nombres,

            u.apellidos
              AS usuario_apellidos

          FROM tramite_estado_historial h

          INNER JOIN usuarios u
            ON u.id =
               h.usuario_id

          WHERE h.tramite_id = $1

          ORDER BY
            h.fecha_cambio ASC,
            h.id ASC;
        `,
        [
          tramiteId
        ]
      );


    // ========================================================
    // OBSERVACIONES
    // ========================================================

    const observacionesResultado =
      await pool.query(
        `
          SELECT
            o.id,
            o.descripcion,
            o.fecha_observacion,
            o.estado,

            u.id
              AS responsable_id,

            u.nombres
              AS responsable_nombres,

            u.apellidos
              AS responsable_apellidos

          FROM tramite_observaciones o

          INNER JOIN usuarios u
            ON u.id =
               o.responsable_usuario_id

          WHERE o.tramite_id = $1

          ORDER BY
            o.fecha_observacion ASC,
            o.id ASC;
        `,
        [
          tramiteId
        ]
      );


    // ========================================================
    // SUBSANACIONES
    // ========================================================

    const subsanacionesResultado =
      await pool.query(
        `
          SELECT
            s.id,
            s.observacion_id,
            s.descripcion,
            s.fecha_subsanacion,

            u.id
              AS responsable_id,

            u.nombres
              AS responsable_nombres,

            u.apellidos
              AS responsable_apellidos

          FROM tramite_subsanaciones s

          INNER JOIN tramite_observaciones o
            ON o.id =
               s.observacion_id

          INNER JOIN usuarios u
            ON u.id =
               s.responsable_usuario_id

          WHERE o.tramite_id = $1

          ORDER BY
            s.fecha_subsanacion ASC,
            s.id ASC;
        `,
        [
          tramiteId
        ]
      );


    // ========================================================
    // EVIDENCIAS
    // ========================================================

    const evidenciasResultado =
      await pool.query(
        `
          SELECT
            e.id,
            e.observacion_id,
            e.subsanacion_id,
            e.nombre_original,
            e.mime_type,
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
            e.fecha_subida ASC,
            e.id ASC;
        `,
        [
          tramiteId
        ]
      );


    // ========================================================
    // CONSTRUIR LÍNEA DE TIEMPO
    // ========================================================

    const lineaTiempo = [];


    lineaTiempo.push({

      tipo:
        'CREACION_TRAMITE',

      id:
        `creacion-${tramiteId}`,

      fecha:
        fila.fecha_creacion,

      titulo:
        'Trámite registrado',

      descripcion:
        `Se registró el expediente ${fila.numero_expediente}.`,

      usuario:
        `${fila.responsable_nombres} ${fila.responsable_apellidos}`,

      datos: {
        estado:
          fila.estado_codigo
      }
    });


    estadosResultado.rows.forEach(
      (
        estado
      ) => {

        lineaTiempo.push({

          tipo:
            'CAMBIO_ESTADO',

          id:
            `estado-${estado.id}`,

          fecha:
            estado.fecha_cambio,

          titulo:
            'Cambio de estado',

          descripcion:
            estado.comentario,

          usuario:
            `${estado.usuario_nombres} ${estado.usuario_apellidos}`,

          datos: {

            estadoAnterior:
              estado.estado_anterior_codigo,

            estadoNuevo:
              estado.estado_nuevo_codigo
          }
        });
      }
    );


    observacionesResultado.rows.forEach(
      (
        observacion
      ) => {

        lineaTiempo.push({

          tipo:
            'OBSERVACION',

          id:
            `observacion-${observacion.id}`,

          fecha:
            observacion.fecha_observacion,

          titulo:
            `Observación #${observacion.id}`,

          descripcion:
            observacion.descripcion,

          usuario:
            `${observacion.responsable_nombres} ${observacion.responsable_apellidos}`,

          datos: {

            observacionId:
              observacion.id,

            estado:
              observacion.estado
          }
        });
      }
    );


    subsanacionesResultado.rows.forEach(
      (
        subsanacion
      ) => {

        lineaTiempo.push({

          tipo:
            'SUBSANACION',

          id:
            `subsanacion-${subsanacion.id}`,

          fecha:
            subsanacion.fecha_subsanacion,

          titulo:
            `Subsanación #${subsanacion.id}`,

          descripcion:
            subsanacion.descripcion,

          usuario:
            `${subsanacion.responsable_nombres} ${subsanacion.responsable_apellidos}`,

          datos: {

            subsanacionId:
              subsanacion.id,

            observacionId:
              subsanacion.observacion_id
          }
        });
      }
    );


    evidenciasResultado.rows.forEach(
      (
        evidencia
      ) => {

        lineaTiempo.push({

          tipo:
            'EVIDENCIA',

          id:
            `evidencia-${evidencia.id}`,

          fecha:
            evidencia.fecha_subida,

          titulo:
            'Evidencia adjuntada',

          descripcion:
            evidencia.descripcion ||
            evidencia.nombre_original,

          usuario:
            `${evidencia.usuario_nombres} ${evidencia.usuario_apellidos}`,

          datos: {

            evidenciaId:
              evidencia.id,

            nombreOriginal:
              evidencia.nombre_original,

            observacionId:
              evidencia.observacion_id,

            subsanacionId:
              evidencia.subsanacion_id,

            tamanoBytes:
              Number(
                evidencia.tamano_bytes
              ),

            hashSha256:
              evidencia.hash_sha256
          }
        });
      }
    );


    lineaTiempo.sort(
      (
        a,
        b
      ) => {

        const fechaA =
          new Date(
            a.fecha
          ).getTime();

        const fechaB =
          new Date(
            b.fecha
          ).getTime();


        return (
          fechaA -
          fechaB
        );
      }
    );


    // ========================================================
    // DURACIÓN ACUMULADA
    // ========================================================

    const duracion =
      calcularDuracion(
        fila.fecha_inicio,
        fila.fecha_finalizacion
      );


    // ========================================================
    // RESPUESTA
    // ========================================================

    return res.status(200).json({

      ok: true,

      tramite: {

        id:
          fila.id,

        numeroExpediente:
          fila.numero_expediente,

        estado:
          fila.estado_codigo,

        estadoNombre:
          fila.estado_nombre,

        observaciones:
          fila.observaciones,

        fechas: {

          inicio:
            fila.fecha_inicio,

          finalizacion:
            fila.fecha_finalizacion,

          creacion:
            fila.fecha_creacion,

          ultimaActualizacion:
            fila.fecha_actualizacion
        },

        duracion: {

          dias:
            duracion.dias,

          horas:
            duracion.horas,

          finalizado:
            Boolean(
              fila.fecha_finalizacion
            )
        },

        documento: {

          id:
            fila.documento_id,

          codigoInterno:
            fila.documento_codigo_interno,

          numeroDocumento:
            fila.documento_numero
        },

        tienda: {

          id:
            fila.tienda_id,

          nombre:
            fila.tienda_nombre
        },

        entidadEmisora: {

          id:
            fila.entidad_id,

          nombre:
            fila.entidad_nombre
        },

        responsable: {

          id:
            fila.responsable_id,

          nombreCompleto:
            `${fila.responsable_nombres} ${fila.responsable_apellidos}`
        }
      },


      observaciones:
        observacionesResultado.rows.map(
          (
            observacion
          ) => ({

            id:
              observacion.id,

            descripcion:
              observacion.descripcion,

            fecha:
              observacion.fecha_observacion,

            estado:
              observacion.estado,

            responsable: {

              id:
                observacion.responsable_id,

              nombreCompleto:
                `${observacion.responsable_nombres} ${observacion.responsable_apellidos}`
            }
          })
        ),


      subsanaciones:
        subsanacionesResultado.rows.map(
          (
            subsanacion
          ) => ({

            id:
              subsanacion.id,

            observacionId:
              subsanacion.observacion_id,

            descripcion:
              subsanacion.descripcion,

            fecha:
              subsanacion.fecha_subsanacion,

            responsable: {

              id:
                subsanacion.responsable_id,

              nombreCompleto:
                `${subsanacion.responsable_nombres} ${subsanacion.responsable_apellidos}`
            }
          })
        ),


      evidencias:
        evidenciasResultado.rows.map(
          (
            evidencia
          ) => ({

            id:
              evidencia.id,

            observacionId:
              evidencia.observacion_id,

            subsanacionId:
              evidencia.subsanacion_id,

            nombreOriginal:
              evidencia.nombre_original,

            mimeType:
              evidencia.mime_type,

            tamanoBytes:
              Number(
                evidencia.tamano_bytes
              ),

            hashSha256:
              evidencia.hash_sha256,

            descripcion:
              evidencia.descripcion,

            fechaSubida:
              evidencia.fecha_subida,

            usuario: {

              id:
                evidencia.usuario_id,

              nombreCompleto:
                `${evidencia.usuario_nombres} ${evidencia.usuario_apellidos}`
            }
          })
        ),


      lineaTiempo
    });


  } catch (
    error
  ) {

    console.error(
      'Error obteniendo seguimiento del trámite:',
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
  obtenerSeguimientoTramite
};