-- ============================================================
-- CERTIIA
-- MIGRACIÓN 024
-- ÉPICA 7 - RENOVACIONES
-- HU-031 / HU-032 / HU-033
-- ============================================================

BEGIN;


-- ============================================================
-- TABLA: renovaciones
-- ============================================================

CREATE TABLE IF NOT EXISTS renovaciones (

    id BIGSERIAL PRIMARY KEY,


    -- ========================================================
    -- DOCUMENTO QUE SE ESTÁ RENOVANDO
    -- ========================================================

    documento_anterior_id BIGINT NOT NULL,


    -- ========================================================
    -- NUEVO DOCUMENTO GENERADO AL FINALIZAR LA RENOVACIÓN
    -- HU-032
    -- ========================================================

    documento_renovado_id BIGINT,


    -- ========================================================
    -- TRÁMITE RELACIONADO
    -- Puede ser NULL si todavía no existe trámite asociado
    -- ========================================================

    tramite_id BIGINT,


    -- ========================================================
    -- RESPONSABLE DE LA RENOVACIÓN
    -- ========================================================

    responsable_usuario_id BIGINT NOT NULL,


    -- ========================================================
    -- FECHAS DEL PROCESO
    -- ========================================================

    fecha_inicio DATE NOT NULL,

    fecha_finalizacion DATE,


    -- ========================================================
    -- ESTADO DE LA RENOVACIÓN
    -- ========================================================

    estado VARCHAR(30)
        NOT NULL
        DEFAULT 'EN_PROCESO',


    -- ========================================================
    -- INFORMACIÓN ADICIONAL
    -- ========================================================

    observaciones VARCHAR(1500),


    -- ========================================================
    -- TRAZABILIDAD
    -- ========================================================

    creado_por BIGINT NOT NULL,

    finalizado_por BIGINT,

    fecha_creacion TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    fecha_actualizacion TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),


    -- ========================================================
    -- CLAVES FORÁNEAS
    -- ========================================================

    CONSTRAINT fk_renovaciones_documento_anterior
        FOREIGN KEY (documento_anterior_id)
        REFERENCES documentos(id)
        ON DELETE RESTRICT,


    CONSTRAINT fk_renovaciones_documento_renovado
        FOREIGN KEY (documento_renovado_id)
        REFERENCES documentos(id)
        ON DELETE RESTRICT,


    CONSTRAINT fk_renovaciones_tramite
        FOREIGN KEY (tramite_id)
        REFERENCES tramites(id)
        ON DELETE RESTRICT,


    CONSTRAINT fk_renovaciones_responsable
        FOREIGN KEY (responsable_usuario_id)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,


    CONSTRAINT fk_renovaciones_creado_por
        FOREIGN KEY (creado_por)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,


    CONSTRAINT fk_renovaciones_finalizado_por
        FOREIGN KEY (finalizado_por)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,


    -- ========================================================
    -- VALIDACIONES
    -- ========================================================

    CONSTRAINT chk_renovaciones_estado
        CHECK (
            estado IN (
                'EN_PROCESO',
                'COMPLETADA',
                'CANCELADA'
            )
        ),


    CONSTRAINT chk_renovaciones_fechas
        CHECK (
            fecha_finalizacion IS NULL
            OR fecha_finalizacion >= fecha_inicio
        ),


    CONSTRAINT chk_renovaciones_documentos_distintos
        CHECK (
            documento_renovado_id IS NULL
            OR documento_renovado_id <> documento_anterior_id
        ),


    CONSTRAINT chk_renovaciones_observaciones
        CHECK (
            observaciones IS NULL
            OR LENGTH(TRIM(observaciones)) > 0
        ),


    CONSTRAINT chk_renovaciones_completada
        CHECK (
            estado <> 'COMPLETADA'
            OR (
                documento_renovado_id IS NOT NULL
                AND fecha_finalizacion IS NOT NULL
                AND finalizado_por IS NOT NULL
            )
        )
);


-- ============================================================
-- SOLO UNA RENOVACIÓN ACTIVA POR DOCUMENTO
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS
uq_renovaciones_documento_activo
ON renovaciones (
    documento_anterior_id
)
WHERE estado = 'EN_PROCESO';


-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS
idx_renovaciones_documento_anterior
ON renovaciones (
    documento_anterior_id
);


CREATE INDEX IF NOT EXISTS
idx_renovaciones_documento_renovado
ON renovaciones (
    documento_renovado_id
);


CREATE INDEX IF NOT EXISTS
idx_renovaciones_tramite
ON renovaciones (
    tramite_id
);


CREATE INDEX IF NOT EXISTS
idx_renovaciones_responsable
ON renovaciones (
    responsable_usuario_id
);


CREATE INDEX IF NOT EXISTS
idx_renovaciones_estado
ON renovaciones (
    estado
);


CREATE INDEX IF NOT EXISTS
idx_renovaciones_fecha_inicio
ON renovaciones (
    fecha_inicio
);


CREATE INDEX IF NOT EXISTS
idx_renovaciones_fecha_finalizacion
ON renovaciones (
    fecha_finalizacion
);


-- ============================================================
-- COMENTARIOS
-- ============================================================

COMMENT ON TABLE renovaciones IS
'Procesos de renovación de documentos de operatividad en CERTIIA.';


COMMENT ON COLUMN renovaciones.documento_anterior_id IS
'Documento vigente o histórico que origina el proceso de renovación.';


COMMENT ON COLUMN renovaciones.documento_renovado_id IS
'Nuevo documento obtenido al finalizar exitosamente la renovación.';


COMMENT ON COLUMN renovaciones.tramite_id IS
'Trámite administrativo relacionado con la renovación, cuando corresponda.';


COMMENT ON COLUMN renovaciones.responsable_usuario_id IS
'Usuario responsable de gestionar la renovación.';


COMMENT ON COLUMN renovaciones.estado IS
'Estado del proceso: EN_PROCESO, COMPLETADA o CANCELADA.';


COMMENT ON COLUMN renovaciones.fecha_inicio IS
'Fecha en la que se inició formalmente la renovación.';


COMMENT ON COLUMN renovaciones.fecha_finalizacion IS
'Fecha en la que concluyó la renovación.';


COMMIT;