const pool = require('../config/database');

function convertirValor(fila, fallback = null) {
  if (!fila) return fallback;

  const valor = fila.valor;

  if (fila.tipo === 'ENTERO') {
    const numero = Number.parseInt(valor, 10);
    return Number.isFinite(numero) ? numero : fallback;
  }

  if (fila.tipo === 'DECIMAL') {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : fallback;
  }

  if (fila.tipo === 'BOOLEANO') {
    return String(valor).toLowerCase() === 'true';
  }

  return valor;
}

async function obtenerParametro(clave, fallback = null) {
  try {
    const resultado = await pool.query(
      `
      SELECT clave, tipo, valor
      FROM config_parametros
      WHERE clave = $1
        AND activo = TRUE
      LIMIT 1;
      `,
      [String(clave)]
    );

    return convertirValor(
      resultado.rows[0] || null,
      fallback
    );
  } catch {
    // Mantiene un valor seguro por defecto si la configuración
    // todavía no está disponible durante el arranque.
    return fallback;
  }
}

async function obtenerParametroNumero(clave, fallback) {
  const valor = await obtenerParametro(clave, fallback);
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : fallback;
}

module.exports = {
  obtenerParametro,
  obtenerParametroNumero
};
