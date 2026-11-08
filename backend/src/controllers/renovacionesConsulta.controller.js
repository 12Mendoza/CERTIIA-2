const pool =
  require('../config/database');


// ============================================================
// UTILIDADES
// ============================================================

function textoFiltro(valor) {

  if (
    typeof valor !== 'string'
  ) {
    return '';
  }

  return valor.trim();
}


// ============================================================
// FORMATEAR RENOVACIÓN
// ============================================================

function formatearRenovacion(
  fila
) {

  return {

    id:
      fila.id,

    estado:
      fila.estado,

    fechaInicio:
      fila.fecha_inicio,

    fechaFinalizacion:
      fila.fecha_finalizacion,

    duracionDias:
      fila.fecha_finalizacion
        ? Number(
            fila.duracion_dias
          )
        : Number(
            fila.duracion_actual_dias
          ),

    observaciones:
      fila.observaciones,


    // ========================================================
    // DOCUMENTO ANTERIOR
    // ========================================================

    documentoAnterior: {

      id:
        fila.documento_anterior_id,

      codigoInterno:
        fila.documento_anterior_codigo,

      numeroDocumento:
        fila.documento_anterior_numero,

      numeroExpediente:
        fila.documento_anterior_expediente,

      fechaEmision:
        fila.documento_anterior_emision,

      fechaVencimiento:
        fila.documento_anterior_vencimiento,

      estado:
        fila.documento_anterior_estado,

      condicionRegistro:
        fila.documento_anterior_condicion,


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
          fila.tipo_documento_categoria
      },


      entidadEmisora: {

        id:
          fila.entidad_emisora_id,

        nombre:
          fila.entidad_emisora_nombre
      },


      reglaVigencia: {

        id:
          fila.regla_vigencia_id,

        tipoVigencia:
          fila.tipo_vigencia,

        requiereRenovacion:
          fila.requiere_renovacion
      }
    },


    // ========================================================
    // DOCUMENTO RENOVADO
    // ========================================================

    documentoRenovado:
      fila.documento_renovado_id
        ? {

            id:
              fila.documento_renovado_id,

            codigoInterno:
              fila.documento_renovado_codigo,

            numeroDocumento:
              fila.documento_renovado_numero,

            fechaEmision:
              fila.documento_renovado_emision,

            fechaVencimiento:
              fila.documento_renovado_vencimiento,

            estado:
              fila.documento_renovado_estado
          }
        : null,


    // ========================================================
    // RESPONSABLE
    // ========================================================

    responsable: {

      id:
        fila.responsable_usuario_id,

      nombres:
        fila.responsable_nombres,

      apellidos:
        fila.responsable_apellidos,

      nombreCompleto:
        `${fila.responsable_nombres || ''} ${fila.responsable_apellidos || ''}`
          .trim()
    },


    // ========================================================
    // TRÁMITE
    // ========================================================

    tramite:
      fila.tramite_id
        ? {

            id:
              fila.tramite_id,

            numeroExpediente:
              fila.tramite_expediente
          }
        : null,


    creadoPor:
      fila.creado_por,

    finalizadoPor:
      fila.finalizado_por,

    fechaCreacion:
      fila.fecha_creacion,

    fechaActualizacion:
      fila.fecha_actualizacion
  };
}


// ============================================================
// LISTAR RENOVACIONES
// HU-032 + BASE HU-033
// ============================================================

async function listarRenovaciones(
  req,
  res
) {

  try {

    const busqueda =
      textoFiltro(
        req.query.q
      );


    const estado =
      textoFiltro(
        req.query.estado
      )
        .toUpperCase();


    // ========================================================
    // VALIDAR ESTADO
    // ========================================================

    const estadosPermitidos = [

      'EN_PROCESO',

      'COMPLETADA',

      'CANCELADA'
    ];


    if (
      estado &&
      !estadosPermitidos.includes(
        estado
      )
    ) {

      return res.status(400).json({

        ok: false,

        mensaje:
          'El estado de renovación seleccionado no es válido'
      });
    }


    // ========================================================
    // FILTROS
    // ========================================================

    const condiciones = [
      '1 = 1'
    ];


    const parametros = [];


    if (estado) {

      parametros.push(
        estado
      );


      condiciones.push(
        `r.estado = $${parametros.length}`
      );
    }


    if (busqueda) {

      parametros.push(
        `%${busqueda}%`
      );


      const posicion =
        parametros.length;


      condiciones.push(
        `
          (
            da.codigo_interno
              ILIKE $${posicion}

            OR da.numero_documento
              ILIKE $${posicion}

            OR t.nombre
              ILIKE $${posicion}

            OR td.nombre
              ILIKE $${posicion}

            OR CONCAT(
              ur.nombres,
              ' ',
              ur.apellidos
            )
              ILIKE $${posicion}

            OR tr.numero_expediente
              ILIKE $${posicion}

            OR dr.codigo_interno
              ILIKE $${posicion}

            OR dr.numero_documento
              ILIKE $${posicion}
          )
        `
      );
    }


    const where =
      condiciones.join(
        '\n AND '
      );


    // ========================================================
    // CONSULTA
    // ========================================================

    const resultado =
      await pool.query(
        `
          SELECT

            r.id,

            r.documento_anterior_id,

            r.documento_renovado_id,

            r.tramite_id,

            r.responsable_usuario_id,

            r.fecha_inicio,

            r.fecha_finalizacion,

            r.estado,

            r.observaciones,

            r.creado_por,

            r.finalizado_por,

            r.fecha_creacion,

            r.fecha_actualizacion,


            CASE

              WHEN
                r.fecha_finalizacion
                  IS NOT NULL

              THEN
                (
                  r.fecha_finalizacion -
                  r.fecha_inicio
                )::int

              ELSE
                NULL

            END
              AS duracion_dias,


            (
              CURRENT_DATE -
              r.fecha_inicio
            )::int
              AS duracion_actual_dias,


            -- =================================================
            -- DOCUMENTO ANTERIOR
            -- =================================================

            da.codigo_interno
              AS documento_anterior_codigo,

            da.numero_documento
              AS documento_anterior_numero,

            da.numero_expediente
              AS documento_anterior_expediente,

            da.fecha_emision
              AS documento_anterior_emision,

            da.fecha_vencimiento
              AS documento_anterior_vencimiento,

            da.estado
              AS documento_anterior_estado,

            da.condicion_registro
              AS documento_anterior_condicion,


            -- =================================================
            -- TIENDA
            -- =================================================

            t.id
              AS tienda_id,

            t.nombre
              AS tienda_nombre,


            -- =================================================
            -- TIPO DOCUMENTAL
            -- =================================================

            td.id
              AS tipo_documento_id,

            td.nombre
              AS tipo_documento_nombre,

            td.categoria
              AS tipo_documento_categoria,


            -- =================================================
            -- ENTIDAD
            -- =================================================

            ee.id
              AS entidad_emisora_id,

            ee.nombre
              AS entidad_emisora_nombre,


            -- =================================================
            -- REGLA
            -- =================================================

            rv.id
              AS regla_vigencia_id,

            rv.tipo_vigencia,

            rv.requiere_renovacion,


            -- =================================================
            -- RESPONSABLE
            -- =================================================

            ur.nombres
              AS responsable_nombres,

            ur.apellidos
              AS responsable_apellidos,


            -- =================================================
            -- TRÁMITE
            -- =================================================

            tr.numero_expediente
              AS tramite_expediente,


            -- =================================================
            -- DOCUMENTO RENOVADO
            -- =================================================

            dr.codigo_interno
              AS documento_renovado_codigo,

            dr.numero_documento
              AS documento_renovado_numero,

            dr.fecha_emision
              AS documento_renovado_emision,

            dr.fecha_vencimiento
              AS documento_renovado_vencimiento,

            dr.estado
              AS documento_renovado_estado


          FROM renovaciones r


          INNER JOIN documentos da

            ON da.id =
               r.documento_anterior_id


          INNER JOIN tiendas t

            ON t.id =
               da.tienda_id


          INNER JOIN tipos_documento td

            ON td.id =
               da.tipo_documento_id


          INNER JOIN entidades_emisoras ee

            ON ee.id =
               da.entidad_emisora_id


          INNER JOIN
            tipo_documento_reglas_vigencia rv

            ON rv.id =
               da.regla_vigencia_id


          INNER JOIN usuarios ur

            ON ur.id =
               r.responsable_usuario_id


          LEFT JOIN tramites tr

            ON tr.id =
               r.tramite_id


          LEFT JOIN documentos dr

            ON dr.id =
               r.documento_renovado_id


          WHERE
            ${where}


          ORDER BY

            CASE
              WHEN r.estado =
                'EN_PROCESO'
              THEN 0
              ELSE 1
            END ASC,

            r.fecha_inicio DESC,

            r.id DESC;
        `,
        parametros
      );


    const renovaciones =
      resultado.rows.map(
        formatearRenovacion
      );


    // ========================================================
    // INDICADORES
    // ========================================================

    const total =
      renovaciones.length;


    const enProceso =
      renovaciones.filter(
        (item) =>
          item.estado ===
          'EN_PROCESO'
      ).length;


    const completadas =
      renovaciones.filter(
        (item) =>
          item.estado ===
          'COMPLETADA'
      ).length;


    const canceladas =
      renovaciones.filter(
        (item) =>
          item.estado ===
          'CANCELADA'
      ).length;


    // ========================================================
    // RESPUESTA
    // ========================================================

    return res.status(200).json({

      ok: true,

      total,

      indicadores: {

        total,

        enProceso,

        completadas,

        canceladas
      },

      renovaciones
    });


  } catch (error) {

    console.error(
      'Error listando renovaciones:',
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
  listarRenovaciones
};