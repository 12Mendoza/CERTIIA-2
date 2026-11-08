BEGIN;

-- ============================================================
-- CERTIIA
-- MIGRACIÓN 028
-- ÉPICA 9 - DASHBOARD
-- HU-038 / HU-039
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
    'dashboard.ver',
    'Ver dashboard',
    'Permite visualizar los indicadores documentales y acceder al detalle desde el dashboard',
    'DASHBOARD',
    TRUE
)
ON CONFLICT (codigo)
DO NOTHING;

-- HU-038: administrador y responsable.
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
WHERE r.codigo IN (
    'ADMIN',
    'RESPONSABLE'
)
AND p.codigo = 'dashboard.ver'
ON CONFLICT (rol_id, permiso_id)
DO NOTHING;

COMMIT;
