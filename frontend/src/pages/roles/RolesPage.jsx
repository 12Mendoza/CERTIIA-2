import {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Check,
  CircleAlert,
  KeyRound,
  Layers3,
  LockKeyhole,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

import {
  api
} from '../../services/api';


function RolesPage() {

  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [recargando, setRecargando] = useState(false);

  const [
    procesandoPermiso,
    setProcesandoPermiso
  ] = useState('');

  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [
    busquedaPermiso,
    setBusquedaPermiso
  ] = useState('');


  // ============================================================
  // CARGA
  // ============================================================

  async function cargarRoles() {

    const respuesta =
      await api.get('/roles');

    setRoles(
      respuesta.roles || []
    );

  }


  async function cargarPermisos() {

    const respuesta =
      await api.get(
        '/roles/permisos'
      );

    setPermisos(
      respuesta.permisos || []
    );

  }


  async function cargarDatos(
    mostrarRecarga = false
  ) {

    try {

      setError('');

      if (mostrarRecarga) {
        setRecargando(true);
      } else {
        setCargando(true);
      }

      await Promise.all([
        cargarRoles(),
        cargarPermisos()
      ]);

    } catch (errorCarga) {

      setError(
        errorCarga.message ||
        'No se pudieron cargar los roles y permisos.'
      );

    } finally {

      setCargando(false);
      setRecargando(false);

    }

  }


  useEffect(() => {

    cargarDatos();

  }, []);


  // ============================================================
  // PERMISOS AGRUPADOS
  // ============================================================

  const permisosFiltrados =
    useMemo(() => {

      const texto =
        busquedaPermiso
          .trim()
          .toLowerCase();

      if (!texto) {
        return permisos;
      }

      return permisos.filter(
        (permiso) => {

          const nombre =
            permiso.nombre
              ?.toLowerCase() ||
            '';

          const codigo =
            permiso.codigo
              ?.toLowerCase() ||
            '';

          const modulo =
            permiso.modulo
              ?.toLowerCase() ||
            '';

          const descripcion =
            permiso.descripcion
              ?.toLowerCase() ||
            '';

          return (
            nombre.includes(texto) ||
            codigo.includes(texto) ||
            modulo.includes(texto) ||
            descripcion.includes(texto)
          );

        }
      );

    }, [
      permisos,
      busquedaPermiso
    ]);


  const permisosPorModulo =
    useMemo(() => {

      const grupos = {};

      permisosFiltrados.forEach(
        (permiso) => {

          const modulo =
            permiso.modulo ||
            'OTROS';

          if (!grupos[modulo]) {
            grupos[modulo] = [];
          }

          grupos[modulo].push(
            permiso
          );

        }
      );

      return grupos;

    }, [
      permisosFiltrados
    ]);


  const cantidadModulos =
    useMemo(
      () =>
        new Set(
          permisos
            .map(
              (permiso) =>
                permiso.modulo ||
                'OTROS'
            )
        ).size,
      [
        permisos
      ]
    );


  const totalAsignaciones =
    roles.reduce(
      (
        total,
        rol
      ) =>
        total +
        (
          rol.permisos?.length ||
          0
        ),
      0
    );


  // ============================================================
  // PERMISO ASIGNADO
  // ============================================================

  function tienePermiso(
    rol,
    permisoId
  ) {

    return rol.permisos?.some(
      (permiso) =>
        permiso.id === permisoId
    );

  }


  // ============================================================
  // CAMBIAR PERMISO
  // ============================================================

  async function cambiarPermiso(
    rol,
    permiso
  ) {

    const asignado =
      tienePermiso(
        rol,
        permiso.id
      );

    const claveProceso =
      `${rol.id}-${permiso.id}`;

    try {

      setProcesandoPermiso(
        claveProceso
      );

      setError('');
      setMensaje('');

      if (asignado) {

        const respuesta =
          await api.delete(
            `/roles/${rol.id}/permisos/${permiso.id}`
          );

        setMensaje(
          respuesta.mensaje ||
          'Permiso retirado correctamente.'
        );

      }

      if (!asignado) {

        const respuesta =
          await api.post(
            `/roles/${rol.id}/permisos`,
            {
              permisoCodigo:
                permiso.codigo
            }
          );

        setMensaje(
          respuesta.mensaje ||
          'Permiso asignado correctamente.'
        );

      }

      await cargarRoles();

      setTimeout(() => {
        setMensaje('');
      }, 3500);

    } catch (errorPermiso) {

      setError(
        errorPermiso.message ||
        'No se pudo modificar el permiso.'
      );

    } finally {

      setProcesandoPermiso('');

    }

  }


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
            <ShieldCheck size={28} />

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

          <h2 className="mt-5 text-lg font-bold text-slate-900">
            Cargando roles y permisos
          </h2>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-500
            "
          >
            Estamos consultando la configuración
            actual del control de acceso.
          </p>

        </div>

      </div>

    );

  }


  return (

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
            lg:grid-cols-[1fr_340px]
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

            <div className="mb-4 flex items-center gap-3">

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
                <LockKeyhole size={22} />
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
                  Control de acceso
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  RBAC · Roles y permisos
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
              Roles y permisos
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
              Controla de forma centralizada qué acciones
              puede ejecutar cada rol dentro de CERTIIA,
              aplicando el principio de mínimo privilegio.
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
                <ShieldCheck size={14} />
                {roles.length} roles
              </EtiquetaHero>

              <EtiquetaHero>
                <KeyRound size={14} />
                {permisos.length} permisos
              </EtiquetaHero>

              <EtiquetaHero>
                <Layers3 size={14} />
                {cantidadModulos} módulos
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

            <div className="flex items-center justify-between">

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
                  Política de acceso
                </p>

                <p className="mt-1 text-lg font-bold text-white">
                  RBAC activo
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
                <ShieldCheck size={22} />
              </div>

            </div>

            <div className="mt-5 space-y-3">

              <FilaResumen
                etiqueta="Roles configurados"
                valor={roles.length}
                clase="bg-indigo-400"
              />

              <FilaResumen
                etiqueta="Permisos disponibles"
                valor={permisos.length}
                clase="bg-emerald-400"
              />

              <FilaResumen
                etiqueta="Asignaciones activas"
                valor={totalAsignaciones}
                clase="bg-violet-400"
              />

            </div>

            <button
              type="button"
              onClick={() =>
                cargarDatos(true)
              }
              disabled={recargando}
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
                disabled:opacity-60
              "
            >
              <RefreshCw
                size={17}
                className={
                  recargando
                    ? 'animate-spin'
                    : ''
                }
              />

              {
                recargando
                  ? 'Actualizando...'
                  : 'Actualizar permisos'
              }
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
            <Check
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-bold">
                Permisos actualizados
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
                No se pudo modificar el acceso
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
          titulo="Roles"
          valor={roles.length}
          descripcion="Perfiles de acceso"
          icono={ShieldCheck}
          tono="indigo"
          etiqueta="RBAC"
        />

        <TarjetaKpi
          titulo="Permisos"
          valor={permisos.length}
          descripcion="Acciones controladas"
          icono={KeyRound}
          tono="emerald"
          etiqueta="Acciones"
        />

        <TarjetaKpi
          titulo="Módulos"
          valor={cantidadModulos}
          descripcion="Áreas protegidas"
          icono={Layers3}
          tono="violet"
          etiqueta="Cobertura"
        />

        <TarjetaKpi
          titulo="Asignaciones"
          valor={totalAsignaciones}
          descripcion="Permisos en uso"
          icono={LockKeyhole}
          tono="amber"
          etiqueta="Acceso"
        />

      </section>


      {/* ================================================= */}
      {/* BUSCADOR */}
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
            bg-gradient-to-r
            from-white
            to-slate-50
            px-5
            py-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div>

            <h2 className="font-bold text-slate-900">
              Matriz de permisos
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Busca un permiso por nombre, código,
              módulo o descripción.
            </p>

          </div>

          <div className="relative w-full sm:max-w-md">

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
              value={busquedaPermiso}
              onChange={(event) =>
                setBusquedaPermiso(
                  event.target.value
                )
              }
              placeholder="Buscar permiso..."
              className="
                h-11
                w-full
                rounded-xl
                border
                border-slate-300
                bg-white
                pl-11
                pr-4
                text-sm
                text-slate-800
                outline-none
                transition
                focus:border-indigo-500
                focus:ring-4
                focus:ring-indigo-50
              "
            />

          </div>

        </div>

      </section>


      {/* ================================================= */}
      {/* ROLES */}
      {/* ================================================= */}

      <section className="space-y-6">

        {
          roles.map(
            (rol) => {

              const asignados =
                rol.permisos?.length ||
                0;

              const porcentaje =
                permisos.length > 0
                  ? Math.round(
                      (asignados / permisos.length) * 100
                    )
                  : 0;

              return (

                <article
                  key={rol.id}
                  className="
                    overflow-hidden
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                  "
                >

                  {/* CABECERA ROL */}

                  <div
                    className="
                      relative
                      overflow-hidden
                      border-b
                      border-slate-100
                      bg-gradient-to-r
                      from-slate-50
                      via-white
                      to-indigo-50/50
                      px-5
                      py-5
                      sm:px-6
                    "
                  >

                    <div
                      className="
                        absolute
                        -right-12
                        -top-16
                        h-40
                        w-40
                        rounded-full
                        bg-indigo-100/60
                        blur-3xl
                      "
                    />

                    <div
                      className="
                        relative
                        flex
                        flex-col
                        gap-5
                        lg:flex-row
                        lg:items-center
                        lg:justify-between
                      "
                    >

                      <div className="flex items-start gap-4">

                        <div
                          className="
                            flex
                            h-13
                            w-13
                            shrink-0
                            items-center
                            justify-center
                            rounded-2xl
                            bg-indigo-100
                            text-indigo-700
                          "
                        >
                          <ShieldCheck size={24} />
                        </div>

                        <div>

                          <div
                            className="
                              flex
                              flex-wrap
                              items-center
                              gap-2
                            "
                          >

                            <h2
                              className="
                                text-lg
                                font-bold
                                text-slate-900
                              "
                            >
                              {rol.nombre}
                            </h2>

                            <span
                              className="
                                rounded-lg
                                bg-slate-200
                                px-2
                                py-1
                                text-[11px]
                                font-bold
                                tracking-wide
                                text-slate-600
                              "
                            >
                              {rol.codigo}
                            </span>

                            <span
                              className={`
                                rounded-full
                                border
                                px-2.5
                                py-1
                                text-[11px]
                                font-bold
                                ${
                                  rol.activo
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-red-200 bg-red-50 text-red-700'
                                }
                              `}
                            >
                              {
                                rol.activo
                                  ? 'Activo'
                                  : 'Inactivo'
                              }
                            </span>

                          </div>

                          <p
                            className="
                              mt-2
                              max-w-2xl
                              text-sm
                              leading-6
                              text-slate-500
                            "
                          >
                            {
                              rol.descripcion ||
                              'Rol del sistema CERTIIA'
                            }
                          </p>

                        </div>

                      </div>

                      <div
                        className="
                          min-w-[240px]
                          rounded-2xl
                          border
                          border-slate-200
                          bg-white
                          p-4
                          shadow-sm
                        "
                      >

                        <div className="flex items-center justify-between">

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
                              Cobertura
                            </p>

                            <p className="mt-1 text-xl font-bold text-slate-900">
                              {asignados} / {permisos.length}
                            </p>
                          </div>

                          <span
                            className="
                              rounded-full
                              bg-indigo-50
                              px-3
                              py-1.5
                              text-xs
                              font-bold
                              text-indigo-600
                            "
                          >
                            {porcentaje}%
                          </span>

                        </div>

                        <div
                          className="
                            mt-3
                            h-2
                            overflow-hidden
                            rounded-full
                            bg-slate-100
                          "
                        >
                          <div
                            className="
                              h-full
                              rounded-full
                              bg-gradient-to-r
                              from-indigo-500
                              to-violet-500
                              transition-all
                            "
                            style={{
                              width:
                                `${Math.min(
                                  100,
                                  porcentaje
                                )}%`
                            }}
                          />
                        </div>

                      </div>

                    </div>

                  </div>


                  {/* PERMISOS */}

                  <div className="p-5 sm:p-6">

                    {
                      Object.keys(
                        permisosPorModulo
                      ).length === 0
                        ? (
                          <div
                            className="
                              rounded-2xl
                              border
                              border-dashed
                              border-slate-300
                              bg-slate-50
                              px-6
                              py-12
                              text-center
                            "
                          >
                            <Search
                              size={28}
                              className="mx-auto text-slate-300"
                            />

                            <p
                              className="
                                mt-4
                                text-sm
                                font-bold
                                text-slate-700
                              "
                            >
                              No hay permisos coincidentes
                            </p>

                            <p
                              className="
                                mt-1
                                text-xs
                                text-slate-400
                              "
                            >
                              Modifica la búsqueda para ver más resultados.
                            </p>
                          </div>
                        )
                        : (
                          <div className="space-y-5">

                            {
                              Object.entries(
                                permisosPorModulo
                              ).map(
                                ([
                                  modulo,
                                  permisosModulo
                                ]) => {

                                  const asignadosModulo =
                                    permisosModulo.filter(
                                      (permiso) =>
                                        tienePermiso(
                                          rol,
                                          permiso.id
                                        )
                                    ).length;

                                  return (

                                    <div
                                      key={modulo}
                                      className="
                                        overflow-hidden
                                        rounded-2xl
                                        border
                                        border-slate-200
                                        bg-slate-50/50
                                      "
                                    >

                                      <div
                                        className="
                                          flex
                                          flex-col
                                          gap-3
                                          border-b
                                          border-slate-200
                                          bg-white
                                          px-4
                                          py-4
                                          sm:flex-row
                                          sm:items-center
                                          sm:justify-between
                                        "
                                      >

                                        <div className="flex items-center gap-3">

                                          <div
                                            className="
                                              flex
                                              h-9
                                              w-9
                                              items-center
                                              justify-center
                                              rounded-xl
                                              bg-indigo-50
                                              text-indigo-600
                                            "
                                          >
                                            <KeyRound size={16} />
                                          </div>

                                          <div>
                                            <h3
                                              className="
                                                text-xs
                                                font-bold
                                                uppercase
                                                tracking-[0.14em]
                                                text-slate-600
                                              "
                                            >
                                              {modulo}
                                            </h3>

                                            <p className="mt-0.5 text-[11px] text-slate-400">
                                              {permisosModulo.length} permisos disponibles
                                            </p>
                                          </div>

                                        </div>

                                        <span
                                          className="
                                            w-fit
                                            rounded-full
                                            bg-indigo-50
                                            px-3
                                            py-1.5
                                            text-xs
                                            font-bold
                                            text-indigo-600
                                          "
                                        >
                                          {asignadosModulo}
                                          {' / '}
                                          {permisosModulo.length}
                                          {' asignados'}
                                        </span>

                                      </div>

                                      <div
                                        className="
                                          grid
                                          gap-3
                                          p-4
                                          md:grid-cols-2
                                          xl:grid-cols-3
                                        "
                                      >

                                        {
                                          permisosModulo.map(
                                            (permiso) => {

                                              const asignado =
                                                tienePermiso(
                                                  rol,
                                                  permiso.id
                                                );

                                              const clave =
                                                `${rol.id}-${permiso.id}`;

                                              const procesando =
                                                procesandoPermiso ===
                                                clave;

                                              return (

                                                <button
                                                  key={permiso.id}
                                                  type="button"
                                                  disabled={procesando}
                                                  onClick={() =>
                                                    cambiarPermiso(
                                                      rol,
                                                      permiso
                                                    )
                                                  }
                                                  className={`
                                                    group
                                                    relative
                                                    flex
                                                    min-h-24
                                                    items-start
                                                    gap-3
                                                    overflow-hidden
                                                    rounded-2xl
                                                    border
                                                    p-4
                                                    text-left
                                                    transition
                                                    duration-200
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-60
                                                    ${
                                                      asignado
                                                        ? 'border-indigo-200 bg-indigo-50/80 shadow-sm hover:bg-indigo-100/70'
                                                        : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-sm'
                                                    }
                                                  `}
                                                >

                                                  <span
                                                    className={`
                                                      mt-0.5
                                                      flex
                                                      h-6
                                                      w-6
                                                      shrink-0
                                                      items-center
                                                      justify-center
                                                      rounded-lg
                                                      border
                                                      transition
                                                      ${
                                                        asignado
                                                          ? 'border-indigo-600 bg-indigo-600 text-white'
                                                          : 'border-slate-300 bg-white text-transparent'
                                                      }
                                                    `}
                                                  >
                                                    {
                                                      procesando
                                                        ? (
                                                          <span
                                                            className="
                                                              h-3
                                                              w-3
                                                              animate-spin
                                                              rounded-full
                                                              border-2
                                                              border-current
                                                              border-t-transparent
                                                            "
                                                          />
                                                        )
                                                        : (
                                                          <Check size={14} />
                                                        )
                                                    }
                                                  </span>

                                                  <span className="min-w-0">

                                                    <span
                                                      className="
                                                        block
                                                        text-sm
                                                        font-bold
                                                        text-slate-800
                                                      "
                                                    >
                                                      {permiso.nombre}
                                                    </span>

                                                    <span
                                                      className="
                                                        mt-1
                                                        block
                                                        break-all
                                                        text-[11px]
                                                        font-semibold
                                                        text-indigo-600
                                                      "
                                                    >
                                                      {permiso.codigo}
                                                    </span>

                                                    {
                                                      permiso.descripcion && (
                                                        <span
                                                          className="
                                                            mt-2
                                                            block
                                                            text-xs
                                                            leading-5
                                                            text-slate-400
                                                          "
                                                        >
                                                          {permiso.descripcion}
                                                        </span>
                                                      )
                                                    }

                                                  </span>

                                                  {
                                                    asignado && (
                                                      <span
                                                        className="
                                                          absolute
                                                          right-3
                                                          top-3
                                                          h-2
                                                          w-2
                                                          rounded-full
                                                          bg-indigo-500
                                                        "
                                                      />
                                                    )
                                                  }

                                                </button>

                                              );

                                            }
                                          )
                                        }

                                      </div>

                                    </div>

                                  );

                                }
                              )
                            }

                          </div>
                        )
                    }

                  </div>

                </article>

              );

            }
          )
        }

        {
          roles.length === 0 && (
            <div
              className="
                rounded-3xl
                border
                border-dashed
                border-slate-300
                bg-white
                px-6
                py-16
                text-center
              "
            >
              <Sparkles
                size={32}
                className="mx-auto text-slate-300"
              />

              <p
                className="
                  mt-4
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                No hay roles registrados
              </p>
            </div>
          )
        }

      </section>

    </div>

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

        <span className="text-xs font-medium text-slate-300">
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
    violet: {
      icono:
        'bg-violet-50 text-violet-600',
      barra:
        'from-violet-500 to-fuchsia-500',
      etiqueta:
        'bg-violet-50 text-violet-600'
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


export default RolesPage;
