-- ============================================================
-- CERTIIA
-- MIGRACIÓN 012
-- REGLAS DE VIGENCIA Y ALERTAS
-- HU-017
-- ============================================================


-- ============================================================
-- TABLA: tipo_documento_reglas_vigencia
--
-- Esta tabla conserva versiones históricas de la configuración
-- de vigencia y alertas de cada tipo documental.
-- ============================================================

CREATE TABLE IF NOT EXISTS tipo_documento_reglas_vigencia (

    id BIGSERIAL PRIMARY KEY,

    tipo_documento_id BIGINT NOT NULL,

    version INTEGER NOT NULL,

    tipo_vigencia VARCHAR(30) NOT NULL,

    duracion_valor INTEGER,

    duracion_unidad VARCHAR(10),

    requiere_renovacion BOOLEAN NOT NULL DEFAULT FALSE,

    umbral_por_vencer_dias INTEGER,

    umbral_critico_dias INTEGER,

    es_actual BOOLEAN NOT NULL DEFAULT TRUE,

    vigente_desde TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    vigente_hasta TIMESTAMPTZ,

    creado_por BIGINT,

    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),


    -- ========================================================
    -- RELACIONES
    -- ========================================================

    CONSTRAINT fk_regla_vigencia_tipo_documento

        FOREIGN KEY (
            tipo_documento_id
        )

        REFERENCES tipos_documento (
            id
        )

        ON DELETE RESTRICT,


    CONSTRAINT fk_regla_vigencia_usuario

        FOREIGN KEY (
            creado_por
        )

        REFERENCES usuarios (
            id
        )

        ON DELETE SET NULL,


    -- ========================================================
    -- VERSIÓN
    -- ========================================================

    CONSTRAINT chk_regla_vigencia_version

        CHECK (
            version > 0
        ),


    -- ========================================================
    -- TIPOS DE VIGENCIA
    -- ========================================================

    CONSTRAINT chk_regla_tipo_vigencia

        CHECK (
            tipo_vigencia IN (
                'DETERMINADA',
                'TEMPORAL',
                'INDETERMINADA'
            )
        ),


    -- ========================================================
    -- DURACIÓN
    -- ========================================================

    CONSTRAINT chk_regla_duracion_valor

        CHECK (
            duracion_valor IS NULL
            OR duracion_valor > 0
        ),


    CONSTRAINT chk_regla_duracion_unidad

        CHECK (
            duracion_unidad IS NULL
            OR duracion_unidad IN (
                'DIAS',
                'MESES'
            )
        ),


    -- ========================================================
    -- COHERENCIA SEGÚN TIPO DE VIGENCIA
    --
    -- DETERMINADA:
    -- debe indicar duración y unidad.
    --
    -- TEMPORAL:
    -- la fecha de vencimiento se definirá en cada documento.
    --
    -- INDETERMINADA:
    -- no tiene duración fija.
    -- ========================================================

    CONSTRAINT chk_regla_duracion_tipo_vigencia

        CHECK (

            (
                tipo_vigencia = 'DETERMINADA'

                AND duracion_valor IS NOT NULL

                AND duracion_unidad IS NOT NULL
            )

            OR

            (
                tipo_vigencia = 'TEMPORAL'

                AND duracion_valor IS NULL

                AND duracion_unidad IS NULL
            )

            OR

            (
                tipo_vigencia = 'INDETERMINADA'

                AND duracion_valor IS NULL

                AND duracion_unidad IS NULL
            )

        ),


    -- ========================================================
    -- UMBRALES
    -- ========================================================

    CONSTRAINT chk_regla_umbral_por_vencer

        CHECK (
            umbral_por_vencer_dias IS NULL
            OR umbral_por_vencer_dias > 0
        ),


    CONSTRAINT chk_regla_umbral_critico

        CHECK (
            umbral_critico_dias IS NULL
            OR umbral_critico_dias >= 0
        ),


    -- ========================================================
    -- COHERENCIA DE ALERTAS
    --
    -- Para documentos con vencimiento:
    -- CRÍTICO debe ser menor que POR VENCER.
    --
    -- Ejemplo:
    -- Por vencer = 30 días
    -- Crítico    = 7 días
    -- ========================================================

    CONSTRAINT chk_regla_umbrales_coherentes

        CHECK (

            (
                tipo_vigencia IN (
                    'DETERMINADA',
                    'TEMPORAL'
                )

                AND umbral_por_vencer_dias IS NOT NULL

                AND umbral_critico_dias IS NOT NULL

                AND umbral_critico_dias <
                    umbral_por_vencer_dias
            )

            OR

            (
                tipo_vigencia = 'INDETERMINADA'

                AND umbral_por_vencer_dias IS NULL

                AND umbral_critico_dias IS NULL
            )

        ),


    -- ========================================================
    -- RENOVACIÓN
    --
    -- Una vigencia INDETERMINADA no requiere renovación.
    -- ========================================================

    CONSTRAINT chk_regla_renovacion_indeterminada

        CHECK (
            tipo_vigencia <> 'INDETERMINADA'
            OR requiere_renovacion = FALSE
        ),


    -- ========================================================
    -- HISTORIAL
    -- ========================================================

    CONSTRAINT chk_regla_fechas_historial

        CHECK (
            vigente_hasta IS NULL
            OR vigente_hasta >= vigente_desde
        ),


    CONSTRAINT chk_regla_estado_historial

        CHECK (

            (
                es_actual = TRUE
                AND vigente_hasta IS NULL
            )

            OR

            (
                es_actual = FALSE
            )

        ),


    -- ========================================================
    -- UNA VERSIÓN NO SE PUEDE REPETIR
    -- ========================================================

    CONSTRAINT uq_regla_vigencia_tipo_version

        UNIQUE (
            tipo_documento_id,
            version
        )
);


-- ============================================================
-- SOLO UNA CONFIGURACIÓN ACTUAL POR TIPO DOCUMENTAL
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS
uq_regla_vigencia_actual_por_tipo

ON tipo_documento_reglas_vigencia (
    tipo_documento_id
)

WHERE es_actual = TRUE;


-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS
idx_reglas_vigencia_tipo_documento

ON tipo_documento_reglas_vigencia (
    tipo_documento_id
);


CREATE INDEX IF NOT EXISTS
idx_reglas_vigencia_tipo

ON tipo_documento_reglas_vigencia (
    tipo_vigencia
);


CREATE INDEX IF NOT EXISTS
idx_reglas_vigencia_actual

ON tipo_documento_reglas_vigencia (
    es_actual
);


CREATE INDEX IF NOT EXISTS
idx_reglas_vigencia_fecha_creacion

ON tipo_documento_reglas_vigencia (
    fecha_creacion
);


-- ============================================================
-- COMENTARIOS
-- ============================================================

COMMENT ON TABLE tipo_documento_reglas_vigencia IS
'Historial versionado de reglas de vigencia, renovación y alertas configuradas para los tipos de documento de CERTIIA.';


COMMENT ON COLUMN tipo_documento_reglas_vigencia.tipo_vigencia IS
'DETERMINADA: duración fija; TEMPORAL: vencimiento definido por documento; INDETERMINADA: sin vencimiento.';


COMMENT ON COLUMN tipo_documento_reglas_vigencia.duracion_valor IS
'Cantidad de días o meses para tipos con vigencia DETERMINADA.';


COMMENT ON COLUMN tipo_documento_reglas_vigencia.duracion_unidad IS
'Unidad de duración permitida: DIAS o MESES.';


COMMENT ON COLUMN tipo_documento_reglas_vigencia.umbral_por_vencer_dias IS
'Días anteriores al vencimiento en los que el documento pasa al estado Por vencer.';


COMMENT ON COLUMN tipo_documento_reglas_vigencia.umbral_critico_dias IS
'Días anteriores al vencimiento en los que el documento pasa al estado Crítico.';


COMMENT ON COLUMN tipo_documento_reglas_vigencia.es_actual IS
'Indica cuál versión de la configuración se encuentra actualmente vigente.';


COMMENT ON COLUMN tipo_documento_reglas_vigencia.version IS
'Número secuencial de versión de la configuración para preservar trazabilidad histórica.';


COMMENT ON COLUMN tipo_documento_reglas_vigencia.vigente_desde IS
'Fecha desde la cual esta versión de la configuración estuvo vigente.';


COMMENT ON COLUMN tipo_documento_reglas_vigencia.vigente_hasta IS
'Fecha en la que dejó de estar vigente esta versión. NULL cuando es la configuración actual.';


COMMENT ON COLUMN tipo_documento_reglas_vigencia.creado_por IS
'Usuario que creó esta versión de la configuración.';