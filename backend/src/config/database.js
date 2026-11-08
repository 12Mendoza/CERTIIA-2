require('dotenv').config();

const { Pool } = require('pg');

const esProduccion =
  process.env.NODE_ENV === 'production';

let pool;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString:
      process.env.DATABASE_URL,

    ssl: esProduccion
      ? {
          rejectUnauthorized: false
        }
      : false
  });
} else {
  pool = new Pool({
    host:
      process.env.DB_HOST,

    port:
      Number(
        process.env.DB_PORT || 5432
      ),

    database:
      process.env.DB_NAME,

    user:
      process.env.DB_USER,

    password:
      process.env.DB_PASSWORD,

    ssl: esProduccion
      ? {
          rejectUnauthorized: false
        }
      : false
  });
}

pool.on(
  'error',
  (error) => {
    console.error(
      'Error inesperado PostgreSQL:',
      error.code || 'SIN_CODIGO',
      error.message || 'SIN_MENSAJE'
    );
  }
);

module.exports = pool;

