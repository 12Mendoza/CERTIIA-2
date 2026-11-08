BEGIN;

-- ============================================================
-- CERTIIA
-- MIGRACIÓN 026
-- ÉPICA 8 - ALERTAS Y CALENDARIO
-- HU-034 / HU-035 / HU-036 / HU-037
-- ============================================================

-- ============================================================
-- ALERTAS DE VENCIMIENTO
-- ============================================================

CREATE TABLE IF NOT EXISTS alertas (
    id BIGSERIAL PRIMARY KEY,

    documento_id BIGINT NOT NULL,

    tipo VARCHAR(30) NOT NULL DEFAULT 'VENCIMIENTO',

    nivel VARCHAR(20) NOT NULL,

    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',

    dias_restantes INTEGER,

    fecha_vencimiento DATE NOT NULL,

    mensaje VARCHAR(1000) NOT NULL,

    fecha_generacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    fecha_ultima_evaluacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    atendida_por BIGINT,

    fecha_atencion TIMESTAMPTZ,

    comentario_atencion VARCHAR(1000),

    resuelta_automaticamente BOOLEAN NOT NULL DEFAULT FALSE,

    fecha_resolucion TIMESTAMPTZ,

    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_alertas_documento
        FOREIGN KEY (documento_id)
        REFERENCES documentos(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_alertas_atendida_por
        FOREIGN KEY (atendida_por)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_alertas_tipo
        CHECK (
            tipo IN (
                'VENCIMIENTO'
            )
        ),

    CONSTRAINT chk_alertas_nivel
        CHECK (
            nivel IN (
                'POR_VENCER',
                'CRITICO',
                'VENCIDO'
            )
        ),

    CONSTRAINT chk_alertas_estado
        CHECK (
            estado IN (
                'PENDIENTE',
                'ATENDIDA',
                'RESUELTA'
            )
        ),

    CONSTRAINT chk_alertas_mensaje
        CHECK (
            LENGTH(TRIM(mensaje)) > 0
        ),

    CONSTRAINT chk_alertas_atencion
        CHECK (
            (
                estado <> 'ATENDIDA'
            )
            OR
            (
                atendida_por IS NOT NULL
                AND fecha_atencion IS NOT NULL
            )
        ),

    CONSTRAINT chk_alertas_resolucion
        CHECK (
            (
                estado <> 'RESUELTA'
            )
            OR
            (
                fecha_resolucion IS NOT NULL
            )
        )
);

-- Una alerta por documento, nivel y vencimiento.
-- Si el documento entra a un nuevo nivel, se crea una alerta diferente.
CREATE UNIQUE INDEX IF NOT EXISTS uq_alertas_documento_nivel_vencimiento
ON alertas (
    documento_id,
    tipo,
    nivel,
    fecha_vencimiento
);

CREATE INDEX IF NOT EXISTS idx_alertas_documento
ON alertas(documento_id);

CREATE INDEX IF NOT EXISTS idx_alertas_estado
ON alertas(estado);

CREATE INDEX IF NOT EXISTS idx_alertas_nivel
ON alertas(nivel);

CREATE INDEX IF NOT EXISTS idx_alertas_fecha_vencimiento
ON alertas(fecha_vencimiento);

CREATE INDEX IF NOT EXISTS idx_alertas_fecha_generacion
ON alertas(fecha_generacion);


-- ============================================================
-- REGLAS DE NOTIFICACIÓN DE ALERTAS
--
-- Esta estructura queda preparada para que la Épica 13
-- permita administrar destinatarios/canales desde configuración.
-- En esta épica se crean reglas internas por rol.
-- ============================================================

CREATE TABLE IF NOT EXISTS alerta_notificacion_reglas (
    id BIGSERIAL PRIMARY KEY,

    nivel VARCHAR(20) NOT NULL,

    rol_id BIGINT NOT NULL,

    canal VARCHAR(20) NOT NULL DEFAULT 'SISTEMA',

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    max_reintentos INTEGER NOT NULL DEFAULT 3,

    creado_por BIGINT,

    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_alerta_notificacion_regla_rol
        FOREIGN KEY (rol_id)
        REFERENCES roles(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_alerta_notificacion_regla_creado_por
        FOREIGN KEY (creado_por)
        REFERENCES usuarios(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_alerta_notificacion_regla_nivel
        CHECK (
            nivel IN (
                'POR_VENCER',
                'CRITICO',
                'VENCIDO'
            )
        ),

    CONSTRAINT chk_alerta_notificacion_regla_canal
        CHECK (
            canal IN (
                'SISTEMA',
                'EMAIL'
            )
        ),

    CONSTRAINT chk_alerta_notificacion_regla_reintentos
        CHECK (
            max_reintentos BETWEEN 1 AND 10
        )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_alerta_notificacion_regla
ON alerta_notificacion_reglas (
    nivel,
    rol_id,
    canal
);


-- ============================================================
-- NOTIFICACIONES GENERADAS
-- ============================================================

CREATE TABLE IF NOT EXISTS notificaciones_alerta (
    id BIGSERIAL PRIMARY KEY,

    alerta_id BIGINT NOT NULL,

    usuario_id BIGINT NOT NULL,

    nivel VARCHAR(20) NOT NULL,

    canal VARCHAR(20) NOT NULL,

    destinatario VARCHAR(200),

    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',

    intentos INTEGER NOT NULL DEFAULT 0,

    max_reintentos INTEGER NOT NULL DEFAULT 3,

    contenido JSONB NOT NULL DEFAULT '{}'::jsonb,

    fecha_programada TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    fecha_ultimo_intento TIMESTAMPTZ,

    fecha_envio TIMESTAMPTZ,

    ultimo_error VARCHAR(1000),

    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_notificaciones_alerta_alerta
        FOREIGN KEY (alerta_id)
        REFERENCES alertas(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notificaciones_alerta_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_notificaciones_alerta_nivel
        CHECK (
            nivel IN (
                'POR_VENCER',
                'CRITICO',
                'VENCIDO'
            )
        ),

    CONSTRAINT chk_notificaciones_alerta_canal
        CHECK (
            canal IN (
                'SISTEMA',
                'EMAIL'
            )
        ),

    CONSTRAINT chk_notificaciones_alerta_estado
        CHECK (
            estado IN (
                'PENDIENTE',
                'ENVIADA',
                'FALLIDA'
            )
        ),

    CONSTRAINT chk_notificaciones_alerta_intentos
        CHECK (
            intentos >= 0
            AND max_reintentos BETWEEN 1 AND 10
            AND intentos <= max_reintentos
        )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_notificacion_alerta_usuario_canal
ON notificaciones_alerta (
    alerta_id,
    usuario_id,
    canal
);

CREATE INDEX IF NOT EXISTS idx_notificaciones_alerta_estado
ON notificaciones_alerta(estado);

CREATE INDEX IF NOT EXISTS idx_notificaciones_alerta_usuario
ON notificaciones_alerta(usuario_id);

CREATE INDEX IF NOT EXISTS idx_notificaciones_alerta_fecha
ON notificaciones_alerta(fecha_creacion);


-- ============================================================
-- REGLAS INTERNAS INICIALES DE NOTIFICACIÓN
-- HU-036
--
-- ADMIN y RESPONSABLE reciben notificación dentro del sistema.
-- El canal EMAIL queda preparado pero no se activa por defecto.
-- ============================================================

INSERT INTO alerta_notificacion_reglas (
    nivel,
    rol_id,
    canal,
    activo,
    max_reintentos
)
SELECT
    niveles.nivel,
    r.id,
    'SISTEMA',
    TRUE,
    3
FROM roles r
CROSS JOIN (
    VALUES
        ('POR_VENCER'),
        ('CRITICO'),
        ('VENCIDO')
) AS niveles(nivel)
WHERE r.codigo IN (
    'ADMIN',
    'RESPONSABLE'
)
ON CONFLICT (
    nivel,
    rol_id,
    canal
)
DO NOTHING;

COMMIT;
