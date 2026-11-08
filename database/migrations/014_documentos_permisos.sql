-- ============================================================
-- CERTIIA
-- MIGRACIÓN 014
-- PERMISOS DEL MÓDULO DOCUMENTOS
-- ============================================================


-- ============================================================
-- CREAR PERMISOS
-- ============================================================

INSERT INTO permisos (
    codigo,
    nombre,
    descripcion,
    modulo
)
VALUES

(
    'documentos.ver',
    'Ver documentos',
    'Permite consultar documentos registrados en CERTIIA',
    'DOCUMENTOS'
),

(
    'documentos.crear',
    'Registrar documentos',
    'Permite registrar nuevos documentos',
    'DOCUMENTOS'
),

(
    'documentos.editar',
    'Editar documentos',
    'Permite actualizar información autorizada de documentos registrados',
    'DOCUMENTOS'
),

(
    'documentos.estado',
    'Gestionar estado de documentos',
    'Permite gestionar operaciones relacionadas con el estado documental',
    'DOCUMENTOS'
)

ON CONFLICT (codigo)
DO NOTHING;


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
    UPPER(TRIM(r.nombre)) = 'ADMIN'

    AND p.codigo IN (
        'documentos.ver',
        'documentos.crear',
        'documentos.editar',
        'documentos.estado'
    )

ON CONFLICT (rol_id, permiso_id)
DO NOTHING;