import {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Building2,
  CheckCircle2,
  CircleAlert,
  Eye,
  Filter,
  Landmark,
  MapPin,
  Pencil,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Search,
  UserRound,
  UsersRound
} from 'lucide-react';

import {
  useNavigate
} from 'react-router-dom';

import {
  api
} from '../../services/api';

import {
  useAuth
} from '../../context/AuthContext.jsx';

import EntidadModal from './EntidadModal.jsx';


function EntidadesPage() {

  const navigate =
    useNavigate();

  const {
    usuario
  } = useAuth();

  const [
    entidades,
    setEntidades
  ] = useState([]);

  const [
    busqueda,
    setBusqueda
  ] = useState('');

  const [
    filtroTipo,
    setFiltroTipo
  ] = useState('TODOS');

  const [
    filtroEstado,
    setFiltroEstado
  ] = useState('TODOS');

  const [
    cargando,
    setCargando
  ] = useState(true);

  const [
    recargando,
    setRecargando
  ] = useState(false);

  const [
    error,
    setError
  ] = useState('');

  const [
    mensaje,
    setMensaje
  ] = useState('');

  const [
    cambiandoEstadoId,
    setCambiandoEstadoId
  ] = useState(null);

  const [
    modalAbierto,
    setModalAbierto
  ] = useState(false);

  const [
    modoModal,
    setModoModal
  ] = useState('crear');

  const [
    entidadSeleccionada,
    setEntidadSeleccionada
  ] = useState(null);

  const [
    guardandoEntidad,
    setGuardandoEntidad
  ] = useState(false);

  const [
    errorModal,
    setErrorModal
  ] = useState('');


  // ============================================================
  // PERMISOS
  // ============================================================

  const permisos =
    usuario?.permisos || [];

  const puedeCrear =
    permisos.includes(
      'entidades.crear'
    );

  const puedeEditar =
    permisos.includes(
      'entidades.editar'
    );

  const puedeCambiarEstado =
    permisos.includes(
      'entidades.estado'
    );


  // ============================================================
  // CARGA
  // ============================================================

  async function cargarEntidades(
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
        await api.get(
          '/entidades'
        );

      setEntidades(
        respuesta.entidades || []
      );

    } catch (errorEntidades) {

      setError(
        errorEntidades.message ||
        'No se pudieron cargar las entidades emisoras.'
      );

    } finally {

      setCargando(false);
      setRecargando(false);

    }

  }


  useEffect(() => {

    cargarEntidades();

  }, []);


  // ============================================================
  // MODAL / DETALLE
  // ============================================================

  function abrirNuevaEntidad() {

    setModoModal('crear');
    setEntidadSeleccionada(null);
    setErrorModal('');
    setModalAbierto(true);

  }


  function abrirEditarEntidad(
    entidad
  ) {

    setModoModal('editar');
    setEntidadSeleccionada(
      entidad
    );
    setErrorModal('');
    setModalAbierto(true);

  }


  function consultarEntidad(
    entidad
  ) {

    navigate(
      `/entidades/${entidad.id}`
    );

  }


  function cerrarModal() {

    if (guardandoEntidad) {
      return;
    }

    setModalAbierto(false);
    setEntidadSeleccionada(null);
    setErrorModal('');

  }


  // ============================================================
  // GUARDAR
  // ============================================================

  async function guardarEntidad(
    datos
  ) {

    try {

      setErrorModal('');
      setMensaje('');

      if (
        !datos.tipo ||
        !datos.nombre ||
        !datos.ubicacion
      ) {

        setErrorModal(
          'Tipo, nombre y ubicación son obligatorios.'
        );

        return;

      }

      if (
        datos.ruc &&
        !/^[0-9]{11}$/.test(
          datos.ruc
        )
      ) {

        setErrorModal(
          'El RUC debe contener exactamente 11 dígitos cuando se registre.'
        );

        return;

      }

      setGuardandoEntidad(true);

      if (
        modoModal === 'crear'
      ) {

        const respuesta =
          await api.post(
            '/entidades',
            datos
          );

        setMensaje(
          respuesta.mensaje ||
          'Entidad emisora registrada correctamente.'
        );

      }

      if (
        modoModal === 'editar' &&
        entidadSeleccionada
      ) {

        const respuesta =
          await api.put(
            `/entidades/${entidadSeleccionada.id}`,
            datos
          );

        setMensaje(
          respuesta.mensaje ||
          'Entidad emisora actualizada correctamente.'
        );

      }

      await cargarEntidades();

      setModalAbierto(false);
      setEntidadSeleccionada(null);

      setTimeout(() => {
        setMensaje('');
      }, 4000);

    } catch (errorGuardar) {

      setErrorModal(
        errorGuardar.message ||
        'No se pudo guardar la entidad emisora.'
      );

    } finally {

      setGuardandoEntidad(false);

    }

  }


  // ============================================================
  // ESTADO
  // ============================================================

  async function cambiarEstadoEntidad(
    entidad
  ) {

    const nuevoEstado =
      !entidad.activo;

    const accion =
      nuevoEstado
        ? 'activar'
        : 'desactivar';

    const confirmar =
      window.confirm(
        `¿Deseas ${accion} la entidad "${entidad.nombre}"?`
      );

    if (!confirmar) {
      return;
    }

    try {

      setCambiandoEstadoId(
        entidad.id
      );

      setError('');
      setMensaje('');

      const respuesta =
        await api.patch(
          `/entidades/${entidad.id}/estado`,
          {
            activo:
              nuevoEstado
          }
        );

      setMensaje(
        respuesta.mensaje ||
        'Estado de la entidad actualizado correctamente.'
      );

      await cargarEntidades();

      setTimeout(() => {
        setMensaje('');
      }, 4000);

    } catch (errorEstado) {

      setError(
        errorEstado.message ||
        'No se pudo cambiar el estado de la entidad emisora.'
      );

    } finally {

      setCambiandoEstadoId(null);

    }

  }


  // ============================================================
  // HELPERS
  // ============================================================

  function etiquetaTipo(
    tipo
  ) {

    switch (tipo) {
      case 'MUNICIPALIDAD':
        return 'Municipalidad';
      case 'ENTIDAD_PUBLICA':
        return 'Entidad pública';
      case 'EMPRESA_PRIVADA':
        return 'Empresa privada';
      case 'PROFESIONAL':
        return 'Profesional';
      default:
        return tipo || 'Sin tipo';
    }

  }


  function iconoTipo(
    tipo,
    size = 20
  ) {

    switch (tipo) {
      case 'MUNICIPALIDAD':
        return <Landmark size={size} />;
      case 'ENTIDAD_PUBLICA':
        return <Building2 size={size} />;
      case 'EMPRESA_PRIVADA':
        return <UsersRound size={size} />;
      case 'PROFESIONAL':
        return <UserRound size={size} />;
      default:
        return <Building2 size={size} />;
    }

  }


  function estiloTipo(
    tipo
  ) {

    switch (tipo) {
      case 'MUNICIPALIDAD':
        return 'border-indigo-200 bg-indigo-50 text-indigo-700';
      case 'ENTIDAD_PUBLICA':
        return 'border-sky-200 bg-sky-50 text-sky-700';
      case 'EMPRESA_PRIVADA':
        return 'border-violet-200 bg-violet-50 text-violet-700';
      case 'PROFESIONAL':
        return 'border-amber-200 bg-amber-50 text-amber-700';
      default:
        return 'border-slate-200 bg-slate-50 text-slate-700';
    }

  }


  function limpiarFiltros() {

    setBusqueda('');
    setFiltroTipo('TODOS');
    setFiltroEstado('TODOS');

  }


  // ============================================================
  // FILTROS
  // ============================================================

  const entidadesFiltradas =
    useMemo(() => {

      const texto =
        busqueda
          .trim()
          .toLowerCase();

      return entidades.filter(
        (entidad) => {

          const coincideTexto =
            !texto ||
            entidad.nombre
              ?.toLowerCase()
              .includes(texto) ||
            entidad.ruc
              ?.toLowerCase()
              .includes(texto) ||
            entidad.ubicacion
              ?.toLowerCase()
              .includes(texto) ||
            entidad.datosContacto
              ?.toLowerCase()
              .includes(texto);

          const coincideTipo =
            filtroTipo === 'TODOS' ||
            entidad.tipo ===
              filtroTipo;

          const coincideEstado =
            filtroEstado === 'TODOS' ||
            (
              filtroEstado === 'ACTIVO' &&
              entidad.activo
            ) ||
            (
              filtroEstado === 'INACTIVO' &&
              !entidad.activo
            );

          return (
            coincideTexto &&
            coincideTipo &&
            coincideEstado
          );

        }
      );

    }, [
      entidades,
      busqueda,
      filtroTipo,
      filtroEstado
    ]);


  // ============================================================
  // ESTADÍSTICAS
  // ============================================================

  const totalEntidades =
    entidades.length;

  const activas =
    entidades.filter(
      (entidad) =>
        entidad.activo
    ).length;

  const inactivas =
    entidades.filter(
      (entidad) =>
        !entidad.activo
    ).length;

  const municipalidades =
    entidades.filter(
      (entidad) =>
        entidad.tipo ===
        'MUNICIPALIDAD'
    ).length;

  const porcentajeActivas =
    totalEntidades > 0
      ? Math.round(
          (
            activas /
            totalEntidades
          ) * 100
        )
      : 0;

  const filtrosActivos =
    [
      busqueda.trim(),
      filtroTipo !== 'TODOS'
        ? filtroTipo
        : '',
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
            <Building2 size={28} />

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
            Cargando entidades emisoras
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Estamos obteniendo las entidades registradas en CERTIIA.
          </p>

        </div>

      </div>

    );

  }


  return (

    <>

      <div className="space-y-6">


        {/* HERO */}

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
                  <Building2 size={22} />
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
                    Catálogo documental
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Organismos y emisores autorizados
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
                Entidades emisoras
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
                Administra organismos públicos,
                municipalidades, empresas privadas y
                profesionales vinculados con la emisión
                o gestión de documentos.
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
                  <Building2 size={14} />
                  {totalEntidades} entidades
                </EtiquetaHero>

                <EtiquetaHero>
                  <CheckCircle2 size={14} />
                  {activas} activas
                </EtiquetaHero>

                <EtiquetaHero>
                  <Landmark size={14} />
                  {municipalidades} municipalidades
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
                    Disponibilidad
                  </p>

                  <p className="mt-1 text-lg font-bold text-white">
                    {porcentajeActivas}% activas
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
                  <CheckCircle2 size={22} />
                </div>

              </div>

              <div className="mt-5 space-y-3">
                <FilaResumen
                  etiqueta="Entidades activas"
                  valor={activas}
                  clase="bg-emerald-400"
                />

                <FilaResumen
                  etiqueta="Entidades inactivas"
                  valor={inactivas}
                  clase="bg-slate-400"
                />

                <FilaResumen
                  etiqueta="Municipalidades"
                  valor={municipalidades}
                  clase="bg-indigo-400"
                />
              </div>

              {
                puedeCrear && (

                  <button
                    type="button"
                    onClick={abrirNuevaEntidad}
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
                    <Plus size={17} />
                    Registrar entidad
                  </button>

                )
              }

            </div>

          </div>

        </section>


        {/* MENSAJES */}

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
              <CheckCircle2
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


        {/* KPIS */}

        <section
          className="
            grid
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >

          <TarjetaKpi
            titulo="Entidades registradas"
            valor={totalEntidades}
            descripcion="Emisores en CERTIIA"
            icono={Building2}
            tono="indigo"
            etiqueta="Total"
          />

          <TarjetaKpi
            titulo="Entidades activas"
            valor={activas}
            descripcion="Disponibles para operar"
            icono={CheckCircle2}
            tono="emerald"
            etiqueta={`${porcentajeActivas}%`}
          />

          <TarjetaKpi
            titulo="Entidades inactivas"
            valor={inactivas}
            descripcion="Conservadas en historial"
            icono={PowerOff}
            tono="slate"
            etiqueta="Historial"
          />

          <TarjetaKpi
            titulo="Municipalidades"
            valor={municipalidades}
            descripcion="Entidades municipales"
            icono={Landmark}
            tono="violet"
            etiqueta="Tipo"
          />

        </section>


        {/* FILTROS */}

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
                  Directorio de entidades
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Busca por nombre, RUC, ubicación o contacto.
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
                  cargarEntidades(true)
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
                Búsqueda general
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
                  placeholder="Nombre, RUC, ubicación o contacto..."
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
                Tipo
              </label>

              <select
                value={filtroTipo}
                onChange={(event) =>
                  setFiltroTipo(
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
                  Todos los tipos
                </option>

                <option value="MUNICIPALIDAD">
                  Municipalidad
                </option>

                <option value="ENTIDAD_PUBLICA">
                  Entidad pública
                </option>

                <option value="EMPRESA_PRIVADA">
                  Empresa privada
                </option>

                <option value="PROFESIONAL">
                  Profesional
                </option>
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
                  Todas
                </option>

                <option value="ACTIVO">
                  Activas
                </option>

                <option value="INACTIVO">
                  Inactivas
                </option>
              </select>
            </div>

          </div>

        </section>


        {/* LISTADO */}

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
                <Building2
                  size={18}
                  className="text-indigo-600"
                />

                <h2 className="font-bold text-slate-900">
                  Entidades registradas
                </h2>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Consulta tipo, ubicación, contacto y estado.
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
              {entidadesFiltradas.length}
              {' '}
              {
                entidadesFiltradas.length === 1
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
              entidadesFiltradas.length === 0
                ? (
                  <EstadoVacio />
                )
                : (
                  entidadesFiltradas.map(
                    (entidad) => (
                      <TarjetaEntidadMovil
                        key={entidad.id}
                        entidad={entidad}
                        procesando={
                          cambiandoEstadoId ===
                          entidad.id
                        }
                        puedeEditar={puedeEditar}
                        puedeCambiarEstado={puedeCambiarEstado}
                        iconoTipo={iconoTipo}
                        etiquetaTipo={etiquetaTipo}
                        estiloTipo={estiloTipo}
                        onConsultar={consultarEntidad}
                        onEditar={abrirEditarEntidad}
                        onEstado={cambiarEstadoEntidad}
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
                min-w-[1120px]
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
                    Entidad
                  </th>

                  <th className="px-5 py-4">
                    Tipo
                  </th>

                  <th className="px-5 py-4">
                    RUC
                  </th>

                  <th className="px-5 py-4">
                    Ubicación
                  </th>

                  <th className="px-5 py-4">
                    Estado
                  </th>

                  <th className="px-5 py-4 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>


              <tbody className="divide-y divide-slate-100">

                {
                  entidadesFiltradas.length === 0
                    ? (
                      <tr>
                        <td colSpan="6">
                          <EstadoVacio />
                        </td>
                      </tr>
                    )
                    : (
                      entidadesFiltradas.map(
                        (entidad) => {

                          const procesandoEstado =
                            cambiandoEstadoId ===
                            entidad.id;

                          return (

                            <tr
                              key={entidad.id}
                              className="
                                group
                                align-middle
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
                                      text-indigo-700
                                      ring-1
                                      ring-indigo-100
                                    "
                                  >
                                    {iconoTipo(
                                      entidad.tipo
                                    )}
                                  </div>

                                  <div className="min-w-0">

                                    <p
                                      className="
                                        font-semibold
                                        text-slate-800
                                      "
                                    >
                                      {entidad.nombre}
                                    </p>

                                    <p
                                      className="
                                        mt-1
                                        max-w-xs
                                        truncate
                                        text-xs
                                        text-slate-400
                                      "
                                    >
                                      {
                                        entidad.datosContacto ||
                                        'Sin datos de contacto'
                                      }
                                    </p>

                                  </div>

                                </div>

                              </td>


                              <td className="px-5 py-4">

                                <span
                                  className={`
                                    inline-flex
                                    rounded-full
                                    border
                                    px-3
                                    py-1
                                    text-xs
                                    font-bold
                                    ${estiloTipo(
                                      entidad.tipo
                                    )}
                                  `}
                                >
                                  {
                                    etiquetaTipo(
                                      entidad.tipo
                                    )
                                  }
                                </span>

                              </td>


                              <td
                                className="
                                  whitespace-nowrap
                                  px-5
                                  py-4
                                  text-sm
                                  font-medium
                                  text-slate-600
                                "
                              >
                                {
                                  entidad.ruc ||
                                  'No aplica'
                                }
                              </td>


                              <td className="px-5 py-4">

                                <div
                                  className="
                                    flex
                                    items-start
                                    gap-2
                                  "
                                >
                                  <MapPin
                                    size={16}
                                    className="
                                      mt-0.5
                                      shrink-0
                                      text-slate-400
                                    "
                                  />

                                  <span
                                    className="
                                      max-w-xs
                                      text-sm
                                      text-slate-600
                                    "
                                  >
                                    {entidad.ubicacion}
                                  </span>
                                </div>

                              </td>


                              <td className="px-5 py-4">

                                {
                                  entidad.activo
                                    ? (
                                      <span
                                        className="
                                          inline-flex
                                          items-center
                                          gap-2
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
                                        Activa
                                      </span>
                                    )
                                    : (
                                      <span
                                        className="
                                          inline-flex
                                          items-center
                                          gap-2
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
                                        Inactiva
                                      </span>
                                    )
                                }

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
                                    onClick={() =>
                                      consultarEntidad(
                                        entidad
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
                                    <Eye size={15} />
                                    Ficha
                                  </button>

                                  {
                                    puedeEditar && (
                                      <button
                                        type="button"
                                        title="Editar entidad"
                                        onClick={() =>
                                          abrirEditarEntidad(
                                            entidad
                                          )
                                        }
                                        className="
                                          flex
                                          h-9
                                          w-9
                                          items-center
                                          justify-center
                                          rounded-lg
                                          border
                                          border-slate-200
                                          bg-white
                                          text-slate-500
                                          transition
                                          hover:border-indigo-200
                                          hover:bg-indigo-50
                                          hover:text-indigo-600
                                        "
                                      >
                                        <Pencil size={15} />
                                      </button>
                                    )
                                  }

                                  {
                                    puedeCambiarEstado && (
                                      <button
                                        type="button"
                                        disabled={procesandoEstado}
                                        title={
                                          entidad.activo
                                            ? 'Desactivar entidad'
                                            : 'Activar entidad'
                                        }
                                        onClick={() =>
                                          cambiarEstadoEntidad(
                                            entidad
                                          )
                                        }
                                        className={`
                                          flex
                                          h-9
                                          w-9
                                          items-center
                                          justify-center
                                          rounded-lg
                                          border
                                          transition
                                          disabled:opacity-50
                                          ${
                                            entidad.activo
                                              ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                          }
                                        `}
                                      >
                                        {
                                          procesandoEstado
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
                                            : entidad.activo
                                              ? <PowerOff size={15} />
                                              : <Power size={15} />
                                        }
                                      </button>
                                    )
                                  }

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


      <EntidadModal
        abierto={modalAbierto}
        modo={modoModal}
        entidad={entidadSeleccionada}
        cargando={guardandoEntidad}
        error={errorModal}
        onCerrar={cerrarModal}
        onGuardar={guardarEntidad}
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
    slate: {
      icono:
        'bg-slate-100 text-slate-600',
      barra:
        'from-slate-400 to-slate-600',
      etiqueta:
        'bg-slate-100 text-slate-600'
    },
    violet: {
      icono:
        'bg-violet-50 text-violet-600',
      barra:
        'from-violet-500 to-fuchsia-500',
      etiqueta:
        'bg-violet-50 text-violet-600'
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

          <p className="mt-1 text-3xl font-bold text-slate-950">
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


function TarjetaEntidadMovil({
  entidad,
  procesando,
  puedeEditar,
  puedeCambiarEstado,
  iconoTipo,
  etiquetaTipo,
  estiloTipo,
  onConsultar,
  onEditar,
  onEstado
}) {

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
            text-indigo-700
          "
        >
          {iconoTipo(
            entidad.tipo,
            22
          )}
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
                {entidad.nombre}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {
                  entidad.ruc
                    ? `RUC ${entidad.ruc}`
                    : 'Sin RUC registrado'
                }
              </p>
            </div>

            <span
              className={`
                w-fit
                rounded-full
                border
                px-3
                py-1
                text-xs
                font-bold
                ${estiloTipo(
                  entidad.tipo
                )}
              `}
            >
              {
                etiquetaTipo(
                  entidad.tipo
                )
              }
            </span>
          </div>


          <div
            className="
              mt-4
              space-y-2
              rounded-xl
              bg-slate-50
              p-3
            "
          >
            <div className="flex items-start gap-2 text-xs text-slate-500">
              <MapPin
                size={14}
                className="mt-0.5 shrink-0"
              />

              <span>
                {entidad.ubicacion}
              </span>
            </div>

            <div className="text-xs text-slate-500">
              {
                entidad.datosContacto ||
                'Sin datos de contacto'
              }
            </div>
          </div>


          <div
            className="
              mt-4
              flex
              flex-wrap
              items-center
              justify-between
              gap-3
            "
          >
            {
              entidad.activo
                ? (
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-2
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
                    Activa
                  </span>
                )
                : (
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-2
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
                    Inactiva
                  </span>
                )
            }

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={() =>
                  onConsultar(
                    entidad
                  )
                }
                className="
                  inline-flex
                  h-9
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-slate-200
                  px-3
                  text-xs
                  font-bold
                  text-slate-600
                "
              >
                <Eye size={14} />
                Ficha
              </button>

              {
                puedeEditar && (
                  <button
                    type="button"
                    onClick={() =>
                      onEditar(
                        entidad
                      )
                    }
                    className="
                      inline-flex
                      h-9
                      items-center
                      gap-2
                      rounded-lg
                      border
                      border-slate-200
                      px-3
                      text-xs
                      font-bold
                      text-slate-600
                    "
                  >
                    <Pencil size={14} />
                    Editar
                  </button>
                )
              }

              {
                puedeCambiarEstado && (
                  <button
                    type="button"
                    disabled={procesando}
                    onClick={() =>
                      onEstado(
                        entidad
                      )
                    }
                    className={`
                      inline-flex
                      h-9
                      items-center
                      gap-2
                      rounded-lg
                      border
                      px-3
                      text-xs
                      font-bold
                      disabled:opacity-50
                      ${
                        entidad.activo
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
                        : entidad.activo
                          ? <PowerOff size={14} />
                          : <Power size={14} />
                    }
                  </button>
                )
              }

            </div>

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
        <Building2 size={28} />
      </div>

      <h3 className="mt-4 font-bold text-slate-800">
        No se encontraron entidades
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
        No existen entidades que coincidan con
        los filtros seleccionados.
      </p>
    </div>
  );

}


export default EntidadesPage;
