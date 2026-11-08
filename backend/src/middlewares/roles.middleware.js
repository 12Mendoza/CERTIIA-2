const pool = require('../config/database');


// =====================================================
// SOLO ADMINISTRADOR
// =====================================================
// Se conserva temporalmente para compatibilidad
// con rutas que todavía no han migrado a permisos.
// =====================================================
function soloAdministrador(req, res, next) {
  if (!req.usuario) {
    return res.status(401).json({
      ok: false,
      mensaje: 'Autenticación requerida'
    });
  }

  if (req.usuario.rol !== 'ADMIN') {
    return res.status(403).json({
      ok: false,
      mensaje:
        'No tiene permisos para realizar esta acción'
    });
  }

  next();
}


// =====================================================
// VERIFICAR PERMISO
// =====================================================
function verificarPermiso(permisoCodigo) {
  return async function (req, res, next) {
    try {
      // =================================================
      // 1. VERIFICAR AUTENTICACIÓN
      // =================================================
      if (!req.usuario) {
        return res.status(401).json({
          ok: false,
          mensaje:
            'Autenticación requerida'
        });
      }

      const {
        usuarioId,
        rolId
      } = req.usuario;

      // =================================================
      // 2. VALIDAR DATOS DEL TOKEN
      // =================================================
      if (!usuarioId || !rolId) {
        return res.status(401).json({
          ok: false,
          mensaje:
            'Información de autenticación inválida'
        });
      }

      // =================================================
      // 3. VERIFICAR QUE EL USUARIO SIGA ACTIVO
      // =================================================
      const usuarioResultado =
        await pool.query(
          `
          SELECT
            id,
            activo,
            rol_id
          FROM usuarios
          WHERE id = $1
          LIMIT 1;
          `,
          [
            usuarioId
          ]
        );

      if (
        usuarioResultado.rowCount === 0 ||
        !usuarioResultado.rows[0].activo
      ) {
        return res.status(403).json({
          ok: false,
          mensaje:
            'Usuario no autorizado'
        });
      }

      // =================================================
      // 4. VERIFICAR ROL ACTUAL
      // =================================================
      const rolActual =
        usuarioResultado.rows[0].rol_id;

      /*
        Usamos el rol almacenado actualmente en la
        base de datos y no únicamente el rol que venía
        dentro del JWT.

        Así, si un administrador cambia el rol de un
        usuario, los nuevos permisos se reflejan
        inmediatamente.
      */

      // =================================================
      // 5. BUSCAR PERMISO DEL ROL
      // =================================================
      const permisoResultado =
        await pool.query(
          `
          SELECT
            p.id,
            p.codigo,
            p.nombre,
            p.modulo
          FROM rol_permisos rp

          INNER JOIN permisos p
            ON p.id = rp.permiso_id

          INNER JOIN roles r
            ON r.id = rp.rol_id

          WHERE rp.rol_id = $1
            AND p.codigo = $2
            AND p.activo = TRUE
            AND r.activo = TRUE

          LIMIT 1;
          `,
          [
            rolActual,
            permisoCodigo
          ]
        );

      // =================================================
      // 6. PERMISO DENEGADO
      // =================================================
      if (
        permisoResultado.rowCount === 0
      ) {
        return res.status(403).json({
          ok: false,
          mensaje:
            'No tiene permisos para realizar esta acción'
        });
      }

      // =================================================
      // 7. GUARDAR PERMISO VERIFICADO
      // =================================================
      req.permiso = {
        id:
          permisoResultado.rows[0].id,

        codigo:
          permisoResultado.rows[0].codigo,

        nombre:
          permisoResultado.rows[0].nombre,

        modulo:
          permisoResultado.rows[0].modulo
      };

      // =================================================
      // 8. CONTINUAR
      // =================================================
      next();

    } catch (error) {
      console.error(
        'Error al verificar permiso:',
        error.message
      );

      return res.status(500).json({
        ok: false,
        mensaje:
          'Error interno del servidor'
      });
    }
  };
}


// =====================================================
// EXPORTAR FUNCIONES
// =====================================================
module.exports = {
  soloAdministrador,
  verificarPermiso
};