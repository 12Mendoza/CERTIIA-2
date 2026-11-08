BEGIN;

INSERT INTO permisos (
    codigo,
    nombre,
    descripcion,
    modulo,
    activo
)
VALUES
(
    'ia.ver',
    'Ver IA predictiva',
    'Permite consultar predicciones, explicaciones, resultados y modelos predictivos.',
    'IA_PREDICTIVA',
    TRUE
),
(
    'ia.predecir',
    'Solicitar predicciones',
    'Permite solicitar predicciones de riesgo y duración para trámites o renovaciones.',
    'IA_PREDICTIVA',
    TRUE
),
(
    'ia.resultados',
    'Gestionar resultados reales',
    'Permite registrar, validar o excluir resultados reales del conjunto de aprendizaje.',
    'IA_PREDICTIVA',
    TRUE
),
(
    'ia.entrenar',
    'Entrenar modelos predictivos',
    'Permite generar nuevas versiones candidatas de modelos con datos validados.',
    'IA_PREDICTIVA',
    TRUE
),
(
    'ia.activar',
    'Activar modelos predictivos',
    'Permite aprobar y activar versiones candidatas que cumplan criterios mínimos.',
    'IA_PREDICTIVA',
    TRUE
)
ON CONFLICT (codigo) DO NOTHING;

-- ADMIN y RESPONSABLE pueden consultar y utilizar predicciones.
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
WHERE r.codigo IN ('ADMIN', 'RESPONSABLE')
  AND r.activo = TRUE
  AND p.activo = TRUE
  AND p.codigo IN (
      'ia.ver',
      'ia.predecir',
      'ia.resultados'
  )
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

-- El entrenamiento y la activación quedan restringidos a ADMIN.
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
      'ia.entrenar',
      'ia.activar'
  )
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

COMMIT;
