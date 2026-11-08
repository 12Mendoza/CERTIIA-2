-- ============================================================
-- CERTIIA
-- MIGRACIÓN 013
-- HU-018 - REGISTRAR DOCUMENTO
-- ============================================================


CREATE TABLE documentos (

    id BIGSERIAL PRIMARY KEY,


    -- ========================================================
    -- IDENTIFICACIÓN INTERNA
    -- ========================================================

    codigo_interno VARCHAR(50) NOT NULL,


    -- ========================================================
    -- RELACIONES PRINCIPALES
    -- ========================================================

    tienda_id BIGINT NOT NULL,

    tipo_documento_id BIGINT NOT NULL,

    entidad_emisora_id BIGINT NOT NULL,

    regla_vigencia_id BIGINT NOT NULL,


    -- ========================================================
    -- INFORMACIÓN DEL DOCUMENTO
    -- ========================================================

    numero_documento VARCHAR(120) NOT NULL,

    numero_expediente VARCHAR(120),

    fecha_emision DATE NOT NULL,

    fecha_vencimiento DATE,


    -- ========================================================
    -- RESPONSABLE
    -- ========================================================

    responsable_usuario_id BIGINT NOT NULL,


    -- Usuario que registró el documento en CERTIIA
    registrado_por BIGINT NOT NULL,


    -- ========================================================
    -- ESTADO DE VIGENCIA
    -- ========================================================

    estado VARCHAR(30) NOT NULL,


    -- ========================================================
    -- INFORMACIÓN ADICIONAL
    -- ========================================================

    observaciones VARCHAR(1000),


    -- ========================================================
    -- TRAZABILIDAD
    -- ========================================================

    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),


    -- ========================================================
    -- CLAVES FORÁNEAS
    -- ========================================================

    CONSTRAINT fk_documentos_tienda
        FOREIGN KEY (tienda_id)
        REFERENCES tiendas(id)
        ON DELETE RESTRICT,


    CONSTRAINT fk_documentos_tipo_documento
        FOREIGN KEY (tipo_documento_id)
        REFERENCES tipos_documento(id)
        ON DELETE RESTRICT,


    CONSTRAINT fk_documentos_entidad_emisora
        FOREIGN KEY (entidad_emisora_id)
        REFERENCES entidades_emisoras(id)
        ON DELETE RESTRICT,


    CONSTRAINT fk_documentos_regla_vigencia
        FOREIGN KEY (regla_vigencia_id)
        REFERENCES tipo_documento_reglas_vigencia(id)
        ON DELETE RESTRICT,


    CONSTRAINT fk_documentos_responsable
        FOREIGN KEY (responsable_usuario_id)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,


    CONSTRAINT fk_documentos_registrado_por
        FOREIGN KEY (registrado_por)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,


    -- ========================================================
    -- VALIDACIONES
    -- ========================================================

    CONSTRAINT chk_documentos_codigo_interno
        CHECK (
            LENGTH(TRIM(codigo_interno)) > 0
        ),


    CONSTRAINT chk_documentos_numero_documento
        CHECK (
            LENGTH(TRIM(numero_documento)) > 0
        ),


    CONSTRAINT chk_documentos_numero_expediente
        CHECK (
            numero_expediente IS NULL
            OR LENGTH(TRIM(numero_expediente)) > 0
        ),


    CONSTRAINT chk_documentos_estado
        CHECK (
            estado IN (
                'VIGENTE',
                'POR_VENCER',
                'CRITICO',
                'VENCIDO',
                'EN_RENOVACION'
            )
        ),


    CONSTRAINT chk_documentos_fechas
        CHECK (
            fecha_vencimiento IS NULL
            OR fecha_vencimiento >= fecha_emision
        )
);


-- ============================================================
-- CÓDIGO INTERNO ÚNICO
-- ============================================================

CREATE UNIQUE INDEX uq_documentos_codigo_interno
ON documentos (
    UPPER(TRIM(codigo_interno))
);


-- ============================================================
-- ÍNDICES DE BÚSQUEDA
-- ============================================================

CREATE INDEX idx_documentos_tienda
ON documentos(tienda_id);


CREATE INDEX idx_documentos_tipo_documento
ON documentos(tipo_documento_id);


CREATE INDEX idx_documentos_entidad_emisora
ON documentos(entidad_emisora_id);


CREATE INDEX idx_documentos_regla_vigencia
ON documentos(regla_vigencia_id);


CREATE INDEX idx_documentos_responsable
ON documentos(responsable_usuario_id);


CREATE INDEX idx_documentos_estado
ON documentos(estado);


CREATE INDEX idx_documentos_fecha_emision
ON documentos(fecha_emision);


CREATE INDEX idx_documentos_fecha_vencimiento
ON documentos(fecha_vencimiento);


CREATE INDEX idx_documentos_numero_documento
ON documentos(
    UPPER(TRIM(numero_documento))
);