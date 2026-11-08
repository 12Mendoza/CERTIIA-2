const express = require('express');

const {
  listarAuditoria,
  obtenerDetalleAuditoria,
  obtenerCatalogosAuditoria
} = require('../controllers/auditoria.controller');

const {
  verificarToken
} = require('../middlewares/auth.middleware');

const {
  verificarPermiso
} = require('../middlewares/roles.middleware');

const router = express.Router();


router.get(
  '/catalogos',
  verificarToken,
  verificarPermiso('auditoria.ver'),
  obtenerCatalogosAuditoria
);

router.get(
  '/',
  verificarToken,
  verificarPermiso('auditoria.ver'),
  listarAuditoria
);

router.get(
  '/:id',
  verificarToken,
  verificarPermiso('auditoria.ver'),
  obtenerDetalleAuditoria
);


module.exports = router;
