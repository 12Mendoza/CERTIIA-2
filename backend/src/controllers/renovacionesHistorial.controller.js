const pool =
  require('../config/database');


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
// HU-033
// CONSULTAR HISTORIAL DE RENOVACIONES
// ============================================================

async function consultarHistorialRenovaciones(
  req,
  res
) {

  try {

    const documentoId =
      Number(
        req.params.documentoId
      );


    // ========================================================
    // VALIDAR DOCUMENTO
    // ========================================================

    if (
      !idValido(
        documentoId
      )
    ) {

      return res.status(400).json({

        ok: false,

        mensaje:
          'El documento indicado no es válido'
      });
    }


    // ========================================================
    // COMPROBAR EXISTENCIA
    // ========================================================

    const resultadoDocumento =
      await pool.query(
        `
          SELECT
            id,
            codigo_interno,
            numero_documento

          FROM documentos

          WHERE id = $1

          LIMIT 1;
        `,
        [
          documentoId
        ]
      );


    if (
      resultadoDocumento.rowCount ===
      0
    ) {

      return res.status(404).json({

        ok: false,

        mensaje:
          'El documento no existe'
      });
    }


    // ========================================================
    // OBTENER TODA LA CADENA DOCUMENTAL
    //
    // Permite comenzar desde:
    // - documento original
    // - documento intermedio
    // - último documento renovado
    //
    // Y reconstruye toda la cadena.
    // ========================================================

    const resultadoCadena =
      await pool.query(
        `
          WITH RECURSIVE
          cadena_documentos(id) AS (

            SELECT
              $1::BIGINT


            UNION


            SELECT

              CASE

                WHEN
                  r.documento_anterior_id =
                  cd.id

                THEN
                  r.documento_renovado_id

                ELSE
                  r.documento_anterior_id

              END

            FROM cadena_documentos cd

            INNER JOIN renovaciones r

              ON
                r.documento_anterior_id =
                  cd.id

                OR

                r.documento_renovado_id =
                  cd.id

            WHERE

              r.documento_renovado_id
                IS NOT NULL
          )

          SELECT

            d.id,

            d.codigo_interno,

            d.numero_documento,

            d.numero_expediente,

            d.fecha_emision,

            d.fecha_vencimiento,

            d.estado,

            d.condicion_registro,

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


            ee.id
              AS entidad_emisora_id,

            ee.nombre
              AS entidad_emisora_nombre,


            u.id
              AS responsable_usuario_id,

            u.nombres
              AS responsable_nombres,

            u.apellidos
              AS responsable_apellidos


          FROM cadena_documentos cd

          INNER JOIN documentos d

            ON d.id =
               cd.id


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


          ORDER BY

            d.fecha_emision ASC,

            d.id ASC;
        `,
        [
          documentoId
        ]
      );


    // ========================================================
    // IDS DE TODA LA CADENA
    // ========================================================

    const idsCadena =
      resultadoCadena.rows.map(
        (fila) =>
          Number(fila.id)
      );


    // ========================================================
    // RENOVACIONES DE TODA LA CADENA
    // ========================================================

    let renovaciones = [];


    if (
      idsCadena.length > 0
    ) {

      const resultadoRenovaciones =
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
                  (
                    CURRENT_DATE -
                    r.fecha_inicio
                  )::int

              END
                AS duracion_dias,


              da.codigo_interno
                AS documento_anterior_codigo,

              da.numero_documento
                AS documento_anterior_numero,


              dn.codigo_interno
                AS documento_renovado_codigo,

              dn.numero_documento
                AS documento_renovado_numero,


              ur.nombres
                AS responsable_nombres,

              ur.apellidos
                AS responsable_apellidos,


              tr.numero_expediente
                AS tramite_expediente,

              tr.estado
                AS tramite_estado


            FROM renovaciones r


            INNER JOIN documentos da

              ON da.id =
                 r.documento_anterior_id


            LEFT JOIN documentos dn

              ON dn.id =
                 r.documento_renovado_id


            INNER JOIN usuarios ur

              ON ur.id =
                 r.responsable_usuario_id


            LEFT JOIN tramites tr

              ON tr.id =
                 r.tramite_id


            WHERE

              r.documento_anterior_id =
                ANY($1::BIGINT[])

              OR

              r.documento_renovado_id =
                ANY($1::BIGINT[])


            ORDER BY

              r.fecha_inicio ASC,

              r.id ASC;
          `,
          [
            idsCadena
          ]
        );


      renovaciones =
        resultadoRenovaciones.rows.map(
          (fila) => ({

            id:
              fila.id,

            estado:
              fila.estado,

            fechaInicio:
              fila.fecha_inicio,

            fechaFinalizacion:
              fila.fecha_finalizacion,

            duracionDias:
              Number(
                fila.duracion_dias
              ),

            observaciones:
              fila.observaciones,


            documentoAnterior: {

              id:
                fila.documento_anterior_id,

              codigoInterno:
                fila.documento_anterior_codigo,

              numeroDocumento:
                fila.documento_anterior_numero
            },


            documentoRenovado:
              fila.documento_renovado_id
                ? {

                    id:
                      fila.documento_renovado_id,

                    codigoInterno:
                      fila.documento_renovado_codigo,

                    numeroDocumento:
                      fila.documento_renovado_numero
                  }
                : null,


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


            tramite:
              fila.tramite_id
                ? {

                    id:
                      fila.tramite_id,

                    numeroExpediente:
                      fila.tramite_expediente,

                    estado:
                      fila.tramite_estado
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
          })
        );
    }


    // ========================================================
    // FORMATEAR VERSIONES
    // ========================================================

    const versiones =
      resultadoCadena.rows.map(
        (
          fila,
          indice
        ) => ({

          numeroVersion:
            indice + 1,

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

          condicionRegistro:
            fila.condicion_registro,

          observaciones:
            fila.observaciones,


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


          fechaCreacion:
            fila.fecha_creacion,

          fechaActualizacion:
            fila.fecha_actualizacion
        })
      );


    // ========================================================
    // RESPUESTA
    // ========================================================

    return res.status(200).json({

      ok: true,


      documentoConsultado: {

        id:
          resultadoDocumento
            .rows[0]
            .id,

        codigoInterno:
          resultadoDocumento
            .rows[0]
            .codigo_interno,

        numeroDocumento:
          resultadoDocumento
            .rows[0]
            .numero_documento
      },


      resumen: {

        totalVersiones:
          versiones.length,

        totalRenovaciones:
          renovaciones.length,

        primeraVersionId:
          versiones[0]
            ?.id ||
          null,

        versionActualId:
          versiones[
            versiones.length - 1
          ]?.id ||
          null
      },


      versiones,

      renovaciones
    });


  } catch (error) {

    console.error(
      'Error consultando historial de renovaciones:',
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
  consultarHistorialRenovaciones
};