BEGIN;

-- ============================================================
-- CERTIIA
-- MIGRACIÓN 027
-- PERMISOS DE ÉPICA 8 - ALERTAS Y CALENDARIO
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
    'alertas.ver',
    'Ver alertas',
    'Permite consultar alertas de vencimiento e historial de atención',
    'ALERTAS',
    TRUE
),
(
    'alertas.generar',
    'Generar alertas',
    'Permite ejecutar la evaluación de vencimientos y generar alertas',
    'ALERTAS',
    TRUE
),
(
    'alertas.atender',
    'Atender alertas',
    'Permite marcar alertas como atendidas y registrar su atención',
    'ALERTAS',
    TRUE
),
(
    'alertas.notificar',
    'Procesar notificaciones',
    'Permite procesar notificaciones asociadas a alertas',
    'ALERTAS',
    TRUE
),
(
    'alertas.calendario',
    'Ver calendario de vencimientos',
    'Permite consultar el calendario de vencimientos documentales',
    'ALERTAS',
    TRUE
)
ON CONFLICT (codigo)
DO NOTHING;

-- ADMIN: todos los permisos de Épica 8.
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
      'alertas.ver',
      'alertas.generar',
      'alertas.atender',
      'alertas.notificar',
      'alertas.calendario'
  )
ON CONFLICT (rol_id, permiso_id)
DO NOTHING;

-- RESPONSABLE: gestión operativa completa de alertas.
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
      'alertas.ver',
      'alertas.generar',
      'alertas.atender',
      'alertas.notificar',
      'alertas.calendario'
  )
ON CONFLICT (rol_id, permiso_id)
DO NOTHING;

-- CONSULTA: solo lectura y calendario.
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
WHERE r.codigo = 'CONSULTA'
  AND p.codigo IN (
      'alertas.ver',
      'alertas.calendario'
  )
ON CONFLICT (rol_id, permiso_id)
DO NOTHING;

COMMIT;
