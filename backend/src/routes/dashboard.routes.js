const express =
  require('express');

const {
  obtenerDashboard
} = require(
  '../controllers/dashboard.controller'
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
// HU-038 / HU-039 - DASHBOARD DOCUMENTAL
// ============================================================

router.get(
  '/',
  verificarToken,
  verificarPermiso(
    'dashboard.ver'
  ),
  obtenerDashboard
);


module.exports = router;
