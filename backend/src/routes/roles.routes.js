const express = require('express');

const {
  listarRoles,
  listarPermisos,
  asignarPermiso,
  quitarPermiso
} = require('../controllers/roles.controller');

const {
  verificarToken
} = require('../middlewares/auth.middleware');

const {
  verificarPermiso
} = require('../middlewares/roles.middleware');

const router = express.Router();


// =====================================================
// LISTAR TODOS LOS PERMISOS
// Requiere permiso: roles.ver
// =====================================================
router.get(
  '/permisos',
  verificarToken,
  verificarPermiso('roles.ver'),
  listarPermisos
);


// =====================================================
// LISTAR ROLES Y SUS PERMISOS
// Requiere permiso: roles.ver
// =====================================================
router.get(
  '/',
  verificarToken,
  verificarPermiso('roles.ver'),
  listarRoles
);


// =====================================================
// ASIGNAR PERMISO A UN ROL
// Requiere permiso: roles.gestionar
// =====================================================
router.post(
  '/:rolId/permisos',
  verificarToken,
  verificarPermiso('roles.gestionar'),
  asignarPermiso
);


// =====================================================
// QUITAR PERMISO A UN ROL
// Requiere permiso: roles.gestionar
// =====================================================
router.delete(
  '/:rolId/permisos/:permisoId',
  verificarToken,
  verificarPermiso('roles.gestionar'),
  quitarPermiso
);


module.exports = router;