const pool = require('../config/database');

const {
  registrarEvento
} = require('../services/auditoria.service');


// ============================================================
// CONSTANTES
// ============================================================

const TIPOS_VIGENCIA = [
  'DETERMINADA',
  'TEMPORAL',
  'INDETERMINADA'
];


const UNIDADES_DURACION = [
  'DIAS',
  'MESES'
];


// ============================================================
// UTILIDADES
// ============================================================

function idValido(id) {
  const numero =
    Number(id);


  return (
    Number.isInteger(numero) &&
    numero > 0
  );
}


function enteroPositivo(valor) {
  const numero =
    Number(valor);


  return (
    Number.isInteger(numero) &&
    numero > 0
  );
}


function enteroNoNegativo(valor) {
  const numero =
    Number(valor);


  return (
    Number.isInteger(numero) &&
    numero >= 0
  );
}


function formatearRegla(regla) {
  if (!regla) {
    return null;
  }


  return {
    id:
      regla.id,

    tipoDocumentoId:
      regla.tipo_documento_id,

    version:
      regla.version,

    tipoVigencia:
      regla.tipo_vigencia,

    duracionValor:
      regla.duracion_valor,

    duracionUnidad:
      regla.duracion_unidad,

    requiereRenovacion:
      regla.requiere_renovacion,

    umbralPorVencerDias:
      regla.umbral_por_vencer_dias,

    umbralCriticoDias:
      regla.umbral_critico_dias,

    esActual:
      regla.es_actual,

    vigenteDesde:
      regla.vigente_desde,

    vigenteHasta:
      regla.vigente_hasta,

    creadoPor:
      regla.creado_por,

    fechaCreacion:
      regla.fecha_creacion
  };
}


// ============================================================
// VALIDAR CONFIGURACIÓN
// ============================================================

function validarConfiguracion({
  tipoVigencia,
  duracionValor,
  duracionUnidad,
  requiereRenovacion,
  umbralPorVencerDias,
  umbralCriticoDias
}) {
  if (
    !TIPOS_VIGENCIA.includes(
      tipoVigencia
    )
  ) {
    return (
      'El tipo de vigencia no es válido'
    );
  }


  if (
    typeof requiereRenovacion !==
    'boolean'
  ) {
    return (
      'El campo requiereRenovacion debe ser true o false'
    );
  }


  // ========================================================
  // DETERMINADA
  // ========================================================

  if (
    tipoVigencia ===
    'DETERMINADA'
  ) {
    if (
      !enteroPositivo(
        duracionValor
      )
    ) {
      return (
        'La vigencia determinada requiere una duración mayor que cero'
      );
    }


    if (
      !UNIDADES_DURACION.includes(
        duracionUnidad
      )
    ) {
      return (
        'La duración debe expresarse en DIAS o MESES'
      );
    }


    if (
      !enteroPositivo(
        umbralPorVencerDias
      )
    ) {
      return (
        'El umbral Por vencer debe ser mayor que cero'
      );
    }


    if (
      !enteroNoNegativo(
        umbralCriticoDias
      )
    ) {
      return (
        'El umbral Crítico debe ser cero o mayor'
      );
    }


    if (
      Number(
        umbralCriticoDias
      ) >=
      Number(
        umbralPorVencerDias
      )
    ) {
      return (
        'El umbral Crítico debe ser menor que el umbral Por vencer'
      );
    }
  }


  // ========================================================
  // TEMPORAL
  // ========================================================

  if (
    tipoVigencia ===
    'TEMPORAL'
  ) {
    if (
      duracionValor !== null &&
      duracionValor !== undefined &&
      duracionValor !== ''
    ) {
      return (
        'La vigencia temporal no utiliza una duración fija'
      );
    }


    if (
      duracionUnidad !== null &&
      duracionUnidad !== undefined &&
      duracionUnidad !== ''
    ) {
      return (
        'La vigencia temporal no utiliza una unidad de duración'
      );
    }


    if (
      !enteroPositivo(
        umbralPorVencerDias
      )
    ) {
      return (
        'El umbral Por vencer debe ser mayor que cero'
      );
    }


    if (
      !enteroNoNegativo(
        umbralCriticoDias
      )
    ) {
      return (
        'El umbral Crítico debe ser cero o mayor'
      );
    }


    if (
      Number(
        umbralCriticoDias
      ) >=
      Number(
        umbralPorVencerDias
      )
    ) {
      return (
        'El umbral Crítico debe ser menor que el umbral Por vencer'
      );
    }
  }


  // ========================================================
  // INDETERMINADA
  // ========================================================

  if (
    tipoVigencia ===
    'INDETERMINADA'
  ) {
    if (
      requiereRenovacion !== false
    ) {
      return (
        'Una vigencia indeterminada no puede requerir renovación'
      );
    }


    if (
      duracionValor !== null &&
      duracionValor !== undefined &&
      duracionValor !== ''
    ) {
      return (
        'Una vigencia indeterminada no utiliza duración'
      );
    }


    if (
      duracionUnidad !== null &&
      duracionUnidad !== undefined &&
      duracionUnidad !== ''
    ) {
      return (
        'Una vigencia indeterminada no utiliza unidad de duración'
      );
    }


    if (
      umbralPorVencerDias !== null &&
      umbralPorVencerDias !== undefined &&
      umbralPorVencerDias !== ''
    ) {
      return (
        'Una vigencia indeterminada no utiliza el umbral Por vencer'
      );
    }


    if (
      umbralCriticoDias !== null &&
      umbralCriticoDias !== undefined &&
      umbralCriticoDias !== ''
    ) {
      return (
        'Una vigencia indeterminada no utiliza el umbral Crítico'
      );
    }
  }


  return null;
}


// ============================================================
// OBTENER CONFIGURACIÓN ACTUAL
// ============================================================

async function obtenerReglaActual(
  req,
  res
) {
  try {
    const {
      tipoDocumentoId
    } = req.params;


    if (
      !idValido(
        tipoDocumentoId
      )
    ) {
      return res.status(400).json({
        ok: false,

        mensaje:
          'El identificador del tipo de documento no es válido'
      });
    }


    const tipoResultado =
      await pool.query(
        `
        SELECT
          id,
          nombre,
          categoria,
          activo

        FROM tipos_documento

        WHERE id = $1

        LIMIT 1;
        `,
        [
          tipoDocumentoId
        ]
      );


    if (
      tipoResultado.rowCount === 0
    ) {
      return res.status(404).json({
        ok: false,

        mensaje:
          'Tipo de documento no encontrado'
      });
    }


    const reglaResultado =
      await pool.query(
        `
        SELECT
          id,
          tipo_documento_id,
          version,
          tipo_vigencia,
          duracion_valor,
          duracion_unidad,
          requiere_renovacion,
          umbral_por_vencer_dias,
          umbral_critico_dias,
          es_actual,
          vigente_desde,
          vigente_hasta,
          creado_por,
          fecha_creacion

        FROM tipo_documento_reglas_vigencia

        WHERE
          tipo_documento_id = $1
          AND es_actual = TRUE

        LIMIT 1;
        `,
        [
          tipoDocumentoId
        ]
      );


    return res.status(200).json({
      ok: true,

      tipoDocumento: {
        id:
          tipoResultado.rows[0].id,

        nombre:
          tipoResultado.rows[0].nombre,

        categoria:
          tipoResultado.rows[0].categoria,

        activo:
          tipoResultado.rows[0].activo
      },

      configurada:
        reglaResultado.rowCount > 0,

      regla:
        reglaResultado.rowCount > 0
          ? formatearRegla(
              reglaResultado.rows[0]
            )
          : null
    });

  } catch (error) {
    console.error(
      'Error al obtener regla de vigencia:',
      error.message
    );


    return res.status(500).json({
      ok: false,

      mensaje:
        'Error interno del servidor'
    });
  }
}


// ============================================================
// HISTORIAL DE CONFIGURACIONES
// ============================================================

async function listarHistorialReglas(
  req,
  res
) {
  try {
    const {
      tipoDocumentoId
    } = req.params;


    if (
      !idValido(
        tipoDocumentoId
      )
    ) {
      return res.status(400).json({
        ok: false,

        mensaje:
          'El identificador del tipo de documento no es válido'
      });
    }


    const tipoResultado =
      await pool.query(
        `
        SELECT
          id,
          nombre

        FROM tipos_documento

        WHERE id = $1

        LIMIT 1;
        `,
        [
          tipoDocumentoId
        ]
      );


    if (
      tipoResultado.rowCount === 0
    ) {
      return res.status(404).json({
        ok: false,

        mensaje:
          'Tipo de documento no encontrado'
      });
    }


    const resultado =
      await pool.query(
        `
        SELECT
          id,
          tipo_documento_id,
          version,
          tipo_vigencia,
          duracion_valor,
          duracion_unidad,
          requiere_renovacion,
          umbral_por_vencer_dias,
          umbral_critico_dias,
          es_actual,
          vigente_desde,
          vigente_hasta,
          creado_por,
          fecha_creacion

        FROM tipo_documento_reglas_vigencia

        WHERE tipo_documento_id = $1

        ORDER BY
          version DESC;
        `,
        [
          tipoDocumentoId
        ]
      );


    return res.status(200).json({
      ok: true,

      tipoDocumento: {
        id:
          tipoResultado.rows[0].id,

        nombre:
          tipoResultado.rows[0].nombre
      },

      total:
        resultado.rows.length,

      historial:
        resultado.rows.map(
          formatearRegla
        )
    });

  } catch (error) {
    console.error(
      'Error al listar historial de vigencia:',
      error.message
    );


    return res.status(500).json({
      ok: false,

      mensaje:
        'Error interno del servidor'
    });
  }
}


// ============================================================
// GUARDAR NUEVA CONFIGURACIÓN
// ============================================================
//
// IMPORTANTE:
// Nunca se modifica una versión histórica.
// Cada cambio crea una nueva versión.
//
// Ejemplo:
// versión 1 -> deja de ser actual
// versión 2 -> nueva configuración actual
// ============================================================

async function guardarReglaVigencia(
  req,
  res
) {
  const client =
    await pool.connect();


  try {
    const usuarioId =
      req.usuario.usuarioId;


    const {
      tipoDocumentoId
    } = req.params;


    if (
      !idValido(
        tipoDocumentoId
      )
    ) {
      return res.status(400).json({
        ok: false,

        mensaje:
          'El identificador del tipo de documento no es válido'
      });
    }


    const {
      tipoVigencia,
      duracionValor,
      duracionUnidad,
      requiereRenovacion,
      umbralPorVencerDias,
      umbralCriticoDias
    } = req.body;


    const tipoVigenciaNormalizado =
      typeof tipoVigencia ===
      'string'
        ? tipoVigencia
            .trim()
            .toUpperCase()
        : '';


    const duracionUnidadNormalizada =
      typeof duracionUnidad ===
      'string' &&
      duracionUnidad.trim()
        ? duracionUnidad
            .trim()
            .toUpperCase()
        : null;


    const errorValidacion =
      validarConfiguracion({
        tipoVigencia:
          tipoVigenciaNormalizado,

        duracionValor,

        duracionUnidad:
          duracionUnidadNormalizada,

        requiereRenovacion,

        umbralPorVencerDias,

        umbralCriticoDias
      });


    if (errorValidacion) {
      return res.status(400).json({
        ok: false,

        mensaje:
          errorValidacion
      });
    }


    // ========================================================
    // NORMALIZAR VALORES
    // ========================================================

    const duracionValorNormalizado =
      tipoVigenciaNormalizado ===
      'DETERMINADA'
        ? Number(
            duracionValor
          )
        : null;


    const duracionUnidadFinal =
      tipoVigenciaNormalizado ===
      'DETERMINADA'
        ? duracionUnidadNormalizada
        : null;


    const umbralPorVencerNormalizado =
      tipoVigenciaNormalizado ===
      'INDETERMINADA'
        ? null
        : Number(
            umbralPorVencerDias
          );


    const umbralCriticoNormalizado =
      tipoVigenciaNormalizado ===
      'INDETERMINADA'
        ? null
        : Number(
            umbralCriticoDias
          );


    // ========================================================
    // TRANSACCIÓN
    // ========================================================

    await client.query(
      'BEGIN'
    );


    // ========================================================
    // BLOQUEAR EL TIPO DOCUMENTAL
    // Evita dos configuraciones simultáneas.
    // ========================================================

    const tipoResultado =
      await client.query(
        `
        SELECT
          id,
          nombre,
          categoria,
          activo,
          requiere_renovacion

        FROM tipos_documento

        WHERE id = $1

        FOR UPDATE;
        `,
        [
          tipoDocumentoId
        ]
      );


    if (
      tipoResultado.rowCount === 0
    ) {
      await client.query(
        'ROLLBACK'
      );


      return res.status(404).json({
        ok: false,

        mensaje:
          'Tipo de documento no encontrado'
      });
    }


    const tipoDocumento =
      tipoResultado.rows[0];


    // ========================================================
    // OBTENER SIGUIENTE VERSIÓN
    // ========================================================

    const versionResultado =
      await client.query(
        `
        SELECT
          COALESCE(
            MAX(version),
            0
          ) + 1 AS siguiente_version

        FROM tipo_documento_reglas_vigencia

        WHERE tipo_documento_id = $1;
        `,
        [
          tipoDocumentoId
        ]
      );


    const siguienteVersion =
      Number(
        versionResultado.rows[0]
          .siguiente_version
      );


    // ========================================================
    // CERRAR CONFIGURACIÓN ACTUAL
    // ========================================================

    await client.query(
      `
      UPDATE tipo_documento_reglas_vigencia

      SET
        es_actual = FALSE,
        vigente_hasta = NOW()

      WHERE
        tipo_documento_id = $1
        AND es_actual = TRUE;
      `,
      [
        tipoDocumentoId
      ]
    );


    // ========================================================
    // CREAR NUEVA VERSIÓN
    // ========================================================

    const nuevaReglaResultado =
      await client.query(
        `
        INSERT INTO tipo_documento_reglas_vigencia (
          tipo_documento_id,
          version,
          tipo_vigencia,
          duracion_valor,
          duracion_unidad,
          requiere_renovacion,
          umbral_por_vencer_dias,
          umbral_critico_dias,
          es_actual,
          vigente_desde,
          vigente_hasta,
          creado_por
        )

        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          TRUE,
          NOW(),
          NULL,
          $9
        )

        RETURNING
          id,
          tipo_documento_id,
          version,
          tipo_vigencia,
          duracion_valor,
          duracion_unidad,
          requiere_renovacion,
          umbral_por_vencer_dias,
          umbral_critico_dias,
          es_actual,
          vigente_desde,
          vigente_hasta,
          creado_por,
          fecha_creacion;
        `,
        [
          tipoDocumentoId,
          siguienteVersion,
          tipoVigenciaNormalizado,
          duracionValorNormalizado,
          duracionUnidadFinal,
          requiereRenovacion,
          umbralPorVencerNormalizado,
          umbralCriticoNormalizado,
          usuarioId
        ]
      );


    const nuevaRegla =
      nuevaReglaResultado.rows[0];


    // ========================================================
    // SINCRONIZAR REQUIERE RENOVACIÓN
    //
    // tipos_documento mantiene el valor actual para que
    // listados y futuras altas puedan consultarlo rápidamente.
    // El historial real queda en reglas_vigencia.
    // ========================================================

    await client.query(
      `
      UPDATE tipos_documento

      SET
        requiere_renovacion = $1,
        fecha_actualizacion = NOW()

      WHERE id = $2;
      `,
      [
        requiereRenovacion,
        tipoDocumentoId
      ]
    );


    await client.query(
      'COMMIT'
    );


    // ========================================================
    // AUDITORÍA
    // ========================================================

    await registrarEvento({
      usuarioId,

      evento:
        'REGLA_VIGENCIA_CONFIGURADA',

      modulo:
        'TIPOS_DOCUMENTO',

      descripcion:
        `Se configuró la versión ${nuevaRegla.version} de vigencia para el tipo documental ID ${tipoDocumento.id}, nombre ${tipoDocumento.nombre}, tipo de vigencia ${nuevaRegla.tipo_vigencia}`,

      ip:
        req.ip,

      userAgent:
        req.headers['user-agent']
    });


    return res.status(201).json({
      ok: true,

      mensaje:
        `Configuración de vigencia guardada como versión ${nuevaRegla.version}`,

      regla:
        formatearRegla(
          nuevaRegla
        )
    });

  } catch (error) {
    try {
      await client.query(
        'ROLLBACK'
      );
    } catch (
      rollbackError
    ) {
      console.error(
        'Error al revertir transacción:',
        rollbackError.message
      );
    }


    console.error(
      'Error al guardar regla de vigencia:',
      error.message
    );


    if (
      error.code === '23505'
    ) {
      return res.status(409).json({
        ok: false,

        mensaje:
          'Ya existe una configuración actual o una versión duplicada para este tipo documental'
      });
    }


    if (
      error.code === '23514'
    ) {
      return res.status(400).json({
        ok: false,

        mensaje:
          'La configuración de vigencia no cumple las reglas de coherencia'
      });
    }


    return res.status(500).json({
      ok: false,

      mensaje:
        'Error interno del servidor'
    });

  } finally {
    client.release();
  }
}


// ============================================================
// EXPORTAR
// ============================================================

module.exports = {
  obtenerReglaActual,
  listarHistorialReglas,
  guardarReglaVigencia
};