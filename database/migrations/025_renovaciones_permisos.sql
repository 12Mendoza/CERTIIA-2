BEGIN;

-- ============================================================
-- CERTIIA
-- MIGRACIÓN 025
-- PERMISOS DEL MÓDULO RENOVACIONES
-- ÉPICA 7
-- HU-031 / HU-032 / HU-033
-- ============================================================


-- ============================================================
-- CREAR PERMISOS
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
    'renovaciones.ver',
    'Ver renovaciones',
    'Permite consultar procesos e historial de renovaciones',
    'RENOVACIONES',
    TRUE
),
(
    'renovaciones.crear',
    'Iniciar renovación',
    'Permite iniciar procesos de renovación de documentos',
    'RENOVACIONES',
    TRUE
),
(
    'renovaciones.completar',
    'Completar renovación',
    'Permite registrar el nuevo documento y finalizar una renovación',
    'RENOVACIONES',
    TRUE
)
ON CONFLICT (codigo)
DO NOTHING;


-- ============================================================
-- ASIGNAR PERMISOS AL ADMINISTRADOR
-- ============================================================

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
WHERE r.codigo = 'ADMIN'
AND p.codigo IN (
    'renovaciones.ver',
    'renovaciones.crear',
    'renovaciones.completar'
)
ON CONFLICT (rol_id, permiso_id)
DO NOTHING;


-- ============================================================
-- ASIGNAR PERMISOS AL RESPONSABLE
-- ============================================================

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
WHERE r.codigo = 'RESPONSABLE'
AND p.codigo IN (
    'renovaciones.ver',
    'renovaciones.crear',
    'renovaciones.completar'
)
ON CONFLICT (rol_id, permiso_id)
DO NOTHING;


COMMIT;