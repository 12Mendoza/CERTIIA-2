const express =
  require('express');

const {
  listarAlertas,
  evaluarVencimientos,
  atenderAlerta,
  procesarNotificaciones,
  consultarNotificaciones
} = require(
  '../controllers/alertas.controller'
);

const {
  obtenerCatalogosCalendario,
  obtenerCalendarioVencimientos
} = require(
  '../controllers/calendarioAlertas.controller'
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
// HU-037 - CATÁLOGOS DEL CALENDARIO
// ============================================================

router.get(
  '/calendario/catalogos',
  verificarToken,
  verificarPermiso(
    'alertas.calendario'
  ),
  obtenerCatalogosCalendario
);


// ============================================================
// HU-037 - CALENDARIO
// ============================================================

router.get(
  '/calendario',
  verificarToken,
  verificarPermiso(
    'alertas.calendario'
  ),
  obtenerCalendarioVencimientos
);


// ============================================================
// HU-036 - MIS NOTIFICACIONES
// ============================================================

router.get(
  '/notificaciones',
  verificarToken,
  verificarPermiso(
    'alertas.ver'
  ),
  consultarNotificaciones
);


// ============================================================
// HU-036 - PROCESAR / REINTENTAR NOTIFICACIONES
// ============================================================

router.post(
  '/notificaciones/procesar',
  verificarToken,
  verificarPermiso(
    'alertas.notificar'
  ),
  procesarNotificaciones
);


// ============================================================
// HU-034 - EJECUTAR EVALUACIÓN DE VENCIMIENTOS
// ============================================================

router.post(
  '/evaluar',
  verificarToken,
  verificarPermiso(
    'alertas.generar'
  ),
  evaluarVencimientos
);


// ============================================================
// HU-035 - ATENDER ALERTA
// ============================================================

router.patch(
  '/:id/atender',
  verificarToken,
  verificarPermiso(
    'alertas.atender'
  ),
  atenderAlerta
);


// ============================================================
// HU-034 / HU-035 - LISTAR ALERTAS
// ============================================================

router.get(
  '/',
  verificarToken,
  verificarPermiso(
    'alertas.ver'
  ),
  listarAlertas
);


module.exports = router;
