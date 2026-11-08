const express = require('express');

const {
  resumen,
  actualizarParametro,
  crearValorCatalogo,
  actualizarValorCatalogo,
  actualizarCanal,
  crearReglaNotificacion,
  actualizarReglaNotificacion
} = require('../controllers/configuracion.controller');

const {
  verificarToken
} = require('../middlewares/auth.middleware');

const {
  verificarPermiso
} = require('../middlewares/roles.middleware');

const router = express.Router();

router.get(
  '/resumen',
  verificarToken,
  verificarPermiso('configuracion.ver'),
  resumen
);

router.patch(
  '/parametros/:clave',
  verificarToken,
  verificarPermiso('configuracion.parametros'),
  actualizarParametro
);

router.post(
  '/catalogos/:catalogoId/valores',
  verificarToken,
  verificarPermiso('configuracion.catalogos'),
  crearValorCatalogo
);

router.patch(
  '/catalogos/valores/:id',
  verificarToken,
  verificarPermiso('configuracion.catalogos'),
  actualizarValorCatalogo
);

router.patch(
  '/notificaciones/canales/:codigo',
  verificarToken,
  verificarPermiso('configuracion.notificaciones'),
  actualizarCanal
);

router.post(
  '/notificaciones/reglas',
  verificarToken,
  verificarPermiso('configuracion.notificaciones'),
  crearReglaNotificacion
);

router.patch(
  '/notificaciones/reglas/:id',
  verificarToken,
  verificarPermiso('configuracion.notificaciones'),
  actualizarReglaNotificacion
);

module.exports = router;
