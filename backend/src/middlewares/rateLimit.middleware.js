const {
  rateLimit
} = require('express-rate-limit');


// ============================================================
// LIMITADOR DE INTENTOS DE INICIO DE SESIÓN
// ============================================================
const loginLimiter = rateLimit({
  // Ventana de 15 minutos
  windowMs:
    15 * 60 * 1000,

  // Máximo de solicitudes de login por IP
  max: 20,

  // No contabilizar inicios de sesión exitosos
  skipSuccessfulRequests:
    true,

  // Cabeceras modernas de Rate Limit
  standardHeaders:
    'draft-8',

  // Desactivar cabeceras antiguas
  legacyHeaders:
    false,

  // ==========================================================
  // RESPUESTA CUANDO SE SUPERA EL LÍMITE
  // ==========================================================
  handler: (
    req,
    res
  ) => {
    return res.status(429).json({
      ok: false,

      mensaje:
        'Demasiados intentos de inicio de sesión. Intente nuevamente más tarde.'
    });
  }
});


module.exports = {
  loginLimiter
};