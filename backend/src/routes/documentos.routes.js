const express = require('express');
const multer = require('multer');

const {
  registrarDocumento
} = require('../controllers/documentos.controller');

const {
  obtenerCatalogosDocumento
} = require('../controllers/documentosCatalogos.controller');

const {
  adjuntarArchivoDocumento
} = require('../controllers/documentosArchivos.controller');

const {
  obtenerArchivoDocumento
} = require('../controllers/documentosArchivoConsulta.controller');

const {
  listarDocumentos
} = require('../controllers/documentosConsulta.controller');

const {
  obtenerDetalleDocumento
} = require('../controllers/documentosDetalle.controller');
const {
  editarDocumento
} = require('../controllers/documentosEditar.controller');

const {
  cambiarCondicionDocumento
} = require('../controllers/documentosBaja.controller');

const {
  verificarToken
} = require('../middlewares/auth.middleware');

const {
  verificarPermiso
} = require('../middlewares/roles.middleware');

const {
  uploadDocumento
} = require('../middlewares/uploadDocumento.middleware');


const router = express.Router();


// ============================================================
// PROCESAR ARCHIVO DIGITAL
// ============================================================

const procesarArchivoDocumento = (
  req,
  res,
  next
) => {

  uploadDocumento.single(
    'archivo'
  )(
    req,
    res,
    (error) => {

      if (!error) {
        return next();
      }


      if (
        error instanceof multer.MulterError
      ) {

        if (
          error.code === 'LIMIT_FILE_SIZE'
        ) {
          return res.status(400).json({
            ok: false,
            mensaje:
              'El archivo supera el tamaño máximo permitido de 10 MB.'
          });
        }


        return res.status(400).json({
          ok: false,
          mensaje:
            `Error al procesar el archivo: ${error.message}`
        });
      }


      return res.status(400).json({
        ok: false,
        mensaje:
          error.message ||
          'El archivo seleccionado no es válido.'
      });
    }
  );
};


// ============================================================
// CATÁLOGOS
// ============================================================

router.get(
  '/catalogos',
  verificarToken,
  verificarPermiso(
    'documentos.crear'
  ),
  obtenerCatalogosDocumento
);


// ============================================================
// LISTAR / BUSCAR / FILTRAR
// ============================================================

router.get(
  '/',
  verificarToken,
  verificarPermiso(
    'documentos.ver'
  ),
  listarDocumentos
);


// ============================================================
// REGISTRAR DOCUMENTO
// ============================================================

router.post(
  '/',
  verificarToken,
  verificarPermiso(
    'documentos.crear'
  ),
  registrarDocumento
);


// ============================================================
// VISUALIZAR / DESCARGAR ARCHIVO DIGITAL
// ============================================================

router.get(
  '/:id/archivo/:archivoId',
  verificarToken,
  verificarPermiso(
    'documentos.ver'
  ),
  obtenerArchivoDocumento
);


// ============================================================
// ARCHIVAR / ANULAR DOCUMENTO
// HU-025
// ============================================================

router.patch(
  '/:id/condicion',
  verificarToken,
  verificarPermiso(
    'documentos.editar'
  ),
  cambiarCondicionDocumento
);


// ============================================================
// CONSULTAR DETALLE
// ============================================================

router.get(
  '/:id',
  verificarToken,
  verificarPermiso(
    'documentos.ver'
  ),
  obtenerDetalleDocumento
);


// ============================================================
// EDITAR DOCUMENTO
// ============================================================

router.put(
  '/:id',
  verificarToken,
  verificarPermiso(
    'documentos.editar'
  ),
  editarDocumento
);


// ============================================================
// ADJUNTAR ARCHIVO DIGITAL
// ============================================================

router.post(
  '/:id/archivo',
  verificarToken,
  verificarPermiso(
    'documentos.editar'
  ),
  procesarArchivoDocumento,
  adjuntarArchivoDocumento
);


module.exports = router;