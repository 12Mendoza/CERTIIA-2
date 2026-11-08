import {
  useState
} from 'react';

import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate
} from 'react-router-dom';

import {
  BarChart3,
  Bell,
  BrainCircuit,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Files,
  FileText,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Store,
  User,
  Users,
  X
} from 'lucide-react';

import {
  useAuth
} from '../context/AuthContext.jsx';


// =====================================================
// MENÚ PRINCIPAL
// =====================================================

const menuItems = [

  {
    nombre: 'Dashboard',
    ruta: '/dashboard',
    icono: LayoutDashboard,
    permiso: 'dashboard.ver',
    seccion: 'Principal',
    descripcion:
      'Resumen general del cumplimiento documental'
  },

  // ===================================================
  // OPERACIÓN
  // ===================================================

  {
    nombre: 'Tiendas',
    ruta: '/tiendas',
    icono: Store,
    permiso: 'tiendas.ver',
    seccion: 'Operación',
    descripcion:
      'Administración de tiendas retail'
  },

  {
    nombre: 'Entidades Emisoras',
    ruta: '/entidades',
    icono: Building2,
    permiso: 'entidades.ver',
    seccion: 'Operación',
    descripcion:
      'Entidades responsables de emitir documentos'
  },

  {
    nombre: 'Tipos de Documento',
    ruta: '/tipos-documento',
    icono: FileText,
    permiso: 'tipos_documento.ver',
    seccion: 'Operación',
    descripcion:
      'Configuración de documentos y vigencias'
  },

  {
    nombre: 'Documentos',
    ruta: '/documentos',
    icono: Files,
    permiso: 'documentos.crear',
    seccion: 'Operación',
    descripcion:
      'Control de documentos de operatividad'
  },

  {
    nombre: 'Trámites',
    ruta: '/tramites',
    icono: ClipboardList,
    permiso: 'tramites.crear',
    seccion: 'Operación',
    descripcion:
      'Seguimiento de expedientes y trámites'
  },

  {
    nombre: 'Renovaciones',
    ruta: '/renovaciones',
    icono: RefreshCw,
    permiso: 'renovaciones.ver',
    seccion: 'Operación',
    descripcion:
      'Gestión del ciclo de renovación documental'
  },

  // ===================================================
  // CONTROL
  // ===================================================

  {
    nombre: 'Alertas y Calendario',
    ruta: '/alertas',
    icono: Bell,
    permiso: 'alertas.ver',
    seccion: 'Control',
    descripcion:
      'Alertas, vencimientos y planificación'
  },

  {
    nombre: 'Reportes',
    ruta: '/reportes',
    icono: BarChart3,
    permiso: 'reportes.ver',
    seccion: 'Control',
    descripcion:
      'Análisis y exportación de información'
  },

  // ===================================================
  // INTELIGENCIA
  // ===================================================

  {
    nombre: 'IA Predictiva',
    ruta: '/ia-predictiva',
    icono: BrainCircuit,
    permiso: 'ia.ver',
    seccion: 'Inteligencia',
    descripcion:
      'Predicción de riesgo y duración'
  },

  // ===================================================
  // ADMINISTRACIÓN
  // ===================================================

  {
    nombre: 'Usuarios',
    ruta: '/usuarios',
    icono: Users,
    permiso: 'usuarios.ver',
    seccion: 'Administración',
    descripcion:
      'Administración de cuentas de usuario'
  },

  {
    nombre: 'Roles y permisos',
    ruta: '/roles',
    icono: ShieldCheck,
    permiso: 'roles.ver',
    seccion: 'Administración',
    descripcion:
      'Control de accesos y permisos'
  },

  {
    nombre: 'Auditoría',
    ruta: '/auditoria',
    icono: ClipboardList,
    permiso: 'auditoria.ver',
    seccion: 'Administración',
    descripcion:
      'Trazabilidad de operaciones del sistema'
  },

  {
    nombre: 'Configuración',
    ruta: '/configuracion',
    icono: Settings2,
    permiso: 'configuracion.ver',
    seccion: 'Administración',
    descripcion:
      'Parámetros generales y reglas del sistema'
  },

  // ===================================================
  // CUENTA
  // ===================================================

  {
    nombre: 'Cambiar contraseña',
    ruta: '/cambiar-password',
    icono: KeyRound,
    permiso: null,
    seccion: 'Cuenta',
    descripcion:
      'Seguridad de la cuenta'
  }

];


const ordenSecciones = [
  'Principal',
  'Operación',
  'Control',
  'Inteligencia',
  'Administración',
  'Cuenta'
];


// =====================================================
// APP LAYOUT
// =====================================================

function AppLayout() {

  const navigate =
    useNavigate();

  const location =
    useLocation();


  const {
    usuario,
    logout
  } = useAuth();


  const [
    sidebarContraido,
    setSidebarContraido
  ] = useState(false);


  const [
    sidebarMovil,
    setSidebarMovil
  ] = useState(false);


  const [
    cerrandoSesion,
    setCerrandoSesion
  ] = useState(false);


  // ===================================================
  // PERMISOS DEL USUARIO
  // ===================================================

  const permisosUsuario =
    usuario?.permisos || [];


  // ===================================================
  // MENÚ SEGÚN PERMISOS
  // ===================================================

  const menuVisible =
    menuItems.filter(
      (item) =>
        !item.permiso ||
        permisosUsuario.includes(
          item.permiso
        )
    );


  // ===================================================
  // SECCIONES VISIBLES
  // ===================================================

  const seccionesVisibles =
    ordenSecciones
      .map(
        (seccion) => ({
          nombre: seccion,

          items:
            menuVisible.filter(
              (item) =>
                item.seccion ===
                seccion
            )
        })
      )
      .filter(
        (seccion) =>
          seccion.items.length > 0
      );


  // ===================================================
  // PÁGINA ACTUAL
  // ===================================================

  const itemActual =
    [...menuItems]
      .sort(
        (a, b) =>
          b.ruta.length -
          a.ruta.length
      )
      .find(
        (item) =>
          location.pathname ===
            item.ruta ||

          location.pathname.startsWith(
            `${item.ruta}/`
          )
      );


  const tituloActual =
    itemActual?.nombre ||
    'CERTIIA';


  const descripcionActual =
    itemActual?.descripcion ||
    'Sistema de gestión documental';


  // ===================================================
  // CERRAR SESIÓN
  // ===================================================

  async function handleLogout() {

    try {

      setCerrandoSesion(true);

      await logout();

      navigate(
        '/login',
        {
          replace: true
        }
      );

    } finally {

      setCerrandoSesion(false);
    }
  }


  // ===================================================
  // DATOS DEL USUARIO
  // ===================================================

  const nombreUsuario =
    usuario?.nombres ||
    'Usuario';


  const apellidoUsuario =
    usuario?.apellidos ||
    '';


  const nombreCompleto =
    `${nombreUsuario} ${apellidoUsuario}`
      .trim();


  const iniciales =
    `${nombreUsuario?.[0] || 'U'}${apellidoUsuario?.[0] || ''}`
      .toUpperCase();


  const rolUsuario =
    usuario?.rolNombre ||
    usuario?.rol ||
    'Usuario';


  return (

    <div
      className="
        min-h-screen
        bg-slate-50
        text-slate-900
      "
    >

      {/* ============================================= */}
      {/* FONDO MÓVIL */}
      {/* ============================================= */}

      {
        sidebarMovil && (

          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() =>
              setSidebarMovil(false)
            }
            className="
              fixed inset-0 z-40
              bg-slate-950/60
              backdrop-blur-sm
              lg:hidden
            "
          />

        )
      }


      {/* ============================================= */}
      {/* SIDEBAR */}
      {/* ============================================= */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50

          flex flex-col

          border-r
          border-slate-800

          bg-slate-950

          text-white

          shadow-2xl
          shadow-slate-950/10

          transition-all
          duration-300

          ${
            sidebarContraido
              ? 'lg:w-20'
              : 'lg:w-72'
          }

          ${
            sidebarMovil
              ? 'w-72 translate-x-0'
              : '-translate-x-full lg:translate-x-0'
          }
        `}
      >

        {/* =========================================== */}
        {/* LOGO */}
        {/* =========================================== */}

        <div
          className="
            flex h-20
            shrink-0
            items-center
            justify-between
            border-b
            border-slate-800
            px-4
          "
        >

          <div
            className="
              flex
              min-w-0
              items-center
              gap-3
            "
          >

            <div
              className="
                flex h-11 w-11
                shrink-0
                items-center
                justify-center

                rounded-2xl

                bg-gradient-to-br
                from-indigo-500
                to-indigo-700

                shadow-lg
                shadow-indigo-950/40
              "
            >

              <ShieldCheck
                size={24}
              />

            </div>


            {
              (
                !sidebarContraido ||
                sidebarMovil
              ) && (

                <div
                  className="
                    min-w-0
                  "
                >

                  <p
                    className="
                      truncate
                      text-lg
                      font-bold
                      tracking-wide
                    "
                  >

                    CERTIIA

                  </p>


                  <p
                    className="
                      truncate
                      text-[11px]
                      font-medium
                      uppercase
                      tracking-[0.12em]
                      text-slate-500
                    "
                  >

                    Control documental

                  </p>

                </div>

              )
            }

          </div>


          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() =>
              setSidebarMovil(false)
            }
            className="
              rounded-xl
              p-2

              text-slate-400

              transition

              hover:bg-slate-800
              hover:text-white

              lg:hidden
            "
          >

            <X
              size={20}
            />

          </button>

        </div>


        {/* =========================================== */}
        {/* NAVEGACIÓN */}
        {/* =========================================== */}

        <nav
          className="
            flex-1
            overflow-y-auto
            px-3
            py-5
          "
        >

          {
            seccionesVisibles.map(
              (
                seccion,
                indiceSeccion
              ) => (

                <div
                  key={
                    seccion.nombre
                  }
                  className={
                    indiceSeccion === 0
                      ? ''
                      : 'mt-6'
                  }
                >

                  {
                    (
                      !sidebarContraido ||
                      sidebarMovil
                    ) && (

                      <p
                        className="
                          mb-2
                          px-3

                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.18em]

                          text-slate-600
                        "
                      >

                        {
                          seccion.nombre
                        }

                      </p>

                    )
                  }


                  <div
                    className="
                      space-y-1
                    "
                  >

                    {
                      seccion.items.map(
                        ({
                          nombre,
                          ruta,
                          icono: Icon
                        }) => (

                          <NavLink
                            key={ruta}
                            to={ruta}
                            onClick={() =>
                              setSidebarMovil(
                                false
                              )
                            }
                            title={
                              sidebarContraido &&
                              !sidebarMovil
                                ? nombre
                                : undefined
                            }
                            className={
                              ({
                                isActive
                              }) => `

                                group

                                relative

                                flex
                                min-h-11
                                items-center

                                rounded-xl

                                transition-all
                                duration-200

                                ${
                                  sidebarContraido &&
                                  !sidebarMovil

                                    ? `
                                      justify-center
                                      px-2
                                    `

                                    : `
                                      gap-3
                                      px-3
                                    `
                                }

                                ${
                                  isActive

                                    ? `
                                      bg-indigo-600
                                      text-white

                                      shadow-lg
                                      shadow-indigo-950/30
                                    `

                                    : `
                                      text-slate-400

                                      hover:bg-slate-900
                                      hover:text-slate-100
                                    `
                                }
                              `
                            }
                          >

                            <Icon
                              size={19}
                              className="
                                shrink-0
                              "
                            />


                            {
                              (
                                !sidebarContraido ||
                                sidebarMovil
                              ) && (

                                <span
                                  className="
                                    truncate
                                    text-sm
                                    font-medium
                                  "
                                >

                                  {nombre}

                                </span>

                              )
                            }

                          </NavLink>

                        )
                      )
                    }

                  </div>

                </div>

              )
            )
          }

        </nav>


        {/* =========================================== */}
        {/* INFORMACIÓN DEL USUARIO */}
        {/* =========================================== */}

        <div
          className="
            shrink-0
            border-t
            border-slate-800
            p-3
          "
        >

          {
            (
              !sidebarContraido ||
              sidebarMovil
            ) && (

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/cambiar-password'
                  )
                }
                className="
                  mb-2
                  flex w-full
                  items-center
                  gap-3

                  rounded-xl

                  bg-slate-900/80
                  p-3

                  text-left

                  transition

                  hover:bg-slate-900
                "
              >

                <div
                  className="
                    flex h-10 w-10
                    shrink-0
                    items-center
                    justify-center

                    rounded-xl

                    bg-indigo-500/15

                    text-sm
                    font-bold
                    text-indigo-300
                  "
                >

                  {iniciales}

                </div>


                <div
                  className="
                    min-w-0
                    flex-1
                  "
                >

                  <p
                    className="
                      truncate
                      text-sm
                      font-semibold
                      text-white
                    "
                  >

                    {nombreCompleto}

                  </p>


                  <p
                    className="
                      truncate
                      text-xs
                      text-slate-500
                    "
                  >

                    {rolUsuario}

                  </p>

                </div>

              </button>

            )
          }


          <button
            type="button"
            disabled={
              cerrandoSesion
            }
            onClick={
              handleLogout
            }
            title={
              sidebarContraido
                ? 'Cerrar sesión'
                : undefined
            }
            className={`
              flex h-11
              w-full
              items-center

              rounded-xl

              text-slate-400

              transition

              hover:bg-red-500/10
              hover:text-red-400

              disabled:cursor-not-allowed
              disabled:opacity-50

              ${
                sidebarContraido &&
                !sidebarMovil

                  ? `
                    justify-center
                    px-2
                  `

                  : `
                    gap-3
                    px-3
                  `
              }
            `}
          >

            <LogOut
              size={19}
              className="
                shrink-0
              "
            />


            {
              (
                !sidebarContraido ||
                sidebarMovil
              ) && (

                <span
                  className="
                    text-sm
                    font-medium
                  "
                >

                  {
                    cerrandoSesion
                      ? 'Cerrando...'
                      : 'Cerrar sesión'
                  }

                </span>

              )
            }

          </button>

        </div>


        {/* =========================================== */}
        {/* BOTÓN CONTRAER */}
        {/* =========================================== */}

        <button
          type="button"
          aria-label={
            sidebarContraido
              ? 'Expandir menú'
              : 'Contraer menú'
          }
          onClick={() =>
            setSidebarContraido(
              !sidebarContraido
            )
          }
          className="
            absolute
            -right-3
            top-24

            hidden
            h-7 w-7
            items-center
            justify-center

            rounded-full

            border
            border-slate-700

            bg-slate-900

            text-slate-300

            shadow-md

            transition

            hover:border-indigo-500
            hover:bg-indigo-600
            hover:text-white

            lg:flex
          "
        >

          {
            sidebarContraido
              ? (

                <ChevronRight
                  size={15}
                />

              )
              : (

                <ChevronLeft
                  size={15}
                />

              )
          }

        </button>

      </aside>


      {/* ============================================= */}
      {/* CONTENIDO PRINCIPAL */}
      {/* ============================================= */}

      <div
        className={`
          min-h-screen

          transition-all
          duration-300

          ${
            sidebarContraido
              ? 'lg:pl-20'
              : 'lg:pl-72'
          }
        `}
      >

        {/* =========================================== */}
        {/* HEADER */}
        {/* =========================================== */}

        <header
          className="
            sticky
            top-0
            z-30

            border-b
            border-slate-200/80

            bg-white/95

            backdrop-blur-xl
          "
        >

          <div
            className="
              flex
              min-h-20
              items-center
              justify-between

              gap-4

              px-4
              sm:px-6
              lg:px-8
            "
          >

            {/* ======================================= */}
            {/* IZQUIERDA */}
            {/* ======================================= */}

            <div
              className="
                flex
                min-w-0
                items-center
                gap-4
              "
            >

              <button
                type="button"
                aria-label="Abrir menú"
                onClick={() =>
                  setSidebarMovil(true)
                }
                className="
                  flex h-10 w-10
                  shrink-0
                  items-center
                  justify-center

                  rounded-xl

                  border
                  border-slate-200

                  bg-white

                  text-slate-600

                  shadow-sm

                  transition

                  hover:border-indigo-200
                  hover:bg-indigo-50
                  hover:text-indigo-600

                  lg:hidden
                "
              >

                <Menu
                  size={21}
                />

              </button>


              <div
                className="
                  min-w-0
                "
              >

                {/* BREADCRUMB */}

                <div
                  className="
                    mb-0.5

                    flex
                    items-center
                    gap-1.5

                    text-xs
                    font-medium
                    text-slate-400
                  "
                >

                  <span>
                    CERTIIA
                  </span>

                  <ChevronRight
                    size={13}
                  />

                  <span
                    className="
                      truncate
                      text-slate-500
                    "
                  >

                    {tituloActual}

                  </span>

                </div>


                {/* TÍTULO */}

                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >

                  <h1
                    className="
                      truncate

                      text-base
                      font-bold
                      text-slate-900

                      sm:text-lg
                    "
                  >

                    {tituloActual}

                  </h1>

                </div>


                <p
                  className="
                    hidden
                    truncate

                    text-xs
                    text-slate-500

                    md:block
                  "
                >

                  {descripcionActual}

                </p>

              </div>

            </div>


            {/* ======================================= */}
            {/* DERECHA */}
            {/* ======================================= */}

            <div
              className="
                flex
                shrink-0
                items-center
                gap-2
              "
            >

              {/* ALERTAS */}

              {
                permisosUsuario.includes(
                  'alertas.ver'
                ) && (

                  <button
                    type="button"
                    aria-label="Abrir alertas"
                    title="Alertas y calendario"
                    onClick={() =>
                      navigate('/alertas')
                    }
                    className="
                      flex h-10 w-10
                      items-center
                      justify-center

                      rounded-xl

                      border
                      border-slate-200

                      bg-white

                      text-slate-500

                      shadow-sm

                      transition

                      hover:border-indigo-200
                      hover:bg-indigo-50
                      hover:text-indigo-600
                    "
                  >

                    <Bell
                      size={19}
                    />

                  </button>

                )
              }


              {/* CUENTA */}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/cambiar-password'
                  )
                }
                title="Configuración de la cuenta"
                className="
                  flex
                  items-center
                  gap-3

                  rounded-xl

                  border
                  border-transparent

                  px-1.5
                  py-1.5

                  transition

                  hover:border-slate-200
                  hover:bg-slate-50
                "
              >

                <div
                  className="
                    hidden
                    max-w-40
                    text-right
                    sm:block
                  "
                >

                  <p
                    className="
                      truncate

                      text-sm
                      font-semibold
                      text-slate-800
                    "
                  >

                    {nombreCompleto}

                  </p>


                  <p
                    className="
                      truncate
                      text-xs
                      text-slate-400
                    "
                  >

                    {rolUsuario}

                  </p>

                </div>


                <div
                  className="
                    flex h-10 w-10
                    items-center
                    justify-center

                    rounded-xl

                    bg-gradient-to-br
                    from-indigo-50
                    to-indigo-100

                    font-bold
                    text-indigo-700

                    ring-1
                    ring-indigo-200
                  "
                >

                  {
                    iniciales || (

                      <User
                        size={19}
                      />

                    )
                  }

                </div>

              </button>

            </div>

          </div>

        </header>


        {/* =========================================== */}
        {/* PÁGINA ACTUAL */}
        {/* =========================================== */}

        <main
          className="
            min-h-[calc(100vh-5rem)]

            bg-slate-50

            p-4
            sm:p-6
            lg:p-8
          "
        >

          <div
            className="
              mx-auto
              w-full
              max-w-[1700px]
            "
          >

            <Outlet />

          </div>

        </main>

      </div>

    </div>
  );
}


export default AppLayout;