const pool = require('../config/database');
const {
  registrarEvento
} = require('../services/auditoria.service');
const {
  obtenerParametroNumero
} = require('../services/parametros.service');

function idValido(valor) {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0;
}

function codigoValido(valor) {
  return /^[A-Z0-9_]{2,80}$/.test(
    String(valor || '').trim().toUpperCase()
  );
}

function valorBooleano(valor) {
  if (typeof valor === 'boolean') return valor;
  if (String(valor).toLowerCase() === 'true') return true;
  if (String(valor).toLowerCase() === 'false') return false;
  return null;
}

function normalizarValorParametro(parametro, valor) {
  if (parametro.sensible) {
    const error = new Error(
      'Los parámetros sensibles no pueden administrarse desde esta interfaz.'
    );
    error.status = 403;
    throw error;
  }

  if (!parametro.editable) {
    const error = new Error('El parámetro no es editable.');
    error.status = 409;
    throw error;
  }

  if (parametro.tipo === 'ENTERO') {
    const n = Number(valor);

    if (!Number.isInteger(n)) {
      const error = new Error('El valor debe ser un número entero.');
      error.status = 400;
      throw error;
    }

    if (
      parametro.minimo !== null &&
      n < Number(parametro.minimo)
    ) {
      const error = new Error(
        `El valor mínimo permitido es ${parametro.minimo}.`
      );
      error.status = 400;
      throw error;
    }

    if (
      parametro.maximo !== null &&
      n > Number(parametro.maximo)
    ) {
      const error = new Error(
        `El valor máximo permitido es ${parametro.maximo}.`
      );
      error.status = 400;
      throw error;
    }

    return String(n);
  }

  if (parametro.tipo === 'DECIMAL') {
    const n = Number(valor);

    if (!Number.isFinite(n)) {
      const error = new Error('El valor debe ser numérico.');
      error.status = 400;
      throw error;
    }

    if (
      parametro.minimo !== null &&
      n < Number(parametro.minimo)
    ) {
      const error = new Error(
        `El valor mínimo permitido es ${parametro.minimo}.`
      );
      error.status = 400;
      throw error;
    }

    if (
      parametro.maximo !== null &&
      n > Number(parametro.maximo)
    ) {
      const error = new Error(
        `El valor máximo permitido es ${parametro.maximo}.`
      );
      error.status = 400;
      throw error;
    }

    return String(n);
  }

  if (parametro.tipo === 'BOOLEANO') {
    const b = valorBooleano(valor);

    if (b === null) {
      const error = new Error('El valor debe ser verdadero o falso.');
      error.status = 400;
      throw error;
    }

    return b ? 'true' : 'false';
  }

  const texto = String(valor ?? '').trim();

  if (!texto) {
    const error = new Error('El valor no puede estar vacío.');
    error.status = 400;
    throw error;
  }

  if (texto.length > 1000) {
    const error = new Error('El valor es demasiado extenso.');
    error.status = 400;
    throw error;
  }

  return texto;
}


// ============================================================
// RESUMEN
// ============================================================

async function resumen(req, res) {
  try {
    const [
      parametros,
      catalogos,
      canales,
      reglas,
      roles
    ] = await Promise.all([
      pool.query(`
        SELECT
          clave,
          nombre,
          descripcion,
          tipo,
          CASE WHEN sensible THEN NULL ELSE valor END AS valor,
          CASE WHEN sensible THEN NULL ELSE valor_defecto END AS valor_defecto,
          minimo,
          maximo,
          sensible,
          editable,
          activo,
          modificado_por,
          fecha_actualizacion
        FROM config_parametros
        WHERE activo = TRUE
        ORDER BY nombre ASC;
      `),

      pool.query(`
        SELECT
          c.id,
          c.codigo,
          c.nombre,
          c.descripcion,
          c.activo,
          COALESCE(
            json_agg(
              json_build_object(
                'id', v.id,
                'codigo', v.codigo,
                'nombre', v.nombre,
                'descripcion', v.descripcion,
                'orden', v.orden,
                'metadata', v.metadata,
                'activo', v.activo,
                'fechaActualizacion', v.fecha_actualizacion
              )
              ORDER BY v.orden, v.nombre
            ) FILTER (WHERE v.id IS NOT NULL),
            '[]'::json
          ) AS valores
        FROM config_catalogos c
        LEFT JOIN config_catalogo_valores v
          ON v.catalogo_id = c.id
        GROUP BY c.id
        ORDER BY c.nombre ASC;
      `),

      pool.query(`
        SELECT
          codigo,
          nombre,
          descripcion,
          activo,
          requiere_proveedor,
          fecha_actualizacion
        FROM config_canales_notificacion
        ORDER BY codigo ASC;
      `),

      pool.query(`
        SELECT
          r.id,
          r.nivel,
          r.rol_id,
          ro.codigo AS rol_codigo,
          ro.nombre AS rol_nombre,
          r.canal,
          r.activo,
          r.max_reintentos,
          r.descripcion,
          r.fecha_creacion,
          r.fecha_actualizacion
        FROM alerta_notificacion_reglas r
        INNER JOIN roles ro
          ON ro.id = r.rol_id
        ORDER BY r.nivel, ro.nombre, r.canal;
      `),

      pool.query(`
        SELECT id, codigo, nombre
        FROM roles
        WHERE activo = TRUE
        ORDER BY nombre ASC;
      `)
    ]);

    return res.json({
      ok: true,
      parametros: parametros.rows,
      catalogos: catalogos.rows,
      canales: canales.rows,
      reglas: reglas.rows,
      roles: roles.rows
    });
  } catch (error) {
    console.error('Error cargando configuración:', error.message);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor'
    });
  }
}


// ============================================================
// HU-050 - ACTUALIZAR PARÁMETRO
// ============================================================

async function actualizarParametro(req, res) {
  const cliente = await pool.connect();

  try {
    const clave = String(req.params.clave || '').trim();
    const { valor } = req.body || {};
    const usuarioId = req.usuario?.usuarioId;

    await cliente.query('BEGIN');

    const actual = await cliente.query(
      `
      SELECT *
      FROM config_parametros
      WHERE clave = $1
        AND activo = TRUE
      FOR UPDATE;
      `,
      [clave]
    );

    if (actual.rowCount === 0) {
      await cliente.query('ROLLBACK');
      return res.status(404).json({
        ok: false,
        mensaje: 'Parámetro no encontrado.'
      });
    }

    const parametro = actual.rows[0];
    const valorNormalizado =
      normalizarValorParametro(parametro, valor);

    const actualizado = await cliente.query(
      `
      UPDATE config_parametros
      SET
        valor = $2,
        modificado_por = $3,
        fecha_actualizacion = NOW()
      WHERE clave = $1
      RETURNING
        clave,
        nombre,
        descripcion,
        tipo,
        valor,
        valor_defecto,
        minimo,
        maximo,
        sensible,
        editable,
        activo,
        modificado_por,
        fecha_actualizacion;
      `,
      [clave, valorNormalizado, usuarioId]
    );

    await cliente.query(
      `
      INSERT INTO config_parametros_historial (
        parametro_clave,
        valor_anterior,
        valor_nuevo,
        modificado_por
      )
      VALUES ($1, $2, $3, $4);
      `,
      [clave, parametro.valor, valorNormalizado, usuarioId]
    );

    await cliente.query('COMMIT');

    await registrarEvento({
      usuarioId,
      evento: 'CONFIG_PARAMETRO_ACTUALIZADO',
      modulo: 'CONFIGURACION',
      descripcion: `Parámetro ${clave} actualizado.`,
      entidad: 'config_parametros',
      registroId: null,
      datosAnteriores: {
        clave,
        valor: parametro.valor
      },
      datosNuevos: {
        clave,
        valor: valorNormalizado
      },
      req
    });

    return res.json({
      ok: true,
      mensaje: 'Parámetro actualizado correctamente.',
      parametro: actualizado.rows[0]
    });
  } catch (error) {
    await cliente.query('ROLLBACK').catch(() => {});
    console.error('Error actualizando parámetro:', error.message);

    return res.status(error.status || 500).json({
      ok: false,
      mensaje: error.status
        ? error.message
        : 'Error interno del servidor'
    });
  } finally {
    cliente.release();
  }
}


// ============================================================
// HU-051 - CREAR VALOR DE CATÁLOGO
// ============================================================

async function crearValorCatalogo(req, res) {
  try {
    const catalogoId = Number(req.params.catalogoId);
    const usuarioId = req.usuario?.usuarioId;
    const {
      codigo,
      nombre,
      descripcion = null,
      orden = 0
    } = req.body || {};

    if (!idValido(catalogoId)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Catálogo no válido.'
      });
    }

    const codigoNormalizado =
      String(codigo || '').trim().toUpperCase();

    if (!codigoValido(codigoNormalizado)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El código solo puede contener letras mayúsculas, números y guion bajo.'
      });
    }

    if (!String(nombre || '').trim()) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El nombre es obligatorio.'
      });
    }

    const resultado = await pool.query(
      `
      INSERT INTO config_catalogo_valores (
        catalogo_id,
        codigo,
        nombre,
        descripcion,
        orden,
        creado_por,
        modificado_por
      )
      SELECT
        c.id,
        $2,
        $3,
        $4,
        $5,
        $6,
        $6
      FROM config_catalogos c
      WHERE c.id = $1
        AND c.activo = TRUE
      RETURNING *;
      `,
      [
        catalogoId,
        codigoNormalizado,
        String(nombre).trim(),
        descripcion ? String(descripcion).trim() : null,
        Number.isInteger(Number(orden)) ? Number(orden) : 0,
        usuarioId
      ]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Catálogo no encontrado o inactivo.'
      });
    }

    await registrarEvento({
      usuarioId,
      evento: 'CATALOGO_VALOR_CREADO',
      modulo: 'CONFIGURACION',
      descripcion: `Valor ${codigoNormalizado} creado en catálogo ${catalogoId}.`,
      entidad: 'config_catalogo_valores',
      registroId: resultado.rows[0].id,
      datosNuevos: resultado.rows[0],
      req
    });

    return res.status(201).json({
      ok: true,
      mensaje: 'Valor de catálogo creado correctamente.',
      valor: resultado.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        ok: false,
        mensaje: 'Ya existe un valor con ese código en el catálogo.'
      });
    }

    console.error('Error creando valor de catálogo:', error.message);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor'
    });
  }
}


// ============================================================
// HU-051 - ACTUALIZAR / DESACTIVAR VALOR
// ============================================================

async function actualizarValorCatalogo(req, res) {
  try {
    const id = Number(req.params.id);
    const usuarioId = req.usuario?.usuarioId;
    const {
      nombre,
      descripcion,
      orden,
      activo
    } = req.body || {};

    if (!idValido(id)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Valor de catálogo no válido.'
      });
    }

    const anterior = await pool.query(
      `
      SELECT *
      FROM config_catalogo_valores
      WHERE id = $1
      LIMIT 1;
      `,
      [id]
    );

    if (anterior.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Valor de catálogo no encontrado.'
      });
    }

    const actual = anterior.rows[0];

    const actualizado = await pool.query(
      `
      UPDATE config_catalogo_valores
      SET
        nombre = $2,
        descripcion = $3,
        orden = $4,
        activo = $5,
        modificado_por = $6,
        fecha_actualizacion = NOW()
      WHERE id = $1
      RETURNING *;
      `,
      [
        id,
        nombre !== undefined
          ? String(nombre).trim()
          : actual.nombre,
        descripcion !== undefined
          ? (descripcion ? String(descripcion).trim() : null)
          : actual.descripcion,
        orden !== undefined && Number.isInteger(Number(orden))
          ? Number(orden)
          : actual.orden,
        typeof activo === 'boolean'
          ? activo
          : actual.activo,
        usuarioId
      ]
    );

    await registrarEvento({
      usuarioId,
      evento: 'CATALOGO_VALOR_ACTUALIZADO',
      modulo: 'CONFIGURACION',
      descripcion: `Valor de catálogo ${actual.codigo} actualizado.`,
      entidad: 'config_catalogo_valores',
      registroId: id,
      datosAnteriores: actual,
      datosNuevos: actualizado.rows[0],
      req
    });

    return res.json({
      ok: true,
      mensaje: 'Valor de catálogo actualizado correctamente.',
      valor: actualizado.rows[0]
    });
  } catch (error) {
    console.error('Error actualizando valor de catálogo:', error.message);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor'
    });
  }
}


// ============================================================
// HU-052 - ACTIVAR / DESACTIVAR CANAL
// ============================================================

async function actualizarCanal(req, res) {
  try {
    const codigo =
      String(req.params.codigo || '').trim().toUpperCase();
    const { activo } = req.body || {};
    const usuarioId = req.usuario?.usuarioId;

    if (typeof activo !== 'boolean') {
      return res.status(400).json({
        ok: false,
        mensaje: 'Debe indicar si el canal estará activo.'
      });
    }

    const anterior = await pool.query(
      `
      SELECT *
      FROM config_canales_notificacion
      WHERE codigo = $1
      LIMIT 1;
      `,
      [codigo]
    );

    if (anterior.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Canal no encontrado.'
      });
    }

    if (
      activo &&
      anterior.rows[0].requiere_proveedor &&
      codigo === 'EMAIL' &&
      !process.env.SMTP_HOST
    ) {
      return res.status(409).json({
        ok: false,
        mensaje:
          'No se puede habilitar EMAIL porque todavía no existe un proveedor SMTP configurado.'
      });
    }

    const actualizado = await pool.query(
      `
      UPDATE config_canales_notificacion
      SET
        activo = $2,
        modificado_por = $3,
        fecha_actualizacion = NOW()
      WHERE codigo = $1
      RETURNING *;
      `,
      [codigo, activo, usuarioId]
    );

    await registrarEvento({
      usuarioId,
      evento: 'CANAL_NOTIFICACION_ACTUALIZADO',
      modulo: 'CONFIGURACION',
      descripcion: `Canal ${codigo} ${activo ? 'habilitado' : 'deshabilitado'}.`,
      entidad: 'config_canales_notificacion',
      datosAnteriores: anterior.rows[0],
      datosNuevos: actualizado.rows[0],
      req
    });

    return res.json({
      ok: true,
      mensaje: `Canal ${activo ? 'habilitado' : 'deshabilitado'} correctamente.`,
      canal: actualizado.rows[0]
    });
  } catch (error) {
    console.error('Error actualizando canal:', error.message);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor'
    });
  }
}


// ============================================================
// HU-052 - CREAR REGLA
// ============================================================

async function crearReglaNotificacion(req, res) {
  try {
    const usuarioId = req.usuario?.usuarioId;
    const {
      nivel,
      rolId,
      canal,
      activo = true,
      maxReintentos,
      descripcion = null
    } = req.body || {};

    const nivelNormalizado =
      String(nivel || '').trim().toUpperCase();

    const canalNormalizado =
      String(canal || '').trim().toUpperCase();

    if (!['POR_VENCER', 'CRITICO', 'VENCIDO'].includes(nivelNormalizado)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Nivel de alerta no válido.'
      });
    }

    if (!idValido(rolId)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Rol destinatario no válido.'
      });
    }

    const canalDb = await pool.query(
      `
      SELECT *
      FROM config_canales_notificacion
      WHERE codigo = $1
      LIMIT 1;
      `,
      [canalNormalizado]
    );

    if (canalDb.rowCount === 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Canal de notificación no válido.'
      });
    }

    if (activo && !canalDb.rows[0].activo) {
      return res.status(409).json({
        ok: false,
        mensaje: 'No puede habilitar una regla cuyo canal está desactivado.'
      });
    }

    const rol = await pool.query(
      `
      SELECT id
      FROM roles
      WHERE id = $1
        AND activo = TRUE
      LIMIT 1;
      `,
      [Number(rolId)]
    );

    if (rol.rowCount === 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El rol destinatario no existe o está inactivo.'
      });
    }

    const maxDefault = await obtenerParametroNumero(
      'NOTIFICACIONES_MAX_REINTENTOS',
      3
    );

    const reintentos =
      maxReintentos === undefined
        ? maxDefault
        : Number(maxReintentos);

    if (
      !Number.isInteger(reintentos) ||
      reintentos < 1 ||
      reintentos > 10
    ) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Los reintentos deben estar entre 1 y 10.'
      });
    }

    const resultado = await pool.query(
      `
      INSERT INTO alerta_notificacion_reglas (
        nivel,
        rol_id,
        canal,
        activo,
        max_reintentos,
        descripcion,
        creado_por,
        actualizado_por
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
      RETURNING *;
      `,
      [
        nivelNormalizado,
        Number(rolId),
        canalNormalizado,
        Boolean(activo),
        reintentos,
        descripcion ? String(descripcion).trim() : null,
        usuarioId
      ]
    );

    await registrarEvento({
      usuarioId,
      evento: 'REGLA_NOTIFICACION_CREADA',
      modulo: 'CONFIGURACION',
      descripcion: `Regla ${nivelNormalizado}/${canalNormalizado} creada.`,
      entidad: 'alerta_notificacion_reglas',
      registroId: resultado.rows[0].id,
      datosNuevos: resultado.rows[0],
      req
    });

    return res.status(201).json({
      ok: true,
      mensaje: 'Regla de notificación creada correctamente.',
      regla: resultado.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        ok: false,
        mensaje: 'Ya existe una regla para ese nivel, rol y canal.'
      });
    }

    console.error('Error creando regla:', error.message);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor'
    });
  }
}


// ============================================================
// HU-052 - ACTUALIZAR / DESACTIVAR REGLA
// ============================================================

async function actualizarReglaNotificacion(req, res) {
  try {
    const id = Number(req.params.id);
    const usuarioId = req.usuario?.usuarioId;
    const {
      activo,
      maxReintentos,
      descripcion
    } = req.body || {};

    if (!idValido(id)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Regla no válida.'
      });
    }

    const anterior = await pool.query(
      `
      SELECT r.*, c.activo AS canal_activo
      FROM alerta_notificacion_reglas r
      INNER JOIN config_canales_notificacion c
        ON c.codigo = r.canal
      WHERE r.id = $1
      LIMIT 1;
      `,
      [id]
    );

    if (anterior.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Regla no encontrada.'
      });
    }

    const actual = anterior.rows[0];
    const activoNuevo =
      typeof activo === 'boolean'
        ? activo
        : actual.activo;

    if (activoNuevo && !actual.canal_activo) {
      return res.status(409).json({
        ok: false,
        mensaje: 'No puede activar una regla cuyo canal está deshabilitado.'
      });
    }

    const reintentos =
      maxReintentos === undefined
        ? Number(actual.max_reintentos)
        : Number(maxReintentos);

    if (
      !Number.isInteger(reintentos) ||
      reintentos < 1 ||
      reintentos > 10
    ) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Los reintentos deben estar entre 1 y 10.'
      });
    }

    const actualizado = await pool.query(
      `
      UPDATE alerta_notificacion_reglas
      SET
        activo = $2,
        max_reintentos = $3,
        descripcion = $4,
        actualizado_por = $5,
        fecha_actualizacion = NOW()
      WHERE id = $1
      RETURNING *;
      `,
      [
        id,
        activoNuevo,
        reintentos,
        descripcion !== undefined
          ? (descripcion ? String(descripcion).trim() : null)
          : actual.descripcion,
        usuarioId
      ]
    );

    await registrarEvento({
      usuarioId,
      evento: 'REGLA_NOTIFICACION_ACTUALIZADA',
      modulo: 'CONFIGURACION',
      descripcion: `Regla de notificación ${id} actualizada.`,
      entidad: 'alerta_notificacion_reglas',
      registroId: id,
      datosAnteriores: actual,
      datosNuevos: actualizado.rows[0],
      req
    });

    return res.json({
      ok: true,
      mensaje: 'Regla de notificación actualizada correctamente.',
      regla: actualizado.rows[0]
    });
  } catch (error) {
    console.error('Error actualizando regla:', error.message);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor'
    });
  }
}


module.exports = {
  resumen,
  actualizarParametro,
  crearValorCatalogo,
  actualizarValorCatalogo,
  actualizarCanal,
  crearReglaNotificacion,
  actualizarReglaNotificacion
};
