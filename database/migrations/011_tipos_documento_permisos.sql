-- ============================================================
-- CERTIIA
-- MIGRACIÓN 011
-- PERMISOS - TIPOS DE DOCUMENTO
-- ============================================================


-- ============================================================
-- REGISTRAR PERMISOS
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
    'tipos_documento.ver',
    'Ver tipos de documento',
    'Permite consultar y listar tipos de documento',
    'TIPOS_DOCUMENTO',
    TRUE
),

(
    'tipos_documento.crear',
    'Crear tipos de documento',
    'Permite registrar nuevos tipos de documento',
    'TIPOS_DOCUMENTO',
    TRUE
),

(
    'tipos_documento.editar',
    'Editar tipos de documento',
    'Permite modificar los datos autorizados de los tipos de documento',
    'TIPOS_DOCUMENTO',
    TRUE
),

(
    'tipos_documento.estado',
    'Cambiar estado de tipos de documento',
    'Permite activar o desactivar tipos de documento',
    'TIPOS_DOCUMENTO',
    TRUE
),

(
    'tipos_documento.configurar',
    'Configurar vigencia y alertas',
    'Permite configurar reglas de vigencia, renovación y alertas de los tipos de documento',
    'TIPOS_DOCUMENTO',
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
-- ASIGNAR PERMISOS AL ROL ADMIN
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
        'tipos_documento.ver',
        'tipos_documento.crear',
        'tipos_documento.editar',
        'tipos_documento.estado',
        'tipos_documento.configurar'
    )

ON CONFLICT DO NOTHING;