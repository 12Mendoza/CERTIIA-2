const express =
  require('express');

const {
  iniciarRenovacion,
  completarRenovacion
} = require(
  '../controllers/renovaciones.controller'
);

const {
  listarRenovaciones
} = require(
  '../controllers/renovacionesConsulta.controller'
);

const {
  consultarHistorialRenovaciones
} = require(
  '../controllers/renovacionesHistorial.controller'
);

const {
  verificarToken
} = require(
  '../middlewares/auth.middleware'
);

const {
  verificarPermiso
} = require(
  '../middlewares/roles.middleware'
);


const router =
  express.Router();


// ============================================================
// HU-033
// LISTAR RENOVACIONES
// ============================================================

router.get(
  '/',
  verificarToken,
  verificarPermiso(
    'renovaciones.ver'
  ),
  listarRenovaciones
);


// ============================================================
// HU-033
// CONSULTAR HISTORIAL COMPLETO DE RENOVACIONES
// ============================================================

router.get(
  '/historial/:documentoId',
  verificarToken,
  verificarPermiso(
    'renovaciones.ver'
  ),
  consultarHistorialRenovaciones
);


// ============================================================
// HU-031
// INICIAR RENOVACIÓN
// ============================================================

router.post(
  '/',
  verificarToken,
  verificarPermiso(
    'renovaciones.crear'
  ),
  iniciarRenovacion
);


// ============================================================
// HU-032
// REGISTRAR DOCUMENTO RENOVADO
// ============================================================

router.patch(
  '/:id/completar',
  verificarToken,
  verificarPermiso(
    'renovaciones.completar'
  ),
  completarRenovacion
);


module.exports = router;