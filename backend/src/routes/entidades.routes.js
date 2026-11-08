const express = require('express');

const {
  listarEntidades,
  obtenerEntidad,
  registrarEntidad,
  editarEntidad,
  cambiarEstadoEntidad
} = require('../controllers/entidades.controller');

const {
  verificarToken
} = require('../middlewares/auth.middleware');

const {
  verificarPermiso
} = require('../middlewares/roles.middleware');


const router = express.Router();


// ============================================================
// LISTAR ENTIDADES EMISORAS
// ============================================================
router.get(
  '/',
  verificarToken,
  verificarPermiso('entidades.ver'),
  listarEntidades
);


// ============================================================
// CONSULTAR ENTIDAD EMISORA
// ============================================================
router.get(
  '/:id',
  verificarToken,
  verificarPermiso('entidades.ver'),
  obtenerEntidad
);


// ============================================================
// REGISTRAR ENTIDAD EMISORA
// ============================================================
router.post(
  '/',
  verificarToken,
  verificarPermiso('entidades.crear'),
  registrarEntidad
);


// ============================================================
// EDITAR ENTIDAD EMISORA
// ============================================================
router.put(
  '/:id',
  verificarToken,
  verificarPermiso('entidades.editar'),
  editarEntidad
);


// ============================================================
// ACTIVAR / DESACTIVAR ENTIDAD EMISORA
// ============================================================
router.patch(
  '/:id/estado',
  verificarToken,
  verificarPermiso('entidades.estado'),
  cambiarEstadoEntidad
);


module.exports = router;