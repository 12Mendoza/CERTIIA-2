BEGIN;

-- ============================================================
-- CERTIIA
-- MIGRACIÓN 033
-- ÉPICA 13 - CONFIGURACIÓN DEL SISTEMA
-- HU-050 / HU-051 / HU-052
-- ============================================================

-- ============================================================
-- HU-050 - PARÁMETROS GENERALES
-- ============================================================

CREATE TABLE IF NOT EXISTS config_parametros (
    clave VARCHAR(100) PRIMARY KEY,
    nombre VARCHAR(160) NOT NULL,
    descripcion VARCHAR(500),
    tipo VARCHAR(20) NOT NULL,
    valor TEXT NOT NULL,
    valor_defecto TEXT NOT NULL,
    minimo NUMERIC,
    maximo NUMERIC,
    sensible BOOLEAN NOT NULL DEFAULT FALSE,
    editable BOOLEAN NOT NULL DEFAULT TRUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    modificado_por BIGINT,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_config_parametros_usuario
        FOREIGN KEY (modificado_por)
        REFERENCES usuarios(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_config_parametros_tipo
        CHECK (tipo IN ('ENTERO', 'DECIMAL', 'BOOLEANO', 'TEXTO')),

    CONSTRAINT chk_config_parametros_rango
        CHECK (
            minimo IS NULL
            OR maximo IS NULL
            OR minimo <= maximo
        )
);

CREATE TABLE IF NOT EXISTS config_parametros_historial (
    id BIGSERIAL PRIMARY KEY,
    parametro_clave VARCHAR(100) NOT NULL,
    valor_anterior TEXT,
    valor_nuevo TEXT NOT NULL,
    modificado_por BIGINT,
    fecha_cambio TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_config_param_hist_parametro
        FOREIGN KEY (parametro_clave)
        REFERENCES config_parametros(clave)
        ON DELETE RESTRICT,

    CONSTRAINT fk_config_param_hist_usuario
        FOREIGN KEY (modificado_por)
        REFERENCES usuarios(id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_config_parametros_historial_clave_fecha
ON config_parametros_historial(parametro_clave, fecha_cambio DESC);

INSERT INTO config_parametros (
    clave,
    nombre,
    descripcion,
    tipo,
    valor,
    valor_defecto,
    minimo,
    maximo,
    sensible,
    editable
)
VALUES
(
    'LOGIN_MAX_INTENTOS',
    'Máximo de intentos de acceso',
    'Cantidad de intentos fallidos antes del bloqueo temporal.',
    'ENTERO',
    '5',
    '5',
    3,
    10,
    FALSE,
    TRUE
),
(
    'LOGIN_BLOQUEO_MINUTOS',
    'Minutos de bloqueo',
    'Duración del bloqueo temporal después de alcanzar el máximo de intentos.',
    'ENTERO',
    '15',
    '15',
    1,
    120,
    FALSE,
    TRUE
),
(
    'PASSWORD_RESET_MINUTOS',
    'Vigencia de recuperación',
    'Minutos de validez del mecanismo de restablecimiento de contraseña.',
    'ENTERO',
    '15',
    '15',
    5,
    60,
    FALSE,
    TRUE
),
(
    'NOTIFICACIONES_MAX_REINTENTOS',
    'Máximo de reintentos de notificación',
    'Cantidad máxima de reintentos para una notificación fallida.',
    'ENTERO',
    '3',
    '3',
    1,
    10,
    FALSE,
    TRUE
),
(
    'REPORTES_LIMITE_FILAS',
    'Límite de filas de reportes',
    'Límite funcional máximo recomendado para exportaciones y reportes.',
    'ENTERO',
    '5000',
    '5000',
    100,
    50000,
    FALSE,
    TRUE
),
(
    'IA_MIN_MUESTRAS',
    'Mínimo de muestras para IA',
    'Cantidad mínima de resultados reales validados requerida para entrenamiento.',
    'ENTERO',
    '12',
    '12',
    8,
    1000,
    FALSE,
    TRUE
)
ON CONFLICT (clave) DO NOTHING;


-- ============================================================
-- HU-051 - CATÁLOGOS CONFIGURABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS config_catalogos (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(80) NOT NULL UNIQUE,
    nombre VARCHAR(160) NOT NULL,
    descripcion VARCHAR(500),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_por BIGINT,
    modificado_por BIGINT,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_config_catalogos_creado_por
        FOREIGN KEY (creado_por)
        REFERENCES usuarios(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_config_catalogos_modificado_por
        FOREIGN KEY (modificado_por)
        REFERENCES usuarios(id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS config_catalogo_valores (
    id BIGSERIAL PRIMARY KEY,
    catalogo_id BIGINT NOT NULL,
    codigo VARCHAR(80) NOT NULL,
    nombre VARCHAR(160) NOT NULL,
    descripcion VARCHAR(500),
    orden INTEGER NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_por BIGINT,
    modificado_por BIGINT,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_config_catalogo_valores_catalogo
        FOREIGN KEY (catalogo_id)
        REFERENCES config_catalogos(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_config_catalogo_valores_creado_por
        FOREIGN KEY (creado_por)
        REFERENCES usuarios(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_config_catalogo_valores_modificado_por
        FOREIGN KEY (modificado_por)
        REFERENCES usuarios(id)
        ON DELETE SET NULL,

    CONSTRAINT uq_config_catalogo_valor
        UNIQUE (catalogo_id, codigo)
);

CREATE INDEX IF NOT EXISTS idx_config_catalogo_valores_catalogo
ON config_catalogo_valores(catalogo_id, activo, orden, nombre);

INSERT INTO config_catalogos (codigo, nombre, descripcion)
VALUES
(
    'CATEGORIAS_DOCUMENTO',
    'Categorías de documento',
    'Clasificaciones configurables para tipos de documentos de operatividad.'
),
(
    'NIVELES_RIESGO_TIENDA',
    'Niveles de riesgo de tienda',
    'Clasificación del nivel de riesgo operativo de una tienda.'
)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO config_catalogo_valores (
    catalogo_id,
    codigo,
    nombre,
    orden
)
SELECT c.id, v.codigo, v.nombre, v.orden
FROM config_catalogos c
CROSS JOIN (
    VALUES
        ('LICENCIA', 'Licencia', 10),
        ('CERTIFICADO', 'Certificado', 20),
        ('INSPECCION', 'Inspección', 30),
        ('OTRO', 'Otro', 99)
) AS v(codigo, nombre, orden)
WHERE c.codigo = 'CATEGORIAS_DOCUMENTO'
ON CONFLICT (catalogo_id, codigo) DO NOTHING;

INSERT INTO config_catalogo_valores (
    catalogo_id,
    codigo,
    nombre,
    orden
)
SELECT c.id, v.codigo, v.nombre, v.orden
FROM config_catalogos c
CROSS JOIN (
    VALUES
        ('BAJO', 'Bajo', 10),
        ('MEDIO', 'Medio', 20),
        ('ALTO', 'Alto', 30)
) AS v(codigo, nombre, orden)
WHERE c.codigo = 'NIVELES_RIESGO_TIENDA'
ON CONFLICT (catalogo_id, codigo) DO NOTHING;


-- ============================================================
-- HU-052 - CANALES Y REGLAS DE NOTIFICACIÓN
-- ============================================================

CREATE TABLE IF NOT EXISTS config_canales_notificacion (
    codigo VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(400),
    activo BOOLEAN NOT NULL DEFAULT FALSE,
    requiere_proveedor BOOLEAN NOT NULL DEFAULT FALSE,
    modificado_por BIGINT,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_config_canales_usuario
        FOREIGN KEY (modificado_por)
        REFERENCES usuarios(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_config_canal_codigo
        CHECK (codigo IN ('SISTEMA', 'EMAIL'))
);

INSERT INTO config_canales_notificacion (
    codigo,
    nombre,
    descripcion,
    activo,
    requiere_proveedor
)
VALUES
(
    'SISTEMA',
    'Notificación interna',
    'Entrega la notificación dentro de CERTIIA.',
    TRUE,
    FALSE
),
(
    'EMAIL',
    'Correo electrónico',
    'Requiere un proveedor de correo configurado antes del envío real.',
    FALSE,
    TRUE
)
ON CONFLICT (codigo) DO NOTHING;

-- La tabla fue creada en la Épica 8. Agregamos trazabilidad adicional.
ALTER TABLE alerta_notificacion_reglas
ADD COLUMN IF NOT EXISTS actualizado_por BIGINT;

ALTER TABLE alerta_notificacion_reglas
ADD COLUMN IF NOT EXISTS descripcion VARCHAR(300);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_alerta_notificacion_regla_actualizado_por'
    ) THEN
        ALTER TABLE alerta_notificacion_reglas
        ADD CONSTRAINT fk_alerta_notificacion_regla_actualizado_por
        FOREIGN KEY (actualizado_por)
        REFERENCES usuarios(id)
        ON DELETE SET NULL;
    END IF;
END
$$;

COMMIT;
