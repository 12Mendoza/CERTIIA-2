BEGIN;

-- ============================================================
-- HU-029
-- EVIDENCIAS DOCUMENTALES DE TRÁMITES
-- ============================================================

CREATE TABLE IF NOT EXISTS tramite_evidencias (
    id BIGSERIAL PRIMARY KEY,

    tramite_id BIGINT NOT NULL,

    observacion_id BIGINT,

    subsanacion_id BIGINT,

    nombre_original VARCHAR(255) NOT NULL,

    nombre_interno VARCHAR(255) NOT NULL,

    ruta_relativa VARCHAR(500) NOT NULL,

    mime_type VARCHAR(120) NOT NULL,

    extension VARCHAR(20) NOT NULL,

    tamano_bytes BIGINT NOT NULL,

    hash_sha256 VARCHAR(64) NOT NULL,

    descripcion VARCHAR(500),

    subido_por BIGINT NOT NULL,

    fecha_subida TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    activo BOOLEAN NOT NULL DEFAULT TRUE,


    CONSTRAINT fk_tramite_evidencia_tramite
        FOREIGN KEY (tramite_id)
        REFERENCES tramites(id)
        ON DELETE RESTRICT,


    CONSTRAINT fk_tramite_evidencia_observacion
        FOREIGN KEY (observacion_id)
        REFERENCES tramite_observaciones(id)
        ON DELETE RESTRICT,


    CONSTRAINT fk_tramite_evidencia_subsanacion
        FOREIGN KEY (subsanacion_id)
        REFERENCES tramite_subsanaciones(id)
        ON DELETE RESTRICT,


    CONSTRAINT fk_tramite_evidencia_usuario
        FOREIGN KEY (subido_por)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,


    CONSTRAINT uq_tramite_evidencia_nombre_interno
        UNIQUE (nombre_interno),


    CONSTRAINT ck_tramite_evidencia_nombre_original
        CHECK (
            BTRIM(nombre_original) <> ''
        ),


    CONSTRAINT ck_tramite_evidencia_nombre_interno
        CHECK (
            BTRIM(nombre_interno) <> ''
        ),


    CONSTRAINT ck_tramite_evidencia_ruta
        CHECK (
            BTRIM(ruta_relativa) <> ''
        ),


    CONSTRAINT ck_tramite_evidencia_mime
        CHECK (
            BTRIM(mime_type) <> ''
        ),


    CONSTRAINT ck_tramite_evidencia_extension
        CHECK (
            BTRIM(extension) <> ''
        ),


    CONSTRAINT ck_tramite_evidencia_tamano
        CHECK (
            tamano_bytes > 0
        ),


    CONSTRAINT ck_tramite_evidencia_hash
        CHECK (
            hash_sha256 ~ '^[A-Fa-f0-9]{64}$'
        ),


    CONSTRAINT ck_tramite_evidencia_descripcion
        CHECK (
            descripcion IS NULL
            OR BTRIM(descripcion) <> ''
        ),


    CONSTRAINT ck_tramite_evidencia_evento
        CHECK (
            NOT (
                observacion_id IS NOT NULL
                AND subsanacion_id IS NOT NULL
            )
        )
);


-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS
idx_tramite_evidencias_tramite
ON tramite_evidencias (
    tramite_id
);


CREATE INDEX IF NOT EXISTS
idx_tramite_evidencias_observacion
ON tramite_evidencias (
    observacion_id
);


CREATE INDEX IF NOT EXISTS
idx_tramite_evidencias_subsanacion
ON tramite_evidencias (
    subsanacion_id
);


CREATE INDEX IF NOT EXISTS
idx_tramite_evidencias_hash
ON tramite_evidencias (
    hash_sha256
);


CREATE INDEX IF NOT EXISTS
idx_tramite_evidencias_fecha
ON tramite_evidencias (
    fecha_subida
);


COMMIT;