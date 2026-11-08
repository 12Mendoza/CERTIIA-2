const crypto = require('crypto');
const pool = require('../config/database');

const MIN_MUESTRAS = 12;

const CARACTERISTICAS = [
  'esRenovacion',
  'observaciones',
  'cambiosEstado',
  'entidadMunicipalidad',
  'entidadPublica',
  'requiereRenovacion',
  'mesInicioSin',
  'mesInicioCos'
];

const ETIQUETAS = {
  esRenovacion:
    'El caso es una renovación',

  observaciones:
    'Cantidad de observaciones',

  cambiosEstado:
    'Cantidad de cambios de estado',

  entidadMunicipalidad:
    'Gestión ante municipalidad',

  entidadPublica:
    'Gestión ante entidad pública',

  requiereRenovacion:
    'Tipo documental renovable',

  mesInicioSin:
    'Componente estacional del mes de inicio',

  mesInicioCos:
    'Componente estacional del mes de inicio'
};


// ============================================================
// FUNCIONES MATEMÁTICAS
// ============================================================

function sigmoid(x) {

  if (x >= 0) {

    const z =
      Math.exp(-x);

    return 1 / (1 + z);
  }

  const z =
    Math.exp(x);

  return z / (1 + z);
}


function media(valores) {

  if (!valores.length) {

    return 0;
  }

  return valores.reduce(
    (a, b) =>
      a + b,
    0
  ) / valores.length;
}


function percentil(
  valores,
  p
) {

  if (!valores.length) {

    return 0;
  }

  const ordenados =
    [...valores].sort(
      (a, b) =>
        a - b
    );

  const posicion =
    (ordenados.length - 1) * p;

  const inferior =
    Math.floor(
      posicion
    );

  const superior =
    Math.ceil(
      posicion
    );

  if (
    inferior ===
    superior
  ) {

    return ordenados[
      inferior
    ];
  }

  const peso =
    posicion -
    inferior;

  return (
    ordenados[inferior] *
      (1 - peso)
    +
    ordenados[superior] *
      peso
  );
}


// ============================================================
// CONSTRUIR VECTOR DE CARACTERÍSTICAS
// ============================================================

function construirVector(
  caso
) {

  const mes =
    Number(
      caso.mes_inicio ||
      1
    );

  const angulo =
    (
      2 *
      Math.PI *
      (mes - 1)
    ) /
    12;

  return [

    caso.tipo_objeto ===
      'RENOVACION'
      ? 1
      : 0,

    Number(
      caso.observaciones ||
      0
    ),

    Number(
      caso.cambios_estado ||
      0
    ),

    caso.entidad_tipo ===
      'MUNICIPALIDAD'
      ? 1
      : 0,

    caso.entidad_tipo ===
      'ENTIDAD_PUBLICA'
      ? 1
      : 0,

    caso.requiere_renovacion
      ? 1
      : 0,

    Math.sin(
      angulo
    ),

    Math.cos(
      angulo
    )
  ];
}


// ============================================================
// NORMALIZACIÓN
// ============================================================

function normalizador(
  matriz
) {

  const medias = [];
  const desvios = [];

  for (
    let j = 0;
    j < CARACTERISTICAS.length;
    j += 1
  ) {

    const columna =
      matriz.map(
        (fila) =>
          fila[j]
      );

    const m =
      media(
        columna
      );

    const varianza =
      media(
        columna.map(
          (x) =>
            (x - m) ** 2
        )
      );

    const d =
      Math.sqrt(
        varianza
      );

    medias.push(
      m
    );

    desvios.push(
      d > 1e-9
        ? d
        : 1
    );
  }

  return {
    medias,
    desvios
  };
}


function aplicarNormalizacion(
  vector,
  normalizacion
) {

  return vector.map(
    (
      valor,
      i
    ) =>
      (
        valor -
        normalizacion.medias[i]
      ) /
      normalizacion.desvios[i]
  );
}


// ============================================================
// DIVIDIR DATASET
// ============================================================

function dividirDataset(
  registros
) {

  const ordenados =
    [...registros].sort(
      (
        a,
        b
      ) => {

        const tipo =
          a.tipo_objeto.localeCompare(
            b.tipo_objeto
          );

        if (
          tipo !== 0
        ) {

          return tipo;
        }

        return (
          Number(
            a.objeto_id
          )
          -
          Number(
            b.objeto_id
          )
        );
      }
    );

  const evaluacion = [];
  const entrenamiento = [];

  ordenados.forEach(
    (
      registro,
      index
    ) => {

      if (
        (index + 1) % 5 ===
        0
      ) {

        evaluacion.push(
          registro
        );

      } else {

        entrenamiento.push(
          registro
        );
      }
    }
  );

  if (
    evaluacion.length < 2 &&
    entrenamiento.length > 2
  ) {

    evaluacion.push(
      entrenamiento.pop()
    );

    evaluacion.push(
      entrenamiento.pop()
    );
  }

  return {
    entrenamiento,
    evaluacion
  };
}


// ============================================================
// ENTRENAMIENTO REGRESIÓN LOGÍSTICA
// ============================================================

function entrenarLogistica(
  X,
  y
) {

  const pesos =
    new Array(
      CARACTERISTICAS.length
    ).fill(0);

  let sesgo = 0;

  const tasa = 0.04;
  const epocas = 3500;
  const lambda = 0.002;

  for (
    let epoca = 0;
    epoca < epocas;
    epoca += 1
  ) {

    const gradW =
      new Array(
        pesos.length
      ).fill(0);

    let gradB = 0;

    for (
      let i = 0;
      i < X.length;
      i += 1
    ) {

      let z =
        sesgo;

      for (
        let j = 0;
        j < pesos.length;
        j += 1
      ) {

        z +=
          pesos[j] *
          X[i][j];
      }

      const error =
        sigmoid(z) -
        y[i];

      gradB +=
        error;

      for (
        let j = 0;
        j < pesos.length;
        j += 1
      ) {

        gradW[j] +=
          error *
          X[i][j];
      }
    }

    sesgo -=
      tasa *
      gradB /
      X.length;

    for (
      let j = 0;
      j < pesos.length;
      j += 1
    ) {

      pesos[j] -=
        tasa *
        (
          gradW[j] /
          X.length
          +
          lambda *
          pesos[j]
        );
    }
  }

  return {
    pesos,
    sesgo
  };
}


// ============================================================
// ENTRENAMIENTO REGRESIÓN LINEAL
// ============================================================

function entrenarLineal(
  X,
  y
) {

  const pesos =
    new Array(
      CARACTERISTICAS.length
    ).fill(0);

  let sesgo =
    media(
      y
    );

  const tasa = 0.025;
  const epocas = 4500;
  const lambda = 0.002;

  for (
    let epoca = 0;
    epoca < epocas;
    epoca += 1
  ) {

    const gradW =
      new Array(
        pesos.length
      ).fill(0);

    let gradB = 0;

    for (
      let i = 0;
      i < X.length;
      i += 1
    ) {

      let pred =
        sesgo;

      for (
        let j = 0;
        j < pesos.length;
        j += 1
      ) {

        pred +=
          pesos[j] *
          X[i][j];
      }

      const error =
        pred -
        y[i];

      gradB +=
        error;

      for (
        let j = 0;
        j < pesos.length;
        j += 1
      ) {

        gradW[j] +=
          error *
          X[i][j];
      }
    }

    sesgo -=
      tasa *
      (
        2 *
        gradB /
        X.length
      );

    for (
      let j = 0;
      j < pesos.length;
      j += 1
    ) {

      pesos[j] -=
        tasa *
        (
          2 *
          gradW[j] /
          X.length
          +
          lambda *
          pesos[j]
        );
    }
  }

  return {
    pesos,
    sesgo
  };
}


// ============================================================
// PREDICCIONES
// ============================================================

function predecirLogistica(
  modelo,
  vectorNormalizado
) {

  let z =
    Number(
      modelo.sesgo ||
      0
    );

  modelo.pesos.forEach(
    (
      peso,
      i
    ) => {

      z +=
        Number(
          peso
        ) *
        vectorNormalizado[i];
    }
  );

  return sigmoid(
    z
  );
}


function predecirLineal(
  modelo,
  vectorNormalizado
) {

  let valor =
    Number(
      modelo.sesgo ||
      0
    );

  modelo.pesos.forEach(
    (
      peso,
      i
    ) => {

      valor +=
        Number(
          peso
        ) *
        vectorNormalizado[i];
    }
  );

  return Math.max(
    0,
    valor
  );
}


// ============================================================
// MÉTRICAS
// ============================================================

function metricasRiesgo(
  modelo,
  X,
  y
) {

  let correctos = 0;
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let brier = 0;

  X.forEach(
    (
      fila,
      i
    ) => {

      const p =
        predecirLogistica(
          modelo,
          fila
        );

      const pred =
        p >= 0.5
          ? 1
          : 0;

      if (
        pred === y[i]
      ) {
        correctos += 1;
      }

      if (
        pred === 1 &&
        y[i] === 1
      ) {
        tp += 1;
      }

      if (
        pred === 1 &&
        y[i] === 0
      ) {
        fp += 1;
      }

      if (
        pred === 0 &&
        y[i] === 1
      ) {
        fn += 1;
      }

      brier +=
        (
          p -
          y[i]
        ) ** 2;
    }
  );

  return {

    accuracy:
      X.length
        ? correctos /
          X.length
        : 0,

    precision:
      tp + fp
        ? tp /
          (
            tp +
            fp
          )
        : 0,

    recall:
      tp + fn
        ? tp /
          (
            tp +
            fn
          )
        : 0,

    brier:
      X.length
        ? brier /
          X.length
        : 1,

    muestrasEvaluacion:
      X.length
  };
}


function metricasDuracion(
  modelo,
  X,
  y,
  mediaEntrenamiento
) {

  let abs = 0;
  let cuadrado = 0;
  let baselineAbs = 0;

  X.forEach(
    (
      fila,
      i
    ) => {

      const pred =
        predecirLineal(
          modelo,
          fila
        );

      const error =
        pred -
        y[i];

      abs +=
        Math.abs(
          error
        );

      cuadrado +=
        error ** 2;

      baselineAbs +=
        Math.abs(
          mediaEntrenamiento -
          y[i]
        );
    }
  );

  return {

    mae:
      X.length
        ? abs /
          X.length
        : null,

    rmse:
      X.length
        ? Math.sqrt(
            cuadrado /
            X.length
          )
        : null,

    baselineMae:
      X.length
        ? baselineAbs /
          X.length
        : null,

    muestrasEvaluacion:
      X.length
  };
}


// ============================================================
// EXPLICACIÓN DE FACTORES
// ============================================================

function factoresExplicacion(
  parametros,
  vectorNormalizado,
  tipo
) {

  return CARACTERISTICAS
    .map(
      (
        clave,
        i
      ) => {

        const contribucion =
          Number(
            parametros.pesos[i]
          ) *
          vectorNormalizado[i];

        return {

          factor:
            clave,

          descripcion:
            ETIQUETAS[
              clave
            ],

          contribucion:
            Number(
              contribucion.toFixed(
                4
              )
            ),

          efecto:
            contribucion >= 0
              ? 'AUMENTA'
              : 'REDUCE',

          magnitud:
            Math.abs(
              contribucion
            )
        };
      }
    )
    .sort(
      (
        a,
        b
      ) =>
        b.magnitud -
        a.magnitud
    )
    .slice(
      0,
      4
    )
    .map(
      ({
        magnitud,
        ...factor
      }) => ({

        ...factor,

        interpretacion:
          tipo ===
          'RIESGO_RETRASO'
            ? `${factor.descripcion}: ${factor.efecto === 'AUMENTA' ? 'eleva' : 'reduce'} el riesgo estimado.`
            : `${factor.descripcion}: ${factor.efecto === 'AUMENTA' ? 'incrementa' : 'reduce'} la duración estimada.`
      })
    );
}


// ============================================================
// OBTENER CASO
// ============================================================

async function obtenerCaso(
  tipoObjeto,
  objetoId
) {

  const tipo =
    String(
      tipoObjeto ||
      ''
    ).toUpperCase();

  const id =
    Number(
      objetoId
    );

  if (
    !Number.isInteger(
      id
    ) ||
    id <= 0
  ) {

    return null;
  }


  // ==========================================================
  // TRÁMITE
  // ==========================================================

  if (
    tipo ===
    'TRAMITE'
  ) {

    const resultado =
      await pool.query(
        `
        SELECT
          'TRAMITE'::text
            AS tipo_objeto,

          t.id
            AS objeto_id,

          t.numero_expediente
            AS referencia,

          t.fecha_inicio,

          t.fecha_finalizacion,

          t.estado_codigo
            AS estado,

          EXTRACT(
            MONTH
            FROM t.fecha_inicio
          )::int
            AS mes_inicio,

          ee.tipo
            AS entidad_tipo,

          td.requiere_renovacion,

          COUNT(
            DISTINCT o.id
          )::int
            AS observaciones,

          COUNT(
            DISTINCT h.id
          )::int
            AS cambios_estado,

          d.id
            AS documento_id,

          d.codigo_interno,

          ti.nombre
            AS tienda,

          td.nombre
            AS tipo_documento

        FROM tramites t

        INNER JOIN documentos d
          ON d.id =
             t.documento_id

        INNER JOIN tiendas ti
          ON ti.id =
             d.tienda_id

        INNER JOIN tipos_documento td
          ON td.id =
             d.tipo_documento_id

        INNER JOIN entidades_emisoras ee
          ON ee.id =
             t.entidad_emisora_id

        LEFT JOIN tramite_observaciones o
          ON o.tramite_id =
             t.id

        LEFT JOIN tramite_estado_historial h
          ON h.tramite_id =
             t.id

        WHERE t.id = $1

        GROUP BY
          t.id,
          ee.tipo,
          td.requiere_renovacion,
          d.id,
          d.codigo_interno,
          ti.nombre,
          td.nombre

        LIMIT 1;
        `,
        [
          id
        ]
      );

    return (
      resultado.rows[0] ||
      null
    );
  }


  // ==========================================================
  // RENOVACIÓN
  // ==========================================================

  if (
    tipo ===
    'RENOVACION'
  ) {

    const resultado =
      await pool.query(
        `
        SELECT
          'RENOVACION'::text
            AS tipo_objeto,

          r.id
            AS objeto_id,

          COALESCE(
            t.numero_expediente,
            d.numero_expediente,
            d.numero_documento
          )
            AS referencia,

          r.fecha_inicio,

          r.fecha_finalizacion,

          r.estado,

          EXTRACT(
            MONTH
            FROM r.fecha_inicio
          )::int
            AS mes_inicio,

          ee.tipo
            AS entidad_tipo,

          td.requiere_renovacion,

          COUNT(
            DISTINCT o.id
          )::int
            AS observaciones,

          COUNT(
            DISTINCT h.id
          )::int
            AS cambios_estado,

          d.id
            AS documento_id,

          d.codigo_interno,

          ti.nombre
            AS tienda,

          td.nombre
            AS tipo_documento

        FROM renovaciones r

        INNER JOIN documentos d
          ON d.id =
             r.documento_anterior_id

        INNER JOIN tiendas ti
          ON ti.id =
             d.tienda_id

        INNER JOIN tipos_documento td
          ON td.id =
             d.tipo_documento_id

        INNER JOIN entidades_emisoras ee
          ON ee.id =
             d.entidad_emisora_id

        LEFT JOIN tramites t
          ON t.id =
             r.tramite_id

        LEFT JOIN tramite_observaciones o
          ON o.tramite_id =
             t.id

        LEFT JOIN tramite_estado_historial h
          ON h.tramite_id =
             t.id

        WHERE r.id = $1

        GROUP BY
          r.id,
          t.numero_expediente,
          d.numero_expediente,
          d.numero_documento,
          ee.tipo,
          td.requiere_renovacion,
          d.id,
          d.codigo_interno,
          ti.nombre,
          td.nombre

        LIMIT 1;
        `,
        [
          id
        ]
      );

    return (
      resultado.rows[0] ||
      null
    );
  }

  return null;
}


// ============================================================
// LISTAR CASOS ACTIVOS
// ============================================================

async function listarCasosActivos() {

  const [
    tramites,
    renovaciones
  ] =
    await Promise.all([

      pool.query(
        `
        SELECT
          'TRAMITE'::text
            AS tipo_objeto,

          t.id
            AS objeto_id,

          t.numero_expediente
            AS referencia,

          t.estado_codigo
            AS estado,

          t.fecha_inicio,

          ti.nombre
            AS tienda,

          td.nombre
            AS tipo_documento

        FROM tramites t

        INNER JOIN documentos d
          ON d.id =
             t.documento_id

        INNER JOIN tiendas ti
          ON ti.id =
             d.tienda_id

        INNER JOIN tipos_documento td
          ON td.id =
             d.tipo_documento_id

        WHERE
          t.fecha_finalizacion
            IS NULL

        ORDER BY
          t.fecha_inicio ASC,
          t.id ASC;
        `
      ),


      pool.query(
        `
        SELECT
          'RENOVACION'::text
            AS tipo_objeto,

          r.id
            AS objeto_id,

          COALESCE(
            t.numero_expediente,
            d.numero_expediente,
            d.numero_documento
          )
            AS referencia,

          r.estado,

          r.fecha_inicio,

          ti.nombre
            AS tienda,

          td.nombre
            AS tipo_documento

        FROM renovaciones r

        INNER JOIN documentos d
          ON d.id =
             r.documento_anterior_id

        INNER JOIN tiendas ti
          ON ti.id =
             d.tienda_id

        INNER JOIN tipos_documento td
          ON td.id =
             d.tipo_documento_id

        LEFT JOIN tramites t
          ON t.id =
             r.tramite_id

        WHERE
          r.fecha_finalizacion
            IS NULL

          AND r.estado IN (
            'EN_PROCESO',
            'INICIADA'
          )

        ORDER BY
          r.fecha_inicio ASC,
          r.id ASC;
        `
      )
    ]);

  return [
    ...tramites.rows,
    ...renovaciones.rows
  ];
}


// ============================================================
// SINCRONIZAR RESULTADOS REALES
// ============================================================

async function sincronizarResultadosReales(
  usuarioId
) {

  const cliente =
    await pool.connect();

  try {

    await cliente.query(
      'BEGIN'
    );


    // ========================================================
    // TRÁMITES FINALIZADOS
    // ========================================================

    const tramites =
      await cliente.query(
        `
        INSERT INTO ia_resultados_reales (
          tipo_objeto,
          objeto_id,
          duracion_real_dias,
          resultado,
          apto_ml,
          validado,
          registrado_por
        )

        SELECT
          'TRAMITE',

          t.id,

          (
            t.fecha_finalizacion -
            t.fecha_inicio
          )::int,

          t.estado_codigo,

          TRUE,

          TRUE,

          $1

        FROM tramites t

        WHERE
          t.fecha_finalizacion
            IS NOT NULL

          AND
          t.fecha_finalizacion >=
          t.fecha_inicio

        ON CONFLICT (
          tipo_objeto,
          objeto_id
        )
        DO NOTHING

        RETURNING id;
        `,
        [
          usuarioId
        ]
      );


    // ========================================================
    // RENOVACIONES FINALIZADAS
    // CORRECCIÓN: ya no usa r.duracion_dias
    // ========================================================

    const renovaciones =
      await cliente.query(
        `
        INSERT INTO ia_resultados_reales (
          tipo_objeto,
          objeto_id,
          duracion_real_dias,
          resultado,
          apto_ml,
          validado,
          registrado_por
        )

        SELECT
          'RENOVACION',

          r.id,

          (
            r.fecha_finalizacion -
            r.fecha_inicio
          )::int,

          r.estado,

          TRUE,

          TRUE,

          $1

        FROM renovaciones r

        WHERE
          r.fecha_finalizacion
            IS NOT NULL

          AND
          r.fecha_finalizacion >=
          r.fecha_inicio

          AND
          r.estado =
          'COMPLETADA'

        ON CONFLICT (
          tipo_objeto,
          objeto_id
        )
        DO NOTHING

        RETURNING id;
        `,
        [
          usuarioId
        ]
      );


    await cliente.query(
      'COMMIT'
    );


    return {

      tramitesNuevos:
        tramites.rowCount,

      renovacionesNuevas:
        renovaciones.rowCount,

      totalNuevos:
        tramites.rowCount +
        renovaciones.rowCount
    };

  } catch (
    error
  ) {

    await cliente.query(
      'ROLLBACK'
    );

    throw error;

  } finally {

    cliente.release();
  }
}


// ============================================================
// CARGAR DATASET VALIDADO
// ============================================================

async function cargarDatasetValidado() {

  const resultado =
    await pool.query(
      `
      SELECT
        rr.id
          AS resultado_real_id,

        rr.tipo_objeto,

        rr.objeto_id,

        rr.duracion_real_dias,

        rr.resultado

      FROM ia_resultados_reales rr

      WHERE
        rr.apto_ml = TRUE

        AND
        rr.validado = TRUE

      ORDER BY
        rr.tipo_objeto ASC,
        rr.objeto_id ASC;
      `
    );

  const registros = [];

  for (
    const fila
    of resultado.rows
  ) {

    const caso =
      await obtenerCaso(
        fila.tipo_objeto,
        fila.objeto_id
      );

    if (!caso) {

      continue;
    }

    registros.push({

      ...caso,

      resultado_real_id:
        fila.resultado_real_id,

      duracion_real_dias:
        Number(
          fila.duracion_real_dias
        ),

      resultado_real:
        fila.resultado
    });
  }

  return registros;
}


// ============================================================
// CHECKSUM DATASET
// ============================================================

function checksumDataset(
  registros
) {

  const contenido =
    registros
      .map(
        (r) =>
          `${r.tipo_objeto}:${r.objeto_id}:${r.duracion_real_dias}:${r.resultado_real}`
      )
      .join('|');

  return crypto
    .createHash(
      'sha256'
    )
    .update(
      contenido
    )
    .digest(
      'hex'
    );
}


// ============================================================
// CREAR VERSIÓN DATASET
// ============================================================

async function crearVersionDataset(
  registros,
  usuarioId
) {

  const {
    entrenamiento,
    evaluacion
  } =
    dividirDataset(
      registros
    );

  const version =
    `DS-${new Date()
      .toISOString()
      .replace(
        /[-:.TZ]/g,
        ''
      )
      .slice(
        0,
        14
      )}`;


  const snapshot =
    registros.map(
      (r) => ({

        tipoObjeto:
          r.tipo_objeto,

        objetoId:
          Number(
            r.objeto_id
          ),

        resultadoRealId:
          Number(
            r.resultado_real_id
          ),

        duracionRealDias:
          Number(
            r.duracion_real_dias
          ),

        resultado:
          r.resultado_real
      })
    );


  const resultado =
    await pool.query(
      `
      INSERT INTO ia_dataset_versiones (
        version,
        total_registros,
        registros_entrenamiento,
        registros_evaluacion,
        checksum_sha256,
        definicion,
        registros_snapshot,
        creado_por
      )

      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6::jsonb,
        $7::jsonb,
        $8
      )

      RETURNING *;
      `,
      [
        version,

        registros.length,

        entrenamiento.length,

        evaluacion.length,

        checksumDataset(
          registros
        ),

        JSON.stringify({
          origen:
            'ia_resultados_reales',

          soloAptos:
            true,

          soloValidados:
            true,

          split:
            'deterministico_80_20',

          caracteristicas:
            CARACTERISTICAS
        }),

        JSON.stringify(
          snapshot
        ),

        usuarioId
      ]
    );


  return {

    dataset:
      resultado.rows[0],

    entrenamiento,

    evaluacion
  };
}


// ============================================================
// ENTRENAR MODELOS
// ============================================================

async function entrenarModelos(
  usuarioId
) {

  const registros =
    await cargarDatasetValidado();


  if (
    registros.length <
    MIN_MUESTRAS
  ) {

    return {

      ok: false,

      insuficiente: true,

      mensaje:
        `Se requieren al menos ${MIN_MUESTRAS} resultados reales validados. Actualmente existen ${registros.length}.`,

      muestrasDisponibles:
        registros.length,

      minimoRequerido:
        MIN_MUESTRAS
    };
  }


  const {
    dataset,
    entrenamiento,
    evaluacion
  } =
    await crearVersionDataset(
      registros,
      usuarioId
    );


  if (
    entrenamiento.length < 6 ||
    evaluacion.length < 2
  ) {

    return {

      ok: false,

      insuficiente: true,

      mensaje:
        'La división entrenamiento/evaluación no contiene suficientes registros.',

      muestrasDisponibles:
        registros.length,

      minimoRequerido:
        MIN_MUESTRAS
    };
  }


  const matrizTrain =
    entrenamiento.map(
      (r) =>
        construirVector(
          r
        )
    );


  const normalizacion =
    normalizador(
      matrizTrain
    );


  const Xtrain =
    matrizTrain.map(
      (x) =>
        aplicarNormalizacion(
          x,
          normalizacion
        )
    );


  const Xeval =
    evaluacion
      .map(
        (r) =>
          construirVector(
            r
          )
      )
      .map(
        (x) =>
          aplicarNormalizacion(
            x,
            normalizacion
          )
      );


  const duracionesTrain =
    entrenamiento.map(
      (r) =>
        Number(
          r.duracion_real_dias
        )
    );


  const duracionesEval =
    evaluacion.map(
      (r) =>
        Number(
          r.duracion_real_dias
        )
    );


  const umbralRetraso =
    percentil(
      duracionesTrain,
      0.75
    );


  const yRiesgoTrain =
    duracionesTrain.map(
      (d) =>
        d > umbralRetraso
          ? 1
          : 0
    );


  const yRiesgoEval =
    duracionesEval.map(
      (d) =>
        d > umbralRetraso
          ? 1
          : 0
    );


  const clases =
    new Set(
      yRiesgoTrain
    );


  if (
    clases.size < 2
  ) {

    return {

      ok: false,

      insuficiente: true,

      mensaje:
        'Los datos históricos no contienen variación suficiente para aprender riesgo de retraso.',

      muestrasDisponibles:
        registros.length,

      minimoRequerido:
        MIN_MUESTRAS
    };
  }


  const modeloRiesgo =
    entrenarLogistica(
      Xtrain,
      yRiesgoTrain
    );


  const metricasR =
    metricasRiesgo(
      modeloRiesgo,
      Xeval,
      yRiesgoEval
    );


  const cumpleRiesgo =
    metricasR.accuracy >=
      0.55
    &&
    metricasR.brier <=
      0.30;


  const modeloDuracion =
    entrenarLineal(
      Xtrain,
      duracionesTrain
    );


  const metricasD =
    metricasDuracion(
      modeloDuracion,
      Xeval,
      duracionesEval,
      media(
        duracionesTrain
      )
    );


  const cumpleDuracion =
    Number.isFinite(
      metricasD.mae
    )
    &&
    metricasD.mae <=
      Math.max(
        10,
        metricasD.baselineMae
      );


  const marca =
    new Date()
      .toISOString()
      .replace(
        /[-:.TZ]/g,
        ''
      )
      .slice(
        0,
        14
      );


  const comunes = {

    normalizacion,

    caracteristicas:
      CARACTERISTICAS
  };


  const riesgo =
    await pool.query(
      `
      INSERT INTO ia_modelos (
        tipo_modelo,
        version,
        dataset_version_id,
        algoritmo,
        caracteristicas,
        parametros,
        metricas,
        criterios_aprobacion,
        cumple_criterios,
        entrenado_por
      )

      VALUES (
        'RIESGO_RETRASO',
        $1,
        $2,
        'REGRESION_LOGISTICA_GD',
        $3::jsonb,
        $4::jsonb,
        $5::jsonb,
        $6::jsonb,
        $7,
        $8
      )

      RETURNING *;
      `,
      [
        `RISK-${marca}`,

        dataset.id,

        JSON.stringify(
          CARACTERISTICAS
        ),

        JSON.stringify({
          ...comunes,
          ...modeloRiesgo,
          umbralRetrasoDias:
            umbralRetraso
        }),

        JSON.stringify(
          metricasR
        ),

        JSON.stringify({
          accuracyMinima:
            0.55,

          brierMaximo:
            0.30
        }),

        cumpleRiesgo,

        usuarioId
      ]
    );


  const duracion =
    await pool.query(
      `
      INSERT INTO ia_modelos (
        tipo_modelo,
        version,
        dataset_version_id,
        algoritmo,
        caracteristicas,
        parametros,
        metricas,
        criterios_aprobacion,
        cumple_criterios,
        entrenado_por
      )

      VALUES (
        'DURACION',
        $1,
        $2,
        'REGRESION_LINEAL_GD',
        $3::jsonb,
        $4::jsonb,
        $5::jsonb,
        $6::jsonb,
        $7,
        $8
      )

      RETURNING *;
      `,
      [
        `DUR-${marca}`,

        dataset.id,

        JSON.stringify(
          CARACTERISTICAS
        ),

        JSON.stringify({
          ...comunes,
          ...modeloDuracion
        }),

        JSON.stringify(
          metricasD
        ),

        JSON.stringify({
          maeNoPeorQueBaseline:
            true,

          toleranciaDias:
            10
        }),

        cumpleDuracion,

        usuarioId
      ]
    );


  return {

    ok: true,

    insuficiente: false,

    dataset,

    modelos: [
      riesgo.rows[0],
      duracion.rows[0]
    ]
  };
}


// ============================================================
// OBTENER MODELO ACTIVO
// ============================================================

async function obtenerModeloActivo(
  tipo
) {

  const resultado =
    await pool.query(
      `
      SELECT *
      FROM ia_modelos

      WHERE
        tipo_modelo = $1

        AND
        estado =
        'ACTIVO'

      ORDER BY
        fecha_aprobacion DESC,
        id DESC

      LIMIT 1;
      `,
      [
        tipo
      ]
    );

  return (
    resultado.rows[0] ||
    null
  );
}


// ============================================================
// PREDECIR CASO
// ============================================================

async function predecirCaso(
  tipoObjeto,
  objetoId,
  usuarioId
) {

  const caso =
    await obtenerCaso(
      tipoObjeto,
      objetoId
    );


  if (!caso) {

    const error =
      new Error(
        'El trámite o renovación solicitado no existe.'
      );

    error.status =
      404;

    throw error;
  }


  const [
    modeloRiesgo,
    modeloDuracion
  ] =
    await Promise.all([

      obtenerModeloActivo(
        'RIESGO_RETRASO'
      ),

      obtenerModeloActivo(
        'DURACION'
      )
    ]);


  if (
    !modeloRiesgo &&
    !modeloDuracion
  ) {

    const error =
      new Error(
        'No existe un modelo predictivo activo. Entrene y apruebe una versión con datos históricos suficientes.'
      );

    error.status =
      409;

    error.insuficiente =
      true;

    throw error;
  }


  const vector =
    construirVector(
      caso
    );


  const respuesta = {

    caso: {

      tipoObjeto:
        caso.tipo_objeto,

      objetoId:
        Number(
          caso.objeto_id
        ),

      referencia:
        caso.referencia,

      tienda:
        caso.tienda,

      tipoDocumento:
        caso.tipo_documento,

      estado:
        caso.estado,

      documentoId:
        Number(
          caso.documento_id
        )
    },

    riesgo:
      null,

    duracion:
      null,

    advertencia:
      'La predicción es una recomendación de apoyo. No modifica estados oficiales ni reemplaza la decisión del responsable.'
  };


  // ==========================================================
  // RIESGO
  // ==========================================================

  if (
    modeloRiesgo
  ) {

    const parametros =
      modeloRiesgo.parametros;


    const normalizado =
      aplicarNormalizacion(
        vector,
        parametros.normalizacion
      );


    const probabilidad =
      predecirLogistica(
        parametros,
        normalizado
      );


    const nivel =
      probabilidad >= 0.70
        ? 'ALTO'
        : probabilidad >= 0.40
          ? 'MEDIO'
          : 'BAJO';


    const factores =
      factoresExplicacion(
        parametros,
        normalizado,
        'RIESGO_RETRASO'
      );


    const guardada =
      await pool.query(
        `
        INSERT INTO ia_predicciones (
          modelo_id,
          tipo_objeto,
          objeto_id,
          tipo_prediccion,
          probabilidad,
          nivel_riesgo,
          entrada,
          factores,
          solicitado_por
        )

        VALUES (
          $1,
          $2,
          $3,
          'RIESGO_RETRASO',
          $4,
          $5,
          $6::jsonb,
          $7::jsonb,
          $8
        )

        RETURNING
          id,
          fecha_prediccion;
        `,
        [
          modeloRiesgo.id,

          caso.tipo_objeto,

          caso.objeto_id,

          probabilidad,

          nivel,

          JSON.stringify({
            caracteristicas:
              CARACTERISTICAS,

            vector
          }),

          JSON.stringify(
            factores
          ),

          usuarioId
        ]
      );


    respuesta.riesgo = {

      prediccionId:
        guardada.rows[0].id,

      probabilidad:
        Number(
          probabilidad.toFixed(
            4
          )
        ),

      nivel,

      umbralHistoricoRetrasoDias:
        Number(
          parametros.umbralRetrasoDias ||
          0
        ),

      modelo: {

        id:
          modeloRiesgo.id,

        version:
          modeloRiesgo.version,

        algoritmo:
          modeloRiesgo.algoritmo
      },

      factores,

      fechaPrediccion:
        guardada.rows[0]
          .fecha_prediccion
    };
  }


  // ==========================================================
  // DURACIÓN
  // ==========================================================

  if (
    modeloDuracion
  ) {

    const parametros =
      modeloDuracion.parametros;


    const normalizado =
      aplicarNormalizacion(
        vector,
        parametros.normalizacion
      );


    const dias =
      predecirLineal(
        parametros,
        normalizado
      );


    const factores =
      factoresExplicacion(
        parametros,
        normalizado,
        'DURACION'
      );


    const guardada =
      await pool.query(
        `
        INSERT INTO ia_predicciones (
          modelo_id,
          tipo_objeto,
          objeto_id,
          tipo_prediccion,
          duracion_estimada_dias,
          entrada,
          factores,
          solicitado_por
        )

        VALUES (
          $1,
          $2,
          $3,
          'DURACION',
          $4,
          $5::jsonb,
          $6::jsonb,
          $7
        )

        RETURNING
          id,
          fecha_prediccion;
        `,
        [
          modeloDuracion.id,

          caso.tipo_objeto,

          caso.objeto_id,

          Number(
            dias.toFixed(
              2
            )
          ),

          JSON.stringify({
            caracteristicas:
              CARACTERISTICAS,

            vector
          }),

          JSON.stringify(
            factores
          ),

          usuarioId
        ]
      );


    respuesta.duracion = {

      prediccionId:
        guardada.rows[0].id,

      diasEstimados:
        Number(
          dias.toFixed(
            1
          )
        ),

      esPlazoOficial:
        false,

      modelo: {

        id:
          modeloDuracion.id,

        version:
          modeloDuracion.version,

        algoritmo:
          modeloDuracion.algoritmo
      },

      factores,

      fechaPrediccion:
        guardada.rows[0]
          .fecha_prediccion
    };
  }


  return respuesta;
}


// ============================================================
// EXPORTACIONES
// ============================================================

module.exports = {

  MIN_MUESTRAS,

  CARACTERISTICAS,

  listarCasosActivos,

  sincronizarResultadosReales,

  entrenarModelos,

  predecirCaso
};
