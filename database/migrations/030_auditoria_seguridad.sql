BEGIN;

-- ============================================================
-- ÉPICA 11 - AUDITORÍA
-- Refuerzo de integridad y rendimiento de la bitácora
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_auditoria_fecha_evento
  ON auditoria (fecha_evento DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_fecha
  ON auditoria (usuario_id, fecha_evento DESC);

CREATE INDEX IF NOT EXISTS idx_auditoria_modulo_fecha
  ON auditoria (modulo, fecha_evento DESC);

CREATE INDEX IF NOT EXISTS idx_auditoria_evento_fecha
  ON auditoria (evento, fecha_evento DESC);

CREATE INDEX IF NOT EXISTS idx_auditoria_entidad_registro
  ON auditoria (entidad, registro_id);

CREATE OR REPLACE FUNCTION bloquear_mutacion_auditoria()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION
    'Los registros de auditoría son inmutables y no pueden actualizarse ni eliminarse.';
END;
$$;

DROP TRIGGER IF EXISTS trg_auditoria_append_only
  ON auditoria;

CREATE TRIGGER trg_auditoria_append_only
BEFORE UPDATE OR DELETE
ON auditoria
FOR EACH ROW
EXECUTE FUNCTION bloquear_mutacion_auditoria();

COMMENT ON TRIGGER trg_auditoria_append_only ON auditoria
IS 'Impide UPDATE/DELETE funcional sobre la bitácora. La auditoría se conserva como registro append-only.';

COMMIT;
