const pool = require('../config/database');


// ============================================================
// OBTENER CATÁLOGOS PARA REGISTRAR DOCUMENTOS
// ============================================================

async function obtenerCatalogosDocumento(
  req,
  res
) {
  try {

    // ========================================================
    // CONSULTAS
    // ========================================================

    const [
      tiendasResultado,
      tiposResultado,
      entidadesResultado,
      usuariosResultado
    ] = await Promise.all([

      // ------------------------------------------------------
      // TIENDAS ACTIVAS
      // ------------------------------------------------------

      pool.query(
        `
          SELECT
            id,
            codigo,
            nombre

          FROM tiendas

          WHERE activo = TRUE

          ORDER BY
            nombre ASC,
            codigo ASC;
        `
      ),


      // ------------------------------------------------------
      // TIPOS DOCUMENTALES ACTIVOS
      // CON REGLA DE VIGENCIA CONFIGURADA
      // ------------------------------------------------------

      pool.query(
        `
          SELECT
            td.id,
            td.nombre,
            td.categoria,

            rv.id
              AS regla_vigencia_id,

            rv.version
              AS regla_version,

            rv.tipo_vigencia,

            rv.duracion_valor,

            rv.duracion_unidad,

            rv.requiere_renovacion,

            rv.umbral_por_vencer_dias,

            rv.umbral_critico_dias

          FROM tipos_documento td

          INNER JOIN tipo_documento_reglas_vigencia rv
            ON rv.tipo_documento_id = td.id
            AND rv.es_actual = TRUE

          WHERE td.activo = TRUE

          ORDER BY
            td.categoria ASC,
            td.nombre ASC;
        `
      ),


      // ------------------------------------------------------
      // ENTIDADES EMISORAS ACTIVAS
      // ------------------------------------------------------

      pool.query(
        `
          SELECT
            id,
            tipo,
            nombre

          FROM entidades_emisoras

          WHERE activo = TRUE

          ORDER BY
            nombre ASC;
        `
      ),


      // ------------------------------------------------------
      // USUARIOS ACTIVOS
      // ------------------------------------------------------

      pool.query(
        `
          SELECT
            id,
            nombres,
            apellidos,
            email

          FROM usuarios

          WHERE activo = TRUE

          ORDER BY
            apellidos ASC,
            nombres ASC;
        `
      )
    ]);


    // ========================================================
    // FORMATEAR TIENDAS
    // ========================================================

    const tiendas =
      tiendasResultado.rows.map(
        (tienda) => ({
          id:
            tienda.id,

          codigo:
            tienda.codigo,

          nombre:
            tienda.nombre
        })
      );


    // ========================================================
    // FORMATEAR TIPOS DOCUMENTALES
    // ========================================================

    const tiposDocumento =
      tiposResultado.rows.map(
        (tipo) => ({
          id:
            tipo.id,

          nombre:
            tipo.nombre,

          categoria:
            tipo.categoria,

          reglaVigenciaId:
            tipo.regla_vigencia_id,

          reglaVersion:
            tipo.regla_version,

          tipoVigencia:
            tipo.tipo_vigencia,

          duracionValor:
            tipo.duracion_valor,

          duracionUnidad:
            tipo.duracion_unidad,

          requiereRenovacion:
            tipo.requiere_renovacion,

          umbralPorVencerDias:
            tipo.umbral_por_vencer_dias,

          umbralCriticoDias:
            tipo.umbral_critico_dias
        })
      );


    // ========================================================
    // FORMATEAR ENTIDADES
    // ========================================================

    const entidades =
      entidadesResultado.rows.map(
        (entidad) => ({
          id:
            entidad.id,

          tipo:
            entidad.tipo,

          nombre:
            entidad.nombre
        })
      );


    // ========================================================
    // FORMATEAR USUARIOS
    // ========================================================

    const usuarios =
      usuariosResultado.rows.map(
        (usuario) => ({
          id:
            usuario.id,

          nombres:
            usuario.nombres,

          apellidos:
            usuario.apellidos,

          nombreCompleto:
            `${usuario.nombres} ${usuario.apellidos}`.trim(),

          email:
            usuario.email
        })
      );


    // ========================================================
    // RESPUESTA
    // ========================================================

    return res.status(200).json({
      ok: true,

      tiendas,

      tiposDocumento,

      entidades,

      usuarios
    });

  } catch (error) {
    console.error(
      'Error al obtener catálogos de documentos:',
      error.message
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
  obtenerCatalogosDocumento
};