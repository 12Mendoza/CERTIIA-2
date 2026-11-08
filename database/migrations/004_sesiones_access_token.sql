-- =====================================================
-- CERTIIA
-- MIGRACIÓN 004
-- SOPORTE PARA REVOCACIÓN DE ACCESS TOKENS
-- =====================================================

-- Actualmente CERTIIA todavía no utiliza refresh tokens.
-- Permitimos que este campo quede vacío hasta implementar
-- el flujo access token + refresh token posteriormente.
ALTER TABLE sesiones
ALTER COLUMN refresh_token_hash DROP NOT NULL;


-- Guardaremos únicamente el hash SHA-256 del access token.
-- Nunca el JWT original.
ALTER TABLE sesiones
ADD COLUMN IF NOT EXISTS access_token_hash TEXT;


-- Evitar sesiones duplicadas para un mismo access token.
CREATE UNIQUE INDEX IF NOT EXISTS
idx_sesiones_access_token_hash
ON sesiones (access_token_hash)
WHERE access_token_hash IS NOT NULL;


-- Índice para búsquedas por usuario.
CREATE INDEX IF NOT EXISTS
idx_sesiones_usuario
ON sesiones (usuario_id);


-- Índice útil para comprobar sesiones activas/revocadas.
CREATE INDEX IF NOT EXISTS
idx_sesiones_estado
ON sesiones (revocada, fecha_expiracion);