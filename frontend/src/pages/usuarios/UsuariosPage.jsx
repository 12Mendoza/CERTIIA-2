import {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  CircleAlert,
  Clock3,
  Filter,
  LockKeyhole,
  Mail,
  Pencil,
  Power,
  PowerOff,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  UserX
} from 'lucide-react';

import {
  api
} from '../../services/api';

import UsuarioModal from './UsuarioModal.jsx';


function UsuariosPage() {

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');

  const [cargando, setCargando] = useState(true);
  const [recargando, setRecargando] = useState(false);

  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [
    cambiandoEstadoId,
    setCambiandoEstadoId
  ] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoModal, setModoModal] = useState('crear');

  const [
    usuarioSeleccionado,
    setUsuarioSeleccionado
  ] = useState(null);

  const [
    guardandoUsuario,
    setGuardandoUsuario
  ] = useState(false);

  const [errorModal, setErrorModal] = useState('');


  // ============================================================
  // CARGA
  // ============================================================

  async function cargarUsuarios(
    mostrarRecarga = false
  ) {

    try {

      setError('');

      if (mostrarRecarga) {
        setRecargando(true);
      } else {
        setCargando(true);
      }

      const respuesta =
        await api.get('/usuarios');

      setUsuarios(
        respuesta.usuarios || []
      );

    } catch (errorUsuarios) {

      setError(
        errorUsuarios.message ||
        'No se pudieron cargar los usuarios.'
      );

    } finally {

      setCargando(false);
      setRecargando(false);

    }

  }


  async function cargarRoles() {

    try {

      const respuesta =
        await api.get('/roles');

      setRoles(
        respuesta.roles || []
      );

    } catch (errorRoles) {

      console.error(
        'Error al cargar roles:',
        errorRoles.message
      );

    }

  }


  useEffect(() => {

    cargarUsuarios();
    cargarRoles();

  }, []);


  // ============================================================
  // MODAL
  // ============================================================

  function abrirNuevoUsuario() {

    setModoModal('crear');
    setUsuarioSeleccionado(null);
    setErrorModal('');
    setModalAbierto(true);

  }


  function abrirEditarUsuario(usuario) {

    setModoModal('editar');
    setUsuarioSeleccionado(usuario);
    setErrorModal('');
    setModalAbierto(true);

  }


  function cerrarModal() {

    if (guardandoUsuario) {
      return;
    }

    setModalAbierto(false);
    setUsuarioSeleccionado(null);
    setErrorModal('');

  }


  async function guardarUsuario(datos) {

    try {

      setErrorModal('');
      setMensaje('');

      if (
        !datos.nombres ||
        !datos.apellidos ||
        !datos.email ||
        !datos.rolCodigo
      ) {

        setErrorModal(
          'Completa todos los campos obligatorios.'
        );

        return;

      }

      if (
        modoModal === 'crear' &&
        !datos.password
      ) {

        setErrorModal(
          'La contraseña temporal es obligatoria.'
        );

        return;

      }

      if (
        modoModal === 'crear' &&
        datos.password.length < 8
      ) {

        setErrorModal(
          'La contraseña debe tener al menos 8 caracteres.'
        );

        return;

      }

      setGuardandoUsuario(true);

      if (modoModal === 'crear') {

        const respuesta =
          await api.post(
            '/usuarios',
            datos
          );

        setMensaje(
          respuesta.mensaje ||
          'Usuario creado correctamente.'
        );

      }

      if (
        modoModal === 'editar' &&
        usuarioSeleccionado
      ) {

        const respuesta =
          await api.put(
            `/usuarios/${usuarioSeleccionado.id}`,
            {
              nombres:
                datos.nombres,

              apellidos:
                datos.apellidos,

              email:
                datos.email,

              rolCodigo:
                datos.rolCodigo
            }
          );

        setMensaje(
          respuesta.mensaje ||
          'Usuario actualizado correctamente.'
        );

      }

      await cargarUsuarios();

      setModalAbierto(false);
      setUsuarioSeleccionado(null);

      setTimeout(() => {
        setMensaje('');
      }, 4000);

    } catch (errorGuardar) {

      setErrorModal(
        errorGuardar.message ||
        'No se pudo guardar el usuario.'
      );

    } finally {

      setGuardandoUsuario(false);

    }

  }


  // ============================================================
  // ESTADO DEL USUARIO
  // ============================================================

  async function cambiarEstadoUsuario(usuario) {

    const nuevoEstado =
      !usuario.activo;

    const accion =
      nuevoEstado
        ? 'activar'
        : 'desactivar';

    const confirmar =
      window.confirm(
        `¿Deseas ${accion} al usuario ${usuario.nombres} ${usuario.apellidos}?`
      );

    if (!confirmar) {
      return;
    }

    try {

      setCambiandoEstadoId(
        usuario.id
      );

      setError('');
      setMensaje('');

      const respuesta =
        await api.patch(
          `/usuarios/${usuario.id}/estado`,
          {
            activo:
              nuevoEstado
          }
        );

      setMensaje(
        respuesta.mensaje ||
        'Estado actualizado correctamente.'
      );

      await cargarUsuarios();

      setTimeout(() => {
        setMensaje('');
      }, 4000);

    } catch (errorEstado) {

      setError(
        errorEstado.message ||
        'No se pudo cambiar el estado del usuario.'
      );

    } finally {

      setCambiandoEstadoId(null);

    }

  }


  // ============================================================
  // HELPERS
  // ============================================================

  function estaBloqueado(usuario) {

    return Boolean(
      usuario.bloqueadoHasta &&
      new Date(
        usuario.bloqueadoHasta
      ) > new Date()
    );

  }


  function formatearFecha(valor) {

    if (!valor) {
      return 'Sin acceso';
    }

    const fecha =
      new Date(valor);

    if (
      Number.isNaN(
        fecha.getTime()
      )
    ) {
      return 'Sin acceso';
    }

    return fecha.toLocaleString(
      'es-PE',
      {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    );

  }


  function obtenerIniciales(usuario) {

    return `${usuario.nombres?.[0] || ''}${usuario.apellidos?.[0] || ''}`
      .toUpperCase();

  }


  function limpiarFiltros() {

    setBusqueda('');
    setFiltroRol('');
    setFiltroEstado('TODOS');

  }


  // ============================================================
  // FILTROS
  // ============================================================

  const usuariosFiltrados =
    useMemo(() => {

      const texto =
        busqueda
          .trim()
          .toLowerCase();

      return usuarios.filter(
        (usuario) => {

          const nombre =
            `${usuario.nombres || ''} ${usuario.apellidos || ''}`
              .toLowerCase();

          const email =
            usuario.email
              ?.toLowerCase() ||
            '';

          const rolNombre =
            usuario.rol?.nombre
              ?.toLowerCase() ||
            '';

          const rolCodigo =
            usuario.rol?.codigo ||
            '';

          const bloqueado =
            estaBloqueado(usuario);

          const coincideTexto =
            !texto ||
            nombre.includes(texto) ||
            email.includes(texto) ||
            rolNombre.includes(texto);

          const coincideRol =
            !filtroRol ||
            rolCodigo === filtroRol;

          let coincideEstado = true;

          if (filtroEstado === 'ACTIVOS') {
            coincideEstado =
              usuario.activo &&
              !bloqueado;
          }

          if (filtroEstado === 'INACTIVOS') {
            coincideEstado =
              !usuario.activo;
          }

          if (filtroEstado === 'BLOQUEADOS') {
            coincideEstado =
              bloqueado;
          }

          return (
            coincideTexto &&
            coincideRol &&
            coincideEstado
          );

        }
      );

    }, [
      usuarios,
      busqueda,
      filtroRol,
      filtroEstado
    ]);


  // ============================================================
  // ESTADÍSTICAS
  // ============================================================

  const totalUsuarios =
    usuarios.length;

  const activos =
    usuarios.filter(
      (usuario) =>
        usuario.activo
    ).length;

  const inactivos =
    usuarios.filter(
      (usuario) =>
        !usuario.activo
    ).length;

  const bloqueados =
    usuarios.filter(
      (usuario) =>
        estaBloqueado(usuario)
    ).length;

  const porcentajeActivos =
    totalUsuarios > 0
      ? Math.round(
          (activos / totalUsuarios) * 100
        )
      : 0;

  const filtrosActivos =
    [
      busqueda.trim(),
      filtroRol,
      filtroEstado !== 'TODOS'
        ? filtroEstado
        : ''
    ].filter(Boolean).length;


  // ============================================================
  // LOADING
  // ============================================================

  if (cargando) {

    return (

      <div
        className="
          flex
          min-h-[65vh]
          items-center
          justify-center
        "
      >

        <div
          className="
            relative
            w-full
            max-w-sm
            overflow-hidden
            rounded-3xl
            border
            border-slate-200
            bg-white
            px-8
            py-12
            text-center
            shadow-sm
          "
        >

          <div
            className="
              absolute
              -right-16
              -top-16
              h-40
              w-40
              rounded-full
              bg-indigo-100
              blur-3xl
            "
          />

          <div
            className="
              relative
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-indigo-50
              text-indigo-600
            "
          >

            <Users
              size={28}
            />

            <div
              className="
                absolute
                inset-0
                animate-spin
                rounded-2xl
                border-2
                border-transparent
                border-t-indigo-500
              "
            />

          </div>

          <h2
            className="
              mt-5
              text-lg
              font-bold
              text-slate-900
            "
          >
            Cargando usuarios
          </h2>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-500
            "
          >
            Estamos consultando las cuentas,
            roles y estados de acceso de CERTIIA.
          </p>

        </div>

      </div>

    );

  }


  return (

    <>

      <div className="space-y-6">

        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[28px]
            border
            border-slate-800
            bg-gradient-to-br
            from-slate-950
            via-slate-900
            to-indigo-950
            shadow-xl
            shadow-slate-900/10
          "
        >

          <div
            className="
              absolute
              -right-24
              -top-24
              h-80
              w-80
              rounded-full
              bg-indigo-500/20
              blur-3xl
            "
          />

          <div
            className="
              absolute
              -bottom-32
              left-1/3
              h-72
              w-72
              rounded-full
              bg-violet-500/10
              blur-3xl
            "
          />

          <div
            className="
              absolute
              inset-0
              opacity-[0.05]
            "
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize:
                '28px 28px'
            }}
          />

          <div
            className="
              relative
              grid
              gap-6
              px-6
              py-7
              lg:grid-cols-[1fr_330px]
              lg:px-8
              lg:py-8
            "
          >

            <div
              className="
                flex
                flex-col
                justify-center
              "
            >

              <div
                className="
                  mb-4
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/10
                    text-indigo-300
                    backdrop-blur
                  "
                >

                  <ShieldCheck
                    size={22}
                  />

                </div>

                <div>

                  <p
                    className="
                      text-xs
                      font-bold
                      uppercase
                      tracking-[0.22em]
                      text-indigo-300
                    "
                  >
                    Seguridad y acceso
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-400
                    "
                  >
                    Administración de identidades
                  </p>

                </div>

              </div>

              <h1
                className="
                  text-3xl
                  font-bold
                  tracking-tight
                  text-white
                  sm:text-4xl
                "
              >
                Usuarios
              </h1>

              <p
                className="
                  mt-3
                  max-w-2xl
                  text-sm
                  leading-6
                  text-slate-300
                "
              >
                Administra cuentas, roles y estados de
                acceso manteniendo trazabilidad y control
                sobre quién puede utilizar CERTIIA.
              </p>

              <div
                className="
                  mt-6
                  flex
                  flex-wrap
                  gap-2
                "
              >

                <EtiquetaHero>
                  <Users size={14} />
                  {totalUsuarios} cuentas
                </EtiquetaHero>

                <EtiquetaHero>
                  <ShieldCheck size={14} />
                  {roles.length} roles disponibles
                </EtiquetaHero>

                <EtiquetaHero>
                  <LockKeyhole size={14} />
                  Control de acceso activo
                </EtiquetaHero>

              </div>

            </div>

            <div
              className="
                rounded-2xl
                border
                border-white/10
                bg-white/[0.07]
                p-5
                backdrop-blur-md
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >

                <div>

                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-400
                    "
                  >
                    Estado de cuentas
                  </p>

                  <p
                    className="
                      mt-1
                      text-lg
                      font-bold
                      text-white
                    "
                  >
                    {porcentajeActivos}% activas
                  </p>

                </div>

                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-2xl
                    bg-emerald-500/15
                    text-emerald-300
                  "
                >
                  <UserCheck size={22} />
                </div>

              </div>

              <div className="mt-5 space-y-3">

                <FilaResumen
                  etiqueta="Usuarios activos"
                  valor={activos}
                  clase="bg-emerald-400"
                />

                <FilaResumen
                  etiqueta="Usuarios inactivos"
                  valor={inactivos}
                  clase="bg-slate-400"
                />

                <FilaResumen
                  etiqueta="Bloqueos temporales"
                  valor={bloqueados}
                  clase="bg-amber-400"
                />

              </div>

              <button
                type="button"
                onClick={abrirNuevoUsuario}
                className="
                  mt-5
                  inline-flex
                  h-11
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-white
                  px-4
                  text-sm
                  font-bold
                  text-slate-900
                  transition
                  hover:bg-slate-100
                "
              >
                <UserPlus size={17} />
                Registrar usuario
              </button>

            </div>

          </div>

        </section>


        {/* ================================================= */}
        {/* MENSAJES */}
        {/* ================================================= */}

        {
          mensaje && (

            <div
              className="
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-emerald-200
                bg-emerald-50
                px-5
                py-4
                text-sm
                text-emerald-700
                shadow-sm
              "
            >
              <UserCheck
                size={20}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-bold">
                  Operación completada
                </p>

                <p className="mt-1">
                  {mensaje}
                </p>
              </div>
            </div>

          )
        }

        {
          error && (

            <div
              className="
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-red-200
                bg-red-50
                px-5
                py-4
                text-sm
                text-red-700
                shadow-sm
              "
            >
              <CircleAlert
                size={20}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-bold">
                  No se pudo completar la operación
                </p>

                <p className="mt-1">
                  {error}
                </p>
              </div>
            </div>

          )
        }


        {/* ================================================= */}
        {/* KPI */}
        {/* ================================================= */}

        <section
          className="
            grid
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >

          <TarjetaKpi
            titulo="Usuarios registrados"
            valor={totalUsuarios}
            descripcion="Cuentas existentes"
            icono={Users}
            tono="indigo"
            etiqueta="Total"
          />

          <TarjetaKpi
            titulo="Usuarios activos"
            valor={activos}
            descripcion="Acceso habilitado"
            icono={UserCheck}
            tono="emerald"
            etiqueta={`${porcentajeActivos}%`}
          />

          <TarjetaKpi
            titulo="Usuarios inactivos"
            valor={inactivos}
            descripcion="Acceso deshabilitado"
            icono={UserX}
            tono="slate"
            etiqueta="Control"
          />

          <TarjetaKpi
            titulo="Bloqueados"
            valor={bloqueados}
            descripcion="Bloqueo temporal"
            icono={LockKeyhole}
            tono="amber"
            etiqueta="Seguridad"
          />

        </section>


        {/* ================================================= */}
        {/* FILTROS */}
        {/* ================================================= */}

        <section
          className="
            overflow-hidden
            rounded-3xl
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >

          <div
            className="
              flex
              flex-col
              gap-4
              border-b
              border-slate-100
              bg-gradient-to-r
              from-white
              to-slate-50
              px-5
              py-5
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  bg-indigo-50
                  text-indigo-600
                "
              >
                <Filter size={19} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Directorio de usuarios
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Busca y segmenta las cuentas registradas.
                </p>
              </div>

            </div>

            <div className="flex flex-wrap items-center gap-3">

              {
                filtrosActivos > 0 && (
                  <button
                    type="button"
                    onClick={limpiarFiltros}
                    className="
                      text-xs
                      font-bold
                      text-indigo-600
                      transition
                      hover:text-indigo-800
                    "
                  >
                    Limpiar filtros
                  </button>
                )
              }

              <button
                type="button"
                onClick={() =>
                  cargarUsuarios(true)
                }
                disabled={recargando}
                className="
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  text-xs
                  font-bold
                  text-slate-600
                  transition
                  hover:border-indigo-200
                  hover:bg-indigo-50
                  hover:text-indigo-600
                  disabled:opacity-60
                "
              >
                <RefreshCw
                  size={16}
                  className={
                    recargando
                      ? 'animate-spin'
                      : ''
                  }
                />
                Actualizar
              </button>

            </div>

          </div>

          <div
            className="
              grid
              gap-4
              p-5
              lg:grid-cols-[1.6fr_1fr_1fr]
            "
          >

            <div>

              <label
                className="
                  mb-2
                  block
                  text-xs
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-500
                "
              >
                Buscar
              </label>

              <div className="relative">

                <Search
                  size={18}
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type="search"
                  value={busqueda}
                  onChange={(event) =>
                    setBusqueda(
                      event.target.value
                    )
                  }
                  placeholder="Nombre, correo o rol..."
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    bg-slate-50
                    pl-11
                    pr-4
                    text-sm
                    text-slate-800
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-indigo-500
                    focus:bg-white
                    focus:ring-4
                    focus:ring-indigo-50
                  "
                />

              </div>

            </div>

            <div>

              <label
                className="
                  mb-2
                  block
                  text-xs
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-500
                "
              >
                Rol
              </label>

              <select
                value={filtroRol}
                onChange={(event) =>
                  setFiltroRol(
                    event.target.value
                  )
                }
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-4
                  text-sm
                  text-slate-700
                  outline-none
                  transition
                  focus:border-indigo-500
                  focus:ring-4
                  focus:ring-indigo-50
                "
              >
                <option value="">
                  Todos los roles
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

            <div>

              <label
                className="
                  mb-2
                  block
                  text-xs
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-500
                "
              >
                Estado
              </label>

              <select
                value={filtroEstado}
                onChange={(event) =>
                  setFiltroEstado(
                    event.target.value
                  )
                }
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-4
                  text-sm
                  text-slate-700
                  outline-none
                  transition
                  focus:border-indigo-500
                  focus:ring-4
                  focus:ring-indigo-50
                "
              >
                <option value="TODOS">
                  Todos los estados
                </option>
                <option value="ACTIVOS">
                  Activos
                </option>
                <option value="INACTIVOS">
                  Inactivos
                </option>
                <option value="BLOQUEADOS">
                  Bloqueados
                </option>
              </select>

            </div>

          </div>

        </section>


        {/* ================================================= */}
        {/* LISTADO */}
        {/* ================================================= */}

        <section
          className="
            overflow-hidden
            rounded-3xl
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >

          <div
            className="
              flex
              flex-col
              gap-3
              border-b
              border-slate-100
              px-5
              py-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div>

              <div className="flex items-center gap-2">

                <Users
                  size={18}
                  className="text-indigo-600"
                />

                <h2 className="font-bold text-slate-900">
                  Usuarios registrados
                </h2>

              </div>

              <p className="mt-1 text-xs text-slate-500">
                Gestiona datos, rol y estado de acceso.
              </p>

            </div>

            <span
              className="
                inline-flex
                w-fit
                items-center
                rounded-full
                border
                border-slate-200
                bg-slate-50
                px-3
                py-1.5
                text-xs
                font-bold
                text-slate-600
              "
            >
              {usuariosFiltrados.length}
              {' '}
              {
                usuariosFiltrados.length === 1
                  ? 'resultado'
                  : 'resultados'
              }
            </span>

          </div>


          {/* MOBILE */}

          <div
            className="
              divide-y
              divide-slate-100
              lg:hidden
            "
          >

            {
              usuariosFiltrados.length === 0
                ? (
                  <EstadoVacio />
                )
                : (
                  usuariosFiltrados.map(
                    (usuario) => (
                      <TarjetaUsuarioMovil
                        key={usuario.id}
                        usuario={usuario}
                        procesando={
                          cambiandoEstadoId === usuario.id
                        }
                        onEditar={
                          abrirEditarUsuario
                        }
                        onCambiarEstado={
                          cambiarEstadoUsuario
                        }
                        formatearFecha={
                          formatearFecha
                        }
                        estaBloqueado={
                          estaBloqueado
                        }
                        obtenerIniciales={
                          obtenerIniciales
                        }
                      />
                    )
                  )
                )
            }

          </div>


          {/* DESKTOP */}

          <div
            className="
              hidden
              overflow-x-auto
              lg:block
            "
          >

            <table
              className="
                w-full
                min-w-[980px]
              "
            >

              <thead
                className="
                  border-b
                  border-slate-200
                  bg-slate-50
                "
              >
                <tr
                  className="
                    text-left
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-500
                  "
                >
                  <th className="px-5 py-4">
                    Usuario
                  </th>

                  <th className="px-5 py-4">
                    Rol
                  </th>

                  <th className="px-5 py-4">
                    Estado
                  </th>

                  <th className="px-5 py-4">
                    Último acceso
                  </th>

                  <th className="px-5 py-4 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {
                  usuariosFiltrados.length === 0
                    ? (
                      <tr>
                        <td colSpan="5">
                          <EstadoVacio />
                        </td>
                      </tr>
                    )
                    : (
                      usuariosFiltrados.map(
                        (usuario) => {

                          const bloqueado =
                            estaBloqueado(usuario);

                          const procesando =
                            cambiandoEstadoId ===
                            usuario.id;

                          return (

                            <tr
                              key={usuario.id}
                              className="
                                group
                                transition
                                hover:bg-indigo-50/30
                              "
                            >

                              <td className="px-5 py-4">

                                <div className="flex items-center gap-3">

                                  <div
                                    className="
                                      flex
                                      h-11
                                      w-11
                                      shrink-0
                                      items-center
                                      justify-center
                                      rounded-2xl
                                      bg-gradient-to-br
                                      from-indigo-50
                                      to-violet-100
                                      text-sm
                                      font-bold
                                      text-indigo-700
                                      ring-1
                                      ring-indigo-100
                                    "
                                  >
                                    {obtenerIniciales(usuario)}
                                  </div>

                                  <div className="min-w-0">

                                    <p
                                      className="
                                        font-semibold
                                        text-slate-800
                                      "
                                    >
                                      {usuario.nombres}{' '}
                                      {usuario.apellidos}
                                    </p>

                                    <div
                                      className="
                                        mt-1
                                        flex
                                        items-center
                                        gap-1.5
                                        text-xs
                                        text-slate-400
                                      "
                                    >
                                      <Mail size={12} />
                                      <span className="truncate">
                                        {usuario.email}
                                      </span>
                                    </div>

                                  </div>

                                </div>

                              </td>

                              <td className="px-5 py-4">

                                <span
                                  className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    rounded-lg
                                    border
                                    border-indigo-100
                                    bg-indigo-50
                                    px-2.5
                                    py-1
                                    text-xs
                                    font-bold
                                    text-indigo-700
                                  "
                                >
                                  <ShieldCheck size={13} />
                                  {
                                    usuario.rol?.nombre ||
                                    usuario.rol?.codigo ||
                                    'Sin rol'
                                  }
                                </span>

                              </td>

                              <td className="px-5 py-4">

                                <EstadoUsuario
                                  usuario={usuario}
                                  bloqueado={bloqueado}
                                />

                              </td>

                              <td className="px-5 py-4">

                                <div
                                  className="
                                    flex
                                    items-center
                                    gap-2
                                    text-sm
                                    text-slate-500
                                  "
                                >
                                  <Clock3
                                    size={15}
                                    className="text-slate-400"
                                  />

                                  {
                                    formatearFecha(
                                      usuario.ultimoLogin
                                    )
                                  }
                                </div>

                              </td>

                              <td className="px-5 py-4">

                                <div
                                  className="
                                    flex
                                    justify-end
                                    gap-2
                                  "
                                >

                                  <button
                                    type="button"
                                    title="Editar usuario"
                                    onClick={() =>
                                      abrirEditarUsuario(
                                        usuario
                                      )
                                    }
                                    className="
                                      inline-flex
                                      h-9
                                      items-center
                                      justify-center
                                      gap-2
                                      rounded-lg
                                      border
                                      border-slate-200
                                      bg-white
                                      px-3
                                      text-xs
                                      font-bold
                                      text-slate-600
                                      transition
                                      hover:border-indigo-200
                                      hover:bg-indigo-50
                                      hover:text-indigo-600
                                    "
                                  >
                                    <Pencil size={15} />
                                    Editar
                                  </button>

                                  <button
                                    type="button"
                                    disabled={procesando}
                                    title={
                                      usuario.activo
                                        ? 'Desactivar usuario'
                                        : 'Activar usuario'
                                    }
                                    onClick={() =>
                                      cambiarEstadoUsuario(
                                        usuario
                                      )
                                    }
                                    className={`
                                      inline-flex
                                      h-9
                                      items-center
                                      justify-center
                                      gap-2
                                      rounded-lg
                                      border
                                      px-3
                                      text-xs
                                      font-bold
                                      transition
                                      disabled:opacity-50
                                      ${
                                        usuario.activo
                                          ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                                          : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                      }
                                    `}
                                  >
                                    {
                                      procesando
                                        ? (
                                          <span
                                            className="
                                              h-4
                                              w-4
                                              animate-spin
                                              rounded-full
                                              border-2
                                              border-current
                                              border-t-transparent
                                            "
                                          />
                                        )
                                        : usuario.activo
                                          ? <PowerOff size={15} />
                                          : <Power size={15} />
                                    }

                                    {
                                      usuario.activo
                                        ? 'Desactivar'
                                        : 'Activar'
                                    }
                                  </button>

                                </div>

                              </td>

                            </tr>

                          );

                        }
                      )
                    )
                }

              </tbody>

            </table>

          </div>

        </section>

      </div>


      {/* ================================================= */}
      {/* MODAL EXISTENTE */}
      {/* ================================================= */}

      <UsuarioModal
        abierto={modalAbierto}
        modo={modoModal}
        usuario={usuarioSeleccionado}
        roles={roles}
        cargando={guardandoUsuario}
        error={errorModal}
        onCerrar={cerrarModal}
        onGuardar={guardarUsuario}
      />

    </>

  );

}


// ============================================================
// COMPONENTES VISUALES
// ============================================================

function EtiquetaHero({
  children
}) {

  return (
    <span
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        border-white/10
        bg-white/[0.08]
        px-3
        py-1.5
        text-xs
        font-semibold
        text-slate-200
        backdrop-blur
      "
    >
      {children}
    </span>
  );

}


function FilaResumen({
  etiqueta,
  valor,
  clase
}) {

  return (
    <div
      className="
        flex
        items-center
        justify-between
        rounded-xl
        border
        border-white/10
        bg-black/10
        px-3
        py-2.5
      "
    >
      <div className="flex items-center gap-2">
        <span
          className={`
            h-2
            w-2
            rounded-full
            ${clase}
          `}
        />

        <span
          className="
            text-xs
            font-medium
            text-slate-300
          "
        >
          {etiqueta}
        </span>
      </div>

      <span className="text-sm font-bold text-white">
        {valor}
      </span>
    </div>
  );

}


function TarjetaKpi({
  titulo,
  valor,
  descripcion,
  icono: Icono,
  tono,
  etiqueta
}) {

  const estilos = {
    indigo: {
      icono:
        'bg-indigo-50 text-indigo-600',
      barra:
        'from-indigo-500 to-violet-500',
      etiqueta:
        'bg-indigo-50 text-indigo-600'
    },
    emerald: {
      icono:
        'bg-emerald-50 text-emerald-600',
      barra:
        'from-emerald-500 to-teal-500',
      etiqueta:
        'bg-emerald-50 text-emerald-600'
    },
    slate: {
      icono:
        'bg-slate-100 text-slate-600',
      barra:
        'from-slate-400 to-slate-600',
      etiqueta:
        'bg-slate-100 text-slate-600'
    },
    amber: {
      icono:
        'bg-amber-50 text-amber-600',
      barra:
        'from-amber-500 to-orange-500',
      etiqueta:
        'bg-amber-50 text-amber-600'
    }
  };

  const estilo =
    estilos[tono] ||
    estilos.indigo;

  return (
    <article
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        transition
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
        hover:shadow-slate-200/60
      "
    >

      <div
        className="
          absolute
          -right-8
          -top-8
          h-24
          w-24
          rounded-full
          bg-slate-100
          opacity-60
          transition
          group-hover:scale-125
        "
      />

      <div
        className="
          relative
          flex
          items-start
          justify-between
          gap-4
        "
      >

        <div>
          <span
            className={`
              inline-flex
              rounded-full
              px-2.5
              py-1
              text-[10px]
              font-bold
              uppercase
              tracking-wide
              ${estilo.etiqueta}
            `}
          >
            {etiqueta}
          </span>

          <p
            className="
              mt-4
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-slate-400
            "
          >
            {titulo}
          </p>

          <p
            className="
              mt-1
              text-3xl
              font-bold
              tracking-tight
              text-slate-950
            "
          >
            {valor}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {descripcion}
          </p>
        </div>

        <div
          className={`
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            ${estilo.icono}
          `}
        >
          <Icono size={22} />
        </div>

      </div>

      <div
        className={`
          absolute
          bottom-0
          left-0
          h-1
          w-full
          bg-gradient-to-r
          ${estilo.barra}
        `}
      />

    </article>
  );

}


function EstadoUsuario({
  usuario,
  bloqueado
}) {

  if (bloqueado) {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-1.5
          rounded-full
          border
          border-amber-200
          bg-amber-50
          px-3
          py-1
          text-xs
          font-bold
          text-amber-700
        "
      >
        <LockKeyhole size={13} />
        Bloqueado
      </span>
    );
  }

  if (usuario.activo) {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-1.5
          rounded-full
          border
          border-emerald-200
          bg-emerald-50
          px-3
          py-1
          text-xs
          font-bold
          text-emerald-700
        "
      >
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Activo
      </span>
    );
  }

  return (
    <span
      className="
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        border-slate-200
        bg-slate-50
        px-3
        py-1
        text-xs
        font-bold
        text-slate-600
      "
    >
      <span className="h-2 w-2 rounded-full bg-slate-400" />
      Inactivo
    </span>
  );

}


function TarjetaUsuarioMovil({
  usuario,
  procesando,
  onEditar,
  onCambiarEstado,
  formatearFecha,
  estaBloqueado,
  obtenerIniciales
}) {

  const bloqueado =
    estaBloqueado(usuario);

  return (
    <article className="p-5">

      <div className="flex items-start gap-3">

        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            from-indigo-50
            to-violet-100
            font-bold
            text-indigo-700
          "
        >
          {obtenerIniciales(usuario)}
        </div>

        <div className="min-w-0 flex-1">

          <div
            className="
              flex
              flex-col
              gap-2
              sm:flex-row
              sm:items-start
              sm:justify-between
            "
          >

            <div>
              <p className="font-bold text-slate-800">
                {usuario.nombres}{' '}
                {usuario.apellidos}
              </p>

              <p
                className="
                  mt-1
                  truncate
                  text-xs
                  text-slate-400
                "
              >
                {usuario.email}
              </p>
            </div>

            <EstadoUsuario
              usuario={usuario}
              bloqueado={bloqueado}
            />

          </div>

          <div
            className="
              mt-4
              grid
              gap-2
              rounded-xl
              bg-slate-50
              p-3
              text-xs
              text-slate-500
            "
          >

            <div className="flex items-center gap-2">
              <ShieldCheck size={14} />
              {
                usuario.rol?.nombre ||
                usuario.rol?.codigo ||
                'Sin rol'
              }
            </div>

            <div className="flex items-center gap-2">
              <Clock3 size={14} />
              Último acceso:
              {' '}
              {formatearFecha(usuario.ultimoLogin)}
            </div>

          </div>

          <div className="mt-4 flex gap-2">

            <button
              type="button"
              onClick={() =>
                onEditar(usuario)
              }
              className="
                inline-flex
                h-10
                flex-1
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                text-xs
                font-bold
                text-slate-600
              "
            >
              <Pencil size={15} />
              Editar
            </button>

            <button
              type="button"
              disabled={procesando}
              onClick={() =>
                onCambiarEstado(usuario)
              }
              className={`
                inline-flex
                h-10
                flex-1
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                text-xs
                font-bold
                disabled:opacity-50
                ${
                  usuario.activo
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                }
              `}
            >
              {
                procesando
                  ? (
                    <span
                      className="
                        h-4
                        w-4
                        animate-spin
                        rounded-full
                        border-2
                        border-current
                        border-t-transparent
                      "
                    />
                  )
                  : usuario.activo
                    ? <PowerOff size={15} />
                    : <Power size={15} />
              }

              {
                usuario.activo
                  ? 'Desactivar'
                  : 'Activar'
              }
            </button>

          </div>

        </div>

      </div>

    </article>
  );

}


function EstadoVacio() {

  return (
    <div
      className="
        flex
        min-h-72
        flex-col
        items-center
        justify-center
        px-6
        py-12
        text-center
      "
    >
      <div
        className="
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-2xl
          bg-slate-100
          text-slate-400
        "
      >
        <Sparkles size={28} />
      </div>

      <h3 className="mt-4 font-bold text-slate-800">
        No se encontraron usuarios
      </h3>

      <p
        className="
          mt-2
          max-w-sm
          text-sm
          leading-6
          text-slate-500
        "
      >
        No existen cuentas que coincidan con los
        filtros seleccionados.
      </p>
    </div>
  );

}


export default UsuariosPage;
