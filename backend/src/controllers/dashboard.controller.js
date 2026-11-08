const pool =
  require('../config/database');

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


function textoFiltro(valor) {
  if (
    typeof valor !== 'string'
  ) {
    return '';
  }

  return valor.trim();
}


function formatearFecha(valor) {
  if (!valor) {
    return null;
  }

  return String(valor)
    .slice(0, 10);
}


// ============================================================
// HU-038 / HU-039
// OBTENER INDICADORES GENERALES DEL DASHBOARD
// ============================================================

async function obtenerDashboard(
  req,
  res
) {
  try {
    // Se usa la misma regla de vigencia que el listado operativo.
    await recalcularEstadosDocumentos();

    const tiendaId =
      textoFiltro(
        req.query.tiendaId
      );

    const tipoDocumentoId =
      textoFiltro(
        req.query.tipoDocumentoId
      );

    const categoria =
      textoFiltro(
        req.query.categoria
      );


    if (
      tiendaId &&
      !idValido(tiendaId)
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El filtro de tienda no es válido.'
      });
    }


    if (
      tipoDocumentoId &&
      !idValido(tipoDocumentoId)
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El filtro de tipo de documento no es válido.'
      });
    }


    const condiciones = [
      `d.condicion_registro = 'ACTIVO'`
    ];

    const parametros = [];


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
        Number(tipoDocumentoId)
      );

      condiciones.push(
        `d.tipo_documento_id = $${parametros.length}`
      );
    }


    if (categoria) {
      parametros.push(
        categoria
      );

      condiciones.push(
        `LOWER(td.categoria) = LOWER($${parametros.length})`
      );
    }


    const where =
      `WHERE ${condiciones.join(
        '\n AND '
      )}`;


    const [
      resultadoTiendas,
      resultadoIndicadores,
      resultadoProximos,
      resultadoTiendasFiltradas,
      resultadoCatalogoTiendas,
      resultadoCatalogoTipos
    ] = await Promise.all([
      pool.query(
        `
          SELECT
            COUNT(*)::int AS total
          FROM tiendas
          WHERE activo = TRUE;
        `
      ),

      pool.query(
        `
          SELECT
            COUNT(*)::int AS total_documentos,

            COUNT(*) FILTER (
              WHERE d.estado = 'VIGENTE'
            )::int AS vigente,

            COUNT(*) FILTER (
              WHERE d.estado = 'POR_VENCER'
            )::int AS por_vencer,

            COUNT(*) FILTER (
              WHERE d.estado = 'CRITICO'
            )::int AS critico,

            COUNT(*) FILTER (
              WHERE d.estado = 'VENCIDO'
            )::int AS vencido,

            COUNT(*) FILTER (
              WHERE d.estado = 'EN_RENOVACION'
            )::int AS en_renovacion

          FROM documentos d

          INNER JOIN tipos_documento td
            ON td.id = d.tipo_documento_id

          ${where};
        `,
        parametros
      ),

      pool.query(
        `
          SELECT
            d.id,
            d.codigo_interno,
            d.numero_documento,
            d.fecha_vencimiento,
            d.estado,

            (d.fecha_vencimiento - CURRENT_DATE)::int
              AS dias_restantes,

            t.id AS tienda_id,
            t.nombre AS tienda_nombre,

            td.id AS tipo_documento_id,
            td.nombre AS tipo_documento_nombre,
            td.categoria AS tipo_documento_categoria

          FROM documentos d

          INNER JOIN tiendas t
            ON t.id = d.tienda_id

          INNER JOIN tipos_documento td
            ON td.id = d.tipo_documento_id

          ${where}

            AND d.fecha_vencimiento IS NOT NULL
            AND d.fecha_vencimiento >= CURRENT_DATE

          ORDER BY
            d.fecha_vencimiento ASC,
            d.id ASC

          LIMIT 10;
        `,
        parametros
      ),

      pool.query(
        `
          SELECT
            COUNT(DISTINCT d.tienda_id)::int AS total

          FROM documentos d

          INNER JOIN tipos_documento td
            ON td.id = d.tipo_documento_id

          ${where};
        `,
        parametros
      ),

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


    const fila =
      resultadoIndicadores.rows[0] || {};


    const proximosVencimientos =
      resultadoProximos.rows.map(
        (documento) => ({
          id:
            documento.id,

          codigoInterno:
            documento.codigo_interno,

          numeroDocumento:
            documento.numero_documento,

          fechaVencimiento:
            formatearFecha(
              documento.fecha_vencimiento
            ),

          diasRestantes:
            Number(
              documento.dias_restantes
            ),

          estado:
            documento.estado,

          tienda: {
            id:
              documento.tienda_id,

            nombre:
              documento.tienda_nombre
          },

          tipoDocumento: {
            id:
              documento.tipo_documento_id,

            nombre:
              documento.tipo_documento_nombre,

            categoria:
              documento.tipo_documento_categoria
          }
        })
      );


    return res.status(200).json({
      ok: true,

      generadoEn:
        new Date().toISOString(),

      filtros: {
        tiendaId:
          tiendaId
            ? Number(tiendaId)
            : null,

        tipoDocumentoId:
          tipoDocumentoId
            ? Number(tipoDocumentoId)
            : null,

        categoria:
          categoria ||
          null
      },

      resumen: {
        totalTiendas:
          Number(
            resultadoTiendas.rows[0]
              ?.total ||
            0
          ),

        tiendasConDocumentos:
          Number(
            resultadoTiendasFiltradas
              .rows[0]
              ?.total ||
            0
          ),

        totalDocumentos:
          Number(
            fila.total_documentos ||
            0
          )
      },

      indicadores: {
        vigente:
          Number(
            fila.vigente ||
            0
          ),

        porVencer:
          Number(
            fila.por_vencer ||
            0
          ),

        critico:
          Number(
            fila.critico ||
            0
          ),

        vencido:
          Number(
            fila.vencido ||
            0
          ),

        enRenovacion:
          Number(
            fila.en_renovacion ||
            0
          )
      },

      proximosVencimientos,

      catalogos: {
        tiendas:
          resultadoCatalogoTiendas.rows.map(
            (tienda) => ({
              id:
                tienda.id,

              codigo:
                tienda.codigo,

              nombre:
                tienda.nombre
            })
          ),

        tiposDocumento:
          resultadoCatalogoTipos.rows.map(
            (tipo) => ({
              id:
                tipo.id,

              nombre:
                tipo.nombre,

              categoria:
                tipo.categoria
            })
          )
      }
    });

  } catch (error) {
    console.error(
      'Error al cargar Dashboard:',
      error
    );

    return res.status(500).json({
      ok: false,
      mensaje:
        'No se pudo cargar el Dashboard.'
    });
  }
}


module.exports = {
  obtenerDashboard
};
