const pool = require('../config/database');


function enteroPositivo(valor) {
  const numero = Number(valor);

  return (
    Number.isInteger(numero) &&
    numero > 0
  );
}


function fechaValida(valor) {
  if (!valor) {
    return true;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(
    String(valor)
  );
}


function construirFiltros(query) {
  const {
    q,
    evento,
    modulo,
    usuarioId,
    entidad,
    registroId,
    fechaDesde,
    fechaHasta
  } = query;

  const condiciones = [];
  const valores = [];

  function agregar(valor) {
    valores.push(valor);
    return `$${valores.length}`;
  }

  if (q?.trim()) {
    const parametro =
      agregar(`%${q.trim()}%`);

    condiciones.push(
      `(
        a.evento ILIKE ${parametro}
        OR a.modulo ILIKE ${parametro}
        OR COALESCE(a.descripcion, '') ILIKE ${parametro}
        OR COALESCE(a.entidad, '') ILIKE ${parametro}
        OR COALESCE(u.nombres, '') ILIKE ${parametro}
        OR COALESCE(u.apellidos, '') ILIKE ${parametro}
        OR COALESCE(u.email, '') ILIKE ${parametro}
        OR COALESCE(a.registro_id::text, '') ILIKE ${parametro}
      )`
    );
  }

  if (evento) {
    condiciones.push(
      `a.evento = ${agregar(evento)}`
    );
  }

  if (modulo) {
    condiciones.push(
      `a.modulo = ${agregar(modulo)}`
    );
  }

  if (usuarioId) {
    if (!enteroPositivo(usuarioId)) {
      const error = new Error(
        'usuarioId no es válido.'
      );
      error.status = 400;
      throw error;
    }

    condiciones.push(
      `a.usuario_id = ${agregar(Number(usuarioId))}`
    );
  }

  if (entidad) {
    condiciones.push(
      `a.entidad = ${agregar(entidad)}`
    );
  }

  if (registroId) {
    condiciones.push(
      `a.registro_id::text = ${agregar(String(registroId).trim())}`
    );
  }

  if (!fechaValida(fechaDesde)) {
    const error = new Error(
      'fechaDesde debe tener formato YYYY-MM-DD.'
    );
    error.status = 400;
    throw error;
  }

  if (!fechaValida(fechaHasta)) {
    const error = new Error(
      'fechaHasta debe tener formato YYYY-MM-DD.'
    );
    error.status = 400;
    throw error;
  }

  if (
    fechaDesde &&
    fechaHasta &&
    fechaDesde > fechaHasta
  ) {
    const error = new Error(
      'fechaDesde no puede ser posterior a fechaHasta.'
    );
    error.status = 400;
    throw error;
  }

  if (fechaDesde) {
    condiciones.push(
      `a.fecha_evento >= ${agregar(fechaDesde)}::date`
    );
  }

  if (fechaHasta) {
    condiciones.push(
      `a.fecha_evento < (${agregar(fechaHasta)}::date + INTERVAL '1 day')`
    );
  }

  return {
    where:
      condiciones.length > 0
        ? `WHERE ${condiciones.join(' AND ')}`
        : '',
    valores
  };
}


async function listarAuditoria(req, res) {
  try {
    const pagina =
      enteroPositivo(req.query.pagina)
        ? Number(req.query.pagina)
        : 1;

    let limite =
      enteroPositivo(req.query.limite)
        ? Number(req.query.limite)
        : 25;

    if (limite > 100) {
      limite = 100;
    }

    const {
      where,
      valores
    } = construirFiltros(req.query);

    const offset =
      (pagina - 1) * limite;

    const valoresListado = [
      ...valores,
      limite,
      offset
    ];

    const parametroLimite =
      `$${valores.length + 1}`;

    const parametroOffset =
      `$${valores.length + 2}`;

    const [
      resultado,
      resumenResultado
    ] = await Promise.all([
      pool.query(
        `
          SELECT
            a.id,
            a.usuario_id,
            a.evento,
            a.modulo,
            a.descripcion,
            a.entidad,
            a.registro_id,
            a.ip,
            a.user_agent,
            a.fecha_evento,
            u.nombres,
            u.apellidos,
            u.email
          FROM auditoria a
          LEFT JOIN usuarios u
            ON u.id = a.usuario_id
          ${where}
          ORDER BY
            a.fecha_evento DESC,
            a.id DESC
          LIMIT ${parametroLimite}
          OFFSET ${parametroOffset};
        `,
        valoresListado
      ),
      pool.query(
        `
          SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (
              WHERE a.evento = 'LOGIN_EXITOSO'
            )::int AS logins_exitosos,
            COUNT(*) FILTER (
              WHERE a.evento = 'LOGIN_FALLIDO'
            )::int AS logins_fallidos,
            COUNT(*) FILTER (
              WHERE a.evento IN (
                'BLOQUEO_TEMPORAL',
                'BLOQUEO'
              )
            )::int AS bloqueos
          FROM auditoria a
          LEFT JOIN usuarios u
            ON u.id = a.usuario_id
          ${where};
        `,
        valores
      )
    ]);

    const resumen =
      resumenResultado.rows[0] || {};

    const total =
      Number(resumen.total || 0);

    const totalPaginas =
      Math.max(
        1,
        Math.ceil(total / limite)
      );

    return res.status(200).json({
      ok: true,
      eventos: resultado.rows,
      resumen: {
        total,
        loginsExitosos:
          Number(resumen.logins_exitosos || 0),
        loginsFallidos:
          Number(resumen.logins_fallidos || 0),
        bloqueos:
          Number(resumen.bloqueos || 0)
      },
      paginacion: {
        pagina,
        limite,
        total,
        totalPaginas,
        tieneAnterior:
          pagina > 1,
        tieneSiguiente:
          pagina < totalPaginas
      }
    });

  } catch (error) {
    console.error(
      'Error al listar auditoría:',
      error.message
    );

    return res.status(
      error.status || 500
    ).json({
      ok: false,
      mensaje:
        error.status
          ? error.message
          : 'Error interno del servidor'
    });
  }
}


async function obtenerDetalleAuditoria(req, res) {
  try {
    const { id } = req.params;

    if (!enteroPositivo(id)) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El identificador del evento no es válido.'
      });
    }

    const resultado =
      await pool.query(
        `
          SELECT
            a.id,
            a.usuario_id,
            a.evento,
            a.modulo,
            a.descripcion,
            a.entidad,
            a.registro_id,
            a.datos_anteriores,
            a.datos_nuevos,
            a.ip,
            a.user_agent,
            a.fecha_evento,
            u.nombres,
            u.apellidos,
            u.email
          FROM auditoria a
          LEFT JOIN usuarios u
            ON u.id = a.usuario_id
          WHERE a.id = $1
          LIMIT 1;
        `,
        [Number(id)]
      );

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        mensaje:
          'El evento de auditoría no existe.'
      });
    }

    return res.status(200).json({
      ok: true,
      evento: resultado.rows[0]
    });

  } catch (error) {
    console.error(
      'Error obteniendo detalle de auditoría:',
      error.message
    );

    return res.status(500).json({
      ok: false,
      mensaje:
        'Error interno del servidor'
    });
  }
}


async function obtenerCatalogosAuditoria(req, res) {
  try {
    const [
      modulosResultado,
      eventosResultado,
      entidadesResultado,
      usuariosResultado
    ] = await Promise.all([
      pool.query(
        `
          SELECT DISTINCT modulo
          FROM auditoria
          WHERE modulo IS NOT NULL
            AND BTRIM(modulo) <> ''
          ORDER BY modulo ASC;
        `
      ),
      pool.query(
        `
          SELECT DISTINCT evento
          FROM auditoria
          WHERE evento IS NOT NULL
            AND BTRIM(evento) <> ''
          ORDER BY evento ASC;
        `
      ),
      pool.query(
        `
          SELECT DISTINCT entidad
          FROM auditoria
          WHERE entidad IS NOT NULL
            AND BTRIM(entidad) <> ''
          ORDER BY entidad ASC;
        `
      ),
      pool.query(
        `
          SELECT DISTINCT
            u.id,
            u.nombres,
            u.apellidos,
            u.email
          FROM auditoria a
          INNER JOIN usuarios u
            ON u.id = a.usuario_id
          ORDER BY
            u.apellidos ASC,
            u.nombres ASC,
            u.id ASC;
        `
      )
    ]);

    return res.status(200).json({
      ok: true,
      modulos:
        modulosResultado.rows.map(
          (fila) => fila.modulo
        ),
      eventos:
        eventosResultado.rows.map(
          (fila) => fila.evento
        ),
      entidades:
        entidadesResultado.rows.map(
          (fila) => fila.entidad
        ),
      usuarios:
        usuariosResultado.rows
    });

  } catch (error) {
    console.error(
      'Error obteniendo catálogos de auditoría:',
      error.message
    );

    return res.status(500).json({
      ok: false,
      mensaje:
        'Error interno del servidor'
    });
  }
}


module.exports = {
  listarAuditoria,
  obtenerDetalleAuditoria,
  obtenerCatalogosAuditoria
};
