require('dotenv').config();

const pool = require('./database');

async function probarConexion() {
  try {
    const resultado = await pool.query(`
      SELECT
        current_database() AS base_datos,
        current_user AS usuario,
        NOW() AS fecha_servidor
    `);

    console.log('Conexión exitosa a PostgreSQL');
    console.table(resultado.rows);
  } catch (error) {
    console.error('Error al conectar con PostgreSQL:');
    console.error(error.message);
  } finally {
    await pool.end();
  }
}

probarConexion();