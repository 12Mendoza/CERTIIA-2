const pool = require('../config/database');
const {
  listarCasosActivos,
  sincronizarResultadosReales,
  entrenarModelos,
  predecirCaso
} = require('../services/iaModelo.service');
const {
  registrarEvento
} = require('../services/auditoria.service');

function idValido(valor) {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0;
}

async function resumenIa(req, res) {
  try {
    const [modelos, resultados, predicciones] = await Promise.all([
      pool.query(`
        SELECT
          id, tipo_modelo, version, algoritmo, estado,
          cumple_criterios, metricas, fecha_entrenamiento,
          fecha_aprobacion
        FROM ia_modelos
        ORDER BY fecha_entrenamiento DESC, id DESC;
      `),
      pool.query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE apto_ml AND validado)::int AS aptos
        FROM ia_resultados_reales;
      `),
      pool.query(`
        SELECT COUNT(*)::int AS total
        FROM ia_predicciones;
      `)
    ]);

    return res.json({
      ok: true,
      modelos: modelos.rows,
      resultados: resultados.rows[0],
      totalPredicciones: predicciones.rows[0].total
    });
  } catch (error) {
    console.error('Error en resumen IA:', error.message);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
}

async function casosActivos(req, res) {
  try {
    const casos = await listarCasosActivos();
    return res.json({ ok: true, casos });
  } catch (error) {
    console.error('Error listando casos IA:', error.message);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
}

async function solicitarPrediccion(req, res) {
  try {
    const usuarioId = req.usuario?.usuarioId;
    const { tipoObjeto, objetoId } = req.body || {};

    if (!['TRAMITE', 'RENOVACION'].includes(String(tipoObjeto || '').toUpperCase())) {
      return res.status(400).json({ ok: false, mensaje: 'tipoObjeto debe ser TRAMITE o RENOVACION.' });
    }

    if (!idValido(objetoId)) {
      return res.status(400).json({ ok: false, mensaje: 'objetoId no es válido.' });
    }

    const prediccion = await predecirCaso(
      String(tipoObjeto).toUpperCase(),
      Number(objetoId),
      usuarioId
    );

    await registrarEvento({
      usuarioId,
      evento: 'PREDICCION_IA_SOLICITADA',
      modulo: 'IA_PREDICTIVA',
      descripcion: `Predicción solicitada para ${tipoObjeto} ${objetoId}.`,
      entidad: String(tipoObjeto).toLowerCase(),
      registroId: Number(objetoId),
      datosNuevos: {
        riesgo: prediccion.riesgo?.nivel || null,
        probabilidad: prediccion.riesgo?.probabilidad || null,
        duracionEstimadaDias: prediccion.duracion?.diasEstimados || null,
        modeloRiesgo: prediccion.riesgo?.modelo?.version || null,
        modeloDuracion: prediccion.duracion?.modelo?.version || null
      },
      req
    });

    return res.status(201).json({ ok: true, prediccion });
  } catch (error) {
    console.error('Error generando predicción:', error.message);
    return res.status(error.status || 500).json({
      ok: false,
      insuficiente: Boolean(error.insuficiente),
      mensaje: error.status ? error.message : 'Error interno del servidor'
    });
  }
}

async function listarPredicciones(req, res) {
  try {
    let limite = Number(req.query.limite || 50);
    if (!Number.isInteger(limite) || limite < 1) limite = 50;
    if (limite > 200) limite = 200;

    const resultado = await pool.query(
      `
      SELECT
        p.id,
        p.tipo_objeto,
        p.objeto_id,
        p.tipo_prediccion,
        p.probabilidad,
        p.nivel_riesgo,
        p.duracion_estimada_dias,
        p.factores,
        p.fecha_prediccion,
        m.version AS modelo_version,
        m.algoritmo,
        u.nombres,
        u.apellidos
      FROM ia_predicciones p
      INNER JOIN ia_modelos m ON m.id = p.modelo_id
      INNER JOIN usuarios u ON u.id = p.solicitado_por
      ORDER BY p.fecha_prediccion DESC, p.id DESC
      LIMIT $1;
      `,
      [limite]
    );

    return res.json({ ok: true, predicciones: resultado.rows });
  } catch (error) {
    console.error('Error listando predicciones:', error.message);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
}

async function sincronizarResultados(req, res) {
  try {
    const usuarioId = req.usuario?.usuarioId;
    const resultado = await sincronizarResultadosReales(usuarioId);

    await registrarEvento({
      usuarioId,
      evento: 'RESULTADOS_IA_SINCRONIZADOS',
      modulo: 'IA_PREDICTIVA',
      descripcion: `Se incorporaron ${resultado.totalNuevos} resultados reales nuevos.`,
      entidad: 'ia_resultados_reales',
      datosNuevos: resultado,
      req
    });

    return res.status(200).json({ ok: true, ...resultado });
  } catch (error) {
    console.error('Error sincronizando resultados IA:', error.message);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
}

async function listarResultados(req, res) {
  try {
    const resultado = await pool.query(
      `
      SELECT
        rr.*,
        COUNT(p.id)::int AS predicciones_previas
      FROM ia_resultados_reales rr
      LEFT JOIN ia_predicciones p
        ON p.tipo_objeto = rr.tipo_objeto
       AND p.objeto_id = rr.objeto_id
       AND p.fecha_prediccion <= rr.fecha_registro
      GROUP BY rr.id
      ORDER BY rr.fecha_registro DESC, rr.id DESC
      LIMIT 300;
      `
    );

    return res.json({ ok: true, resultados: resultado.rows });
  } catch (error) {
    console.error('Error listando resultados IA:', error.message);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
}

async function actualizarResultado(req, res) {
  try {
    const id = Number(req.params.id);
    const { aptoMl, motivoExclusion } = req.body || {};

    if (!idValido(id) || typeof aptoMl !== 'boolean') {
      return res.status(400).json({ ok: false, mensaje: 'Datos inválidos.' });
    }

    if (!aptoMl && !String(motivoExclusion || '').trim()) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Debe indicar el motivo de exclusión del dataset.'
      });
    }

    const anterior = await pool.query(
      `SELECT * FROM ia_resultados_reales WHERE id = $1 LIMIT 1;`,
      [id]
    );

    if (anterior.rowCount === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Resultado real no encontrado.' });
    }

    const actualizado = await pool.query(
      `
      UPDATE ia_resultados_reales
      SET apto_ml = $2,
          motivo_exclusion = $3,
          fecha_actualizacion = NOW()
      WHERE id = $1
      RETURNING *;
      `,
      [id, aptoMl, aptoMl ? null : String(motivoExclusion).trim()]
    );

    await registrarEvento({
      usuarioId: req.usuario?.usuarioId,
      evento: 'RESULTADO_IA_VALIDADO',
      modulo: 'IA_PREDICTIVA',
      descripcion: aptoMl
        ? 'Resultado marcado como apto para aprendizaje.'
        : 'Resultado excluido del dataset de aprendizaje.',
      entidad: 'ia_resultados_reales',
      registroId: id,
      datosAnteriores: anterior.rows[0],
      datosNuevos: actualizado.rows[0],
      req
    });

    return res.json({ ok: true, resultado: actualizado.rows[0] });
  } catch (error) {
    console.error('Error actualizando resultado IA:', error.message);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
}

async function listarModelos(req, res) {
  try {
    const resultado = await pool.query(
      `
      SELECT
        m.*,
        d.version AS dataset_version,
        d.total_registros,
        d.registros_entrenamiento,
        d.registros_evaluacion
      FROM ia_modelos m
      INNER JOIN ia_dataset_versiones d ON d.id = m.dataset_version_id
      ORDER BY m.fecha_entrenamiento DESC, m.id DESC;
      `
    );

    return res.json({ ok: true, modelos: resultado.rows });
  } catch (error) {
    console.error('Error listando modelos IA:', error.message);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
}

async function entrenar(req, res) {
  try {
    const usuarioId = req.usuario?.usuarioId;
    const resultado = await entrenarModelos(usuarioId);

    await registrarEvento({
      usuarioId,
      evento: resultado.ok ? 'MODELOS_IA_ENTRENADOS' : 'ENTRENAMIENTO_IA_INSUFICIENTE',
      modulo: 'IA_PREDICTIVA',
      descripcion: resultado.ok
        ? 'Se generaron nuevas versiones candidatas de los modelos predictivos.'
        : resultado.mensaje,
      entidad: 'ia_modelos',
      datosNuevos: resultado.ok
        ? {
            datasetVersion: resultado.dataset.version,
            modelos: resultado.modelos.map((m) => ({
              id: m.id,
              tipo: m.tipo_modelo,
              version: m.version,
              cumpleCriterios: m.cumple_criterios
            }))
          }
        : {
            muestrasDisponibles: resultado.muestrasDisponibles,
            minimoRequerido: resultado.minimoRequerido
          },
      req
    });

    return res.status(resultado.ok ? 201 : 422).json(resultado);
  } catch (error) {
    console.error('Error entrenando IA:', error.message);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
}

async function activarModelo(req, res) {
  const cliente = await pool.connect();

  try {
    const id = Number(req.params.id);
    const usuarioId = req.usuario?.usuarioId;

    if (!idValido(id)) {
      return res.status(400).json({ ok: false, mensaje: 'Modelo no válido.' });
    }

    await cliente.query('BEGIN');

    const actual = await cliente.query(
      `SELECT * FROM ia_modelos WHERE id = $1 FOR UPDATE;`,
      [id]
    );

    if (actual.rowCount === 0) {
      await cliente.query('ROLLBACK');
      return res.status(404).json({ ok: false, mensaje: 'Modelo no encontrado.' });
    }

    const modelo = actual.rows[0];

    if (!modelo.cumple_criterios) {
      await cliente.query('ROLLBACK');
      return res.status(409).json({
        ok: false,
        mensaje: 'La versión no cumple los criterios mínimos de calidad y no puede activarse.'
      });
    }

    await cliente.query(
      `
      UPDATE ia_modelos
      SET estado = 'RETIRADO'
      WHERE tipo_modelo = $1
        AND estado = 'ACTIVO'
        AND id <> $2;
      `,
      [modelo.tipo_modelo, id]
    );

    const activado = await cliente.query(
      `
      UPDATE ia_modelos
      SET estado = 'ACTIVO',
          aprobado_por = $2,
          fecha_aprobacion = NOW()
      WHERE id = $1
      RETURNING *;
      `,
      [id, usuarioId]
    );

    await cliente.query('COMMIT');

    await registrarEvento({
      usuarioId,
      evento: 'MODELO_IA_ACTIVADO',
      modulo: 'IA_PREDICTIVA',
      descripcion: `Modelo ${modelo.version} activado para ${modelo.tipo_modelo}.`,
      entidad: 'ia_modelos',
      registroId: id,
      datosAnteriores: modelo,
      datosNuevos: activado.rows[0],
      req
    });

    return res.json({ ok: true, modelo: activado.rows[0] });
  } catch (error) {
    await cliente.query('ROLLBACK').catch(() => {});
    console.error('Error activando modelo IA:', error.message);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  } finally {
    cliente.release();
  }
}

module.exports = {
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
};
