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
  MapPin,
  Pencil,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Search,
  ShieldAlert,
  Store,
  XCircle
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

import TiendaModal from './TiendaModal.jsx';


function TiendasPage() {

  const {
    usuario
  } = useAuth();

  const navigate =
    useNavigate();


  // ============================================================
  // ESTADO
  // ============================================================

  const [tiendas, setTiendas] =
    useState([]);

  const [busqueda, setBusqueda] =
    useState('');

  const [filtroEstado, setFiltroEstado] =
    useState('TODAS');

  const [filtroRiesgo, setFiltroRiesgo] =
    useState('TODOS');

  const [cargando, setCargando] =
    useState(true);

  const [recargando, setRecargando] =
    useState(false);

  const [error, setError] =
    useState('');

  const [mensaje, setMensaje] =
    useState('');

  const [
    cambiandoEstadoId,
    setCambiandoEstadoId
  ] = useState(null);


  // ============================================================
  // MODAL
  // ============================================================

  const [
    modalAbierto,
    setModalAbierto
  ] = useState(false);

  const [
    modoModal,
    setModoModal
  ] = useState('crear');

  const [
    tiendaSeleccionada,
    setTiendaSeleccionada
  ] = useState(null);

  const [
    guardandoTienda,
    setGuardandoTienda
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
      'tiendas.crear'
    );

  const puedeEditar =
    permisos.includes(
      'tiendas.editar'
    );

  const puedeCambiarEstado =
    permisos.includes(
      'tiendas.estado'
    );


  // ============================================================
  // CARGAR TIENDAS
  // ============================================================

  async function cargarTiendas(
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
          '/tiendas'
        );

      setTiendas(
        respuesta.tiendas || []
      );

    } catch (errorTiendas) {

      setError(
        errorTiendas.message ||
        'No se pudieron cargar las tiendas.'
      );

    } finally {

      setCargando(false);
      setRecargando(false);

    }

  }


  useEffect(() => {

    cargarTiendas();

  }, []);


  // ============================================================
  // NUEVA / EDITAR / DETALLE
  // ============================================================

  function abrirNuevaTienda() {

    setModoModal('crear');
    setTiendaSeleccionada(null);
    setErrorModal('');
    setModalAbierto(true);

  }


  function abrirEditarTienda(
    tienda
  ) {

    setModoModal('editar');
    setTiendaSeleccionada(
      tienda
    );
    setErrorModal('');
    setModalAbierto(true);

  }


  function abrirFichaTienda(
    tienda
  ) {

    navigate(
      `/tiendas/${tienda.id}`
    );

  }


  function cerrarModal() {

    if (guardandoTienda) {
      return;
    }

    setModalAbierto(false);
    setTiendaSeleccionada(null);
    setErrorModal('');

  }


  // ============================================================
  // GUARDAR TIENDA
  // ============================================================

  async function guardarTienda(
    datos
  ) {

    try {

      setErrorModal('');
      setMensaje('');

      if (
        !datos.codigo ||
        !datos.nombre ||
        !datos.ruc ||
        !datos.direccion ||
        !datos.departamento ||
        !datos.provincia ||
        !datos.distrito ||
        !datos.nivelRiesgo
      ) {

        setErrorModal(
          'Completa todos los campos obligatorios.'
        );

        return;

      }

      if (
        !/^[0-9]{11}$/.test(
          datos.ruc
        )
      ) {

        setErrorModal(
          'El RUC debe contener exactamente 11 dígitos.'
        );

        return;

      }

      setGuardandoTienda(true);

      if (
        modoModal === 'crear'
      ) {

        const respuesta =
          await api.post(
            '/tiendas',
            datos
          );

        setMensaje(
          respuesta.mensaje ||
          'Tienda registrada correctamente.'
        );

      }

      if (
        modoModal === 'editar' &&
        tiendaSeleccionada
      ) {

        const respuesta =
          await api.put(
            `/tiendas/${tiendaSeleccionada.id}`,
            datos
          );

        setMensaje(
          respuesta.mensaje ||
          'Tienda actualizada correctamente.'
        );

      }

      await cargarTiendas();

      setModalAbierto(false);
      setTiendaSeleccionada(null);

      setTimeout(() => {
        setMensaje('');
      }, 4000);

    } catch (errorGuardar) {

      setErrorModal(
        errorGuardar.message ||
        'No se pudo guardar la tienda.'
      );

    } finally {

      setGuardandoTienda(false);

    }

  }


  // ============================================================
  // ACTIVAR / DESACTIVAR
  // ============================================================

  async function cambiarEstadoTienda(
    tienda
  ) {

    const nuevoEstado =
      !tienda.activo;

    const accion =
      nuevoEstado
        ? 'activar'
        : 'desactivar';

    const confirmar =
      window.confirm(
        `¿Deseas ${accion} la tienda ${tienda.nombre} (${tienda.codigo})?`
      );

    if (!confirmar) {
      return;
    }

    try {

      setCambiandoEstadoId(
        tienda.id
      );

      setError('');
      setMensaje('');

      const respuesta =
        await api.patch(
          `/tiendas/${tienda.id}/estado`,
          {
            activo:
              nuevoEstado
          }
        );

      setMensaje(
        respuesta.mensaje ||
        'Estado de la tienda actualizado correctamente.'
      );

      await cargarTiendas();

      setTimeout(() => {
        setMensaje('');
      }, 4000);

    } catch (errorEstado) {

      setError(
        errorEstado.message ||
        'No se pudo cambiar el estado de la tienda.'
      );

    } finally {

      setCambiandoEstadoId(null);

    }

  }


  // ============================================================
  // ESTILO DE RIESGO
  // ============================================================

  function estiloRiesgo(
    nivelRiesgo
  ) {

    if (
      nivelRiesgo === 'ALTO'
    ) {

      return (
        'border-red-200 bg-red-50 text-red-700'
      );

    }

    if (
      nivelRiesgo === 'MEDIO'
    ) {

      return (
        'border-amber-200 bg-amber-50 text-amber-700'
      );

    }

    return (
      'border-emerald-200 bg-emerald-50 text-emerald-700'
    );

  }


  function colorPuntoRiesgo(
    nivelRiesgo
  ) {

    if (nivelRiesgo === 'ALTO') {
      return 'bg-red-500';
    }

    if (nivelRiesgo === 'MEDIO') {
      return 'bg-amber-500';
    }

    return 'bg-emerald-500';

  }


  function limpiarFiltros() {

    setBusqueda('');
    setFiltroEstado('TODAS');
    setFiltroRiesgo('TODOS');

  }


  // ============================================================
  // FILTROS
  // ============================================================

  const tiendasFiltradas =
    useMemo(() => {

      const texto =
        busqueda
          .trim()
          .toLowerCase();

      return tiendas.filter(
        (tienda) => {

          const codigo =
            tienda.codigo
              ?.toLowerCase() || '';

          const nombre =
            tienda.nombre
              ?.toLowerCase() || '';

          const ruc =
            tienda.ruc || '';

          const direccion =
            tienda.direccion
              ?.toLowerCase() || '';

          const departamento =
            tienda.departamento
              ?.toLowerCase() || '';

          const provincia =
            tienda.provincia
              ?.toLowerCase() || '';

          const distrito =
            tienda.distrito
              ?.toLowerCase() || '';

          const coincideTexto =
            !texto ||
            codigo.includes(texto) ||
            nombre.includes(texto) ||
            ruc.includes(texto) ||
            direccion.includes(texto) ||
            departamento.includes(texto) ||
            provincia.includes(texto) ||
            distrito.includes(texto);

          let coincideEstado = true;

          if (
            filtroEstado === 'ACTIVAS'
          ) {
            coincideEstado =
              Boolean(
                tienda.activo
              );
          }

          if (
            filtroEstado === 'INACTIVAS'
          ) {
            coincideEstado =
              !tienda.activo;
          }

          const coincideRiesgo =
            filtroRiesgo === 'TODOS' ||
            tienda.nivelRiesgo ===
              filtroRiesgo;

          return (
            coincideTexto &&
            coincideEstado &&
            coincideRiesgo
          );

        }
      );

    }, [
      tiendas,
      busqueda,
      filtroEstado,
      filtroRiesgo
    ]);


  // ============================================================
  // ESTADÍSTICAS
  // ============================================================

  const totalTiendas =
    tiendas.length;

  const activas =
    tiendas.filter(
      (tienda) =>
        tienda.activo
    ).length;

  const inactivas =
    tiendas.filter(
      (tienda) =>
        !tienda.activo
    ).length;

  const altoRiesgo =
    tiendas.filter(
      (tienda) =>
        tienda.nivelRiesgo ===
        'ALTO'
    ).length;

  const porcentajeActivas =
    totalTiendas > 0
      ? Math.round(
          (
            activas /
            totalTiendas
          ) * 100
        )
      : 0;

  const filtrosActivos =
    [
      busqueda.trim(),
      filtroEstado !== 'TODAS'
        ? filtroEstado
        : '',
      filtroRiesgo !== 'TODOS'
        ? filtroRiesgo
        : ''
    ].filter(Boolean).length;


  // ============================================================
  // CARGANDO
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

            <Store size={28} />

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
            Cargando tiendas
          </h2>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-500
            "
          >
            Estamos obteniendo la red de locales
            registrada en CERTIIA.
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
                  <Store size={22} />
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
                    Gestión operativa
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-400
                    "
                  >
                    Red de tiendas CERTIIA
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
                Tiendas
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
                Administra los locales retail,
                su ubicación, nivel de riesgo y
                estado operativo dentro de CERTIIA.
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
                  <Store size={14} />
                  {totalTiendas} tiendas
                </EtiquetaHero>

                <EtiquetaHero>
                  <Building2 size={14} />
                  {activas} activas
                </EtiquetaHero>

                <EtiquetaHero>
                  <ShieldAlert size={14} />
                  {altoRiesgo} de riesgo alto
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
                    Operatividad
                  </p>

                  <p
                    className="
                      mt-1
                      text-lg
                      font-bold
                      text-white
                    "
                  >
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

              <div
                className="
                  mt-5
                  space-y-3
                "
              >

                <FilaResumen
                  etiqueta="Tiendas activas"
                  valor={activas}
                  clase="bg-emerald-400"
                />

                <FilaResumen
                  etiqueta="Tiendas inactivas"
                  valor={inactivas}
                  clase="bg-slate-400"
                />

                <FilaResumen
                  etiqueta="Riesgo alto"
                  valor={altoRiesgo}
                  clase="bg-red-400"
                />

              </div>

              {
                puedeCrear && (

                  <button
                    type="button"
                    onClick={
                      abrirNuevaTienda
                    }
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
                    Registrar tienda
                  </button>

                )
              }

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
            titulo="Tiendas registradas"
            valor={totalTiendas}
            descripcion="Locales en CERTIIA"
            icono={Store}
            tono="indigo"
            etiqueta="Total"
          />

          <TarjetaKpi
            titulo="Tiendas activas"
            valor={activas}
            descripcion="Locales operativos"
            icono={Building2}
            tono="emerald"
            etiqueta={`${porcentajeActivas}%`}
          />

          <TarjetaKpi
            titulo="Tiendas inactivas"
            valor={inactivas}
            descripcion="Sin nuevas operaciones"
            icono={XCircle}
            tono="slate"
            etiqueta="Estado"
          />

          <TarjetaKpi
            titulo="Riesgo alto"
            valor={altoRiesgo}
            descripcion="Requieren atención"
            icono={ShieldAlert}
            tono="red"
            etiqueta="Prioridad"
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

            <div
              className="
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
                  bg-indigo-50
                  text-indigo-600
                "
              >
                <Filter size={19} />
              </div>

              <div>

                <h2
                  className="
                    font-bold
                    text-slate-900
                  "
                >
                  Directorio de tiendas
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  Busca y filtra los locales registrados.
                </p>

              </div>

            </div>

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-3
              "
            >

              {
                filtrosActivos > 0 && (

                  <button
                    type="button"
                    onClick={
                      limpiarFiltros
                    }
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
                  cargarTiendas(
                    true
                  )
                }
                disabled={
                  recargando
                }
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
                  placeholder="Código, nombre, RUC o ubicación..."
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
                Estado
              </label>

              <select
                value={
                  filtroEstado
                }
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
                <option value="TODAS">
                  Todas
                </option>

                <option value="ACTIVAS">
                  Activas
                </option>

                <option value="INACTIVAS">
                  Inactivas
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
                Nivel de riesgo
              </label>

              <select
                value={
                  filtroRiesgo
                }
                onChange={(event) =>
                  setFiltroRiesgo(
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
                  Todos los niveles
                </option>

                <option value="BAJO">
                  Bajo
                </option>

                <option value="MEDIO">
                  Medio
                </option>

                <option value="ALTO">
                  Alto
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

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <Store
                  size={18}
                  className="text-indigo-600"
                />

                <h2
                  className="
                    font-bold
                    text-slate-900
                  "
                >
                  Tiendas registradas
                </h2>
              </div>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                Consulta ubicación, riesgo y estado operativo.
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
              {tiendasFiltradas.length}
              {' '}
              {
                tiendasFiltradas.length === 1
                  ? 'resultado'
                  : 'resultados'
              }
            </span>

          </div>


          {/* ================================================= */}
          {/* MÓVIL */}
          {/* ================================================= */}

          <div
            className="
              divide-y
              divide-slate-100
              lg:hidden
            "
          >

            {
              tiendasFiltradas.length === 0
                ? (
                  <EstadoVacio />
                )
                : (
                  tiendasFiltradas.map(
                    (tienda) => (
                      <TarjetaTiendaMovil
                        key={tienda.id}
                        tienda={tienda}
                        puedeEditar={puedeEditar}
                        puedeCambiarEstado={puedeCambiarEstado}
                        procesando={
                          cambiandoEstadoId ===
                          tienda.id
                        }
                        estiloRiesgo={
                          estiloRiesgo
                        }
                        colorPuntoRiesgo={
                          colorPuntoRiesgo
                        }
                        onFicha={
                          abrirFichaTienda
                        }
                        onEditar={
                          abrirEditarTienda
                        }
                        onEstado={
                          cambiarEstadoTienda
                        }
                      />
                    )
                  )
                )
            }

          </div>


          {/* ================================================= */}
          {/* ESCRITORIO */}
          {/* ================================================= */}

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
                    Tienda
                  </th>

                  <th className="px-5 py-4">
                    RUC
                  </th>

                  <th className="px-5 py-4">
                    Ubicación
                  </th>

                  <th className="px-5 py-4">
                    Riesgo
                  </th>

                  <th className="px-5 py-4">
                    Estado
                  </th>

                  <th className="px-5 py-4 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody
                className="
                  divide-y
                  divide-slate-100
                "
              >

                {
                  tiendasFiltradas.length === 0
                    ? (
                      <tr>
                        <td colSpan="6">
                          <EstadoVacio />
                        </td>
                      </tr>
                    )
                    : (
                      tiendasFiltradas.map(
                        (tienda) => {

                          const procesandoEstado =
                            cambiandoEstadoId ===
                            tienda.id;

                          return (

                            <tr
                              key={tienda.id}
                              className="
                                group
                                align-middle
                                transition
                                hover:bg-indigo-50/30
                              "
                            >

                              <td className="px-5 py-4">

                                <div
                                  className="
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
                                    <Store size={20} />
                                  </div>

                                  <div className="min-w-0">

                                    <div
                                      className="
                                        flex
                                        items-center
                                        gap-2
                                      "
                                    >
                                      <p
                                        className="
                                          font-semibold
                                          text-slate-800
                                        "
                                      >
                                        {tienda.nombre}
                                      </p>

                                      <span
                                        className="
                                          rounded-md
                                          bg-slate-100
                                          px-2
                                          py-0.5
                                          text-[10px]
                                          font-bold
                                          text-slate-500
                                        "
                                      >
                                        {tienda.codigo}
                                      </span>
                                    </div>

                                    <p
                                      className="
                                        mt-1
                                        max-w-xs
                                        truncate
                                        text-xs
                                        text-slate-400
                                      "
                                    >
                                      {tienda.direccion}
                                    </p>

                                  </div>

                                </div>

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
                                {tienda.ruc}
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

                                  <div>

                                    <p
                                      className="
                                        text-sm
                                        font-medium
                                        text-slate-600
                                      "
                                    >
                                      {tienda.distrito}
                                    </p>

                                    <p
                                      className="
                                        mt-0.5
                                        text-xs
                                        text-slate-400
                                      "
                                    >
                                      {tienda.provincia},{' '}
                                      {tienda.departamento}
                                    </p>

                                  </div>
                                </div>

                              </td>


                              <td className="px-5 py-4">

                                <span
                                  className={`
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    border
                                    px-3
                                    py-1
                                    text-xs
                                    font-bold
                                    ${estiloRiesgo(
                                      tienda.nivelRiesgo
                                    )}
                                  `}
                                >
                                  <span
                                    className={`
                                      h-2
                                      w-2
                                      rounded-full
                                      ${colorPuntoRiesgo(
                                        tienda.nivelRiesgo
                                      )}
                                    `}
                                  />

                                  {
                                    tienda.nivelRiesgo
                                  }
                                </span>

                              </td>


                              <td className="px-5 py-4">

                                {
                                  tienda.activo
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
                                        <span
                                          className="
                                            h-2
                                            w-2
                                            rounded-full
                                            bg-emerald-500
                                          "
                                        />
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
                                        <span
                                          className="
                                            h-2
                                            w-2
                                            rounded-full
                                            bg-slate-400
                                          "
                                        />
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
                                      abrirFichaTienda(
                                        tienda
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
                                        onClick={() =>
                                          abrirEditarTienda(
                                            tienda
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
                                        title="Editar tienda"
                                      >
                                        <Pencil size={15} />
                                      </button>

                                    )
                                  }

                                  {
                                    puedeCambiarEstado && (

                                      <button
                                        type="button"
                                        disabled={
                                          procesandoEstado
                                        }
                                        onClick={() =>
                                          cambiarEstadoTienda(
                                            tienda
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
                                            tienda.activo
                                              ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                          }
                                        `}
                                        title={
                                          tienda.activo
                                            ? 'Desactivar tienda'
                                            : 'Activar tienda'
                                        }
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
                                            : tienda.activo
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


      {/* ================================================= */}
      {/* MODAL EXISTENTE */}
      {/* ================================================= */}

      <TiendaModal
        abierto={modalAbierto}
        modo={modoModal}
        tienda={tiendaSeleccionada}
        cargando={guardandoTienda}
        error={errorModal}
        onCerrar={cerrarModal}
        onGuardar={guardarTienda}
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

      <div
        className="
          flex
          items-center
          gap-2
        "
      >
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

      <span
        className="
          text-sm
          font-bold
          text-white
        "
      >
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
    red: {
      icono:
        'bg-red-50 text-red-600',
      barra:
        'from-red-500 to-rose-500',
      etiqueta:
        'bg-red-50 text-red-600'
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

          <p
            className="
              mt-1
              text-xs
              text-slate-500
            "
          >
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


function TarjetaTiendaMovil({
  tienda,
  puedeEditar,
  puedeCambiarEstado,
  procesando,
  estiloRiesgo,
  colorPuntoRiesgo,
  onFicha,
  onEditar,
  onEstado
}) {

  return (

    <article className="p-5">

      <div
        className="
          flex
          items-start
          gap-3
        "
      >

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
          <Store size={21} />
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
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-2
                "
              >
                <p
                  className="
                    font-bold
                    text-slate-800
                  "
                >
                  {tienda.nombre}
                </p>

                <span
                  className="
                    rounded-md
                    bg-slate-100
                    px-2
                    py-0.5
                    text-[10px]
                    font-bold
                    text-slate-500
                  "
                >
                  {tienda.codigo}
                </span>
              </div>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-400
                "
              >
                RUC {tienda.ruc}
              </p>
            </div>

            {
              tienda.activo
                ? (
                  <span
                    className="
                      w-fit
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
                    Activa
                  </span>
                )
                : (
                  <span
                    className="
                      w-fit
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
                    Inactiva
                  </span>
                )
            }

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

            <div
              className="
                flex
                items-start
                gap-2
                text-xs
                text-slate-500
              "
            >
              <MapPin
                size={14}
                className="mt-0.5 shrink-0"
              />

              <span>
                {tienda.direccion}
                <br />
                {tienda.distrito},{' '}
                {tienda.provincia},{' '}
                {tienda.departamento}
              </span>
            </div>

            <div>
              <span
                className={`
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  px-3
                  py-1
                  text-xs
                  font-bold
                  ${estiloRiesgo(
                    tienda.nivelRiesgo
                  )}
                `}
              >
                <span
                  className={`
                    h-2
                    w-2
                    rounded-full
                    ${colorPuntoRiesgo(
                      tienda.nivelRiesgo
                    )}
                  `}
                />

                Riesgo {tienda.nivelRiesgo}
              </span>
            </div>

          </div>


          <div
            className="
              mt-4
              flex
              flex-wrap
              gap-2
            "
          >

            <button
              type="button"
              onClick={() =>
                onFicha(
                  tienda
                )
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
                px-3
                text-xs
                font-bold
                text-slate-600
              "
            >
              <Eye size={15} />
              Ficha
            </button>

            {
              puedeEditar && (

                <button
                  type="button"
                  onClick={() =>
                    onEditar(
                      tienda
                    )
                  }
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
                    px-3
                    text-xs
                    font-bold
                    text-slate-600
                  "
                >
                  <Pencil size={15} />
                  Editar
                </button>

              )
            }

            {
              puedeCambiarEstado && (

                <button
                  type="button"
                  disabled={
                    procesando
                  }
                  onClick={() =>
                    onEstado(
                      tienda
                    )
                  }
                  className={`
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    px-3
                    text-xs
                    font-bold
                    disabled:opacity-50
                    ${
                      tienda.activo
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
                      : tienda.activo
                        ? <PowerOff size={15} />
                        : <Power size={15} />
                  }

                  {
                    tienda.activo
                      ? 'Desactivar'
                      : 'Activar'
                  }
                </button>

              )
            }

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
        <Store size={28} />
      </div>

      <h3
        className="
          mt-4
          font-bold
          text-slate-800
        "
      >
        No se encontraron tiendas
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
        No existen locales que coincidan con
        los filtros seleccionados.
      </p>

    </div>

  );

}


export default TiendasPage;
