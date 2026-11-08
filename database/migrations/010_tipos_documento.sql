-- ============================================================
-- CERTIIA
-- MIGRACIÓN 010
-- TIPOS DE DOCUMENTO
-- HU-015 / HU-016
-- ============================================================


-- ============================================================
-- TABLA: tipos_documento
-- ============================================================

CREATE TABLE IF NOT EXISTS tipos_documento (

    id BIGSERIAL PRIMARY KEY,

    nombre VARCHAR(150) NOT NULL,

    categoria VARCHAR(100) NOT NULL,

    descripcion VARCHAR(500) NOT NULL,

    requiere_renovacion BOOLEAN NOT NULL DEFAULT FALSE,

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),


    -- ========================================================
    -- VALIDACIONES
    -- ========================================================

    CONSTRAINT chk_tipo_documento_nombre
        CHECK (
            LENGTH(
                TRIM(nombre)
            ) > 0
        ),

    CONSTRAINT chk_tipo_documento_categoria
        CHECK (
            LENGTH(
                TRIM(categoria)
            ) > 0
        ),

    CONSTRAINT chk_tipo_documento_descripcion
        CHECK (
            LENGTH(
                TRIM(descripcion)
            ) > 0
        )
);


-- ============================================================
-- DUPLICADO LÓGICO
--
-- Regla del proyecto:
-- No pueden existir dos tipos documentales con el mismo
-- nombre y la misma categoría, ignorando mayúsculas,
-- minúsculas y espacios laterales.
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS
uq_tipos_documento_nombre_categoria
ON tipos_documento (

    UPPER(
        TRIM(nombre)
    ),

    UPPER(
        TRIM(categoria)
    )

);


-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS
idx_tipos_documento_activo
ON tipos_documento (
    activo
);


CREATE INDEX IF NOT EXISTS
idx_tipos_documento_categoria
ON tipos_documento (
    categoria
);


CREATE INDEX IF NOT EXISTS
idx_tipos_documento_nombre
ON tipos_documento (
    nombre
);


CREATE INDEX IF NOT EXISTS
idx_tipos_documento_renovacion
ON tipos_documento (
    requiere_renovacion
);


-- ============================================================
-- COMENTARIOS
-- ============================================================

COMMENT ON TABLE tipos_documento IS
'Catálogo de tipos de documentos de operatividad y cumplimiento controlados por CERTIIA.';


COMMENT ON COLUMN tipos_documento.nombre IS
'Nombre del tipo documental.';


COMMENT ON COLUMN tipos_documento.categoria IS
'Categoría a la que pertenece el tipo documental.';


COMMENT ON COLUMN tipos_documento.descripcion IS
'Descripción funcional del tipo documental.';


COMMENT ON COLUMN tipos_documento.requiere_renovacion IS
'Indica si el tipo documental requiere renovación.';


COMMENT ON COLUMN tipos_documento.activo IS
'Permite desactivar un tipo documental sin eliminar información histórica.';


COMMENT ON COLUMN tipos_documento.fecha_creacion IS
'Fecha y hora de creación del tipo documental.';


COMMENT ON COLUMN tipos_documento.fecha_actualizacion IS
'Fecha y hora de la última actualización del tipo documental.';