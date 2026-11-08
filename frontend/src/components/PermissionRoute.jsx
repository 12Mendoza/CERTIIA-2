import {
  Navigate
} from 'react-router-dom';

import {
  LockKeyhole,
  ShieldAlert
} from 'lucide-react';

import {
  useAuth
} from '../context/AuthContext.jsx';


function PermissionRoute({
  permiso,
  children
}) {
  const {
    usuario,
    cargando
  } = useAuth();


  // ===================================================
  // CARGANDO
  // ===================================================
  if (cargando) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">

        <div className="flex flex-col items-center gap-4">

          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="text-sm font-medium text-slate-500">
            Verificando permisos...
          </p>

        </div>

      </div>
    );
  }


  // ===================================================
  // SIN USUARIO
  // ===================================================
  if (!usuario) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  // ===================================================
  // SIN PERMISO REQUERIDO
  // ===================================================
  const permisos =
    usuario.permisos || [];

  const autorizado =
    !permiso ||
    permisos.includes(
      permiso
    );


  if (!autorizado) {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-3xl items-center justify-center">

        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">

            <ShieldAlert
              size={30}
            />

          </div>


          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-red-500">
            Acceso restringido
          </p>


          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            No tienes permiso para acceder
          </h1>


          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
            Tu cuenta no cuenta con el permiso necesario
            para utilizar esta sección de CERTIIA.
          </p>


          <div className="mx-auto mt-6 flex max-w-md items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">

              <LockKeyhole
                size={19}
              />

            </div>


            <div>

              <p className="text-xs font-medium text-slate-400">
                Permiso requerido
              </p>

              <p className="mt-0.5 text-sm font-semibold text-slate-700">
                {permiso}
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={() =>
              window.history.back()
            }
            className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
          >
            Volver
          </button>

        </div>

      </div>
    );
  }


  // ===================================================
  // AUTORIZADO
  // ===================================================
  return children;
}


export default PermissionRoute;