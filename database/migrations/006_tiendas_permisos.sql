-- ============================================================
-- CERTIIA
-- MIGRACIÓN 006
-- PERMISOS DEL MÓDULO TIENDAS
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
    'tiendas.ver',
    'Consultar tiendas',
    'Permite consultar el listado y la ficha de las tiendas.',
    'TIENDAS',
    TRUE
),
(
    'tiendas.crear',
    'Registrar tiendas',
    'Permite registrar nuevas tiendas retail.',
    'TIENDAS',
    TRUE
),
(
    'tiendas.editar',
    'Editar tiendas',
    'Permite modificar los datos autorizados de una tienda.',
    'TIENDAS',
    TRUE
),
(
    'tiendas.estado',
    'Activar o desactivar tiendas',
    'Permite cambiar el estado activo o inactivo de una tienda.',
    'TIENDAS',
    TRUE
)

ON CONFLICT (codigo)
DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    modulo = EXCLUDED.modulo,
    activo = TRUE;


-- ============================================================
-- ADMINISTRADOR
-- TODOS LOS PERMISOS DE TIENDAS
-- ============================================================

INSERT INTO rol_permisos (
    rol_id,
    permiso_id
)

SELECT
    r.id,
    p.id

FROM roles r

CROSS JOIN permisos p

WHERE r.codigo = 'ADMIN'

AND p.codigo IN (
    'tiendas.ver',
    'tiendas.crear',
    'tiendas.editar',
    'tiendas.estado'
)

ON CONFLICT DO NOTHING;


-- ============================================================
-- RESPONSABLE
-- SOLO CONSULTA DE TIENDAS
-- ============================================================

INSERT INTO rol_permisos (
    rol_id,
    permiso_id
)

SELECT
    r.id,
    p.id

FROM roles r

CROSS JOIN permisos p

WHERE r.codigo = 'RESPONSABLE'

AND p.codigo = 'tiendas.ver'

ON CONFLICT DO NOTHING;