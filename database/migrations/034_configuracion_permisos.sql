BEGIN;

-- ============================================================
-- CERTIIA - ÉPICA 13
-- PERMISOS DE CONFIGURACIÓN
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
    'configuracion.ver',
    'Ver configuración',
    'Permite consultar parámetros, catálogos y reglas de configuración.',
    'CONFIGURACION',
    TRUE
),
(
    'configuracion.parametros',
    'Gestionar parámetros generales',
    'Permite modificar parámetros globales no sensibles dentro de sus rangos permitidos.',
    'CONFIGURACION',
    TRUE
),
(
    'configuracion.catalogos',
    'Gestionar catálogos',
    'Permite crear, editar y desactivar valores de catálogos configurables.',
    'CONFIGURACION',
    TRUE
),
(
    'configuracion.notificaciones',
    'Gestionar reglas de notificación',
    'Permite configurar canales, destinatarios por rol y reglas de envío.',
    'CONFIGURACION',
    TRUE
)
ON CONFLICT (codigo) DO NOTHING;

-- Solo ADMIN recibe permisos de configuración.
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
  AND r.activo = TRUE
  AND p.activo = TRUE
  AND p.codigo IN (
      'configuracion.ver',
      'configuracion.parametros',
      'configuracion.catalogos',
      'configuracion.notificaciones'
  )
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

COMMIT;
