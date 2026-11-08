const express = require('express');

const {
  login,
  cambiarPassword,
  solicitarResetPassword,
  confirmarResetPassword,
  logout
} = require('../controllers/auth.controller');

const {
  obtenerPerfil
} = require('../controllers/perfil.controller');

const {
  verificarToken
} = require('../middlewares/auth.middleware');

const {
  loginLimiter
} = require('../middlewares/rateLimit.middleware');


const router = express.Router();


// ============================================================
// LOGIN
// ============================================================
router.post(
  '/login',
  loginLimiter,
  login
);


// ============================================================
// PERFIL DEL USUARIO AUTENTICADO
// ============================================================
router.get(
  '/perfil',
  verificarToken,
  obtenerPerfil
);


// ============================================================
// CAMBIAR CONTRASEÑA
// ============================================================
router.patch(
  '/password',
  verificarToken,
  cambiarPassword
);


// ============================================================
// SOLICITAR RESTABLECIMIENTO DE CONTRASEÑA
// ============================================================
router.post(
  '/password/reset/request',
  solicitarResetPassword
);


// ============================================================
// CONFIRMAR RESTABLECIMIENTO DE CONTRASEÑA
// ============================================================
router.post(
  '/password/reset/confirm',
  confirmarResetPassword
);


// ============================================================
// CERRAR SESIÓN
// ============================================================
router.post(
  '/logout',
  verificarToken,
  logout
);


module.exports = router;