import {
  Navigate,
  Route,
  Routes
} from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute.jsx';
import PermissionRoute from './components/PermissionRoute.jsx';

import AppLayout from './layouts/AppLayout.jsx';

import LoginPage from './pages/auth/LoginPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';
import ChangePasswordPage from './pages/auth/ChangePasswordPage.jsx';

import DashboardPage from './pages/DashboardPage.jsx';

import UsuariosPage from './pages/usuarios/UsuariosPage.jsx';
import RolesPage from './pages/roles/RolesPage.jsx';
import AuditoriaPage from './pages/auditoria/AuditoriaPage.jsx';

import TiendasPage from './pages/tiendas/TiendasPage.jsx';
import TiendaDetallePage from './pages/tiendas/TiendaDetallePage.jsx';

import EntidadesPage from './pages/entidades/EntidadesPage.jsx';
import EntidadDetallePage from './pages/entidades/EntidadDetallePage.jsx';

import TiposDocumentoPage from './pages/tiposDocumento/TiposDocumentoPage.jsx';

import DocumentosPage from './pages/documentos/DocumentosPage.jsx';
import TramitesPage from './pages/tramites/TramitesPage.jsx';
import RenovacionesPage from './pages/renovaciones/RenovacionesPage.jsx';
import AlertasPage from './pages/alertas/AlertasPage.jsx';
import ReportesPage from './pages/reportes/ReportesPage.jsx';
import IaPredictivaPage from './pages/ia/IaPredictivaPage.jsx';
import ConfiguracionPage from './pages/configuracion/ConfiguracionPage.jsx';


// =====================================================
// APP
// =====================================================

function App() {

  return (

    <Routes>

      {/* ============================================= */}
      {/* RUTAS PÚBLICAS */}
      {/* ============================================= */}

      <Route
        path="/login"
        element={
          <LoginPage />
        }
      />

      <Route
        path="/recuperar-password"
        element={
          <ForgotPasswordPage />
        }
      />

      <Route
        path="/restablecer-password"
        element={
          <ResetPasswordPage />
        }
      />


      {/* ============================================= */}
      {/* RUTAS PROTEGIDAS */}
      {/* ============================================= */}

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <PermissionRoute permiso="dashboard.ver">
              <DashboardPage />
            </PermissionRoute>
          }
        />


        {/* USUARIOS */}
        <Route
          path="/usuarios"
          element={
            <PermissionRoute permiso="usuarios.ver">
              <UsuariosPage />
            </PermissionRoute>
          }
        />


        {/* ROLES */}
        <Route
          path="/roles"
          element={
            <PermissionRoute permiso="roles.ver">
              <RolesPage />
            </PermissionRoute>
          }
        />


        {/* AUDITORÍA */}
        <Route
          path="/auditoria"
          element={
            <PermissionRoute permiso="auditoria.ver">
              <AuditoriaPage />
            </PermissionRoute>
          }
        />


        {/* CAMBIAR CONTRASEÑA */}
        <Route
          path="/cambiar-password"
          element={
            <ChangePasswordPage />
          }
        />


        {/* TIENDAS */}
        <Route
          path="/tiendas"
          element={
            <PermissionRoute permiso="tiendas.ver">
              <TiendasPage />
            </PermissionRoute>
          }
        />

        <Route
          path="/tiendas/:id"
          element={
            <PermissionRoute permiso="tiendas.ver">
              <TiendaDetallePage />
            </PermissionRoute>
          }
        />


        {/* ENTIDADES EMISORAS */}
        <Route
          path="/entidades"
          element={
            <PermissionRoute permiso="entidades.ver">
              <EntidadesPage />
            </PermissionRoute>
          }
        />

        <Route
          path="/entidades/:id"
          element={
            <PermissionRoute permiso="entidades.ver">
              <EntidadDetallePage />
            </PermissionRoute>
          }
        />


        {/* TIPOS DE DOCUMENTO */}
        <Route
          path="/tipos-documento"
          element={
            <PermissionRoute permiso="tipos_documento.ver">
              <TiposDocumentoPage />
            </PermissionRoute>
          }
        />


        {/* DOCUMENTOS */}
        <Route
          path="/documentos"
          element={
            <PermissionRoute permiso="documentos.crear">
              <DocumentosPage />
            </PermissionRoute>
          }
        />


        {/* TRÁMITES */}
        <Route
          path="/tramites"
          element={
            <PermissionRoute permiso="tramites.crear">
              <TramitesPage />
            </PermissionRoute>
          }
        />


        {/* RENOVACIONES */}
        <Route
          path="/renovaciones"
          element={
            <PermissionRoute permiso="renovaciones.ver">
              <RenovacionesPage />
            </PermissionRoute>
          }
        />

        {/* ALERTAS Y CALENDARIO */}
        <Route
          path="/alertas"
          element={
            <PermissionRoute permiso="alertas.ver">
              <AlertasPage />
            </PermissionRoute>
          }
        />


        {/* REPORTES */}
        <Route
          path="/reportes"
          element={
            <PermissionRoute permiso="reportes.ver">
              <ReportesPage />
            </PermissionRoute>
          }
        />


          {/* CONFIGURACIÓN */}
          <Route
            path="/configuracion"
            element={
              <PermissionRoute permiso="configuracion.ver">
                <ConfiguracionPage />
              </PermissionRoute>
            }
          />

        {/* IA PREDICTIVA */}
        <Route
          path="/ia-predictiva"
          element={
            <PermissionRoute permiso="ia.ver">
              <IaPredictivaPage />
            </PermissionRoute>
          }
        />

      </Route>


      {/* ============================================= */}
      {/* REDIRECCIONES */}
      {/* ============================================= */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
}


export default App;