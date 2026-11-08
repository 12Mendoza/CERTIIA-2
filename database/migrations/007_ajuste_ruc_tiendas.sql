-- ============================================================
-- CERTIIA
-- MIGRACIÓN 007
-- AJUSTE DE RUC EN TIENDAS
-- ============================================================


-- ============================================================
-- ELIMINAR UNICIDAD DEL RUC
-- ============================================================
ALTER TABLE tiendas
DROP CONSTRAINT IF EXISTS uq_tiendas_ruc;


-- ============================================================
-- MANTENER ÍNDICE PARA BÚSQUEDAS POR RUC
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tiendas_ruc
ON tiendas (ruc);