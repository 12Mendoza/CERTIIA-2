const express = require('express');

const {
  listarUsuarios,
  registrarUsuario,
  editarUsuario,
  cambiarEstadoUsuario
} = require('../controllers/usuarios.controller');

const {
  verificarToken
} = require('../middlewares/auth.middleware');

const {
  verificarPermiso
} = require('../middlewares/roles.middleware');

const router = express.Router();


// =====================================================
// LISTAR USUARIOS
// Requiere permiso: usuarios.ver
// =====================================================
router.get(
  '/',
  verificarToken,
  verificarPermiso('usuarios.ver'),
  listarUsuarios
);


// =====================================================
// REGISTRAR USUARIO
// Requiere permiso: usuarios.crear
// =====================================================
router.post(
  '/',
  verificarToken,
  verificarPermiso('usuarios.crear'),
  registrarUsuario
);


// =====================================================
// EDITAR USUARIO
// Requiere permiso: usuarios.editar
// =====================================================
router.put(
  '/:id',
  verificarToken,
  verificarPermiso('usuarios.editar'),
  editarUsuario
);


// =====================================================
// ACTIVAR / DESACTIVAR USUARIO
// Requiere permiso: usuarios.estado
// =====================================================
router.patch(
  '/:id/estado',
  verificarToken,
  verificarPermiso('usuarios.estado'),
  cambiarEstadoUsuario
);


module.exports = router;