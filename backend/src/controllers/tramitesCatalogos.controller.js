const pool =
  require('../config/database');


// ============================================================
// OBTENER CATÁLOGOS PARA TRÁMITES
// HU-026
// ============================================================

async function obtenerCatalogosTramite(
  req,
  res
) {

  try {

    const [
      resultadoDocumentos,
      resultadoEntidades,
      resultadoUsuarios,
      resultadoEstados
    ] = await Promise.all([

      // ======================================================
      // DOCUMENTOS ACTIVOS
      // ======================================================

      pool.query(
        `
          SELECT
            d.id,
            d.codigo_interno,
            d.numero_documento,
            d.numero_expediente,
            d.estado,
            d.fecha_vencimiento,

            t.id
              AS tienda_id,

            t.nombre
              AS tienda_nombre,

            td.id
              AS tipo_documento_id,

            td.nombre
              AS tipo_documento_nombre,

            ee.id
              AS entidad_emisora_id,

            ee.nombre
              AS entidad_emisora_nombre

          FROM documentos d

          INNER JOIN tiendas t
            ON t.id = d.tienda_id

          INNER JOIN tipos_documento td
            ON td.id =
               d.tipo_documento_id

          INNER JOIN entidades_emisoras ee
            ON ee.id =
               d.entidad_emisora_id

          WHERE
            d.condicion_registro = 'ACTIVO'

          ORDER BY
            d.codigo_interno ASC,
            d.id DESC;
        `
      ),


      // ======================================================
      // ENTIDADES EMISORAS ACTIVAS
      // ======================================================

      pool.query(
        `
          SELECT
            id,
            nombre

          FROM entidades_emisoras

          WHERE activo = TRUE

          ORDER BY
            nombre ASC;
        `
      ),


      // ======================================================
      // USUARIOS ACTIVOS
      // ======================================================

      pool.query(
        `
          SELECT
            u.id,
            u.nombres,
            u.apellidos,
            u.email,
            r.codigo
              AS rol_codigo,
            r.nombre
              AS rol_nombre

          FROM usuarios u

          INNER JOIN roles r
            ON r.id = u.rol_id

          WHERE
            u.activo = TRUE

          ORDER BY
            u.apellidos ASC,
            u.nombres ASC;
        `
      ),


      // ======================================================
      // ESTADOS ACTIVOS
      // ======================================================

      pool.query(
        `
          SELECT
            codigo,
            nombre,
            orden

          FROM tramite_estados

          WHERE activo = TRUE

          ORDER BY
            orden ASC;
        `
      )
    ]);


    // ========================================================
    // FORMATEAR DOCUMENTOS
    // ========================================================

    const documentos =
      resultadoDocumentos.rows.map(
        (documento) => ({

          id:
            documento.id,

          codigoInterno:
            documento.codigo_interno,

          numeroDocumento:
            documento.numero_documento,

          numeroExpediente:
            documento.numero_expediente,

          estado:
            documento.estado,

          fechaVencimiento:
            documento.fecha_vencimiento,

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
              documento.tipo_documento_nombre
          },

          entidadEmisora: {
            id:
              documento.entidad_emisora_id,

            nombre:
              documento.entidad_emisora_nombre
          }
        })
      );


    // ========================================================
    // FORMATEAR ENTIDADES
    // ========================================================

    const entidades =
      resultadoEntidades.rows.map(
        (entidad) => ({

          id:
            entidad.id,

          nombre:
            entidad.nombre
        })
      );


    // ========================================================
    // FORMATEAR USUARIOS
    // ========================================================

    const usuarios =
      resultadoUsuarios.rows.map(
        (usuario) => ({

          id:
            usuario.id,

          nombres:
            usuario.nombres,

          apellidos:
            usuario.apellidos,

          nombreCompleto:
            `${usuario.nombres} ${usuario.apellidos}`,

          email:
            usuario.email,

          rol: {
            codigo:
              usuario.rol_codigo,

            nombre:
              usuario.rol_nombre
          }
        })
      );


    // ========================================================
    // FORMATEAR ESTADOS
    // ========================================================

    const estados =
      resultadoEstados.rows.map(
        (estado) => ({

          codigo:
            estado.codigo,

          nombre:
            estado.nombre,

          orden:
            estado.orden
        })
      );


    // ========================================================
    // RESPUESTA
    // ========================================================

    return res.status(200).json({

      ok: true,

      documentos,

      entidades,

      usuarios,

      estados
    });


  } catch (error) {

    console.error(
      'Error obteniendo catálogos de trámites:',
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
  obtenerCatalogosTramite
};