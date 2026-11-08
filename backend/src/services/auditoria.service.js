const pool = require('../config/database');


const PATRONES_SENSIBLES = [
  /password/i,
  /contrase(?:n|ñ)a/i,
  /passwd/i,
  /token/i,
  /authorization/i,
  /cookie/i,
  /secret/i,
  /api[_-]?key/i,
  /otp/i,
  /pin/i,
  /credential/i,
  /session/i
];

const MAX_PROFUNDIDAD = 8;
const MAX_CLAVES_OBJETO = 100;
const MAX_ELEMENTOS_ARRAY = 100;
const MAX_TEXTO = 4000;


function esClaveSensible(clave) {
  return PATRONES_SENSIBLES.some(
    (patron) => patron.test(String(clave))
  );
}


function sanitizarTexto(texto) {
  if (texto === null || texto === undefined) {
    return texto;
  }

  let valor = String(texto);

  valor = valor
    .replace(
      /Bearer\s+[A-Za-z0-9._~+/=-]+/gi,
      'Bearer [REDACTADO]'
    )
    .replace(
      /\b(password|passwd|contrase(?:n|ñ)a|token|secret|api[_-]?key)\b\s*[:=]\s*[^\s,;]+/gi,
      '$1=[REDACTADO]'
    );

  if (valor.length > MAX_TEXTO) {
    return `${valor.slice(0, MAX_TEXTO)}…`;
  }

  return valor;
}


function sanitizarDato(valor, profundidad = 0) {
  if (valor === null || valor === undefined) {
    return valor;
  }

  if (profundidad > MAX_PROFUNDIDAD) {
    return '[PROFUNDIDAD_LIMITADA]';
  }

  if (typeof valor === 'bigint') {
    return valor.toString();
  }

  if (
    typeof valor === 'string' ||
    typeof valor === 'number' ||
    typeof valor === 'boolean'
  ) {
    return typeof valor === 'string'
      ? sanitizarTexto(valor)
      : valor;
  }

  if (valor instanceof Date) {
    return valor.toISOString();
  }

  if (valor instanceof Error) {
    return {
      name: valor.name,
      message: sanitizarTexto(valor.message)
    };
  }

  if (Array.isArray(valor)) {
    return valor
      .slice(0, MAX_ELEMENTOS_ARRAY)
      .map(
        (elemento) =>
          sanitizarDato(
            elemento,
            profundidad + 1
          )
      );
  }

  if (typeof valor === 'object') {
    const resultado = {};

    Object.entries(valor)
      .slice(0, MAX_CLAVES_OBJETO)
      .forEach(
        ([clave, contenido]) => {
          if (esClaveSensible(clave)) {
            resultado[clave] = '[REDACTADO]';
            return;
          }

          resultado[clave] =
            sanitizarDato(
              contenido,
              profundidad + 1
            );
        }
      );

    return resultado;
  }

  return sanitizarTexto(valor);
}


function extraerContextoAuditoria(req) {
  if (!req) {
    return {
      ip: null,
      userAgent: null
    };
  }

  const forwarded =
    req.headers?.['x-forwarded-for'];

  const ip =
    (
      typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : null
    ) ||
    req.ip ||
    req.socket?.remoteAddress ||
    null;

  const userAgent =
    req.headers?.['user-agent'] ||
    null;

  return {
    ip: ip
      ? sanitizarTexto(ip).slice(0, 255)
      : null,
    userAgent: userAgent
      ? sanitizarTexto(userAgent).slice(0, 1000)
      : null
  };
}


async function registrarEvento({
  usuarioId = null,
  evento,
  modulo,
  descripcion = null,
  entidad = null,
  registroId = null,
  datosAnteriores = null,
  datosNuevos = null,
  ip = null,
  userAgent = null,
  req = null,
  estricto = false
}) {
  try {
    if (!evento || !modulo) {
      throw new Error(
        'evento y modulo son obligatorios para registrar auditoría.'
      );
    }

    const contexto =
      extraerContextoAuditoria(req);

    const anterioresSanitizados =
      datosAnteriores === null
        ? null
        : sanitizarDato(datosAnteriores);

    const nuevosSanitizados =
      datosNuevos === null
        ? null
        : sanitizarDato(datosNuevos);

    await pool.query(
      `
        INSERT INTO auditoria (
          usuario_id,
          evento,
          modulo,
          descripcion,
          entidad,
          registro_id,
          datos_anteriores,
          datos_nuevos,
          ip,
          user_agent
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7::jsonb,
          $8::jsonb,
          $9,
          $10
        )
        RETURNING id;
      `,
      [
        usuarioId,
        sanitizarTexto(evento).slice(0, 120),
        sanitizarTexto(modulo).slice(0, 120),
        descripcion
          ? sanitizarTexto(descripcion)
          : null,
        entidad
          ? sanitizarTexto(entidad).slice(0, 120)
          : null,
        registroId,
        anterioresSanitizados === null
          ? null
          : JSON.stringify(anterioresSanitizados),
        nuevosSanitizados === null
          ? null
          : JSON.stringify(nuevosSanitizados),
        ip || contexto.ip || null,
        userAgent || contexto.userAgent || null
      ]
    );

    return true;

  } catch (error) {
    console.error(
      'Error al registrar auditoría:',
      error.message
    );

    if (estricto) {
      throw error;
    }

    return false;
  }
}


module.exports = {
  registrarEvento,
  extraerContextoAuditoria,
  sanitizarDato
};
