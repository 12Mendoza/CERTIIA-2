-- ============================================================
-- CERTIIA
-- MIGRACIÓN 009
-- PERMISOS - ENTIDADES EMISORAS
-- ÉPICA 3
-- HU-014 GESTIONAR ENTIDAD EMISORA
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
    'entidades.ver',
    'Ver entidades emisoras',
    'Permite consultar y listar entidades emisoras',
    'ENTIDADES_EMISORAS',
    TRUE
),

(
    'entidades.crear',
    'Crear entidades emisoras',
    'Permite registrar nuevas entidades emisoras',
    'ENTIDADES_EMISORAS',
    TRUE
),

(
    'entidades.editar',
    'Editar entidades emisoras',
    'Permite modificar los datos de entidades emisoras',
    'ENTIDADES_EMISORAS',
    TRUE
),

(
    'entidades.estado',
    'Cambiar estado de entidades emisoras',
    'Permite activar o desactivar entidades emisoras',
    'ENTIDADES_EMISORAS',
    TRUE
)

ON CONFLICT (codigo)
DO UPDATE SET

    nombre =
        EXCLUDED.nombre,

    descripcion =
        EXCLUDED.descripcion,

    modulo =
        EXCLUDED.modulo,

    activo =
        EXCLUDED.activo;


-- ============================================================
-- ASIGNAR TODOS LOS PERMISOS AL ROL ADMIN
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

WHERE
    r.codigo = 'ADMIN'

    AND p.codigo IN (
        'entidades.ver',
        'entidades.crear',
        'entidades.editar',
        'entidades.estado'
    )

ON CONFLICT DO NOTHING;