const pool = require('../config/database');


// ============================================================
// REVOCAR TODAS LAS SESIONES DE UN USUARIO
// ============================================================
async function revocarTodasSesiones(
  usuarioId,
  cliente = pool
) {
  await cliente.query(
    `
    UPDATE sesiones
    SET revocada = TRUE
    WHERE usuario_id = $1
      AND revocada = FALSE;
    `,
    [usuarioId]
  );
}


// ============================================================
// REVOCAR TODAS EXCEPTO LA SESIÓN ACTUAL
// ============================================================
async function revocarOtrasSesiones(
  usuarioId,
  accessTokenHash,
  cliente = pool
) {
  if (!accessTokenHash) {
    return;
  }

  await cliente.query(
    `
    UPDATE sesiones
    SET revocada = TRUE
    WHERE usuario_id = $1
      AND revocada = FALSE
      AND (
        access_token_hash IS NULL
        OR access_token_hash <> $2
      );
    `,
    [
      usuarioId,
      accessTokenHash
    ]
  );
}


module.exports = {
  revocarTodasSesiones,
  revocarOtrasSesiones
};