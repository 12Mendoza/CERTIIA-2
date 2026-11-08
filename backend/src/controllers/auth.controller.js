const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const pool = require('../config/database');

const {
  registrarEvento
} = require('../services/auditoria.service');

const {
  revocarTodasSesiones,
  revocarOtrasSesiones
} = require('../services/sesiones.service');

const {
  obtenerParametroNumero
} = require('../services/parametros.service');


// =====================================================
// GENERAR HASH SHA-256
// =====================================================

function generarHashToken(token) {

  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}


// =====================================================
// LOGIN
// =====================================================

async function login(req, res) {

  try {

    const {
      email,
      password
    } = req.body;


    // =================================================
    // VALIDAR CAMPOS
    // =================================================

    if (!email || !password) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'Correo y contraseña son obligatorios'
      });
    }


    // =================================================
    // OBTENER PARÁMETROS CONFIGURABLES
    // =================================================

    const [
      maxIntentos,
      bloqueoMinutos
    ] = await Promise.all([

      obtenerParametroNumero(
        'LOGIN_MAX_INTENTOS',
        5
      ),

      obtenerParametroNumero(
        'LOGIN_BLOQUEO_MINUTOS',
        15
      )
    ]);


    // =================================================
    // BUSCAR USUARIO
    // =================================================

    const resultado = await pool.query(
      `
      SELECT
        u.id,
        u.nombres,
        u.apellidos,
        u.email,
        u.password_hash,
        u.activo,
        u.intentos_fallidos,
        u.bloqueado_hasta,
        u.debe_cambiar_password,

        r.id AS rol_id,
        r.codigo AS rol_codigo,
        r.nombre AS rol_nombre

      FROM usuarios u

      INNER JOIN roles r
        ON r.id = u.rol_id

      WHERE LOWER(u.email) = LOWER($1)

      LIMIT 1;
      `,
      [
        email.trim()
      ]
    );


    // =================================================
    // USUARIO NO ENCONTRADO
    // =================================================

    if (resultado.rowCount === 0) {

      await registrarEvento({

        usuarioId: null,

        evento:
          'LOGIN_FALLIDO',

        modulo:
          'AUTENTICACION',

        descripcion:
          'Intento de inicio de sesión con correo no registrado',

        ip:
          req.ip,

        userAgent:
          req.headers['user-agent']
      });


      return res.status(401).json({
        ok: false,
        mensaje:
          'Credenciales inválidas'
      });
    }


    const usuario =
      resultado.rows[0];


    // =================================================
    // USUARIO DESACTIVADO
    // =================================================

    if (!usuario.activo) {

      await registrarEvento({

        usuarioId:
          usuario.id,

        evento:
          'LOGIN_FALLIDO',

        modulo:
          'AUTENTICACION',

        descripcion:
          'Intento de inicio de sesión con usuario desactivado',

        ip:
          req.ip,

        userAgent:
          req.headers['user-agent']
      });


      return res.status(401).json({
        ok: false,
        mensaje:
          'Credenciales inválidas'
      });
    }


    // =================================================
    // USUARIO BLOQUEADO
    // =================================================

    if (
      usuario.bloqueado_hasta &&
      new Date(
        usuario.bloqueado_hasta
      ) > new Date()
    ) {

      return res.status(423).json({
        ok: false,
        mensaje:
          'Acceso temporalmente bloqueado. Intente nuevamente más tarde.'
      });
    }


    // =================================================
    // VERIFICAR CONTRASEÑA
    // =================================================

    const passwordCorrecta =
      await argon2.verify(
        usuario.password_hash,
        password
      );


    // =================================================
    // CONTRASEÑA INCORRECTA
    // =================================================

    if (!passwordCorrecta) {

      const resultadoIntento =
        await pool.query(
          `
          UPDATE usuarios

          SET
            intentos_fallidos =
              intentos_fallidos + 1,

            bloqueado_hasta = CASE

              WHEN
                intentos_fallidos + 1 >= $2::int

              THEN
                NOW() + (
                  $3::int *
                  INTERVAL '1 minute'
                )

              ELSE
                bloqueado_hasta

            END,

            fecha_actualizacion =
              NOW()

          WHERE id = $1

          RETURNING
            intentos_fallidos,
            bloqueado_hasta;
          `,
          [
            usuario.id,
            maxIntentos,
            bloqueoMinutos
          ]
        );


      const estadoIntento =
        resultadoIntento.rows[0];


      // ===============================================
      // AUDITORÍA LOGIN FALLIDO
      // ===============================================

      await registrarEvento({

        usuarioId:
          usuario.id,

        evento:
          'LOGIN_FALLIDO',

        modulo:
          'AUTENTICACION',

        descripcion:
          `Intento fallido de inicio de sesión. Intento ${estadoIntento.intentos_fallidos} de ${maxIntentos}`,

        ip:
          req.ip,

        userAgent:
          req.headers['user-agent']
      });


      // ===============================================
      // BLOQUEO TEMPORAL
      // ===============================================

      if (
        estadoIntento.intentos_fallidos >=
          maxIntentos &&
        estadoIntento.bloqueado_hasta
      ) {

        await registrarEvento({

          usuarioId:
            usuario.id,

          evento:
            'BLOQUEO_TEMPORAL',

          modulo:
            'AUTENTICACION',

          descripcion:
            `Usuario bloqueado temporalmente durante ${bloqueoMinutos} minutos por alcanzar ${maxIntentos} intentos fallidos`,

          ip:
            req.ip,

          userAgent:
            req.headers['user-agent']
        });
      }


      return res.status(401).json({
        ok: false,
        mensaje:
          'Credenciales inválidas'
      });
    }


    // =================================================
    // GENERAR JWT
    // =================================================

    const token =
      jwt.sign(
        {

          usuarioId:
            usuario.id,

          rolId:
            usuario.rol_id,

          rol:
            usuario.rol_codigo
        },

        process.env.JWT_SECRET,

        {

          expiresIn:
            process.env.JWT_EXPIRES_IN ||
            '15m',

          issuer:
            'certiia-api'
        }
      );


    // =================================================
    // OBTENER EXPIRACIÓN
    // =================================================

    const tokenDecodificado =
      jwt.decode(token);


    const fechaExpiracion =
      new Date(
        tokenDecodificado.exp *
        1000
      );


    // =================================================
    // HASH DEL ACCESS TOKEN
    // =================================================

    const accessTokenHash =
      generarHashToken(token);


    // =================================================
    // REGISTRAR SESIÓN
    // =================================================

    await pool.query(
      `
      INSERT INTO sesiones (
        usuario_id,
        refresh_token_hash,
        access_token_hash,
        ip,
        user_agent,
        fecha_expiracion,
        revocada
      )

      VALUES (
        $1,
        NULL,
        $2,
        $3,
        $4,
        $5,
        FALSE
      );
      `,
      [
        usuario.id,
        accessTokenHash,
        req.ip || null,
        req.headers['user-agent'] || null,
        fechaExpiracion
      ]
    );


    // =================================================
    // ACTUALIZAR LOGIN
    // =================================================

    await pool.query(
      `
      UPDATE usuarios

      SET
        ultimo_login = NOW(),
        intentos_fallidos = 0,
        bloqueado_hasta = NULL,
        fecha_actualizacion = NOW()

      WHERE id = $1;
      `,
      [
        usuario.id
      ]
    );


    // =================================================
    // AUDITORÍA LOGIN EXITOSO
    // =================================================

    await registrarEvento({

      usuarioId:
        usuario.id,

      evento:
        'LOGIN_EXITOSO',

      modulo:
        'AUTENTICACION',

      descripcion:
        'Inicio de sesión realizado correctamente',

      ip:
        req.ip,

      userAgent:
        req.headers['user-agent']
    });


    // =================================================
    // RESPUESTA
    // =================================================

    return res.status(200).json({

      ok: true,

      mensaje:
        'Inicio de sesión exitoso',

      token,

      usuario: {

        id:
          usuario.id,

        nombres:
          usuario.nombres,

        apellidos:
          usuario.apellidos,

        email:
          usuario.email,

        rol:
          usuario.rol_codigo,

        rolNombre:
          usuario.rol_nombre,

        debeCambiarPassword:
          usuario.debe_cambiar_password
      }
    });


  } catch (error) {

    console.error(
      'Error en login:',
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
// CAMBIAR CONTRASEÑA
// =====================================================

async function cambiarPassword(
  req,
  res
) {

  try {

    const usuarioId =
      req.usuario.usuarioId;


    const {
      passwordActual,
      passwordNueva
    } = req.body;


    // =================================================
    // VALIDAR CAMPOS
    // =================================================

    if (
      !passwordActual ||
      !passwordNueva
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'La contraseña actual y la nueva contraseña son obligatorias'
      });
    }


    // =================================================
    // VALIDAR LONGITUD
    // =================================================

    if (
      passwordNueva.length < 8
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'La nueva contraseña debe tener al menos 8 caracteres'
      });
    }


    // =================================================
    // OBTENER USUARIO
    // =================================================

    const resultado =
      await pool.query(
        `
        SELECT
          id,
          password_hash

        FROM usuarios

        WHERE id = $1
          AND activo = TRUE

        LIMIT 1;
        `,
        [
          usuarioId
        ]
      );


    if (
      resultado.rowCount === 0
    ) {

      return res.status(404).json({
        ok: false,
        mensaje:
          'Usuario no encontrado'
      });
    }


    const usuario =
      resultado.rows[0];


    // =================================================
    // VALIDAR CONTRASEÑA ACTUAL
    // =================================================

    const passwordCorrecta =
      await argon2.verify(
        usuario.password_hash,
        passwordActual
      );


    if (!passwordCorrecta) {

      return res.status(401).json({
        ok: false,
        mensaje:
          'La contraseña actual no es correcta'
      });
    }


    // =================================================
    // EVITAR MISMA CONTRASEÑA
    // =================================================

    const mismaPassword =
      await argon2.verify(
        usuario.password_hash,
        passwordNueva
      );


    if (mismaPassword) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'La nueva contraseña debe ser diferente a la actual'
      });
    }


    // =================================================
    // GENERAR NUEVO HASH
    // =================================================

    const nuevoHash =
      await argon2.hash(
        passwordNueva,
        {
          type:
            argon2.argon2id
        }
      );


    // =================================================
    // ACTUALIZAR CONTRASEÑA
    // =================================================

    await pool.query(
      `
      UPDATE usuarios

      SET
        password_hash = $1,

        debe_cambiar_password =
          FALSE,

        intentos_fallidos = 0,

        bloqueado_hasta =
          NULL,

        fecha_actualizacion =
          NOW()

      WHERE id = $2;
      `,
      [
        nuevoHash,
        usuarioId
      ]
    );


    // =================================================
    // CERRAR OTRAS SESIONES
    // =================================================

    await revocarOtrasSesiones(
      usuarioId,
      req.accessTokenHash
    );


    // =================================================
    // AUDITORÍA
    // =================================================

    await registrarEvento({

      usuarioId,

      evento:
        'PASSWORD_CAMBIADA',

      modulo:
        'AUTENTICACION',

      descripcion:
        'El usuario cambió su contraseña correctamente',

      ip:
        req.ip,

      userAgent:
        req.headers['user-agent']
    });


    return res.status(200).json({

      ok: true,

      mensaje:
        'Contraseña actualizada correctamente'
    });


  } catch (error) {

    console.error(
      'Error al cambiar contraseña:',
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
// SOLICITAR RESTABLECIMIENTO
// =====================================================

async function solicitarResetPassword(
  req,
  res
) {

  try {

    const {
      email
    } = req.body;


    if (!email) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El correo es obligatorio'
      });
    }


    // =================================================
    // BUSCAR USUARIO
    // =================================================

    const resultado =
      await pool.query(
        `
        SELECT
          id,
          email,
          activo

        FROM usuarios

        WHERE LOWER(email) =
          LOWER($1)

        LIMIT 1;
        `,
        [
          email.trim()
        ]
      );


    // =================================================
    // RESPUESTA GENÉRICA
    // =================================================

    if (
      resultado.rowCount === 0 ||
      !resultado.rows[0].activo
    ) {

      return res.status(200).json({
        ok: true,
        mensaje:
          'Si el correo está registrado, se generará un enlace de recuperación'
      });
    }


    const usuario =
      resultado.rows[0];


    // =================================================
    // OBTENER VIGENCIA CONFIGURABLE
    // =================================================

    const resetMinutos =
      await obtenerParametroNumero(
        'PASSWORD_RESET_MINUTOS',
        15
      );


    // =================================================
    // INVALIDAR TOKENS ANTERIORES
    // =================================================

    await pool.query(
      `
      UPDATE tokens_restablecimiento

      SET utilizado = TRUE

      WHERE usuario_id = $1
        AND utilizado = FALSE;
      `,
      [
        usuario.id
      ]
    );


    // =================================================
    // GENERAR TOKEN
    // =================================================

    const token =
      crypto
        .randomBytes(32)
        .toString('hex');


    const tokenHash =
      generarHashToken(token);


    // =================================================
    // GUARDAR TOKEN
    // =================================================

    await pool.query(
      `
      INSERT INTO tokens_restablecimiento (
        usuario_id,
        token_hash,
        fecha_expiracion,
        utilizado
      )

      VALUES (
        $1,
        $2,

        NOW() + (
          $3::int *
          INTERVAL '1 minute'
        ),

        FALSE
      );
      `,
      [
        usuario.id,
        tokenHash,
        resetMinutos
      ]
    );


    // =================================================
    // AUDITORÍA
    // =================================================

    await registrarEvento({

      usuarioId:
        usuario.id,

      evento:
        'PASSWORD_RESET_SOLICITADO',

      modulo:
        'AUTENTICACION',

      descripcion:
        'Se solicitó el restablecimiento de contraseña',

      ip:
        req.ip,

      userAgent:
        req.headers['user-agent']
    });


    /**
     * SOLO DESARROLLO LOCAL.
     *
     * En producción tokenPrueba
     * debe eliminarse y enviarse
     * por correo.
     */

    return res.status(200).json({

      ok: true,

      mensaje:
        'Si el correo está registrado, se generará un enlace de recuperación',

      tokenPrueba:
        token
    });


  } catch (error) {

    console.error(
      'Error al solicitar restablecimiento:',
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
// CONFIRMAR RESTABLECIMIENTO
// =====================================================

async function confirmarResetPassword(
  req,
  res
) {

  const cliente =
    await pool.connect();


  try {

    const {
      token,
      passwordNueva
    } = req.body;


    // =================================================
    // VALIDAR CAMPOS
    // =================================================

    if (
      !token ||
      !passwordNueva
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El token y la nueva contraseña son obligatorios'
      });
    }


    // =================================================
    // VALIDAR CONTRASEÑA
    // =================================================

    if (
      passwordNueva.length < 8
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'La nueva contraseña debe tener al menos 8 caracteres'
      });
    }


    const tokenHash =
      generarHashToken(token);


    // =================================================
    // BUSCAR TOKEN
    // =================================================

    const resultado =
      await cliente.query(
        `
        SELECT
          tr.id AS token_id,
          tr.usuario_id,
          u.activo

        FROM tokens_restablecimiento tr

        INNER JOIN usuarios u
          ON u.id =
            tr.usuario_id

        WHERE tr.token_hash = $1

          AND tr.utilizado =
            FALSE

          AND tr.fecha_expiracion >
            NOW()

          AND u.activo =
            TRUE

        LIMIT 1;
        `,
        [
          tokenHash
        ]
      );


    if (
      resultado.rowCount === 0
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'Token inválido o expirado'
      });
    }


    const datosToken =
      resultado.rows[0];


    // =================================================
    // GENERAR NUEVO HASH
    // =================================================

    const nuevoHash =
      await argon2.hash(
        passwordNueva,
        {
          type:
            argon2.argon2id
        }
      );


    // =================================================
    // INICIAR TRANSACCIÓN
    // =================================================

    await cliente.query(
      'BEGIN'
    );


    // =================================================
    // ACTUALIZAR CONTRASEÑA
    // =================================================

    await cliente.query(
      `
      UPDATE usuarios

      SET
        password_hash = $1,

        debe_cambiar_password =
          FALSE,

        intentos_fallidos = 0,

        bloqueado_hasta =
          NULL,

        fecha_actualizacion =
          NOW()

      WHERE id = $2;
      `,
      [
        nuevoHash,
        datosToken.usuario_id
      ]
    );


    // =================================================
    // MARCAR TOKEN USADO
    // =================================================

    await cliente.query(
      `
      UPDATE tokens_restablecimiento

      SET utilizado = TRUE

      WHERE id = $1;
      `,
      [
        datosToken.token_id
      ]
    );


    // =================================================
    // INVALIDAR RESTO DE TOKENS
    // =================================================

    await cliente.query(
      `
      UPDATE tokens_restablecimiento

      SET utilizado = TRUE

      WHERE usuario_id = $1
        AND utilizado = FALSE;
      `,
      [
        datosToken.usuario_id
      ]
    );


    // =================================================
    // CERRAR TODAS LAS SESIONES
    // =================================================

    await revocarTodasSesiones(
      datosToken.usuario_id,
      cliente
    );


    // =================================================
    // CONFIRMAR TRANSACCIÓN
    // =================================================

    await cliente.query(
      'COMMIT'
    );


    // =================================================
    // AUDITORÍA
    // =================================================

    await registrarEvento({

      usuarioId:
        datosToken.usuario_id,

      evento:
        'PASSWORD_RESTABLECIDA',

      modulo:
        'AUTENTICACION',

      descripcion:
        'La contraseña fue restablecida correctamente mediante token de recuperación',

      ip:
        req.ip,

      userAgent:
        req.headers['user-agent']
    });


    return res.status(200).json({

      ok: true,

      mensaje:
        'Contraseña restablecida correctamente'
    });


  } catch (error) {

    try {

      await cliente.query(
        'ROLLBACK'
      );

    } catch (rollbackError) {

      console.error(
        'Error al revertir transacción:',
        rollbackError.message
      );
    }


    console.error(
      'Error al restablecer contraseña:',
      error.message
    );


    return res.status(500).json({
      ok: false,
      mensaje:
        'Error interno del servidor'
    });


  } finally {

    cliente.release();
  }
}


// =====================================================
// CERRAR SESIÓN
// =====================================================

async function logout(
  req,
  res
) {

  try {

    const usuarioId =
      req.usuario.usuarioId;


    const authHeader =
      req.headers.authorization;


    if (
      !authHeader ||
      !authHeader.startsWith(
        'Bearer '
      )
    ) {

      return res.status(401).json({
        ok: false,
        mensaje:
          'Autenticación requerida'
      });
    }


    const token =
      authHeader.split(' ')[1];


    const accessTokenHash =
      generarHashToken(token);


    // =================================================
    // REVOCAR SESIÓN ACTUAL
    // =================================================

    await pool.query(
      `
      UPDATE sesiones

      SET
        revocada = TRUE

      WHERE usuario_id = $1

        AND access_token_hash =
          $2

        AND revocada =
          FALSE;
      `,
      [
        usuarioId,
        accessTokenHash
      ]
    );


    // =================================================
    // AUDITORÍA
    // =================================================

    await registrarEvento({

      usuarioId,

      evento:
        'LOGOUT',

      modulo:
        'AUTENTICACION',

      descripcion:
        'El usuario cerró sesión correctamente',

      ip:
        req.ip,

      userAgent:
        req.headers['user-agent']
    });


    return res.status(200).json({

      ok: true,

      mensaje:
        'Sesión cerrada correctamente'
    });


  } catch (error) {

    console.error(
      'Error al cerrar sesión:',
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

  login,

  cambiarPassword,

  solicitarResetPassword,

  confirmarResetPassword,

  logout
};