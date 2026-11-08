BEGIN;

-- ============================================================
-- HU-027
-- HISTORIAL DE ESTADOS DE TRÁMITES
-- ============================================================

CREATE TABLE IF NOT EXISTS tramite_estado_historial (
    id BIGSERIAL PRIMARY KEY,

    tramite_id BIGINT NOT NULL,

    estado_anterior_codigo VARCHAR(30),

    estado_nuevo_codigo VARCHAR(30) NOT NULL,

    comentario VARCHAR(1500) NOT NULL,

    usuario_id BIGINT NOT NULL,

    fecha_cambio TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_tramite_historial_tramite
        FOREIGN KEY (tramite_id)
        REFERENCES tramites(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_tramite_historial_estado_anterior
        FOREIGN KEY (estado_anterior_codigo)
        REFERENCES tramite_estados(codigo)
        ON DELETE RESTRICT,

    CONSTRAINT fk_tramite_historial_estado_nuevo
        FOREIGN KEY (estado_nuevo_codigo)
        REFERENCES tramite_estados(codigo)
        ON DELETE RESTRICT,

    CONSTRAINT fk_tramite_historial_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    CONSTRAINT ck_tramite_historial_comentario
        CHECK (
            BTRIM(comentario) <> ''
        ),

    CONSTRAINT ck_tramite_historial_estados_distintos
        CHECK (
            estado_anterior_codigo IS NULL
            OR estado_anterior_codigo <> estado_nuevo_codigo
        )
);


-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS
idx_tramite_historial_tramite
ON tramite_estado_historial (
    tramite_id
);


CREATE INDEX IF NOT EXISTS
idx_tramite_historial_fecha
ON tramite_estado_historial (
    fecha_cambio
);


CREATE INDEX IF NOT EXISTS
idx_tramite_historial_usuario
ON tramite_estado_historial (
    usuario_id
);


-- ============================================================
-- CREAR HISTORIAL INICIAL PARA TRÁMITES YA EXISTENTES
-- ============================================================

INSERT INTO tramite_estado_historial (
    tramite_id,
    estado_anterior_codigo,
    estado_nuevo_codigo,
    comentario,
    usuario_id,
    fecha_cambio
)
SELECT
    t.id,
    NULL,
    t.estado_codigo,
    'Estado inicial del trámite',
    t.creado_por,
    t.fecha_creacion
FROM tramites t
WHERE NOT EXISTS (
    SELECT 1
    FROM tramite_estado_historial h
    WHERE h.tramite_id = t.id
);


COMMIT;
