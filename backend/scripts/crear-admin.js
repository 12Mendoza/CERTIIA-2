require('dotenv').config();

const argon2 = require('argon2');
const pool = require('../src/config/database');

async function crearAdministrador() {
  try {
    const {
      ADMIN_NOMBRES,
      ADMIN_APELLIDOS,
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    } = process.env;

    if (
      !ADMIN_NOMBRES ||
      !ADMIN_APELLIDOS ||
      !ADMIN_EMAIL ||
      !ADMIN_PASSWORD
    ) {
      throw new Error(
        'Faltan las variables ADMIN_NOMBRES, ADMIN_APELLIDOS, ADMIN_EMAIL o ADMIN_PASSWORD'
      );
    }

    const rolResultado = await pool.query(
      `
      SELECT id
      FROM roles
      WHERE codigo = $1
        AND activo = TRUE
      LIMIT 1;
      `,
      ['ADMIN']
    );

    if (rolResultado.rowCount === 0) {
      throw new Error('No existe el rol ADMIN');
    }

    const rolId = rolResultado.rows[0].id;

    const usuarioExistente = await pool.query(
      `
      SELECT id
      FROM usuarios
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1;
      `,
      [ADMIN_EMAIL]
    );

    if (usuarioExistente.rowCount > 0) {
      throw new Error('Ya existe un usuario con ese correo');
    }

    const passwordHash = await argon2.hash(ADMIN_PASSWORD, {
      type: argon2.argon2id
    });

    const resultado = await pool.query(
      `
      INSERT INTO usuarios (
        rol_id,
        nombres,
        apellidos,
        email,
        password_hash,
        activo,
        debe_cambiar_password
      )
      VALUES ($1, $2, $3, LOWER($4), $5, TRUE, TRUE)
      RETURNING id, nombres, apellidos, email, activo;
      `,
      [
        rolId,
        ADMIN_NOMBRES,
        ADMIN_APELLIDOS,
        ADMIN_EMAIL,
        passwordHash
      ]
    );

    console.log('Administrador creado correctamente');
    console.table(resultado.rows);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

crearAdministrador();