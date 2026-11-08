BEGIN;

-- ============================================================
-- HU-025
-- ARCHIVAR O ANULAR DOCUMENTO
-- ============================================================

ALTER TABLE documentos
ADD COLUMN condicion_registro VARCHAR(20)
NOT NULL
DEFAULT 'ACTIVO';


ALTER TABLE documentos
ADD CONSTRAINT documentos_condicion_registro_check
CHECK (
    condicion_registro IN (
        'ACTIVO',
        'ARCHIVADO',
        'ANULADO'
    )
);


ALTER TABLE documentos
ADD COLUMN motivo_baja TEXT;


ALTER TABLE documentos
ADD COLUMN fecha_baja TIMESTAMPTZ;


ALTER TABLE documentos
ADD COLUMN baja_por BIGINT;


ALTER TABLE documentos
ADD CONSTRAINT documentos_baja_por_fk
FOREIGN KEY (baja_por)
REFERENCES usuarios(id)
ON UPDATE CASCADE
ON DELETE RESTRICT;


-- ============================================================
-- COHERENCIA DE ARCHIVADO / ANULACIÓN
-- ============================================================

ALTER TABLE documentos
ADD CONSTRAINT documentos_baja_coherencia_check
CHECK (
    (
        condicion_registro = 'ACTIVO'
        AND motivo_baja IS NULL
        AND fecha_baja IS NULL
        AND baja_por IS NULL
    )
    OR
    (
        condicion_registro IN (
            'ARCHIVADO',
            'ANULADO'
        )
        AND motivo_baja IS NOT NULL
        AND BTRIM(motivo_baja) <> ''
        AND fecha_baja IS NOT NULL
        AND baja_por IS NOT NULL
    )
);


-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_documentos_condicion_registro
ON documentos (
    condicion_registro
);


CREATE INDEX idx_documentos_fecha_baja
ON documentos (
    fecha_baja
)
WHERE fecha_baja IS NOT NULL;


CREATE INDEX idx_documentos_baja_por
ON documentos (
    baja_por
)
WHERE baja_por IS NOT NULL;


COMMIT;