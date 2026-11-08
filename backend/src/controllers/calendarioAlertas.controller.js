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


function mesValido(valor) {

  return (
    typeof valor === 'string' &&
    /^\d{4}-(0[1-9]|1[0-2])$/.test(
      valor
    )
  );
}


// ============================================================
// HU-037
// CATÁLOGOS PARA FILTROS DEL CALENDARIO
// ============================================================

async function obtenerCatalogosCalendario(
  req,
  res
) {

  try {

    const [
      tiendas,
      tiposDocumento
    ] = await Promise.all([

      pool.query(
        `
          SELECT
            id,
            codigo,
            nombre

          FROM tiendas

          WHERE activo = TRUE

          ORDER BY nombre ASC;
        `
      ),

      pool.query(
        `
          SELECT
            id,
            nombre,
            categoria

          FROM tipos_documento

          WHERE activo = TRUE

          ORDER BY nombre ASC;
        `
      )
    ]);


    return res.status(200).json({
      ok: true,
      tiendas:
        tiendas.rows,
      tiposDocumento:
        tiposDocumento.rows
    });

  } catch (error) {

    console.error(
      'Error obteniendo catálogos de calendario:',
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
// HU-037
// VISUALIZAR CALENDARIO DE VENCIMIENTOS
// ============================================================

async function obtenerCalendarioVencimientos(
  req,
  res
) {

  try {

    const mes =
      req.query.mes;


    if (
      !mesValido(mes)
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El mes debe tener formato YYYY-MM'
      });
    }


    const tiendaId =
      req.query.tiendaId ||
      '';

    const tipoDocumentoId =
      req.query.tipoDocumentoId ||
      '';


    if (
      tiendaId &&
      !idValido(tiendaId)
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'La tienda seleccionada no es válida'
      });
    }


    if (
      tipoDocumentoId &&
      !idValido(tipoDocumentoId)
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El tipo documental seleccionado no es válido'
      });
    }


    const parametros = [
      `${mes}-01`
    ];


    const condiciones = [
      `d.fecha_vencimiento >= $1::date`,
      `d.fecha_vencimiento < ($1::date + INTERVAL '1 month')`,
      `d.condicion_registro = 'ACTIVO'`,
      `d.fecha_vencimiento IS NOT NULL`,
      `rv.tipo_vigencia <> 'INDETERMINADA'`
    ];


    if (tiendaId) {

      parametros.push(
        Number(tiendaId)
      );

      condiciones.push(
        `d.tienda_id = $${parametros.length}`
      );
    }


    if (tipoDocumentoId) {

      parametros.push(
        Number(
          tipoDocumentoId
        )
      );

      condiciones.push(
        `d.tipo_documento_id = $${parametros.length}`
      );
    }


    const resultado =
      await pool.query(
        `
          SELECT
            d.id,
            d.codigo_interno,
            d.numero_documento,
            d.fecha_vencimiento,
            d.estado,

            (
              d.fecha_vencimiento -
              CURRENT_DATE
            )::int
              AS dias_restantes,

            CASE
              WHEN
                (
                  d.fecha_vencimiento -
                  CURRENT_DATE
                ) < 0
              THEN 'VENCIDO'

              WHEN
                (
                  d.fecha_vencimiento -
                  CURRENT_DATE
                ) <=
                rv.umbral_critico_dias
              THEN 'CRITICO'

              WHEN
                (
                  d.fecha_vencimiento -
                  CURRENT_DATE
                ) <=
                rv.umbral_por_vencer_dias
              THEN 'POR_VENCER'

              ELSE 'NORMAL'
            END
              AS nivel_atencion,

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
              AS entidad_emisora_nombre

          FROM documentos d

          INNER JOIN tiendas t
            ON t.id = d.tienda_id

          INNER JOIN tipos_documento td
            ON td.id = d.tipo_documento_id

          INNER JOIN entidades_emisoras ee
            ON ee.id = d.entidad_emisora_id

          INNER JOIN
            tipo_documento_reglas_vigencia rv
            ON rv.id = d.regla_vigencia_id

          WHERE
            ${condiciones.join(
              '\n AND '
            )}

          ORDER BY
            d.fecha_vencimiento ASC,
            t.nombre ASC,
            td.nombre ASC;
        `,
        parametros
      );


    const eventos =
      resultado.rows.map(
        (fila) => ({
          id:
            fila.id,

          fecha:
            fila.fecha_vencimiento,

          diasRestantes:
            fila.dias_restantes,

          nivelAtencion:
            fila.nivel_atencion,

          documento: {
            id:
              fila.id,
            codigoInterno:
              fila.codigo_interno,
            numeroDocumento:
              fila.numero_documento,
            estado:
              fila.estado
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
              fila.tipo_documento_nombre,
            categoria:
              fila.tipo_documento_categoria
          },

          entidadEmisora: {
            id:
              fila.entidad_emisora_id,
            nombre:
              fila.entidad_emisora_nombre
          }
        })
      );


    return res.status(200).json({
      ok: true,
      mes,
      total:
        eventos.length,
      eventos
    });

  } catch (error) {

    console.error(
      'Error obteniendo calendario:',
      error
    );


    return res.status(500).json({
      ok: false,
      mensaje:
        'Error interno del servidor'
    });
  }
}


module.exports = {
  obtenerCatalogosCalendario,
  obtenerCalendarioVencimientos
};
