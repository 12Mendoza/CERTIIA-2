-- ============================================================
-- CERTIIA
-- MIGRACIÓN 005
-- ÉPICA 2: TIENDAS
-- ============================================================


-- ============================================================
-- TABLA TIENDAS
-- ============================================================
CREATE TABLE IF NOT EXISTS tiendas (
    id BIGSERIAL PRIMARY KEY,

    codigo VARCHAR(30) NOT NULL,

    nombre VARCHAR(150) NOT NULL,

    ruc VARCHAR(11) NOT NULL,

    direccion VARCHAR(250) NOT NULL,

    departamento VARCHAR(100) NOT NULL,

    provincia VARCHAR(100) NOT NULL,

    distrito VARCHAR(100) NOT NULL,

    nivel_riesgo VARCHAR(20) NOT NULL
        DEFAULT 'BAJO',

    activo BOOLEAN NOT NULL
        DEFAULT TRUE,

    fecha_creacion TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    fecha_actualizacion TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),


    -- ========================================================
    -- RESTRICCIONES
    -- ========================================================

    CONSTRAINT uq_tiendas_codigo
        UNIQUE (codigo),

    CONSTRAINT uq_tiendas_ruc
        UNIQUE (ruc),

    CONSTRAINT chk_tiendas_codigo_no_vacio
        CHECK (
            LENGTH(TRIM(codigo)) > 0
        ),

    CONSTRAINT chk_tiendas_nombre_no_vacio
        CHECK (
            LENGTH(TRIM(nombre)) > 0
        ),

    CONSTRAINT chk_tiendas_ruc
        CHECK (
            ruc ~ '^[0-9]{11}$'
        ),

    CONSTRAINT chk_tiendas_direccion_no_vacia
        CHECK (
            LENGTH(TRIM(direccion)) > 0
        ),

    CONSTRAINT chk_tiendas_departamento_no_vacio
        CHECK (
            LENGTH(TRIM(departamento)) > 0
        ),

    CONSTRAINT chk_tiendas_provincia_no_vacia
        CHECK (
            LENGTH(TRIM(provincia)) > 0
        ),

    CONSTRAINT chk_tiendas_distrito_no_vacio
        CHECK (
            LENGTH(TRIM(distrito)) > 0
        ),

    CONSTRAINT chk_tiendas_nivel_riesgo
        CHECK (
            nivel_riesgo IN (
                'BAJO',
                'MEDIO',
                'ALTO'
            )
        )
);


-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_tiendas_activo
ON tiendas (activo);


CREATE INDEX IF NOT EXISTS idx_tiendas_nombre
ON tiendas (nombre);


CREATE INDEX IF NOT EXISTS idx_tiendas_ubicacion
ON tiendas (
    departamento,
    provincia,
    distrito
);


CREATE INDEX IF NOT EXISTS idx_tiendas_nivel_riesgo
ON tiendas (nivel_riesgo);


-- ============================================================
-- COMENTARIOS
-- ============================================================

COMMENT ON TABLE tiendas IS
'Tiendas retail administradas por CERTIIA';


COMMENT ON COLUMN tiendas.codigo IS
'Código interno único de la tienda';


COMMENT ON COLUMN tiendas.ruc IS
'RUC de 11 dígitos asociado a la tienda';


COMMENT ON COLUMN tiendas.nivel_riesgo IS
'Nivel de riesgo de la tienda: BAJO, MEDIO o ALTO';


COMMENT ON COLUMN tiendas.activo IS
'Indica si la tienda se encuentra disponible para nuevas operaciones';