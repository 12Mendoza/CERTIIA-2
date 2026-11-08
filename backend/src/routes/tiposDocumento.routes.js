const express = require('express');

const {
  listarTiposDocumento,
  obtenerTipoDocumento,
  registrarTipoDocumento,
  editarTipoDocumento,
  cambiarEstadoTipoDocumento
} = require('../controllers/tiposDocumento.controller');

const {
  verificarToken
} = require('../middlewares/auth.middleware');

const {
  verificarPermiso
} = require('../middlewares/roles.middleware');


const router = express.Router();


// ============================================================
// LISTAR TIPOS DE DOCUMENTO
// ============================================================

router.get(
  '/',
  verificarToken,
  verificarPermiso('tipos_documento.ver'),
  listarTiposDocumento
);


// ============================================================
// CONSULTAR TIPO DE DOCUMENTO
// ============================================================

router.get(
  '/:id',
  verificarToken,
  verificarPermiso('tipos_documento.ver'),
  obtenerTipoDocumento
);


// ============================================================
// REGISTRAR TIPO DE DOCUMENTO
// ============================================================

router.post(
  '/',
  verificarToken,
  verificarPermiso('tipos_documento.crear'),
  registrarTipoDocumento
);


// ============================================================
// EDITAR TIPO DE DOCUMENTO
// ============================================================

router.put(
  '/:id',
  verificarToken,
  verificarPermiso('tipos_documento.editar'),
  editarTipoDocumento
);


// ============================================================
// ACTIVAR / DESACTIVAR TIPO DE DOCUMENTO
// ============================================================

router.patch(
  '/:id/estado',
  verificarToken,
  verificarPermiso('tipos_documento.estado'),
  cambiarEstadoTipoDocumento
);


module.exports = router;