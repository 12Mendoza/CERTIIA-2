BEGIN;

INSERT INTO permisos (
    codigo,
    nombre,
    descripcion,
    modulo
)
VALUES
(
    'usuarios.ver',
    'Ver usuarios',
    'Permite consultar usuarios registrados',
    'USUARIOS'
),
(
    'usuarios.crear',
    'Crear usuarios',
    'Permite registrar nuevos usuarios',
    'USUARIOS'
),
(
    'usuarios.editar',
    'Editar usuarios',
    'Permite modificar información de usuarios',
    'USUARIOS'
),
(
    'usuarios.estado',
    'Cambiar estado de usuarios',
    'Permite activar o desactivar usuarios',
    'USUARIOS'
),
(
    'roles.ver',
    'Ver roles',
    'Permite consultar roles y permisos',
    'SEGURIDAD'
),
(
    'roles.gestionar',
    'Gestionar roles y permisos',
    'Permite asignar y retirar permisos a los roles',
    'SEGURIDAD'
),
(
    'auditoria.ver',
    'Ver auditoría',
    'Permite consultar los eventos de auditoría',
    'AUDITORIA'
)
ON CONFLICT (codigo) DO NOTHING;

COMMIT;