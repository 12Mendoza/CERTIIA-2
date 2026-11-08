const pool = require('../config/database');

const {
  registrarEvento
} = require('../services/auditoria.service');


// =====================================================
// LISTAR ROLES CON SUS PERMISOS
// =====================================================
async function listarRoles(req, res) {
  try {
    const resultado = await pool.query(
      `
      SELECT
        r.id AS rol_id,
        r.codigo AS rol_codigo,
        r.nombre AS rol_nombre,
        r.descripcion AS rol_descripcion,
        r.activo AS rol_activo,

        p.id AS permiso_id,
        p.codigo AS permiso_codigo,
        p.nombre AS permiso_nombre,
        p.descripcion AS permiso_descripcion,
        p.modulo AS permiso_modulo

      FROM roles r

      LEFT JOIN rol_permisos rp
        ON rp.rol_id = r.id

      LEFT JOIN permisos p
        ON p.id = rp.permiso_id

      ORDER BY
        r.id,
        p.modulo,
        p.codigo;
      `
    );

    const roles = [];

    for (const fila of resultado.rows) {
      let rol = roles.find(
        (item) =>
          item.id === fila.rol_id
      );

      if (!rol) {
        rol = {
          id: fila.rol_id,
          codigo: fila.rol_codigo,
          nombre: fila.rol_nombre,
          descripcion:
            fila.rol_descripcion,
          activo: fila.rol_activo,
          permisos: []
        };

        roles.push(rol);
      }

      if (fila.permiso_id) {
        rol.permisos.push({
          id: fila.permiso_id,
          codigo:
            fila.permiso_codigo,
          nombre:
            fila.permiso_nombre,
          descripcion:
            fila.permiso_descripcion,
          modulo:
            fila.permiso_modulo
        });
      }
    }

    return res.status(200).json({
      ok: true,
      total: roles.length,
      roles
    });

  } catch (error) {
    console.error(
      'Error al listar roles:',
      error.message
    );

    return res.status(500).json({
      ok: false,
      mensaje:
        'Error interno del servidor'
    });
  }
}


// =====================================================
// LISTAR TODOS LOS PERMISOS
// =====================================================
async function listarPermisos(req, res) {
  try {
    const resultado =
      await pool.query(
        `
        SELECT
          id,
          codigo,
          nombre,
          descripcion,
          modulo,
          activo,
          fecha_creacion

        FROM permisos

        WHERE activo = TRUE

        ORDER BY
          modulo ASC,
          codigo ASC;
        `
      );

    return res.status(200).json({
      ok: true,
      total: resultado.rowCount,
      permisos: resultado.rows
    });

  } catch (error) {
    console.error(
      'Error al listar permisos:',
      error.message
    );

    return res.status(500).json({
      ok: false,
      mensaje:
        'Error interno del servidor'
    });
  }
}


// =====================================================
// ASIGNAR PERMISO A UN ROL
// =====================================================
async function asignarPermiso(req, res) {
  try {
    const administradorId =
      req.usuario.usuarioId;

    const {
      rolId
    } = req.params;

    const {
      permisoCodigo
    } = req.body;

    // =================================================
    // VALIDAR ID
    // =================================================
    if (
      !rolId ||
      Number.isNaN(Number(rolId))
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El identificador del rol no es válido'
      });
    }

    // =================================================
    // VALIDAR PERMISO
    // =================================================
    if (!permisoCodigo) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El permiso es obligatorio'
      });
    }

    // =================================================
    // BUSCAR ROL
    // =================================================
    const rolResultado =
      await pool.query(
        `
        SELECT
          id,
          codigo,
          nombre
        FROM roles
        WHERE id = $1
          AND activo = TRUE
        LIMIT 1;
        `,
        [
          rolId
        ]
      );

    if (
      rolResultado.rowCount === 0
    ) {
      return res.status(404).json({
        ok: false,
        mensaje:
          'Rol no encontrado'
      });
    }

    // =================================================
    // BUSCAR PERMISO
    // =================================================
    const permisoResultado =
      await pool.query(
        `
        SELECT
          id,
          codigo,
          nombre,
          descripcion,
          modulo
        FROM permisos
        WHERE codigo = $1
          AND activo = TRUE
        LIMIT 1;
        `,
        [
          permisoCodigo.trim()
        ]
      );

    if (
      permisoResultado.rowCount === 0
    ) {
      return res.status(404).json({
        ok: false,
        mensaje:
          'Permiso no encontrado'
      });
    }

    const rol =
      rolResultado.rows[0];

    const permiso =
      permisoResultado.rows[0];

    // =================================================
    // ASIGNAR PERMISO
    // =================================================
    const asignacionResultado =
      await pool.query(
        `
        INSERT INTO rol_permisos (
          rol_id,
          permiso_id
        )
        VALUES (
          $1,
          $2
        )

        ON CONFLICT (
          rol_id,
          permiso_id
        )
        DO NOTHING

        RETURNING
          rol_id,
          permiso_id;
        `,
        [
          rol.id,
          permiso.id
        ]
      );

    // =================================================
    // YA ESTABA ASIGNADO
    // =================================================
    if (
      asignacionResultado.rowCount === 0
    ) {
      return res.status(200).json({
        ok: true,

        mensaje:
          'El permiso ya estaba asignado a este rol',

        rol: {
          id: rol.id,
          codigo: rol.codigo,
          nombre: rol.nombre
        },

        permiso: {
          id: permiso.id,
          codigo: permiso.codigo,
          nombre: permiso.nombre,
          descripcion:
            permiso.descripcion,
          modulo: permiso.modulo
        }
      });
    }

    // =================================================
    // AUDITORÍA
    // =================================================
    await registrarEvento({
      usuarioId:
        administradorId,

      evento:
        'PERMISO_ASIGNADO',

      modulo:
        'ROLES_PERMISOS',

      descripcion:
        `Se asignó el permiso ${permiso.codigo} al rol ${rol.codigo}`,

      ip:
        req.ip,

      userAgent:
        req.headers['user-agent']
    });

    return res.status(200).json({
      ok: true,

      mensaje:
        'Permiso asignado correctamente',

      rol: {
        id: rol.id,
        codigo: rol.codigo,
        nombre: rol.nombre
      },

      permiso: {
        id: permiso.id,
        codigo: permiso.codigo,
        nombre: permiso.nombre,
        descripcion:
          permiso.descripcion,
        modulo:
          permiso.modulo
      }
    });

  } catch (error) {
    console.error(
      'Error al asignar permiso:',
      error.message
    );

    return res.status(500).json({
      ok: false,
      mensaje:
        'Error interno del servidor'
    });
  }
}


// =====================================================
// QUITAR PERMISO A UN ROL
// =====================================================
async function quitarPermiso(req, res) {
  try {
    const administradorId =
      req.usuario.usuarioId;

    const {
      rolId,
      permisoId
    } = req.params;

    // =================================================
    // VALIDAR IDS
    // =================================================
    if (
      !rolId ||
      Number.isNaN(Number(rolId))
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El identificador del rol no es válido'
      });
    }

    if (
      !permisoId ||
      Number.isNaN(Number(permisoId))
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El identificador del permiso no es válido'
      });
    }

    // =================================================
    // OBTENER INFORMACIÓN
    // =================================================
    const informacionResultado =
      await pool.query(
        `
        SELECT
          r.id AS rol_id,
          r.codigo AS rol_codigo,
          r.nombre AS rol_nombre,

          p.id AS permiso_id,
          p.codigo AS permiso_codigo,
          p.nombre AS permiso_nombre,
          p.modulo AS permiso_modulo

        FROM rol_permisos rp

        INNER JOIN roles r
          ON r.id = rp.rol_id

        INNER JOIN permisos p
          ON p.id = rp.permiso_id

        WHERE rp.rol_id = $1
          AND rp.permiso_id = $2

        LIMIT 1;
        `,
        [
          rolId,
          permisoId
        ]
      );

    if (
      informacionResultado.rowCount === 0
    ) {
      return res.status(404).json({
        ok: false,
        mensaje:
          'El permiso no está asignado a este rol'
      });
    }

    const informacion =
      informacionResultado.rows[0];

    // =================================================
    // QUITAR PERMISO
    // =================================================
    const resultado =
      await pool.query(
        `
        DELETE FROM rol_permisos

        WHERE rol_id = $1
          AND permiso_id = $2

        RETURNING
          rol_id,
          permiso_id;
        `,
        [
          rolId,
          permisoId
        ]
      );

    if (
      resultado.rowCount === 0
    ) {
      return res.status(404).json({
        ok: false,
        mensaje:
          'El permiso no está asignado a este rol'
      });
    }

    // =================================================
    // AUDITORÍA
    // =================================================
    await registrarEvento({
      usuarioId:
        administradorId,

      evento:
        'PERMISO_RETIRADO',

      modulo:
        'ROLES_PERMISOS',

      descripcion:
        `Se retiró el permiso ${informacion.permiso_codigo} del rol ${informacion.rol_codigo}`,

      ip:
        req.ip,

      userAgent:
        req.headers['user-agent']
    });

    return res.status(200).json({
      ok: true,

      mensaje:
        'Permiso retirado correctamente',

      rol: {
        id:
          informacion.rol_id,
        codigo:
          informacion.rol_codigo,
        nombre:
          informacion.rol_nombre
      },

      permiso: {
        id:
          informacion.permiso_id,
        codigo:
          informacion.permiso_codigo,
        nombre:
          informacion.permiso_nombre,
        modulo:
          informacion.permiso_modulo
      }
    });

  } catch (error) {
    console.error(
      'Error al quitar permiso:',
      error.message
    );

    return res.status(500).json({
      ok: false,
      mensaje:
        'Error interno del servidor'
    });
  }
}


// =====================================================
// EXPORTAR FUNCIONES
// =====================================================
module.exports = {
  listarRoles,
  listarPermisos,
  asignarPermiso,
  quitarPermiso
};