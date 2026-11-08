BEGIN;

-- ============================================================
-- CERTIIA
-- MIGRACIÓN 029
-- ÉPICA 10 - REPORTES
-- HU-040 / HU-041 / HU-042
-- ============================================================

INSERT INTO permisos (
    codigo,
    nombre,
    descripcion,
    modulo,
    activo
)
VALUES
(
    'reportes.ver',
    'Ver reportes',
    'Permite consultar reportes de documentos, trámites y renovaciones',
    'REPORTES',
    TRUE
),
(
    'reportes.exportar',
    'Exportar reportes',
    'Permite exportar reportes autorizados a archivos de análisis',
    'REPORTES',
    TRUE
)
ON CONFLICT (codigo) DO UPDATE
SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    modulo = EXCLUDED.modulo,
    activo = TRUE;

INSERT INTO rol_permisos (
    rol_id,
    permiso_id,
    fecha_asignacion
)
SELECT
    r.id,
    p.id,
    NOW()
FROM roles r
CROSS JOIN permisos p
WHERE r.codigo IN ('ADMIN', 'RESPONSABLE')
  AND r.activo = TRUE
  AND p.activo = TRUE
  AND p.codigo IN (
      'reportes.ver',
      'reportes.exportar'
  )
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

COMMIT;
