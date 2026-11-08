import {
  useEffect,
  useState
} from 'react';

import {
  Eye,
  EyeOff,
  Save,
  UserPlus,
  X
} from 'lucide-react';


// =====================================================
// MODAL DE USUARIO
// =====================================================
function UsuarioModal({
  abierto,
  modo = 'crear',
  usuario = null,
  roles = [],
  cargando = false,
  error = '',
  onCerrar,
  onGuardar
}) {
  const [nombres, setNombres] =
    useState('');

  const [apellidos, setApellidos] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [rolCodigo, setRolCodigo] =
    useState('');

  const [
    mostrarPassword,
    setMostrarPassword
  ] = useState(false);


  const esEdicion =
    modo === 'editar';


  // ===================================================
  // CARGAR DATOS
  // ===================================================
  useEffect(() => {
    if (!abierto) {
      return;
    }

    if (
      esEdicion &&
      usuario
    ) {
      setNombres(
        usuario.nombres || ''
      );

      setApellidos(
        usuario.apellidos || ''
      );

      setEmail(
        usuario.email || ''
      );

      setRolCodigo(
        usuario.rol?.codigo || ''
      );

      setPassword('');

    } else {
      setNombres('');
      setApellidos('');
      setEmail('');
      setPassword('');
      setRolCodigo(
        roles[0]?.codigo || ''
      );
    }

    setMostrarPassword(false);

  }, [
    abierto,
    esEdicion,
    usuario,
    roles
  ]);


  // ===================================================
  // ENVIAR FORMULARIO
  // ===================================================
  function handleSubmit(event) {
    event.preventDefault();

    const datos = {
      nombres:
        nombres.trim(),

      apellidos:
        apellidos.trim(),

      email:
        email.trim(),

      rolCodigo
    };

    if (!esEdicion) {
      datos.password =
        password;
    }

    onGuardar(datos);
  }


  if (!abierto) {
    return null;
  }


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

      {/* ============================================= */}
      {/* FONDO */}
      {/* ============================================= */}
      <button
        type="button"
        aria-label="Cerrar"
        onClick={
          cargando
            ? undefined
            : onCerrar
        }
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
      />


      {/* ============================================= */}
      {/* MODAL */}
      {/* ============================================= */}
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

        {/* =========================================== */}
        {/* CABECERA */}
        {/* =========================================== */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 sm:px-7">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <UserPlus size={23} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
                Gestión de usuarios
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {
                  esEdicion
                    ? 'Editar usuario'
                    : 'Nuevo usuario'
                }
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {
                  esEdicion
                    ? 'Actualiza los datos y el rol del usuario.'
                    : 'Registra una nueva cuenta en CERTIIA.'
                }
              </p>
            </div>

          </div>


          <button
            type="button"
            onClick={onCerrar}
            disabled={cargando}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>

        </div>


        {/* =========================================== */}
        {/* FORMULARIO */}
        {/* =========================================== */}
        <form
          onSubmit={handleSubmit}
          className="max-h-[75vh] overflow-y-auto px-6 py-6 sm:px-7"
        >

          <div className="grid gap-5 sm:grid-cols-2">

            {/* ======================================= */}
            {/* NOMBRES */}
            {/* ======================================= */}
            <div>
              <label
                htmlFor="usuario-nombres"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Nombres
              </label>

              <input
                id="usuario-nombres"
                type="text"
                value={nombres}
                onChange={(event) =>
                  setNombres(
                    event.target.value
                  )
                }
                placeholder="Ej. Juan Carlos"
                autoComplete="off"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>


            {/* ======================================= */}
            {/* APELLIDOS */}
            {/* ======================================= */}
            <div>
              <label
                htmlFor="usuario-apellidos"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Apellidos
              </label>

              <input
                id="usuario-apellidos"
                type="text"
                value={apellidos}
                onChange={(event) =>
                  setApellidos(
                    event.target.value
                  )
                }
                placeholder="Ej. Pérez Mendoza"
                autoComplete="off"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

          </div>


          {/* ========================================= */}
          {/* CORREO */}
          {/* ========================================= */}
          <div className="mt-5">
            <label
              htmlFor="usuario-email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Correo electrónico
            </label>

            <input
              id="usuario-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="usuario@certiia.com"
              autoComplete="off"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>


          {/* ========================================= */}
          {/* ROL */}
          {/* ========================================= */}
          <div className="mt-5">
            <label
              htmlFor="usuario-rol"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Rol
            </label>

            <select
              id="usuario-rol"
              value={rolCodigo}
              onChange={(event) =>
                setRolCodigo(
                  event.target.value
                )
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            >
              <option value="">
                Selecciona un rol
              </option>

              {
                roles.map(
                  (rol) => (
                    <option
                      key={rol.id}
                      value={rol.codigo}
                    >
                      {rol.nombre}
                    </option>
                  )
                )
              }
            </select>
          </div>


          {/* ========================================= */}
          {/* CONTRASEÑA SOLO CREACIÓN */}
          {/* ========================================= */}
          {
            !esEdicion && (
              <div className="mt-5">

                <label
                  htmlFor="usuario-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Contraseña temporal
                </label>

                <div className="relative">

                  <input
                    id="usuario-password"
                    type={
                      mostrarPassword
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarPassword(
                        !mostrarPassword
                      )
                    }
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    {
                      mostrarPassword
                        ? (
                          <EyeOff size={18} />
                        )
                        : (
                          <Eye size={18} />
                        )
                    }
                  </button>

                </div>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  El usuario deberá cambiar esta contraseña
                  en su primer acceso.
                </p>

              </div>
            )
          }


          {/* ========================================= */}
          {/* ERROR */}
          {/* ========================================= */}
          {
            error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )
          }


          {/* ========================================= */}
          {/* ACCIONES */}
          {/* ========================================= */}
          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onCerrar}
              disabled={cargando}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>


            <button
              type="submit"
              disabled={cargando}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {
                cargando
                  ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Guardando...
                    </>
                  )
                  : (
                    <>
                      <Save size={18} />

                      {
                        esEdicion
                          ? 'Guardar cambios'
                          : 'Crear usuario'
                      }
                    </>
                  )
              }
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}


export default UsuarioModal;