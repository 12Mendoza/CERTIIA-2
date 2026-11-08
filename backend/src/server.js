require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const pool = require('./config/database');

const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const rolesRoutes = require('./routes/roles.routes');
const auditoriaRoutes = require('./routes/auditoria.routes');
const tiendasRoutes = require('./routes/tiendas.routes');
const entidadesRoutes = require('./routes/entidades.routes');
const tiposDocumentoRoutes = require('./routes/tiposDocumento.routes');
const reglasVigenciaRoutes = require('./routes/reglasVigencia.routes');
const documentosRoutes = require('./routes/documentos.routes');
const tramitesRoutes = require('./routes/tramites.routes');
const renovacionesRoutes = require('./routes/renovaciones.routes');
const alertasRoutes = require('./routes/alertas.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const reportesRoutes = require('./routes/reportes.routes');
const iaRoutes = require('./routes/ia.routes');
const configuracionRoutes = require('./routes/configuracion.routes');



const app = express();

const PORT =
  process.env.PORT || 3000;


// =====================================================
// SEGURIDAD HTTP
// =====================================================

app.use(
  helmet()
);


// =====================================================
// COMUNICACIÓN CON FRONTEND
// =====================================================

app.use(
  cors()
);


// =====================================================
// JSON
// =====================================================

app.use(
  express.json()
);


// =====================================================
// RUTAS
// =====================================================


// Autenticación
app.use(
  '/api/auth',
  authRoutes
);


// Usuarios
app.use(
  '/api/usuarios',
  usuariosRoutes
);


// Roles
app.use(
  '/api/roles',
  rolesRoutes
);


// Auditoría
app.use(
  '/api/auditoria',
  auditoriaRoutes
);


// Tiendas
app.use(
  '/api/tiendas',
  tiendasRoutes
);


// Entidades Emisoras
app.use(
  '/api/entidades',
  entidadesRoutes
);


// Tipos de Documento
app.use(
  '/api/tipos-documento',
  tiposDocumentoRoutes
);


// Reglas de vigencia y alertas
app.use(
  '/api/tipos-documento',
  reglasVigenciaRoutes
);


// Documentos
app.use(
  '/api/documentos',
  documentosRoutes
);


// Trámites
app.use(
  '/api/tramites',
  tramitesRoutes
);


// Renovaciones
app.use(
  '/api/renovaciones',
  renovacionesRoutes
);

app.use(
  '/api/alertas',
  alertasRoutes
);

app.use(
  '/api/dashboard',
  dashboardRoutes
);

app.use(
  '/api/reportes',
  reportesRoutes
);

app.use(
  '/api/ia',
  iaRoutes
);

app.use(
  '/api/configuracion',
  configuracionRoutes
);


// =====================================================
// HEALTH BACKEND
// =====================================================

app.get(
  '/api/health',
  (req, res) => {
    res.json({
      ok: true,
      servicio: 'CERTIIA Backend',
      mensaje:
        'Backend funcionando correctamente'
    });
  }
);


// =====================================================
// HEALTH BASE DE DATOS
// =====================================================

app.get(
  '/api/health/database',
  async (req, res) => {

    try {

      const resultado =
        await pool.query(
          `
            SELECT
              current_database()
              AS base_datos
          `
        );


      return res.status(200).json({

        ok: true,

        servicio:
          'PostgreSQL',

        baseDatos:
          resultado.rows[0]
            .base_datos,

        mensaje:
          'Conexión con PostgreSQL correcta'
      });


    } catch (error) {

      console.error(
        'Error de conexión PostgreSQL:',
        error.message
      );


      return res.status(500).json({

        ok: false,

        mensaje:
          'No se pudo conectar con PostgreSQL'
      });
    }
  }
);


// =====================================================
// INICIAR SERVIDOR
// =====================================================

app.listen(
  PORT,
  () => {

    console.log(
      `CERTIIA Backend ejecutándose en http://localhost:${PORT}`
    );
  }
);