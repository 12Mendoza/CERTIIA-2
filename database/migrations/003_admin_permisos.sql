BEGIN;

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
  AND r.activo = TRUE
  AND p.activo = TRUE
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

COMMIT;