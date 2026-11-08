const argon2 = require('argon2');
const pool = require('../config/database');

const {
  registrarEvento
} = require('../services/auditoria.service');


// =====================================================
// VALIDAR FORMATO DE CORREO
// =====================================================
function correoValido(correo) {
  if (
    typeof correo !== 'string'
  ) {
    return false;
  }

  const correoNormalizado =
    correo.trim();

  if (
    correoNormalizado.length === 0 ||
    correoNormalizado.length > 254
  ) {
    return false;
  }

  const patronCorreo =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return patronCorreo.test(
    correoNormalizado
  );
}


// =====================================================
// LISTAR USUARIOS
// =====================================================
async function listarUsuarios(req, res) {
  try {
    const resultado =
      await pool.query(
        `
        SELECT
          u.id,
          u.nombres,
          u.apellidos,
          u.email,
          u.activo,
          u.intentos_fallidos,
          u.bloqueado_hasta,
          u.debe_cambiar_password,
          u.ultimo_login,
          u.fecha_creacion,
          u.fecha_actualizacion,

          r.id AS rol_id,
          r.codigo AS rol_codigo,
          r.nombre AS rol_nombre

        FROM usuarios u

        INNER JOIN roles r
          ON r.id = u.rol_id

        ORDER BY
          u.activo DESC,
          u.apellidos ASC,
          u.nombres ASC;
        `
      );


    const usuarios =
      resultado.rows.map(
        (usuario) => ({
          id:
            usuario.id,

          nombres:
            usuario.nombres,

          apellidos:
            usuario.apellidos,

          email:
            usuario.email,

          activo:
            usuario.activo,

          intentosFallidos:
            usuario.intentos_fallidos,

          bloqueadoHasta:
            usuario.bloqueado_hasta,

          debeCambiarPassword:
            usuario.debe_cambiar_password,

          ultimoLogin:
            usuario.ultimo_login,

          fechaCreacion:
            usuario.fecha_creacion,

          fechaActualizacion:
            usuario.fecha_actualizacion,

          rol: {
            id:
              usuario.rol_id,

            codigo:
              usuario.rol_codigo,

            nombre:
              usuario.rol_nombre
          }
        })
      );


    return res.status(200).json({
      ok: true,
      total: usuarios.length,
      usuarios
    });

  } catch (error) {
    console.error(
      'Error al listar usuarios:',
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
// REGISTRAR USUARIO
// =====================================================
async function registrarUsuario(req, res) {
  try {
    const administradorId =
      req.usuario.usuarioId;


    const {
      nombres,
      apellidos,
      email,
      password,
      rolCodigo
    } = req.body;


    // =================================================
    // VALIDAR CAMPOS OBLIGATORIOS
    // =================================================
    if (
      typeof nombres !== 'string' ||
      !nombres.trim() ||
      typeof apellidos !== 'string' ||
      !apellidos.trim() ||
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      !password ||
      typeof rolCodigo !== 'string' ||
      !rolCodigo.trim()
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Nombres, apellidos, correo, contraseña y rol son obligatorios'
      });
    }


    // =================================================
    // VALIDAR CORREO
    // =================================================
    const emailNormalizado =
      email
        .trim()
        .toLowerCase();


    if (
      !correoValido(
        emailNormalizado
      )
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El correo electrónico no tiene un formato válido'
      });
    }


    // =================================================
    // VALIDAR CONTRASEÑA
    // =================================================
    if (
      password.length < 8
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'La contraseña debe tener al menos 8 caracteres'
      });
    }


    // =================================================
    // VALIDAR ROL
    // =================================================
    const rolResultado =
      await pool.query(
        `
        SELECT
          id,
          codigo,
          nombre

        FROM roles

        WHERE codigo = $1
          AND activo = TRUE

        LIMIT 1;
        `,
        [
          rolCodigo
            .trim()
            .toUpperCase()
        ]
      );


    if (
      rolResultado.rowCount === 0
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El rol indicado no es válido'
      });
    }


    // =================================================
    // VALIDAR CORREO ÚNICO
    // =================================================
    const usuarioExistente =
      await pool.query(
        `
        SELECT id

        FROM usuarios

        WHERE LOWER(email) =
          LOWER($1)

        LIMIT 1;
        `,
        [
          emailNormalizado
        ]
      );


    if (
      usuarioExistente.rowCount > 0
    ) {
      return res.status(409).json({
        ok: false,
        mensaje:
          'Ya existe un usuario con ese correo'
      });
    }


    // =================================================
    // HASH ARGON2ID
    // =================================================
    const passwordHash =
      await argon2.hash(
        password,
        {
          type:
            argon2.argon2id
        }
      );


    const rol =
      rolResultado.rows[0];


    // =================================================
    // INSERTAR USUARIO
    // =================================================
    const resultado =
      await pool.query(
        `
        INSERT INTO usuarios (
          rol_id,
          nombres,
          apellidos,
          email,
          password_hash,
          activo,
          debe_cambiar_password
        )

        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          TRUE,
          TRUE
        )

        RETURNING
          id,
          nombres,
          apellidos,
          email,
          activo,
          debe_cambiar_password,
          fecha_creacion;
        `,
        [
          rol.id,
          nombres.trim(),
          apellidos.trim(),
          emailNormalizado,
          passwordHash
        ]
      );


    const usuarioCreado =
      resultado.rows[0];


    // =================================================
    // AUDITORÍA
    // =================================================
    await registrarEvento({
      usuarioId:
        administradorId,

      evento:
        'USUARIO_CREADO',

      modulo:
        'USUARIOS',

      descripcion:
        `Se creó el usuario ID ${usuarioCreado.id} con correo ${usuarioCreado.email} y rol ${rol.codigo}`,

      ip:
        req.ip,

      userAgent:
        req.headers['user-agent']
    });


    return res.status(201).json({
      ok: true,

      mensaje:
        'Usuario registrado correctamente',

      usuario: {
        ...usuarioCreado,

        rol:
          rol.codigo,

        rolNombre:
          rol.nombre
      }
    });

  } catch (error) {
    console.error(
      'Error al registrar usuario:',
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
// EDITAR USUARIO
// =====================================================
async function editarUsuario(req, res) {
  try {
    const administradorId =
      req.usuario.usuarioId;


    const {
      id
    } = req.params;


    const {
      nombres,
      apellidos,
      email,
      rolCodigo
    } = req.body;


    // =================================================
    // VALIDAR ID
    // =================================================
    if (
      !id ||
      Number.isNaN(
        Number(id)
      )
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El identificador del usuario no es válido'
      });
    }


    // =================================================
    // VALIDAR CAMPOS
    // =================================================
    if (
      typeof nombres !== 'string' ||
      !nombres.trim() ||
      typeof apellidos !== 'string' ||
      !apellidos.trim() ||
      typeof email !== 'string' ||
      !email.trim() ||
      typeof rolCodigo !== 'string' ||
      !rolCodigo.trim()
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Nombres, apellidos, correo y rol son obligatorios'
      });
    }


    // =================================================
    // VALIDAR CORREO
    // =================================================
    const emailNormalizado =
      email
        .trim()
        .toLowerCase();


    if (
      !correoValido(
        emailNormalizado
      )
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El correo electrónico no tiene un formato válido'
      });
    }


    // =================================================
    // OBTENER USUARIO ACTUAL
    // =================================================
    const usuarioResultado =
      await pool.query(
        `
        SELECT
          id,
          nombres,
          apellidos,
          email,
          rol_id,
          activo

        FROM usuarios

        WHERE id = $1

        LIMIT 1;
        `,
        [
          id
        ]
      );


    if (
      usuarioResultado.rowCount === 0
    ) {
      return res.status(404).json({
        ok: false,
        mensaje:
          'Usuario no encontrado'
      });
    }


    const usuarioAnterior =
      usuarioResultado.rows[0];


    // =================================================
    // VALIDAR ROL
    // =================================================
    const rolResultado =
      await pool.query(
        `
        SELECT
          id,
          codigo,
          nombre

        FROM roles

        WHERE codigo = $1
          AND activo = TRUE

        LIMIT 1;
        `,
        [
          rolCodigo
            .trim()
            .toUpperCase()
        ]
      );


    if (
      rolResultado.rowCount === 0
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El rol indicado no es válido'
      });
    }


    // =================================================
    // VALIDAR CORREO ÚNICO
    // =================================================
    const correoExistente =
      await pool.query(
        `
        SELECT id

        FROM usuarios

        WHERE LOWER(email) =
          LOWER($1)

          AND id <> $2

        LIMIT 1;
        `,
        [
          emailNormalizado,
          id
        ]
      );


    if (
      correoExistente.rowCount > 0
    ) {
      return res.status(409).json({
        ok: false,
        mensaje:
          'Ya existe otro usuario con ese correo'
      });
    }


    const rol =
      rolResultado.rows[0];


    // =================================================
    // ACTUALIZAR USUARIO
    // =================================================
    const resultado =
      await pool.query(
        `
        UPDATE usuarios

        SET
          nombres = $1,
          apellidos = $2,
          email = $3,
          rol_id = $4,
          fecha_actualizacion = NOW()

        WHERE id = $5

        RETURNING
          id,
          nombres,
          apellidos,
          email,
          activo,
          debe_cambiar_password,
          fecha_actualizacion;
        `,
        [
          nombres.trim(),
          apellidos.trim(),
          emailNormalizado,
          rol.id,
          id
        ]
      );


    const usuarioActualizado =
      resultado.rows[0];


    // =================================================
    // AUDITORÍA
    // =================================================
    await registrarEvento({
      usuarioId:
        administradorId,

      evento:
        'USUARIO_EDITADO',

      modulo:
        'USUARIOS',

      descripcion:
        `Se editó el usuario ID ${usuarioActualizado.id}. Correo anterior: ${usuarioAnterior.email}. Correo actual: ${usuarioActualizado.email}. Rol actual: ${rol.codigo}`,

      ip:
        req.ip,

      userAgent:
        req.headers['user-agent']
    });


    return res.status(200).json({
      ok: true,

      mensaje:
        'Usuario actualizado correctamente',

      usuario: {
        ...usuarioActualizado,

        rol:
          rol.codigo,

        rolNombre:
          rol.nombre
      }
    });

  } catch (error) {
    console.error(
      'Error al editar usuario:',
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
// ACTIVAR O DESACTIVAR USUARIO
// =====================================================
async function cambiarEstadoUsuario(
  req,
  res
) {
  try {
    const administradorId =
      req.usuario.usuarioId;


    const {
      id
    } = req.params;


    const {
      activo
    } = req.body;


    // =================================================
    // VALIDAR ID
    // =================================================
    if (
      !id ||
      Number.isNaN(
        Number(id)
      )
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El identificador del usuario no es válido'
      });
    }


    // =================================================
    // VALIDAR ESTADO
    // =================================================
    if (
      typeof activo !== 'boolean'
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El campo activo debe ser true o false'
      });
    }


    // =================================================
    // BUSCAR USUARIO
    // =================================================
    const usuarioResultado =
      await pool.query(
        `
        SELECT
          id,
          nombres,
          apellidos,
          email,
          activo

        FROM usuarios

        WHERE id = $1

        LIMIT 1;
        `,
        [
          id
        ]
      );


    if (
      usuarioResultado.rowCount === 0
    ) {
      return res.status(404).json({
        ok: false,
        mensaje:
          'Usuario no encontrado'
      });
    }


    const usuarioAnterior =
      usuarioResultado.rows[0];


    // =================================================
    // YA TIENE ESE ESTADO
    // =================================================
    if (
      usuarioAnterior.activo ===
      activo
    ) {
      return res.status(200).json({
        ok: true,

        mensaje:
          activo
            ? 'El usuario ya se encuentra activo'
            : 'El usuario ya se encuentra desactivado',

        usuario:
          usuarioAnterior
      });
    }


    // =================================================
    // ACTUALIZAR ESTADO
    // =================================================
    const resultado =
      await pool.query(
        `
        UPDATE usuarios

        SET
          activo = $1,
          intentos_fallidos = 0,
          bloqueado_hasta = NULL,
          fecha_actualizacion = NOW()

        WHERE id = $2

        RETURNING
          id,
          nombres,
          apellidos,
          email,
          activo,
          fecha_actualizacion;
        `,
        [
          activo,
          id
        ]
      );


    const usuarioActualizado =
      resultado.rows[0];


    // =================================================
    // REVOCAR SESIONES SI SE DESACTIVA
    // =================================================
    if (!activo) {
      await pool.query(
        `
        UPDATE sesiones

        SET revocada = TRUE

        WHERE usuario_id = $1
          AND revocada = FALSE;
        `,
        [
          id
        ]
      );
    }


    // =================================================
    // AUDITORÍA
    // =================================================
    await registrarEvento({
      usuarioId:
        administradorId,

      evento:
        activo
          ? 'USUARIO_ACTIVADO'
          : 'USUARIO_DESACTIVADO',

      modulo:
        'USUARIOS',

      descripcion:
        activo
          ? `Se activó el usuario ID ${usuarioActualizado.id} con correo ${usuarioActualizado.email}`
          : `Se desactivó el usuario ID ${usuarioActualizado.id} con correo ${usuarioActualizado.email}`,

      ip:
        req.ip,

      userAgent:
        req.headers['user-agent']
    });


    return res.status(200).json({
      ok: true,

      mensaje:
        activo
          ? 'Usuario activado correctamente'
          : 'Usuario desactivado correctamente',

      usuario:
        usuarioActualizado
    });

  } catch (error) {
    console.error(
      'Error al cambiar estado del usuario:',
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
  listarUsuarios,
  registrarUsuario,
  editarUsuario,
  cambiarEstadoUsuario
};