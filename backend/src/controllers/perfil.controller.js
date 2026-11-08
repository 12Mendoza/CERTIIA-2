const pool = require('../config/database');


// ============================================================
// OBTENER PERFIL DEL USUARIO AUTENTICADO
// ============================================================
async function obtenerPerfil(req, res) {
  try {
    const usuarioId =
      req.usuario?.usuarioId;


    if (!usuarioId) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Usuario no autenticado.'
      });
    }


    // ========================================================
    // OBTENER USUARIO Y ROL
    // ========================================================
    const resultadoUsuario =
      await pool.query(
        `
        SELECT
          u.id,
          u.nombres,
          u.apellidos,
          u.email,
          u.activo,
          u.debe_cambiar_password,
          u.ultimo_login,

          r.id AS rol_id,
          r.codigo AS rol_codigo,
          r.nombre AS rol_nombre

        FROM usuarios u

        INNER JOIN roles r
          ON r.id = u.rol_id

        WHERE u.id = $1
          AND u.activo = TRUE

        LIMIT 1;
        `,
        [usuarioId]
      );


    if (
      resultadoUsuario.rows.length === 0
    ) {
      return res.status(404).json({
        ok: false,
        mensaje:
          'No se encontró el perfil del usuario.'
      });
    }


    const usuario =
      resultadoUsuario.rows[0];


    // ========================================================
    // OBTENER PERMISOS DEL USUARIO
    // ========================================================
    const resultadoPermisos =
      await pool.query(
        `
        SELECT
          p.codigo

        FROM permisos p

        INNER JOIN rol_permisos rp
          ON rp.permiso_id = p.id

        INNER JOIN roles r
          ON r.id = rp.rol_id

        WHERE r.id = $1
          AND r.activo = TRUE
          AND p.activo = TRUE

        ORDER BY p.codigo ASC;
        `,
        [usuario.rol_id]
      );


    const permisos =
      resultadoPermisos.rows.map(
        (permiso) =>
          permiso.codigo
      );


    // ========================================================
    // RESPUESTA
    // ========================================================
    return res.json({
      ok: true,

      usuario: {
        id:
          usuario.id,

        usuarioId:
          usuario.id,

        nombres:
          usuario.nombres,

        apellidos:
          usuario.apellidos,

        email:
          usuario.email,

        activo:
          usuario.activo,

        debeCambiarPassword:
          usuario.debe_cambiar_password,

        ultimoLogin:
          usuario.ultimo_login,

        rolId:
          usuario.rol_id,

        rol:
          usuario.rol_codigo,

        rolNombre:
          usuario.rol_nombre,

        permisos
      }
    });

  } catch (error) {
    console.error(
      'Error al obtener perfil:',
      error
    );


    return res.status(500).json({
      ok: false,
      mensaje:
        'Error interno al obtener el perfil.'
    });
  }
}


module.exports = {
  obtenerPerfil
};