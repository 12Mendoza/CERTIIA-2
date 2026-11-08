BEGIN;

-- ============================================================
-- HU-027
-- PERMISO PARA ACTUALIZAR TRÁMITES
-- ============================================================

INSERT INTO permisos (
    codigo,
    nombre,
    descripcion,
    modulo,
    activo
)
SELECT
    'tramites.editar',
    'Actualizar trámites',
    'Permite actualizar el estado y avance de los trámites',
    'TRAMITES',
    TRUE
WHERE NOT EXISTS (
    SELECT 1
    FROM permisos
    WHERE codigo = 'tramites.editar'
);


-- ============================================================
-- ASIGNAR A ADMIN
-- ============================================================

INSERT INTO rol_permisos (
    rol_id,
    permiso_id
)
SELECT
    r.id,
    p.id
FROM roles r
INNER JOIN permisos p
    ON p.codigo = 'tramites.editar'
WHERE r.codigo = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1
      FROM rol_permisos rp
      WHERE rp.rol_id = r.id
        AND rp.permiso_id = p.id
  );


-- ============================================================
-- ASIGNAR A RESPONSABLE
-- ============================================================

INSERT INTO rol_permisos (
    rol_id,
    permiso_id
)
SELECT
    r.id,
    p.id
FROM roles r
INNER JOIN permisos p
    ON p.codigo = 'tramites.editar'
WHERE r.codigo = 'RESPONSABLE'
  AND NOT EXISTS (
      SELECT 1
      FROM rol_permisos rp
      WHERE rp.rol_id = r.id
        AND rp.permiso_id = p.id
  );


COMMIT;