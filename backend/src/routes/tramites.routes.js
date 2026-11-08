const express =
  require('express');

const {
  registrarTramite
} = require(
  '../controllers/tramites.controller'
);

const {
  obtenerCatalogosTramite
} = require(
  '../controllers/tramitesCatalogos.controller'
);

const {
  actualizarEstadoTramite
} = require(
  '../controllers/tramitesEstado.controller'
);

const {
  listarTramites,
  obtenerHistorialTramite
} = require(
  '../controllers/tramitesConsulta.controller'
);

const {
  listarObservacionesTramite,
  registrarObservacion,
  registrarSubsanacion
} = require(
  '../controllers/tramitesObservaciones.controller'
);

const {
  subirEvidenciaMiddleware,
  registrarEvidencia,
  listarEvidencias,
  obtenerArchivoEvidencia
} = require(
  '../controllers/tramitesEvidencias.controller'
);

const {
  obtenerSeguimientoTramite
} = require(
  '../controllers/tramitesSeguimiento.controller'
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
// CATÁLOGOS DE TRÁMITES
// HU-026
// ============================================================

router.get(
  '/catalogos',
  verificarToken,
  verificarPermiso(
    'tramites.crear'
  ),
  obtenerCatalogosTramite
);


// ============================================================
// LISTAR TRÁMITES
// ============================================================

router.get(
  '/',
  verificarToken,
  verificarPermiso(
    'tramites.ver'
  ),
  listarTramites
);


// ============================================================
// SEGUIMIENTO COMPLETO DEL TRÁMITE
// HU-030
// ============================================================

router.get(
  '/:id/seguimiento',
  verificarToken,
  verificarPermiso(
    'tramites.ver'
  ),
  obtenerSeguimientoTramite
);


// ============================================================
// HISTORIAL DE ESTADOS
// HU-027
// ============================================================

router.get(
  '/:id/historial',
  verificarToken,
  verificarPermiso(
    'tramites.ver'
  ),
  obtenerHistorialTramite
);


// ============================================================
// OBSERVACIONES Y SUBSANACIONES
// HU-028
// ============================================================

router.get(
  '/:id/observaciones',
  verificarToken,
  verificarPermiso(
    'tramites.ver'
  ),
  listarObservacionesTramite
);


router.post(
  '/:id/observaciones',
  verificarToken,
  verificarPermiso(
    'tramites.editar'
  ),
  registrarObservacion
);


router.post(
  '/observaciones/:observacionId/subsanaciones',
  verificarToken,
  verificarPermiso(
    'tramites.editar'
  ),
  registrarSubsanacion
);


// ============================================================
// EVIDENCIAS
// HU-029
// ============================================================

router.get(
  '/:id/evidencias',
  verificarToken,
  verificarPermiso(
    'tramites.ver'
  ),
  listarEvidencias
);


router.post(
  '/:id/evidencias',
  verificarToken,
  verificarPermiso(
    'tramites.editar'
  ),
  subirEvidenciaMiddleware,
  registrarEvidencia
);


router.get(
  '/evidencias/:evidenciaId/archivo',
  verificarToken,
  verificarPermiso(
    'tramites.ver'
  ),
  obtenerArchivoEvidencia
);


// ============================================================
// ACTUALIZAR ESTADO
// HU-027
// ============================================================

router.patch(
  '/:id/estado',
  verificarToken,
  verificarPermiso(
    'tramites.editar'
  ),
  actualizarEstadoTramite
);


// ============================================================
// REGISTRAR TRÁMITE
// HU-026
// ============================================================

router.post(
  '/',
  verificarToken,
  verificarPermiso(
    'tramites.crear'
  ),
  registrarTramite
);


module.exports = router;