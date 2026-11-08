const express = require('express');

const {
  obtenerReglaActual,
  listarHistorialReglas,
  guardarReglaVigencia
} = require('../controllers/reglasVigencia.controller');

const {
  verificarToken
} = require('../middlewares/auth.middleware');

const {
  verificarPermiso
} = require('../middlewares/roles.middleware');


const router = express.Router();


// ============================================================
// OBTENER CONFIGURACIÓN ACTUAL
// ============================================================

router.get(
  '/:tipoDocumentoId/vigencia',
  verificarToken,
  verificarPermiso('tipos_documento.ver'),
  obtenerReglaActual
);


// ============================================================
// OBTENER HISTORIAL DE CONFIGURACIONES
// ============================================================

router.get(
  '/:tipoDocumentoId/vigencia/historial',
  verificarToken,
  verificarPermiso('tipos_documento.ver'),
  listarHistorialReglas
);


// ============================================================
// CREAR NUEVA VERSIÓN DE CONFIGURACIÓN
// ============================================================

router.post(
  '/:tipoDocumentoId/vigencia',
  verificarToken,
  verificarPermiso('tipos_documento.configurar'),
  guardarReglaVigencia
);


module.exports = router;