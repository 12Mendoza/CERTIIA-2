BEGIN;


-- ============================================================
-- AMPLIAR AUDITORÍA PARA REGISTRAR CAMBIOS
-- ============================================================

ALTER TABLE auditoria
ADD COLUMN IF NOT EXISTS entidad VARCHAR(100);


ALTER TABLE auditoria
ADD COLUMN IF NOT EXISTS registro_id BIGINT;


ALTER TABLE auditoria
ADD COLUMN IF NOT EXISTS datos_anteriores JSONB;


ALTER TABLE auditoria
ADD COLUMN IF NOT EXISTS datos_nuevos JSONB;


-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS
    idx_auditoria_modulo_registro
ON auditoria (
    modulo,
    registro_id
);


CREATE INDEX IF NOT EXISTS
    idx_auditoria_entidad
ON auditoria (
    entidad
);


COMMIT;