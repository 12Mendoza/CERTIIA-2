const express = require('express');
const {
  resumenIa,
  casosActivos,
  solicitarPrediccion,
  listarPredicciones,
  sincronizarResultados,
  listarResultados,
  actualizarResultado,
  listarModelos,
  entrenar,
  activarModelo
} = require('../controllers/ia.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { verificarPermiso } = require('../middlewares/roles.middleware');

const router = express.Router();

router.get(
  '/resumen',
  verificarToken,
  verificarPermiso('ia.ver'),
  resumenIa
);

router.get(
  '/casos',
  verificarToken,
  verificarPermiso('ia.ver'),
  casosActivos
);

router.get(
  '/predicciones',
  verificarToken,
  verificarPermiso('ia.ver'),
  listarPredicciones
);

router.post(
  '/predicciones',
  verificarToken,
  verificarPermiso('ia.predecir'),
  solicitarPrediccion
);

router.get(
  '/resultados',
  verificarToken,
  verificarPermiso('ia.ver'),
  listarResultados
);

router.post(
  '/resultados/sincronizar',
  verificarToken,
  verificarPermiso('ia.resultados'),
  sincronizarResultados
);

router.patch(
  '/resultados/:id',
  verificarToken,
  verificarPermiso('ia.resultados'),
  actualizarResultado
);

router.get(
  '/modelos',
  verificarToken,
  verificarPermiso('ia.ver'),
  listarModelos
);

router.post(
  '/modelos/entrenar',
  verificarToken,
  verificarPermiso('ia.entrenar'),
  entrenar
);

router.patch(
  '/modelos/:id/activar',
  verificarToken,
  verificarPermiso('ia.activar'),
  activarModelo
);

module.exports = router;
