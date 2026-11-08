BEGIN;

-- ============================================================
-- CERTIIA - MIGRACIÓN 031
-- ÉPICA 12 - IA PREDICTIVA
-- HU-045 / HU-046 / HU-047 / HU-048 / HU-049
-- ============================================================

CREATE TABLE IF NOT EXISTS ia_dataset_versiones (
    id BIGSERIAL PRIMARY KEY,
    version VARCHAR(80) NOT NULL UNIQUE,
    fecha_corte TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_registros INTEGER NOT NULL,
    registros_entrenamiento INTEGER NOT NULL,
    registros_evaluacion INTEGER NOT NULL,
    checksum_sha256 VARCHAR(64) NOT NULL,
    definicion JSONB NOT NULL,
    registros_snapshot JSONB NOT NULL,
    creado_por BIGINT NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_ia_dataset_creado_por
        FOREIGN KEY (creado_por)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    CONSTRAINT ck_ia_dataset_totales
        CHECK (
            total_registros >= 0
            AND registros_entrenamiento >= 0
            AND registros_evaluacion >= 0
            AND registros_entrenamiento + registros_evaluacion = total_registros
        )
);


CREATE TABLE IF NOT EXISTS ia_modelos (
    id BIGSERIAL PRIMARY KEY,
    tipo_modelo VARCHAR(30) NOT NULL,
    version VARCHAR(80) NOT NULL UNIQUE,
    dataset_version_id BIGINT NOT NULL,
    algoritmo VARCHAR(80) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'CANDIDATO',
    caracteristicas JSONB NOT NULL,
    parametros JSONB NOT NULL,
    metricas JSONB NOT NULL,
    criterios_aprobacion JSONB NOT NULL,
    cumple_criterios BOOLEAN NOT NULL DEFAULT FALSE,
    entrenado_por BIGINT NOT NULL,
    fecha_entrenamiento TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    aprobado_por BIGINT,
    fecha_aprobacion TIMESTAMPTZ,
    observaciones VARCHAR(1500),

    CONSTRAINT fk_ia_modelo_dataset
        FOREIGN KEY (dataset_version_id)
        REFERENCES ia_dataset_versiones(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_ia_modelo_entrenado_por
        FOREIGN KEY (entrenado_por)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_ia_modelo_aprobado_por
        FOREIGN KEY (aprobado_por)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    CONSTRAINT ck_ia_modelo_tipo
        CHECK (tipo_modelo IN ('RIESGO_RETRASO', 'DURACION')),

    CONSTRAINT ck_ia_modelo_estado
        CHECK (estado IN ('CANDIDATO', 'ACTIVO', 'RECHAZADO', 'RETIRADO')),

    CONSTRAINT ck_ia_modelo_aprobacion
        CHECK (
            (estado <> 'ACTIVO')
            OR (
                cumple_criterios = TRUE
                AND aprobado_por IS NOT NULL
                AND fecha_aprobacion IS NOT NULL
            )
        )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_ia_modelo_activo_tipo
ON ia_modelos(tipo_modelo)
WHERE estado = 'ACTIVO';

CREATE INDEX IF NOT EXISTS idx_ia_modelos_tipo_estado
ON ia_modelos(tipo_modelo, estado);


CREATE TABLE IF NOT EXISTS ia_predicciones (
    id BIGSERIAL PRIMARY KEY,
    modelo_id BIGINT NOT NULL,
    tipo_objeto VARCHAR(20) NOT NULL,
    objeto_id BIGINT NOT NULL,
    tipo_prediccion VARCHAR(30) NOT NULL,
    probabilidad NUMERIC(8,6),
    nivel_riesgo VARCHAR(20),
    duracion_estimada_dias NUMERIC(10,2),
    entrada JSONB NOT NULL,
    factores JSONB NOT NULL,
    solicitado_por BIGINT NOT NULL,
    fecha_prediccion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_ia_prediccion_modelo
        FOREIGN KEY (modelo_id)
        REFERENCES ia_modelos(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_ia_prediccion_usuario
        FOREIGN KEY (solicitado_por)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    CONSTRAINT ck_ia_prediccion_objeto
        CHECK (tipo_objeto IN ('TRAMITE', 'RENOVACION')),

    CONSTRAINT ck_ia_prediccion_tipo
        CHECK (tipo_prediccion IN ('RIESGO_RETRASO', 'DURACION')),

    CONSTRAINT ck_ia_prediccion_probabilidad
        CHECK (probabilidad IS NULL OR (probabilidad >= 0 AND probabilidad <= 1)),

    CONSTRAINT ck_ia_prediccion_nivel
        CHECK (nivel_riesgo IS NULL OR nivel_riesgo IN ('BAJO', 'MEDIO', 'ALTO')),

    CONSTRAINT ck_ia_prediccion_duracion
        CHECK (duracion_estimada_dias IS NULL OR duracion_estimada_dias >= 0)
);

CREATE INDEX IF NOT EXISTS idx_ia_predicciones_objeto
ON ia_predicciones(tipo_objeto, objeto_id, fecha_prediccion DESC);

CREATE INDEX IF NOT EXISTS idx_ia_predicciones_modelo
ON ia_predicciones(modelo_id, fecha_prediccion DESC);


CREATE TABLE IF NOT EXISTS ia_resultados_reales (
    id BIGSERIAL PRIMARY KEY,
    tipo_objeto VARCHAR(20) NOT NULL,
    objeto_id BIGINT NOT NULL,
    duracion_real_dias INTEGER NOT NULL,
    resultado VARCHAR(80) NOT NULL,
    apto_ml BOOLEAN NOT NULL DEFAULT TRUE,
    validado BOOLEAN NOT NULL DEFAULT TRUE,
    motivo_exclusion VARCHAR(1000),
    registrado_por BIGINT NOT NULL,
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_ia_resultado_usuario
        FOREIGN KEY (registrado_por)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_ia_resultado_objeto
        UNIQUE (tipo_objeto, objeto_id),

    CONSTRAINT ck_ia_resultado_objeto
        CHECK (tipo_objeto IN ('TRAMITE', 'RENOVACION')),

    CONSTRAINT ck_ia_resultado_duracion
        CHECK (duracion_real_dias >= 0),

    CONSTRAINT ck_ia_resultado_exclusion
        CHECK (
            apto_ml = TRUE
            OR (motivo_exclusion IS NOT NULL AND BTRIM(motivo_exclusion) <> '')
        )
);

CREATE INDEX IF NOT EXISTS idx_ia_resultados_apto
ON ia_resultados_reales(apto_ml, validado);


COMMENT ON TABLE ia_dataset_versiones IS
'Datasets validados y versionados utilizados para entrenamiento/evaluación de modelos CERTIIA.';

COMMENT ON TABLE ia_modelos IS
'Versiones trazables de modelos predictivos. Solo una versión ACTIVA por tipo.';

COMMENT ON TABLE ia_predicciones IS
'Predicciones históricas inmutables vinculadas a la versión exacta del modelo que las produjo.';

COMMENT ON TABLE ia_resultados_reales IS
'Resultados operativos reales utilizados como evidencia y potencial dato de aprendizaje.';

COMMIT;
