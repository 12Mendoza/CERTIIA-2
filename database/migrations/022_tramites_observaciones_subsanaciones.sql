BEGIN;

-- ============================================================
-- HU-028
-- OBSERVACIONES DE TRÁMITES
-- ============================================================

CREATE TABLE IF NOT EXISTS tramite_observaciones (
    id BIGSERIAL PRIMARY KEY,

    tramite_id BIGINT NOT NULL,

    descripcion VARCHAR(1500) NOT NULL,

    fecha_observacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    responsable_usuario_id BIGINT NOT NULL,

    estado VARCHAR(20) NOT NULL DEFAULT 'ABIERTA',

    creado_por BIGINT NOT NULL,

    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_tramite_observacion_tramite
        FOREIGN KEY (tramite_id)
        REFERENCES tramites(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_tramite_observacion_responsable
        FOREIGN KEY (responsable_usuario_id)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_tramite_observacion_creado_por
        FOREIGN KEY (creado_por)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    CONSTRAINT ck_tramite_observacion_descripcion
        CHECK (
            BTRIM(descripcion) <> ''
        ),

    CONSTRAINT ck_tramite_observacion_estado
        CHECK (
            estado IN (
                'ABIERTA',
                'SUBSANADA'
            )
        )
);


-- ============================================================
-- SUBSANACIONES RELACIONADAS
-- ============================================================

CREATE TABLE IF NOT EXISTS tramite_subsanaciones (
    id BIGSERIAL PRIMARY KEY,

    observacion_id BIGINT NOT NULL,

    descripcion VARCHAR(1500) NOT NULL,

    fecha_subsanacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    responsable_usuario_id BIGINT NOT NULL,

    creado_por BIGINT NOT NULL,

    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_tramite_subsanacion_observacion
        FOREIGN KEY (observacion_id)
        REFERENCES tramite_observaciones(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_tramite_subsanacion_responsable
        FOREIGN KEY (responsable_usuario_id)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_tramite_subsanacion_creado_por
        FOREIGN KEY (creado_por)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    CONSTRAINT ck_tramite_subsanacion_descripcion
        CHECK (
            BTRIM(descripcion) <> ''
        )
);


-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS
idx_tramite_observaciones_tramite
ON tramite_observaciones (
    tramite_id
);


CREATE INDEX IF NOT EXISTS
idx_tramite_observaciones_estado
ON tramite_observaciones (
    estado
);


CREATE INDEX IF NOT EXISTS
idx_tramite_observaciones_fecha
ON tramite_observaciones (
    fecha_observacion
);


CREATE INDEX IF NOT EXISTS
idx_tramite_subsanaciones_observacion
ON tramite_subsanaciones (
    observacion_id
);


CREATE INDEX IF NOT EXISTS
idx_tramite_subsanaciones_fecha
ON tramite_subsanaciones (
    fecha_subsanacion
);


COMMIT;