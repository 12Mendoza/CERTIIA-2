const express = require('express');

const {
  verificarToken
} = require('../middlewares/auth.middleware');

const {
  verificarPermiso
} = require('../middlewares/roles.middleware');

const {
  obtenerCatalogosReportes,
  generarReporteDocumentos,
  generarReporteTramitesRenovaciones,
  exportarReporte
} = require('../controllers/reportes.controller');


const router = express.Router();


router.get(
  '/catalogos',
  verificarToken,
  verificarPermiso('reportes.ver'),
  obtenerCatalogosReportes
);


router.get(
  '/documentos',
  verificarToken,
  verificarPermiso('reportes.ver'),
  generarReporteDocumentos
);


router.get(
  '/tramites-renovaciones',
  verificarToken,
  verificarPermiso('reportes.ver'),
  generarReporteTramitesRenovaciones
);


router.get(
  '/exportar',
  verificarToken,
  verificarPermiso('reportes.exportar'),
  exportarReporte
);


module.exports = router;
