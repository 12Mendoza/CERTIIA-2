const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/database');


// =====================================================
// GENERAR HASH SHA-256 DEL TOKEN
// =====================================================
function generarHashToken(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}


// =====================================================
// VERIFICAR TOKEN Y SESIÓN
// =====================================================
async function verificarToken(req, res, next) {
  try {
    // =================================================
    // 1. OBTENER AUTHORIZATION
    // =================================================
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ')
    ) {
      return res.status(401).json({
        ok: false,
        mensaje:
          'Autenticación requerida'
      });
    }

    // =================================================
    // 2. EXTRAER TOKEN
    // =================================================
    const token =
      authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        ok: false,
        mensaje:
          'Autenticación requerida'
      });
    }

    // =================================================
    // 3. VERIFICAR JWT
    // =================================================
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        issuer: 'certiia-api'
      }
    );

    // =================================================
    // 4. GENERAR HASH DEL TOKEN
    // =================================================
    const accessTokenHash =
      generarHashToken(token);

    // =================================================
    // 5. VERIFICAR SESIÓN EN BASE DE DATOS
    // =================================================
    const sesionResultado =
      await pool.query(
        `
        SELECT
          id,
          usuario_id,
          revocada,
          fecha_expiracion
        FROM sesiones
        WHERE access_token_hash = $1
          AND usuario_id = $2
          AND revocada = FALSE
          AND fecha_expiracion > NOW()
        LIMIT 1;
        `,
        [
          accessTokenHash,
          decoded.usuarioId
        ]
      );

    // =================================================
    // 6. SESIÓN NO VÁLIDA O REVOCADA
    // =================================================
    if (
      sesionResultado.rowCount === 0
    ) {
      return res.status(401).json({
        ok: false,
        mensaje:
          'Sesión inválida, expirada o cerrada'
      });
    }

    // =================================================
    // 7. VERIFICAR QUE EL USUARIO SIGA ACTIVO
    // =================================================
    const usuarioResultado =
      await pool.query(
        `
        SELECT
          id,
          activo
        FROM usuarios
        WHERE id = $1
        LIMIT 1;
        `,
        [
          decoded.usuarioId
        ]
      );

    if (
      usuarioResultado.rowCount === 0 ||
      !usuarioResultado.rows[0].activo
    ) {
      return res.status(401).json({
        ok: false,
        mensaje:
          'Usuario no disponible'
      });
    }

    // =================================================
    // 8. GUARDAR DATOS EN LA REQUEST
    // =================================================
    req.usuario = decoded;

    req.sesion = {
      id:
        sesionResultado.rows[0].id,

      usuarioId:
        sesionResultado.rows[0].usuario_id
    };

    req.accessToken = token;

    req.accessTokenHash =
      accessTokenHash;

    // =================================================
    // 9. CONTINUAR
    // =================================================
    next();

  } catch (error) {
    if (
      error.name ===
      'TokenExpiredError'
    ) {
      return res.status(401).json({
        ok: false,
        mensaje:
          'Token expirado'
      });
    }

    if (
      error.name ===
      'JsonWebTokenError'
    ) {
      return res.status(401).json({
        ok: false,
        mensaje:
          'Token inválido'
      });
    }

    console.error(
      'Error al verificar autenticación:',
      error.message
    );

    return res.status(500).json({
      ok: false,
      mensaje:
        'Error interno del servidor'
    });
  }
}


module.exports = {
  verificarToken
};