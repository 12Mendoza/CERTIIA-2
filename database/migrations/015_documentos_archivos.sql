-- ============================================================
-- CERTIIA
-- MIGRACIÓN 015
-- ARCHIVOS DIGITALES DE DOCUMENTOS
-- HU-019 - ADJUNTAR DOCUMENTO DIGITAL
-- ============================================================

CREATE TABLE IF NOT EXISTS documento_archivos (
    id BIGSERIAL PRIMARY KEY,

    documento_id BIGINT NOT NULL,

    nombre_original VARCHAR(255) NOT NULL,

    nombre_interno VARCHAR(255) NOT NULL,

    mime_type VARCHAR(150) NOT NULL,

    tamano_bytes BIGINT NOT NULL,

    hash_sha256 CHAR(64) NOT NULL,

    ruta_archivo VARCHAR(500) NOT NULL,

    cargado_por BIGINT NOT NULL,

    fecha_carga TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    CONSTRAINT fk_documento_archivos_documento
        FOREIGN KEY (documento_id)
        REFERENCES documentos(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_documento_archivos_usuario
        FOREIGN KEY (cargado_por)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_documento_archivos_tamano
        CHECK (tamano_bytes > 0),

    CONSTRAINT chk_documento_archivos_hash
        CHECK (
            hash_sha256 ~ '^[A-Fa-f0-9]{64}$'
        )
);


-- ============================================================
-- NOMBRE INTERNO ÚNICO
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS
    ux_documento_archivos_nombre_interno
ON documento_archivos (
    LOWER(nombre_interno)
);


-- ============================================================
-- ÍNDICES DE CONSULTA
-- ============================================================

CREATE INDEX IF NOT EXISTS
    ix_documento_archivos_documento
ON documento_archivos (
    documento_id
);


CREATE INDEX IF NOT EXISTS
    ix_documento_archivos_cargado_por
ON documento_archivos (
    cargado_por
);


CREATE INDEX IF NOT EXISTS
    ix_documento_archivos_fecha_carga
ON documento_archivos (
    fecha_carga DESC
);


CREATE INDEX IF NOT EXISTS
    ix_documento_archivos_hash_sha256
ON documento_archivos (
    hash_sha256
);