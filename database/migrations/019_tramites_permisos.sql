BEGIN;


-- ============================================================
-- PERMISOS DEL MÓDULO TRÁMITES
-- HU-026
-- ============================================================

INSERT INTO permisos (
    codigo,
    nombre,
    descripcion,
    modulo,
    activo
)
SELECT
    'tramites.ver',
    'Ver trámites',
    'Permite consultar trámites registrados en CERTIIA',
    'TRAMITES',
    TRUE
WHERE NOT EXISTS (
    SELECT 1
    FROM permisos
    WHERE codigo = 'tramites.ver'
);


INSERT INTO permisos (
    codigo,
    nombre,
    descripcion,
    modulo,
    activo
)
SELECT
    'tramites.crear',
    'Registrar trámites',
    'Permite registrar nuevos trámites asociados a documentos',
    'TRAMITES',
    TRUE
WHERE NOT EXISTS (
    SELECT 1
    FROM permisos
    WHERE codigo = 'tramites.crear'
);


-- ============================================================
-- ADMINISTRADOR
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
INNER JOIN permisos p
    ON p.codigo IN (
        'tramites.ver',
        'tramites.crear'
    )
WHERE r.codigo = 'ADMIN'
AND NOT EXISTS (
    SELECT 1
    FROM rol_permisos rp
    WHERE rp.rol_id = r.id
      AND rp.permiso_id = p.id
);


-- ============================================================
-- RESPONSABLE
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
INNER JOIN permisos p
    ON p.codigo IN (
        'tramites.ver',
        'tramites.crear'
    )
WHERE r.codigo = 'RESPONSABLE'
AND NOT EXISTS (
    SELECT 1
    FROM rol_permisos rp
    WHERE rp.rol_id = r.id
      AND rp.permiso_id = p.id
);


COMMIT;