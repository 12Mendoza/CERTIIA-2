import {

  useEffect,

  useMemo,

  useState

} from 'react';



import {

  CalendarClock,

  CircleAlert,

  FileCheck2,

  FileText,

  History,

  Pencil,

  Plus,

  Power,

  PowerOff,

  RefreshCw,

  Search

} from 'lucide-react';



import {

  api

} from '../../services/api';



import {

  useAuth

} from '../../context/AuthContext.jsx';



import TipoDocumentoModal from './TipoDocumentoModal.jsx';

import ReglaVigenciaModal from './ReglaVigenciaModal.jsx';

import HistorialVigenciaModal from './HistorialVigenciaModal.jsx';





function TiposDocumentoPage() {

  const {

    usuario

  } = useAuth();





  // ===================================================
  // DATOS
  // ===================================================
  const [

    tiposDocumento,

    setTiposDocumento

  ] = useState([]);





  const [

    busqueda,

    setBusqueda

  ] = useState('');





  const [

    filtroEstado,

    setFiltroEstado

  ] = useState('TODOS');





  const [

    filtroRenovacion,

    setFiltroRenovacion

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





  // ===================================================
  // MODAL CREAR / EDITAR
  // ===================================================
  const [

    modalAbierto,

    setModalAbierto

  ] = useState(false);





  const [

    modoModal,

    setModoModal

  ] = useState('crear');





  const [

    tipoSeleccionado,

    setTipoSeleccionado

  ] = useState(null);





  const [

    guardando,

    setGuardando

  ] = useState(false);





  const [

    errorModal,

    setErrorModal

  ] = useState('');





  // ===================================================
  // MODAL VIGENCIA
  // ===================================================
  const [

    modalVigenciaAbierto,

    setModalVigenciaAbierto

  ] = useState(false);





  const [

    tipoVigenciaSeleccionado,

    setTipoVigenciaSeleccionado

  ] = useState(null);





  const [

    reglaActual,

    setReglaActual

  ] = useState(null);





  const [

    cargandoRegla,

    setCargandoRegla

  ] = useState(false);





  const [

    guardandoRegla,

    setGuardandoRegla

  ] = useState(false);





  const [

    errorRegla,

    setErrorRegla

  ] = useState('');





  // ===================================================
  // MODAL HISTORIAL
  // ===================================================
  const [

    modalHistorialAbierto,

    setModalHistorialAbierto

  ] = useState(false);





  const [

    tipoHistorialSeleccionado,

    setTipoHistorialSeleccionado

  ] = useState(null);





  const [

    historialReglas,

    setHistorialReglas

  ] = useState([]);





  const [

    cargandoHistorial,

    setCargandoHistorial

  ] = useState(false);





  const [

    errorHistorial,

    setErrorHistorial

  ] = useState('');





  // ===================================================
  // PERMISOS
  // ===================================================
  const permisos =

    usuario?.permisos || [];





  const puedeCrear =

    permisos.includes(

      'tipos_documento.crear'

    );





  const puedeEditar =

    permisos.includes(

      'tipos_documento.editar'

    );





  const puedeCambiarEstado =

    permisos.includes(

      'tipos_documento.estado'

    );





  const puedeConfigurar =

    permisos.includes(

      'tipos_documento.configurar'

    );





  const puedeVer =

    permisos.includes(

      'tipos_documento.ver'

    );





  // ===================================================
  // CARGAR TIPOS DE DOCUMENTO
  // ===================================================
  async function cargarTiposDocumento(

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

          '/tipos-documento'

        );





      setTiposDocumento(

        respuesta.tiposDocumento ||

        []

      );



    } catch (errorCarga) {

      setError(

        errorCarga.message ||

        'No se pudieron cargar los tipos de documento.'

      );



    } finally {

      setCargando(false);

      setRecargando(false);

    }

  }





  // ===================================================
  // CARGA INICIAL
  // ===================================================
  useEffect(() => {

    cargarTiposDocumento();

  }, []);





  // ===================================================
  // NUEVO TIPO
  // ===================================================
  function abrirNuevoTipo() {

    setModoModal(

      'crear'

    );





    setTipoSeleccionado(

      null

    );





    setErrorModal(

      ''

    );





    setModalAbierto(

      true

    );

  }





  // ===================================================
  // EDITAR TIPO
  // ===================================================
  function abrirEditarTipo(

    tipoDocumento

  ) {

    setModoModal(

      'editar'

    );





    setTipoSeleccionado(

      tipoDocumento

    );





    setErrorModal(

      ''

    );





    setModalAbierto(

      true

    );

  }





  // ===================================================
  // CERRAR MODAL TIPO
  // ===================================================
  function cerrarModal() {

    if (guardando) {

      return;

    }





    setModalAbierto(

      false

    );





    setTipoSeleccionado(

      null

    );





    setErrorModal(

      ''

    );

  }





  // ===================================================
  // GUARDAR TIPO DOCUMENTAL
  // ===================================================
  async function guardarTipoDocumento(

    datos

  ) {

    try {

      setErrorModal('');

      setMensaje('');





      if (

        modoModal === 'crear'

      ) {

        if (

          !datos.nombre ||

          !datos.categoria ||

          !datos.descripcion

        ) {

          setErrorModal(

            'Nombre, categoría y descripción son obligatorios.'

          );



          return;

        }

      }





      if (

        modoModal === 'editar'

      ) {

        if (

          !datos.descripcion

        ) {

          setErrorModal(

            'La descripción es obligatoria.'

          );



          return;

        }

      }





      setGuardando(

        true

      );





      if (

        modoModal === 'crear'

      ) {

        const respuesta =

          await api.post(

            '/tipos-documento',

            datos

          );





        setMensaje(

          respuesta.mensaje ||

          'Tipo de documento registrado correctamente.'

        );

      }





      if (

        modoModal === 'editar' &&

        tipoSeleccionado

      ) {

        const respuesta =

          await api.put(

            `/tipos-documento/${tipoSeleccionado.id}`,

            datos

          );





        setMensaje(

          respuesta.mensaje ||

          'Tipo de documento actualizado correctamente.'

        );

      }





      await cargarTiposDocumento();





      setModalAbierto(

        false

      );





      setTipoSeleccionado(

        null

      );





      setTimeout(() => {

        setMensaje('');

      }, 4000);



    } catch (errorGuardar) {

      setErrorModal(

        errorGuardar.message ||

        'No se pudo guardar el tipo de documento.'

      );



    } finally {

      setGuardando(

        false

      );

    }

  }





  // ===================================================
  // ACTIVAR / DESACTIVAR
  // ===================================================
  async function cambiarEstado(

    tipoDocumento

  ) {

    const nuevoEstado =

      !tipoDocumento.activo;





    const accion =

      nuevoEstado

        ? 'activar'

        : 'desactivar';





    const confirmar =

      window.confirm(

        `¿Deseas ${accion} el tipo de documento "${tipoDocumento.nombre}"?`

      );





    if (!confirmar) {

      return;

    }





    try {

      setError('');

      setMensaje('');





      setCambiandoEstadoId(

        tipoDocumento.id

      );





      const respuesta =

        await api.patch(

          `/tipos-documento/${tipoDocumento.id}/estado`,

          {

            activo:

              nuevoEstado

          }

        );





      setMensaje(

        respuesta.mensaje ||

        'Estado actualizado correctamente.'

      );





      await cargarTiposDocumento();





      setTimeout(() => {

        setMensaje('');

      }, 4000);



    } catch (errorEstado) {

      setError(

        errorEstado.message ||

        'No se pudo cambiar el estado del tipo de documento.'

      );



    } finally {

      setCambiandoEstadoId(

        null

      );

    }

  }





  // ===================================================
  // ABRIR CONFIGURACIÓN DE VIGENCIA
  // ===================================================
  async function abrirConfigurarVigencia(

    tipoDocumento

  ) {

    try {

      setTipoVigenciaSeleccionado(

        tipoDocumento

      );





      setReglaActual(

        null

      );





      setErrorRegla(

        ''

      );





      setModalVigenciaAbierto(

        true

      );





      setCargandoRegla(

        true

      );





      const respuesta =

        await api.get(

          `/tipos-documento/${tipoDocumento.id}/vigencia`

        );





      setReglaActual(

        respuesta.regla ||

        null

      );



    } catch (errorCargaRegla) {

      setErrorRegla(

        errorCargaRegla.message ||

        'No se pudo cargar la configuración de vigencia.'

      );



    } finally {

      setCargandoRegla(

        false

      );

    }

  }





  // ===================================================
  // CERRAR VIGENCIA
  // ===================================================
  function cerrarModalVigencia() {

    if (

      guardandoRegla ||

      cargandoRegla

    ) {

      return;

    }





    setModalVigenciaAbierto(

      false

    );





    setTipoVigenciaSeleccionado(

      null

    );





    setReglaActual(

      null

    );





    setErrorRegla(

      ''

    );

  }





  // ===================================================
  // GUARDAR REGLA DE VIGENCIA
  // ===================================================
  async function guardarReglaVigencia(

    datos

  ) {

    if (

      !tipoVigenciaSeleccionado

    ) {

      return;

    }





    if (

      datos.tipoVigencia ===

      'DETERMINADA'

    ) {

      if (

        !Number.isInteger(

          datos.duracionValor

        ) ||

        datos.duracionValor <= 0

      ) {

        setErrorRegla(

          'La duración debe ser mayor que cero.'

        );



        return;

      }





      if (

        ![

          'DIAS',

          'MESES'

        ].includes(

          datos.duracionUnidad

        )

      ) {

        setErrorRegla(

          'Selecciona una unidad de duración válida.'

        );



        return;

      }

    }





    if (

      datos.tipoVigencia !==

      'INDETERMINADA'

    ) {

      if (

        !Number.isInteger(

          datos.umbralPorVencerDias

        ) ||

        datos.umbralPorVencerDias <= 0

      ) {

        setErrorRegla(

          'El umbral Por vencer debe ser mayor que cero.'

        );



        return;

      }





      if (

        !Number.isInteger(

          datos.umbralCriticoDias

        ) ||

        datos.umbralCriticoDias < 0

      ) {

        setErrorRegla(

          'El umbral Crítico debe ser cero o mayor.'

        );



        return;

      }





      if (

        datos.umbralCriticoDias >=

        datos.umbralPorVencerDias

      ) {

        setErrorRegla(

          'El umbral Crítico debe ser menor que el umbral Por vencer.'

        );



        return;

      }

    }





    try {

      setGuardandoRegla(

        true

      );





      setErrorRegla(

        ''

      );





      setMensaje(

        ''

      );





      const respuesta =

        await api.post(

          `/tipos-documento/${tipoVigenciaSeleccionado.id}/vigencia`,

          datos

        );





      setMensaje(

        respuesta.mensaje ||

        'Configuración de vigencia guardada correctamente.'

      );





      await cargarTiposDocumento();





      setModalVigenciaAbierto(

        false

      );





      setTipoVigenciaSeleccionado(

        null

      );





      setReglaActual(

        null

      );





      setTimeout(() => {

        setMensaje('');

      }, 5000);



    } catch (errorGuardarRegla) {

      setErrorRegla(

        errorGuardarRegla.message ||

        'No se pudo guardar la configuración de vigencia.'

      );



    } finally {

      setGuardandoRegla(

        false

      );

    }

  }





  // ===================================================
  // ABRIR HISTORIAL
  // ===================================================
  async function abrirHistorial(

    tipoDocumento

  ) {

    try {

      setTipoHistorialSeleccionado(

        tipoDocumento

      );





      setHistorialReglas(

        []

      );





      setErrorHistorial(

        ''

      );





      setModalHistorialAbierto(

        true

      );





      setCargandoHistorial(

        true

      );





      const respuesta =

        await api.get(

          `/tipos-documento/${tipoDocumento.id}/vigencia/historial`

        );





      setHistorialReglas(

        respuesta.historial ||

        []

      );



    } catch (errorCargaHistorial) {

      setErrorHistorial(

        errorCargaHistorial.message ||

        'No se pudo cargar el historial de vigencia.'

      );



    } finally {

      setCargandoHistorial(

        false

      );

    }

  }





  // ===================================================
  // CERRAR HISTORIAL
  // ===================================================
  function cerrarHistorial() {

    if (cargandoHistorial) {

      return;

    }





    setModalHistorialAbierto(

      false

    );





    setTipoHistorialSeleccionado(

      null

    );





    setHistorialReglas(

      []

    );





    setErrorHistorial(

      ''

    );

  }





  // ===================================================
  // FILTRADO
  // ===================================================
  const tiposFiltrados =

    useMemo(() => {

      const texto =

        busqueda

          .trim()

          .toLowerCase();





      return tiposDocumento.filter(

        (tipoDocumento) => {

          const coincideTexto =

            !texto ||

            tipoDocumento.nombre

              ?.toLowerCase()

              .includes(texto) ||

            tipoDocumento.categoria

              ?.toLowerCase()

              .includes(texto) ||

            tipoDocumento.descripcion

              ?.toLowerCase()

              .includes(texto);





          const coincideEstado =

            filtroEstado === 'TODOS' ||

            (

              filtroEstado === 'ACTIVO' &&

              tipoDocumento.activo

            ) ||

            (

              filtroEstado === 'INACTIVO' &&

              !tipoDocumento.activo

            );





          const coincideRenovacion =

            filtroRenovacion === 'TODOS' ||

            (

              filtroRenovacion === 'SI' &&

              tipoDocumento.requiereRenovacion

            ) ||

            (

              filtroRenovacion === 'NO' &&

              !tipoDocumento.requiereRenovacion

            );





          return (

            coincideTexto &&

            coincideEstado &&

            coincideRenovacion

          );

        }

      );



    }, [

      tiposDocumento,

      busqueda,

      filtroEstado,

      filtroRenovacion

    ]);





  // ===================================================
  // ESTADÍSTICAS
  // ===================================================
  const total =

    tiposDocumento.length;





  const activos =

    tiposDocumento.filter(

      (tipoDocumento) =>

        tipoDocumento.activo

    ).length;





  const inactivos =

    tiposDocumento.filter(

      (tipoDocumento) =>

        !tipoDocumento.activo

    ).length;





  const requierenRenovacion =

    tiposDocumento.filter(

      (tipoDocumento) =>

        tipoDocumento.requiereRenovacion

    ).length;





  // ===================================================
  // CARGANDO
  // ===================================================

  function limpiarFiltros() {

    setBusqueda('');
    setFiltroEstado('TODOS');
    setFiltroRenovacion('TODOS');

  }


  const porcentajeActivos =
    total > 0
      ? Math.round(
          (activos / total) * 100
        )
      : 0;

  const filtrosActivos =
    [
      busqueda.trim(),
      filtroEstado !== 'TODOS'
        ? filtroEstado
        : '',
      filtroRenovacion !== 'TODOS'
        ? filtroRenovacion
        : ''
    ].filter(Boolean).length;



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
            <FileText size={28} />

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
            Cargando tipos de documento
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Estamos consultando las reglas documentales,
            estados y configuraciones de vigencia.
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
                  <FileText size={22} />
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
                    Clasificación, vigencia y alertas
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
                Tipos de documento
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
                Define los tipos documentales que controla CERTIIA,
                su clasificación, estado y reglas versionadas de
                vigencia, renovación y alertas.
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
                  <FileText size={14} />
                  {total} tipos
                </EtiquetaHero>

                <EtiquetaHero>
                  <FileCheck2 size={14} />
                  {activos} activos
                </EtiquetaHero>

                <EtiquetaHero>
                  <RefreshCw size={14} />
                  {requierenRenovacion} con renovación
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
                    Estado del catálogo
                  </p>

                  <p className="mt-1 text-lg font-bold text-white">
                    {porcentajeActivos}% activos
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
                  <FileCheck2 size={22} />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <FilaResumen
                  etiqueta="Tipos activos"
                  valor={activos}
                  clase="bg-emerald-400"
                />

                <FilaResumen
                  etiqueta="Tipos inactivos"
                  valor={inactivos}
                  clase="bg-slate-400"
                />

                <FilaResumen
                  etiqueta="Con renovación"
                  valor={requierenRenovacion}
                  clase="bg-amber-400"
                />
              </div>

              {
                puedeCrear && (
                  <button
                    type="button"
                    onClick={abrirNuevoTipo}
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
                    Registrar tipo
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
              <FileCheck2
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
            titulo="Tipos registrados"
            valor={total}
            descripcion="Definiciones documentales"
            icono={FileText}
            tono="indigo"
            etiqueta="Total"
          />

          <TarjetaKpi
            titulo="Tipos activos"
            valor={activos}
            descripcion="Disponibles para operar"
            icono={FileCheck2}
            tono="emerald"
            etiqueta={`${porcentajeActivos}%`}
          />

          <TarjetaKpi
            titulo="Tipos inactivos"
            valor={inactivos}
            descripcion="Conservados por historial"
            icono={PowerOff}
            tono="slate"
            etiqueta="Trazabilidad"
          />

          <TarjetaKpi
            titulo="Con renovación"
            valor={requierenRenovacion}
            descripcion="Requieren ciclo de renovación"
            icono={RefreshCw}
            tono="amber"
            etiqueta="Seguimiento"
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
                <Search size={19} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Catálogo de tipos documentales
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Busca por nombre, categoría o descripción.
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
                  cargarTiposDocumento(
                    true
                  )
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
                  placeholder="Nombre, categoría o descripción..."
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

                <option value="ACTIVO">
                  Activos
                </option>

                <option value="INACTIVO">
                  Inactivos
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
                Renovación
              </label>

              <select
                value={filtroRenovacion}
                onChange={(event) =>
                  setFiltroRenovacion(
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
                  Todos
                </option>

                <option value="SI">
                  Requiere renovación
                </option>

                <option value="NO">
                  No requiere renovación
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
                <FileText
                  size={18}
                  className="text-indigo-600"
                />

                <h2 className="font-bold text-slate-900">
                  Tipos documentales registrados
                </h2>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Administra clasificación, renovación y vigencia versionada.
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
              {tiposFiltrados.length}
              {' '}
              {
                tiposFiltrados.length === 1
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
              tiposFiltrados.length === 0
                ? (
                  <EstadoVacio />
                )
                : (
                  tiposFiltrados.map(
                    (tipoDocumento) => (
                      <TarjetaTipoMovil
                        key={tipoDocumento.id}
                        tipoDocumento={tipoDocumento}
                        procesando={
                          cambiandoEstadoId ===
                          tipoDocumento.id
                        }
                        puedeVer={puedeVer}
                        puedeConfigurar={puedeConfigurar}
                        puedeEditar={puedeEditar}
                        puedeCambiarEstado={puedeCambiarEstado}
                        onHistorial={abrirHistorial}
                        onConfigurar={abrirConfigurarVigencia}
                        onEditar={abrirEditarTipo}
                        onEstado={cambiarEstado}
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
                min-w-[1160px]
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
                    Tipo documental
                  </th>

                  <th className="px-5 py-4">
                    Categoría
                  </th>

                  <th className="px-5 py-4">
                    Renovación
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
                  tiposFiltrados.length === 0
                    ? (
                      <tr>
                        <td colSpan="5">
                          <EstadoVacio />
                        </td>
                      </tr>
                    )
                    : (
                      tiposFiltrados.map(
                        (tipoDocumento) => {

                          const procesandoEstado =
                            cambiandoEstadoId ===
                            tipoDocumento.id;

                          return (
                            <tr
                              key={tipoDocumento.id}
                              className="
                                group
                                align-middle
                                transition
                                hover:bg-indigo-50/30
                              "
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-start gap-3">
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
                                    <FileText size={20} />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="font-semibold text-slate-800">
                                      {tipoDocumento.nombre}
                                    </p>

                                    <p
                                      className="
                                        mt-1
                                        max-w-xl
                                        text-xs
                                        leading-5
                                        text-slate-400
                                      "
                                    >
                                      {tipoDocumento.descripcion}
                                    </p>
                                  </div>
                                </div>
                              </td>


                              <td className="px-5 py-4">
                                <span
                                  className="
                                    inline-flex
                                    rounded-full
                                    border
                                    border-indigo-100
                                    bg-indigo-50
                                    px-3
                                    py-1
                                    text-xs
                                    font-bold
                                    text-indigo-700
                                  "
                                >
                                  {tipoDocumento.categoria}
                                </span>
                              </td>


                              <td className="px-5 py-4">
                                {
                                  tipoDocumento.requiereRenovacion
                                    ? (
                                      <span
                                        className="
                                          inline-flex
                                          items-center
                                          gap-2
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
                                        <RefreshCw size={13} />
                                        Sí requiere
                                      </span>
                                    )
                                    : (
                                      <span
                                        className="
                                          inline-flex
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
                                        No requiere
                                      </span>
                                    )
                                }
                              </td>


                              <td className="px-5 py-4">
                                {
                                  tipoDocumento.activo
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
                                        Activo
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
                                        Inactivo
                                      </span>
                                    )
                                }
                              </td>


                              <td className="px-5 py-4">
                                <div className="flex justify-end gap-2">

                                  {
                                    puedeVer && (
                                      <button
                                        type="button"
                                        title="Ver historial de vigencia"
                                        onClick={() =>
                                          abrirHistorial(
                                            tipoDocumento
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
                                          border-sky-200
                                          bg-sky-50
                                          text-sky-600
                                          transition
                                          hover:bg-sky-100
                                        "
                                      >
                                        <History size={15} />
                                      </button>
                                    )
                                  }

                                  {
                                    puedeConfigurar && (
                                      <button
                                        type="button"
                                        title="Configurar vigencia y alertas"
                                        onClick={() =>
                                          abrirConfigurarVigencia(
                                            tipoDocumento
                                          )
                                        }
                                        className="
                                          flex
                                          h-9
                                          items-center
                                          justify-center
                                          gap-2
                                          rounded-lg
                                          border
                                          border-violet-200
                                          bg-violet-50
                                          px-3
                                          text-xs
                                          font-bold
                                          text-violet-700
                                          transition
                                          hover:bg-violet-100
                                        "
                                      >
                                        <CalendarClock size={15} />
                                        Vigencia
                                      </button>
                                    )
                                  }

                                  {
                                    puedeEditar && (
                                      <button
                                        type="button"
                                        title="Editar tipo documental"
                                        onClick={() =>
                                          abrirEditarTipo(
                                            tipoDocumento
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
                                          tipoDocumento.activo
                                            ? 'Desactivar tipo documental'
                                            : 'Activar tipo documental'
                                        }
                                        onClick={() =>
                                          cambiarEstado(
                                            tipoDocumento
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
                                            tipoDocumento.activo
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
                                            : tipoDocumento.activo
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
      {/* MODALES EXISTENTES */}
      {/* ================================================= */}

      <TipoDocumentoModal
        abierto={modalAbierto}
        modo={modoModal}
        tipoDocumento={tipoSeleccionado}
        cargando={guardando}
        error={errorModal}
        onCerrar={cerrarModal}
        onGuardar={guardarTipoDocumento}
      />

      <ReglaVigenciaModal
        abierto={modalVigenciaAbierto}
        tipoDocumento={tipoVigenciaSeleccionado}
        reglaActual={reglaActual}
        cargando={
          cargandoRegla ||
          guardandoRegla
        }
        error={errorRegla}
        onCerrar={cerrarModalVigencia}
        onGuardar={guardarReglaVigencia}
      />

      <HistorialVigenciaModal
        abierto={modalHistorialAbierto}
        tipoDocumento={tipoHistorialSeleccionado}
        historial={historialReglas}
        cargando={cargandoHistorial}
        error={errorHistorial}
        onCerrar={cerrarHistorial}
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

      <div className="relative flex items-start justify-between gap-4">
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


function TarjetaTipoMovil({
  tipoDocumento,
  procesando,
  puedeVer,
  puedeConfigurar,
  puedeEditar,
  puedeCambiarEstado,
  onHistorial,
  onConfigurar,
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
          <FileText size={21} />
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
                {tipoDocumento.nombre}
              </p>

              <span
                className="
                  mt-2
                  inline-flex
                  rounded-full
                  border
                  border-indigo-100
                  bg-indigo-50
                  px-2.5
                  py-1
                  text-[11px]
                  font-bold
                  text-indigo-700
                "
              >
                {tipoDocumento.categoria}
              </span>
            </div>

            {
              tipoDocumento.activo
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
                    Activo
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
                    Inactivo
                  </span>
                )
            }
          </div>


          <p
            className="
              mt-4
              text-sm
              leading-6
              text-slate-500
            "
          >
            {tipoDocumento.descripcion}
          </p>


          <div
            className="
              mt-4
              flex
              flex-wrap
              items-center
              gap-2
            "
          >
            {
              tipoDocumento.requiereRenovacion
                ? (
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-2
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
                    <RefreshCw size={13} />
                    Requiere renovación
                  </span>
                )
                : (
                  <span
                    className="
                      inline-flex
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
                    Sin renovación
                  </span>
                )
            }
          </div>


          <div
            className="
              mt-4
              flex
              flex-wrap
              gap-2
            "
          >
            {
              puedeVer && (
                <button
                  type="button"
                  onClick={() =>
                    onHistorial(
                      tipoDocumento
                    )
                  }
                  className="
                    inline-flex
                    h-9
                    items-center
                    gap-2
                    rounded-lg
                    border
                    border-sky-200
                    bg-sky-50
                    px-3
                    text-xs
                    font-bold
                    text-sky-700
                  "
                >
                  <History size={14} />
                  Historial
                </button>
              )
            }

            {
              puedeConfigurar && (
                <button
                  type="button"
                  onClick={() =>
                    onConfigurar(
                      tipoDocumento
                    )
                  }
                  className="
                    inline-flex
                    h-9
                    items-center
                    gap-2
                    rounded-lg
                    border
                    border-violet-200
                    bg-violet-50
                    px-3
                    text-xs
                    font-bold
                    text-violet-700
                  "
                >
                  <CalendarClock size={14} />
                  Vigencia
                </button>
              )
            }

            {
              puedeEditar && (
                <button
                  type="button"
                  onClick={() =>
                    onEditar(
                      tipoDocumento
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
                    bg-white
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
                      tipoDocumento
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
                      tipoDocumento.activo
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
                      : tipoDocumento.activo
                        ? <PowerOff size={14} />
                        : <Power size={14} />
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
        <FileText size={28} />
      </div>

      <h3 className="mt-4 font-bold text-slate-800">
        No se encontraron tipos documentales
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
        No existen registros que coincidan con
        los filtros seleccionados.
      </p>
    </div>
  );

}


export default TiposDocumentoPage;
