const express = require('express');

const {
  listarTiendas,
  registrarTienda,
  editarTienda,
  cambiarEstadoTienda,
  obtenerTienda
} = require('../controllers/tiendas.controller');

const {
  verificarToken
} = require('../middlewares/auth.middleware');

const {
  verificarPermiso
} = require('../middlewares/roles.middleware');


const router = express.Router();


// ============================================================
// LISTAR TIENDAS
// ============================================================
router.get(
  '/',
  verificarToken,
  verificarPermiso('tiendas.ver'),
  listarTiendas
);


// ============================================================
// CONSULTAR FICHA DE TIENDA
// ============================================================
router.get(
  '/:id',
  verificarToken,
  verificarPermiso('tiendas.ver'),
  obtenerTienda
);


// ============================================================
// REGISTRAR TIENDA
// ============================================================
router.post(
  '/',
  verificarToken,
  verificarPermiso('tiendas.crear'),
  registrarTienda
);


// ============================================================
// EDITAR TIENDA
// ============================================================
router.put(
  '/:id',
  verificarToken,
  verificarPermiso('tiendas.editar'),
  editarTienda
);


// ============================================================
// ACTIVAR / DESACTIVAR TIENDA
// ============================================================
router.patch(
  '/:id/estado',
  verificarToken,
  verificarPermiso('tiendas.estado'),
  cambiarEstadoTienda
);


module.exports = router;