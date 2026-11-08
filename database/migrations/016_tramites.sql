BEGIN;


-- ============================================================
-- CATÁLOGO DE ESTADOS DE TRÁMITE
-- ============================================================

CREATE TABLE IF NOT EXISTS tramite_estados (
    codigo VARCHAR(30) PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL,
    orden INTEGER NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_tramite_estados_orden
        CHECK (orden > 0)
);


-- ============================================================
-- ESTADOS PERMITIDOS
-- ============================================================

INSERT INTO tramite_estados (
    codigo,
    nombre,
    orden
)
VALUES
    ('PENDIENTE', 'Pendiente', 1),
    ('EN_TRAMITE', 'En trámite', 2),
    ('OBSERVADO', 'Observado', 3),
    ('SUBSANADO', 'Subsanado', 4),
    ('APROBADO', 'Aprobado', 5),
    ('RECHAZADO', 'Rechazado', 6),
    ('EMITIDO', 'Emitido', 7)
ON CONFLICT (codigo) DO NOTHING;


-- ============================================================
-- TRÁMITES
-- ============================================================

CREATE TABLE IF NOT EXISTS tramites (
    id BIGSERIAL PRIMARY KEY,

    documento_id BIGINT NOT NULL,

    entidad_emisora_id BIGINT NOT NULL,

    numero_expediente VARCHAR(120) NOT NULL,

    fecha_inicio DATE NOT NULL,

    fecha_finalizacion DATE,

    responsable_usuario_id BIGINT NOT NULL,

    estado_codigo VARCHAR(30)
        NOT NULL
        DEFAULT 'PENDIENTE',

    observaciones VARCHAR(1500),

    creado_por BIGINT NOT NULL,

    fecha_creacion TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    fecha_actualizacion TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),


    CONSTRAINT fk_tramites_documento
        FOREIGN KEY (documento_id)
        REFERENCES documentos(id)
        ON DELETE RESTRICT,


    CONSTRAINT fk_tramites_entidad_emisora
        FOREIGN KEY (entidad_emisora_id)
        REFERENCES entidades_emisoras(id)
        ON DELETE RESTRICT,


    CONSTRAINT fk_tramites_responsable
        FOREIGN KEY (responsable_usuario_id)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,


    CONSTRAINT fk_tramites_estado
        FOREIGN KEY (estado_codigo)
        REFERENCES tramite_estados(codigo)
        ON DELETE RESTRICT,


    CONSTRAINT fk_tramites_creado_por
        FOREIGN KEY (creado_por)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,


    CONSTRAINT ck_tramites_fechas
        CHECK (
            fecha_finalizacion IS NULL
            OR fecha_finalizacion >= fecha_inicio
        ),


    CONSTRAINT ck_tramites_expediente_no_vacio
        CHECK (
            BTRIM(numero_expediente) <> ''
        ),


    CONSTRAINT ck_tramites_observaciones_no_vacias
        CHECK (
            observaciones IS NULL
            OR BTRIM(observaciones) <> ''
        )
);


-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS
    idx_tramites_documento
ON tramites(documento_id);


CREATE INDEX IF NOT EXISTS
    idx_tramites_entidad
ON tramites(entidad_emisora_id);


CREATE INDEX IF NOT EXISTS
    idx_tramites_responsable
ON tramites(responsable_usuario_id);


CREATE INDEX IF NOT EXISTS
    idx_tramites_estado
ON tramites(estado_codigo);


CREATE INDEX IF NOT EXISTS
    idx_tramites_fecha_inicio
ON tramites(fecha_inicio);


CREATE INDEX IF NOT EXISTS
    idx_tramites_fecha_creacion
ON tramites(fecha_creacion);


COMMIT;