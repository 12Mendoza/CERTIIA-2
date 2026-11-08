import {
  Navigate,
  useLocation
} from 'react-router-dom';

import {
  useAuth
} from '../context/AuthContext.jsx';


// =====================================================
// RUTA PROTEGIDA
// =====================================================
function ProtectedRoute({
  children
}) {
  const {
    autenticado,
    cargando,
    usuario
  } = useAuth();

  const location =
    useLocation();


  // ===================================================
  // CARGANDO SESIÓN
  // ===================================================
  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="flex flex-col items-center gap-4">

          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="text-sm font-medium text-slate-600">
            Cargando CERTIIA...
          </p>

        </div>

      </div>
    );
  }


  // ===================================================
  // USUARIO NO AUTENTICADO
  // ===================================================
  if (!autenticado) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location
        }}
        replace
      />
    );
  }


  // ===================================================
  // CAMBIO DE CONTRASEÑA OBLIGATORIO
  // ===================================================
  const debeCambiarPassword =
    usuario?.debeCambiarPassword === true;

  const estaEnCambioPassword =
    location.pathname ===
    '/cambiar-password';


  if (
    debeCambiarPassword &&
    !estaEnCambioPassword
  ) {
    return (
      <Navigate
        to="/cambiar-password"
        replace
      />
    );
  }


  // ===================================================
  // USUARIO AUTENTICADO
  // ===================================================
  return children;
}


export default ProtectedRoute;