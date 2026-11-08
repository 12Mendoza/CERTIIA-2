BEGIN;

-- =========================================================
-- ROLES
-- =========================================================
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(40) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- PERMISOS
-- =========================================================
CREATE TABLE IF NOT EXISTS permisos (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(80) NOT NULL UNIQUE,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    modulo VARCHAR(80) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- RELACIÓN ROLES - PERMISOS
-- =========================================================
CREATE TABLE IF NOT EXISTS rol_permisos (
    rol_id BIGINT NOT NULL
        REFERENCES roles(id)
        ON DELETE CASCADE,

    permiso_id BIGINT NOT NULL
        REFERENCES permisos(id)
        ON DELETE CASCADE,

    fecha_asignacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (rol_id, permiso_id)
);

-- =========================================================
-- USUARIOS
-- =========================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,

    rol_id BIGINT NOT NULL
        REFERENCES roles(id),

    nombres VARCHAR(120) NOT NULL,
    apellidos VARCHAR(120) NOT NULL,

    email VARCHAR(180) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    intentos_fallidos INTEGER NOT NULL DEFAULT 0,

    bloqueado_hasta TIMESTAMPTZ,

    debe_cambiar_password BOOLEAN NOT NULL DEFAULT TRUE,

    ultimo_login TIMESTAMPTZ,

    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- SESIONES
-- =========================================================
CREATE TABLE IF NOT EXISTS sesiones (
    id BIGSERIAL PRIMARY KEY,

    usuario_id BIGINT NOT NULL
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    refresh_token_hash TEXT NOT NULL,

    ip VARCHAR(100),

    user_agent TEXT,

    fecha_expiracion TIMESTAMPTZ NOT NULL,

    revocada BOOLEAN NOT NULL DEFAULT FALSE,

    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- RESTABLECIMIENTO DE CONTRASEÑA
-- =========================================================
CREATE TABLE IF NOT EXISTS tokens_restablecimiento (
    id BIGSERIAL PRIMARY KEY,

    usuario_id BIGINT NOT NULL
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    token_hash TEXT NOT NULL UNIQUE,

    fecha_expiracion TIMESTAMPTZ NOT NULL,

    utilizado BOOLEAN NOT NULL DEFAULT FALSE,

    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- AUDITORÍA
-- =========================================================
CREATE TABLE IF NOT EXISTS auditoria (
    id BIGSERIAL PRIMARY KEY,

    usuario_id BIGINT
        REFERENCES usuarios(id)
        ON DELETE SET NULL,

    evento VARCHAR(80) NOT NULL,

    modulo VARCHAR(80) NOT NULL,

    descripcion TEXT,

    ip VARCHAR(100),

    user_agent TEXT,

    fecha_evento TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- ÍNDICES
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_usuarios_rol
ON usuarios(rol_id);

CREATE INDEX IF NOT EXISTS idx_usuarios_activo
ON usuarios(activo);

CREATE INDEX IF NOT EXISTS idx_sesiones_usuario
ON sesiones(usuario_id);

CREATE INDEX IF NOT EXISTS idx_auditoria_usuario
ON auditoria(usuario_id);

CREATE INDEX IF NOT EXISTS idx_auditoria_evento
ON auditoria(evento);

CREATE INDEX IF NOT EXISTS idx_auditoria_fecha
ON auditoria(fecha_evento);

-- =========================================================
-- ROLES INICIALES
-- =========================================================
INSERT INTO roles (
    codigo,
    nombre,
    descripcion
)
VALUES
(
    'ADMIN',
    'Administrador',
    'Administrador general del sistema CERTIIA'
),
(
    'RESPONSABLE',
    'Responsable',
    'Responsable de la gestión documental y de tiendas'
),
(
    'CONSULTA',
    'Consulta',
    'Usuario con acceso únicamente de consulta'
)
ON CONFLICT (codigo) DO NOTHING;

COMMIT;