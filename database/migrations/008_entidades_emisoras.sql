-- ============================================================
-- CERTIIA
-- MIGRACIÓN 008
-- ÉPICA 3 - ENTIDADES EMISORAS
-- HU-014 GESTIONAR ENTIDAD EMISORA
-- ============================================================


-- ============================================================
-- TABLA ENTIDADES EMISORAS
-- ============================================================
CREATE TABLE IF NOT EXISTS entidades_emisoras (

    id BIGSERIAL PRIMARY KEY,

    tipo VARCHAR(30) NOT NULL,

    nombre VARCHAR(180) NOT NULL,

    ruc VARCHAR(11),

    ubicacion VARCHAR(250) NOT NULL,

    datos_contacto VARCHAR(250),

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),


    -- ========================================================
    -- VALIDACIONES
    -- ========================================================

    CONSTRAINT chk_entidad_tipo
        CHECK (
            tipo IN (
                'MUNICIPALIDAD',
                'ENTIDAD_PUBLICA',
                'EMPRESA_PRIVADA',
                'PROFESIONAL'
            )
        ),

    CONSTRAINT chk_entidad_nombre
        CHECK (
            LENGTH(TRIM(nombre)) > 0
        ),

    CONSTRAINT chk_entidad_ubicacion
        CHECK (
            LENGTH(TRIM(ubicacion)) > 0
        ),

    CONSTRAINT chk_entidad_ruc
        CHECK (
            ruc IS NULL
            OR ruc ~ '^[0-9]{11}$'
        )
);


-- ============================================================
-- EVITAR DUPLICADOS LÓGICOS BÁSICOS POR NOMBRE Y TIPO
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS uq_entidad_tipo_nombre
ON entidades_emisoras (
    UPPER(tipo),
    UPPER(TRIM(nombre))
);


-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_entidades_emisoras_activo
ON entidades_emisoras (activo);


CREATE INDEX IF NOT EXISTS idx_entidades_emisoras_tipo
ON entidades_emisoras (tipo);


CREATE INDEX IF NOT EXISTS idx_entidades_emisoras_nombre
ON entidades_emisoras (nombre);


CREATE INDEX IF NOT EXISTS idx_entidades_emisoras_ruc
ON entidades_emisoras (ruc);


-- ============================================================
-- COMENTARIOS
-- ============================================================
COMMENT ON TABLE entidades_emisoras IS
'Entidades que emiten o gestionan documentos controlados por CERTIIA.';


COMMENT ON COLUMN entidades_emisoras.tipo IS
'Tipos permitidos: MUNICIPALIDAD, ENTIDAD_PUBLICA, EMPRESA_PRIVADA o PROFESIONAL.';


COMMENT ON COLUMN entidades_emisoras.ruc IS
'RUC opcional. Cuando se registra debe contener exactamente 11 dígitos.';


COMMENT ON COLUMN entidades_emisoras.activo IS
'Permite desactivar una entidad sin eliminar su historial.';