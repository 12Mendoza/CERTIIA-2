/* eslint-disable react-hooks/exhaustive-deps */

import {

  useEffect,

  useMemo,

  useState

} from 'react';



import {

  Bell,

  CalendarDays,

  CheckCircle2,

  CircleAlert,

  Clock3,

  FileText,

  LoaderCircle,

  RefreshCw,

  Search,

  Send,

  ShieldAlert

} from 'lucide-react';



import {

  useNavigate

} from 'react-router-dom';



import {

  api

} from '../../services/api.js';



import {

  useAuth

} from '../../context/AuthContext.jsx';



import AlertaAtenderModal

  from './AlertaAtenderModal.jsx';



import CalendarioVencimientos

  from './CalendarioVencimientos.jsx';





// ============================================================

// UTILIDADES

// ============================================================



function mensajeError(

  error,

  predeterminado

) {

  return (

    error?.response?.data?.mensaje ||

    error?.data?.mensaje ||

    error?.message ||

    predeterminado

  );

}





function formatearFecha(

  valor

) {

  if (!valor) {

    return '—';

  }



  const texto =

    String(valor).slice(0, 10);



  const partes =

    texto.split('-');



  if (

    partes.length !== 3

  ) {

    return texto;

  }



  return (

    `${partes[2]}/${partes[1]}/${partes[0]}`

  );

}





function claseNivel(

  nivel

) {

  switch (nivel) {

    case 'VENCIDO':

      return 'bg-red-100 text-red-700';

    case 'CRITICO':

      return 'bg-orange-100 text-orange-700';

    case 'POR_VENCER':

      return 'bg-amber-100 text-amber-700';

    default:

      return 'bg-slate-100 text-slate-700';

  }

}





function textoNivel(

  nivel

) {

  switch (nivel) {

    case 'VENCIDO':

      return 'Vencido';

    case 'CRITICO':

      return 'Crítico';

    case 'POR_VENCER':

      return 'Por vencer';

    default:

      return nivel || '—';

  }

}





function mesActual() {

  const ahora =

    new Date();



  return (

    `${ahora.getFullYear()}-${String(

      ahora.getMonth() + 1

    ).padStart(2, '0')}`

  );

}





// ============================================================

// ÉPICA 8 - ALERTAS Y CALENDARIO

// HU-034 / HU-035 / HU-036 / HU-037

// ============================================================



function AlertasPage() {



  const navigate =

    useNavigate();



  const {

    usuario

  } = useAuth();





  const permisos =

    useMemo(

      () =>

        new Set(

          usuario?.permisos || []

        ),

      [

        usuario?.permisos

      ]

    );





  const puedeGenerar =

    permisos.has(

      'alertas.generar'

    );



  const puedeAtender =

    permisos.has(

      'alertas.atender'

    );



  const puedeNotificar =

    permisos.has(

      'alertas.notificar'

    );





  const [

    pestana,

    setPestana

  ] = useState('alertas');





  // ==========================================================

  // ALERTAS

  // ==========================================================



  const [

    alertas,

    setAlertas

  ] = useState([]);



  const [

    indicadores,

    setIndicadores

  ] = useState({

    total: 0,

    pendientes: 0,

    atendidas: 0,

    porVencer: 0,

    criticas: 0,

    vencidas: 0

  });



  const [

    q,

    setQ

  ] = useState('');



  const [

    estado,

    setEstado

  ] = useState('PENDIENTE');



  const [

    nivel,

    setNivel

  ] = useState('');



  const [

    cargandoAlertas,

    setCargandoAlertas

  ] = useState(true);



  const [

    ejecutandoEvaluacion,

    setEjecutandoEvaluacion

  ] = useState(false);



  const [

    error,

    setError

  ] = useState('');



  const [

    mensaje,

    setMensaje

  ] = useState('');





  // ==========================================================

  // ATENCIÓN

  // ==========================================================



  const [

    alertaSeleccionada,

    setAlertaSeleccionada

  ] = useState(null);



  const [

    modalAtender,

    setModalAtender

  ] = useState(false);



  const [

    atendiendo,

    setAtendiendo

  ] = useState(false);



  const [

    errorAtencion,

    setErrorAtencion

  ] = useState('');





  // ==========================================================

  // NOTIFICACIONES

  // ==========================================================



  const [

    notificaciones,

    setNotificaciones

  ] = useState([]);



  const [

    cargandoNotificaciones,

    setCargandoNotificaciones

  ] = useState(false);



  const [

    procesandoNotificaciones,

    setProcesandoNotificaciones

  ] = useState(false);





  // ==========================================================

  // CALENDARIO

  // ==========================================================



  const [

    mes,

    setMes

  ] = useState(

    mesActual()

  );



  const [

    calendario,

    setCalendario

  ] = useState([]);



  const [

    tiendas,

    setTiendas

  ] = useState([]);



  const [

    tiposDocumento,

    setTiposDocumento

  ] = useState([]);



  const [

    tiendaId,

    setTiendaId

  ] = useState('');



  const [

    tipoDocumentoId,

    setTipoDocumentoId

  ] = useState('');



  const [

    cargandoCalendario,

    setCargandoCalendario

  ] = useState(false);





  // ==========================================================

  // CARGAR ALERTAS

  // ==========================================================



  async function cargarAlertas() {

    setCargandoAlertas(true);

    setError('');



    try {

      const parametros =

        new URLSearchParams();



      if (q.trim()) {

        parametros.set(

          'q',

          q.trim()

        );

      }



      if (estado) {

        parametros.set(

          'estado',

          estado

        );

      }



      if (nivel) {

        parametros.set(

          'nivel',

          nivel

        );

      }



      const respuesta =

        await api.get(

          `/alertas?${parametros.toString()}`

        );



      setAlertas(

        Array.isArray(

          respuesta?.alertas

        )

          ? respuesta.alertas

          : []

      );



      setIndicadores({

        total:

          respuesta?.indicadores?.total || 0,

        pendientes:

          respuesta?.indicadores?.pendientes || 0,

        atendidas:

          respuesta?.indicadores?.atendidas || 0,

        porVencer:

          respuesta?.indicadores?.porVencer || 0,

        criticas:

          respuesta?.indicadores?.criticas || 0,

        vencidas:

          respuesta?.indicadores?.vencidas || 0

      });



    } catch (errorPeticion) {

      setError(

        mensajeError(

          errorPeticion,

          'No se pudieron cargar las alertas.'

        )

      );

    } finally {

      setCargandoAlertas(false);

    }

  }





  // ==========================================================

  // CARGAR NOTIFICACIONES

  // ==========================================================



  async function cargarNotificaciones() {

    setCargandoNotificaciones(true);



    try {

      const respuesta =

        await api.get(

          '/alertas/notificaciones'

        );



      setNotificaciones(

        Array.isArray(

          respuesta?.notificaciones

        )

          ? respuesta.notificaciones

          : []

      );



    } catch (errorPeticion) {

      setError(

        mensajeError(

          errorPeticion,

          'No se pudieron cargar las notificaciones.'

        )

      );

    } finally {

      setCargandoNotificaciones(false);

    }

  }





  // ==========================================================

  // CARGAR CATÁLOGOS

  // ==========================================================



  async function cargarCatalogos() {

    try {

      const respuesta =

        await api.get(

          '/alertas/calendario/catalogos'

        );



      setTiendas(

        respuesta?.tiendas || []

      );



      setTiposDocumento(

        respuesta?.tiposDocumento || []

      );



    } catch (errorPeticion) {

      setError(

        mensajeError(

          errorPeticion,

          'No se pudieron cargar los filtros del calendario.'

        )

      );

    }

  }





  // ==========================================================

  // CARGAR CALENDARIO

  // ==========================================================



  async function cargarCalendario() {

    setCargandoCalendario(true);



    try {

      const parametros =

        new URLSearchParams({

          mes

        });



      if (tiendaId) {

        parametros.set(

          'tiendaId',

          tiendaId

        );

      }



      if (tipoDocumentoId) {

        parametros.set(

          'tipoDocumentoId',

          tipoDocumentoId

        );

      }



      const respuesta =

        await api.get(

          `/alertas/calendario?${parametros.toString()}`

        );



      setCalendario(

        Array.isArray(

          respuesta?.eventos

        )

          ? respuesta.eventos

          : []

      );



    } catch (errorPeticion) {

      setError(

        mensajeError(

          errorPeticion,

          'No se pudo cargar el calendario.'

        )

      );

    } finally {

      setCargandoCalendario(false);

    }

  }





  useEffect(

    () => {

      // Carga inicial de datos remotos del módulo.

      // eslint-disable-next-line react-hooks/set-state-in-effect

      cargarAlertas();

      cargarNotificaciones();

      cargarCatalogos();

    },

    []

  );





  useEffect(

    () => {

      if (

        pestana === 'calendario'

      ) {

        // Sincroniza el calendario cuando cambia el mes o sus filtros.

        // eslint-disable-next-line react-hooks/set-state-in-effect

        cargarCalendario();

      }

    },

    [

      pestana,

      mes,

      tiendaId,

      tipoDocumentoId

    ]

  );





  // ==========================================================

  // HU-034 - EVALUAR

  // ==========================================================



  async function evaluar() {

    setEjecutandoEvaluacion(true);

    setError('');

    setMensaje('');



    try {

      const respuesta =

        await api.post(

          '/alertas/evaluar',

          {}

        );



      setMensaje(

        respuesta?.mensaje ||

        'Alertas actualizadas.'

      );



      await Promise.all([

        cargarAlertas(),

        cargarNotificaciones()

      ]);



    } catch (errorPeticion) {

      setError(

        mensajeError(

          errorPeticion,

          'No se pudo ejecutar la evaluación.'

        )

      );

    } finally {

      setEjecutandoEvaluacion(false);

    }

  }





  // ==========================================================

  // HU-035 - ATENDER

  // ==========================================================



  function abrirAtencion(

    alerta

  ) {

    setAlertaSeleccionada(

      alerta

    );

    setErrorAtencion('');

    setModalAtender(true);

  }





  function cerrarAtencion() {

    if (atendiendo) {

      return;

    }



    setModalAtender(false);

    setAlertaSeleccionada(null);

    setErrorAtencion('');

  }





  async function guardarAtencion(

    datos

  ) {

    if (!alertaSeleccionada?.id) {

      return;

    }



    setAtendiendo(true);

    setErrorAtencion('');



    try {

      const respuesta =

        await api.patch(

          `/alertas/${alertaSeleccionada.id}/atender`,

          datos

        );



      setMensaje(

        respuesta?.mensaje ||

        'Alerta atendida.'

      );



      setModalAtender(false);

      setAlertaSeleccionada(null);



      await cargarAlertas();



    } catch (errorPeticion) {

      setErrorAtencion(

        mensajeError(

          errorPeticion,

          'No se pudo atender la alerta.'

        )

      );

    } finally {

      setAtendiendo(false);

    }

  }





  // ==========================================================

  // HU-036 - PROCESAR NOTIFICACIONES

  // ==========================================================



  async function procesarNotificaciones() {

    setProcesandoNotificaciones(true);

    setError('');

    setMensaje('');



    try {

      const respuesta =

        await api.post(

          '/alertas/notificaciones/procesar',

          {

            limite: 100

          }

        );



      setMensaje(

        respuesta?.mensaje ||

        'Notificaciones procesadas.'

      );



      await cargarNotificaciones();



    } catch (errorPeticion) {

      setError(

        mensajeError(

          errorPeticion,

          'No se pudieron procesar las notificaciones.'

        )

      );

    } finally {

      setProcesandoNotificaciones(false);

    }

  }





  // ==========================================================

  // HU-037 - NAVEGAR AL DOCUMENTO

  // ==========================================================



  function abrirDocumento(

    evento

  ) {

    const documentoId =

      evento?.documento?.id;



    if (!documentoId) {

      return;

    }



    navigate(

      `/documentos?documentoId=${documentoId}`,

      {

        state: {

          documentoId,

          abrirDetalle: true

        }

      }

    );

  }





  return (

    <div className="space-y-6">

      {/* ===================================================== */}
      {/* HERO PRINCIPAL */}
      {/* ===================================================== */}

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
            -bottom-28
            left-1/4
            h-72
            w-72
            rounded-full
            bg-violet-500/15
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
              '26px 26px'
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

          <div className="flex flex-col justify-center">

            <div className="mb-4 flex items-center gap-3">

              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/10
                  text-indigo-200
                  backdrop-blur
                "
              >
                <Bell size={24} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-300">
                  Control preventivo
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Vencimientos, alertas y planificación
                </p>
              </div>

            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Alertas y Calendario
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Supervisa vencimientos, atiende alertas, procesa notificaciones
              y planifica la operación documental desde una sola vista.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <EtiquetaHeroAlertas>
                <Bell size={14} />
                {indicadores.total} alerta(s)
              </EtiquetaHeroAlertas>

              <EtiquetaHeroAlertas>
                <Clock3 size={14} />
                {indicadores.pendientes} pendiente(s)
              </EtiquetaHeroAlertas>

              <EtiquetaHeroAlertas>
                <CheckCircle2 size={14} />
                {indicadores.atendidas} atendida(s)
              </EtiquetaHeroAlertas>
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

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Estado operativo
                </p>
                <p className="mt-1 text-lg font-bold text-white">
                  {indicadores.pendientes > 0
                    ? 'Requiere seguimiento'
                    : 'Sin alertas pendientes'}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
                <ShieldAlert size={22} />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <FilaHeroAlertas etiqueta="Alertas totales" valor={indicadores.total} />
              <FilaHeroAlertas etiqueta="Atendidas" valor={indicadores.atendidas} />
              <FilaHeroAlertas etiqueta="Notificaciones" valor={notificaciones.length} />
            </div>

            <div className="mt-5 grid gap-2">
              {puedeGenerar && (
                <button
                  type="button"
                  onClick={evaluar}
                  disabled={ejecutandoEvaluacion}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    size={17}
                    className={ejecutandoEvaluacion ? 'animate-spin' : ''}
                  />
                  {ejecutandoEvaluacion ? 'Evaluando...' : 'Evaluar vencimientos'}
                </button>
              )}

              {puedeNotificar && (
                <button
                  type="button"
                  onClick={procesarNotificaciones}
                  disabled={procesandoNotificaciones}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-xs font-bold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={15} />
                  {procesandoNotificaciones ? 'Procesando...' : 'Procesar notificaciones'}
                </button>
              )}
            </div>

          </div>

        </div>

      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador
          titulo="Pendientes"
          valor={indicadores.pendientes}
          descripcion="Requieren atención"
          icono={Clock3}
          tono="amber"
          etiqueta="Atención"
        />
        <Indicador
          titulo="Por vencer"
          valor={indicadores.porVencer}
          descripcion="Dentro del umbral preventivo"
          icono={Bell}
          tono="indigo"
          etiqueta="Preventivo"
        />
        <Indicador
          titulo="Críticas"
          valor={indicadores.criticas}
          descripcion="Prioridad elevada"
          icono={ShieldAlert}
          tono="orange"
          etiqueta="Crítico"
        />
        <Indicador
          titulo="Vencidas"
          valor={indicadores.vencidas}
          descripcion="Documentos fuera de vigencia"
          icono={CircleAlert}
          tono="red"
          etiqueta="Vencido"
        />
      </section>

      {error && (

        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

          {error}

        </div>

      )}



      {mensaje && (

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">

          {mensaje}

        </div>

      )}



      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <Indicador

          titulo="Pendientes"

          valor={indicadores.pendientes}

          icono={Clock3}

        />

        <Indicador

          titulo="Por vencer"

          valor={indicadores.porVencer}

          icono={Bell}

        />

        <Indicador

          titulo="Críticas"

          valor={indicadores.criticas}

          icono={ShieldAlert}

        />

        <Indicador

          titulo="Vencidas"

          valor={indicadores.vencidas}

          icono={CircleAlert}

        />

      </div>



      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">

        <Pestana

          activa={pestana === 'alertas'}

          icono={Bell}

          texto="Alertas"

          onClick={() => setPestana('alertas')}

        />

        <Pestana

          activa={pestana === 'calendario'}

          icono={CalendarDays}

          texto="Calendario"

          onClick={() => setPestana('calendario')}

        />

        <Pestana

          activa={pestana === 'notificaciones'}

          icono={Send}

          texto="Mis notificaciones"

          onClick={() => {

            setPestana('notificaciones');

            cargarNotificaciones();

          }}

        />

      </div>



      {pestana === 'alertas' && (

        <div className="space-y-4">

          <form

            onSubmit={(evento) => {

              evento.preventDefault();

              cargarAlertas();

            }}

            className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_190px_190px_auto]"

          >

            <div className="relative">

              <Search

                size={18}

                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"

              />

              <input

                type="text"

                value={q}

                onChange={(evento) => setQ(evento.target.value)}

                placeholder="Buscar documento, tienda o tipo..."

                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"

              />

            </div>



            <select

              value={estado}

              onChange={(evento) => setEstado(evento.target.value)}

              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"

            >

              <option value="">Todos los estados</option>

              <option value="PENDIENTE">Pendientes</option>

              <option value="ATENDIDA">Atendidas</option>

              <option value="RESUELTA">Resueltas</option>

            </select>



            <select

              value={nivel}

              onChange={(evento) => setNivel(evento.target.value)}

              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"

            >

              <option value="">Todos los niveles</option>

              <option value="POR_VENCER">Por vencer</option>

              <option value="CRITICO">Crítico</option>

              <option value="VENCIDO">Vencido</option>

            </select>



            <button

              type="submit"

              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"

            >

              Filtrar

            </button>

          </form>



          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {cargandoAlertas ? (

              <div className="flex min-h-64 items-center justify-center gap-3 text-slate-500">

                <LoaderCircle size={22} className="animate-spin" />

                Cargando alertas...

              </div>

            ) : alertas.length === 0 ? (

              <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">

                <Bell size={36} className="mb-3 text-slate-300" />

                <p className="font-semibold text-slate-700">

                  No hay alertas para los filtros seleccionados

                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1100px] text-left text-sm">

                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">

                    <tr>

                      <th className="px-5 py-4">Documento</th>

                      <th className="px-5 py-4">Tienda</th>

                      <th className="px-5 py-4">Vencimiento</th>

                      <th className="px-5 py-4">Nivel</th>

                      <th className="px-5 py-4">Estado</th>

                      <th className="px-5 py-4 text-right">Acción</th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {alertas.map((alerta) => (

                      <tr key={alerta.id} className="hover:bg-slate-50">

                        <td className="px-5 py-4">

                          <p className="font-semibold text-slate-900">

                            {alerta.documento.codigoInterno}

                          </p>

                          <p className="mt-1 text-xs text-slate-500">

                            {alerta.documento.numeroDocumento}

                          </p>

                          <p className="mt-1 text-xs text-slate-400">

                            {alerta.tipoDocumento.nombre}

                          </p>

                        </td>

                        <td className="px-5 py-4 text-slate-700">

                          {alerta.tienda.nombre}

                        </td>

                        <td className="px-5 py-4">

                          <p className="text-slate-700">

                            {formatearFecha(alerta.fechaVencimiento)}

                          </p>

                          <p className="mt-1 text-xs text-slate-500">

                            {alerta.diasRestantes < 0

                              ? `${Math.abs(alerta.diasRestantes)} día(s) vencido`

                              : `${alerta.diasRestantes} día(s) restante(s)`}

                          </p>

                        </td>

                        <td className="px-5 py-4">

                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${claseNivel(alerta.nivel)}`}>

                            {textoNivel(alerta.nivel)}

                          </span>

                        </td>

                        <td className="px-5 py-4 text-slate-700">

                          {alerta.estado}

                        </td>

                        <td className="px-5 py-4 text-right">

                          <div className="flex justify-end gap-2">

                            <button

                              type="button"

                              onClick={() =>

                                navigate(

                                  `/documentos?documentoId=${alerta.documento.id}`,

                                  {

                                    state: {

                                      documentoId: alerta.documento.id,

                                      abrirDetalle: true

                                    }

                                  }

                                )

                              }

                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"

                            >

                              <FileText size={15} />

                              Documento

                            </button>



                            {puedeAtender && alerta.estado === 'PENDIENTE' && (

                              <button

                                type="button"

                                onClick={() => abrirAtencion(alerta)}

                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"

                              >

                                <CheckCircle2 size={15} />

                                Atender

                              </button>

                            )}

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

      )}



      {pestana === 'calendario' && (

        <CalendarioVencimientos

          mes={mes}

          eventos={calendario}

          tiendas={tiendas}

          tiposDocumento={tiposDocumento}

          tiendaId={tiendaId}

          tipoDocumentoId={tipoDocumentoId}

          cargando={cargandoCalendario}

          onCambiarMes={setMes}

          onCambiarTienda={setTiendaId}

          onCambiarTipoDocumento={setTipoDocumentoId}

          onAbrirDocumento={abrirDocumento}

        />

      )}



      {pestana === 'notificaciones' && (

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-4">

            <h3 className="font-bold text-slate-900">

              Mis notificaciones de alerta

            </h3>

            <p className="mt-1 text-sm text-slate-500">

              Historial de notificaciones generadas por los niveles de alerta.

            </p>

          </div>



          {cargandoNotificaciones ? (

            <div className="flex min-h-52 items-center justify-center gap-3 text-slate-500">

              <LoaderCircle size={20} className="animate-spin" />

              Cargando notificaciones...

            </div>

          ) : notificaciones.length === 0 ? (

            <div className="min-h-52 px-6 py-12 text-center text-sm text-slate-500">

              No tienes notificaciones registradas.

            </div>

          ) : (

            <div className="divide-y divide-slate-100">

              {notificaciones.map((notificacion) => (

                <div key={notificacion.id} className="flex gap-4 px-5 py-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

                    <Bell size={18} />

                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <p className="font-semibold text-slate-900">

                        {notificacion.contenido?.titulo || 'Alerta documental'}

                      </p>

                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${claseNivel(notificacion.nivel)}`}>

                        {textoNivel(notificacion.nivel)}

                      </span>

                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">

                        {notificacion.estado}

                      </span>

                    </div>

                    <p className="mt-1 text-sm text-slate-600">

                      {notificacion.contenido?.mensaje || 'Notificación de alerta'}

                    </p>

                    <p className="mt-2 text-xs text-slate-400">

                      Canal: {notificacion.canal} · Intentos: {notificacion.intentos}/{notificacion.maxReintentos}

                    </p>

                    {notificacion.ultimoError && (

                      <p className="mt-1 text-xs text-red-600">

                        {notificacion.ultimoError}

                      </p>

                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      )}



      <AlertaAtenderModal

        abierto={modalAtender}

        alerta={alertaSeleccionada}

        cargando={atendiendo}

        error={errorAtencion}

        onCerrar={cerrarAtencion}

        onGuardar={guardarAtencion}

      />

    </div>

  );

}





function EtiquetaHeroAlertas({
  children
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur">
      {children}
    </span>
  );
}


function FilaHeroAlertas({
  etiqueta,
  valor
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/10 px-3 py-2.5">
      <span className="text-xs font-medium text-slate-300">
        {etiqueta}
      </span>
      <span className="text-sm font-bold text-white">
        {valor}
      </span>
    </div>
  );
}


function Indicador({
  titulo,
  valor,
  descripcion,
  icono: Icono,
  tono = 'indigo',
  etiqueta
}) {
  const estilos = {
    indigo: {
      icono: 'bg-indigo-50 text-indigo-600',
      barra: 'from-indigo-500 to-violet-500',
      etiqueta: 'bg-indigo-50 text-indigo-600'
    },
    amber: {
      icono: 'bg-amber-50 text-amber-600',
      barra: 'from-amber-500 to-yellow-500',
      etiqueta: 'bg-amber-50 text-amber-700'
    },
    orange: {
      icono: 'bg-orange-50 text-orange-600',
      barra: 'from-orange-500 to-amber-500',
      etiqueta: 'bg-orange-50 text-orange-700'
    },
    red: {
      icono: 'bg-red-50 text-red-600',
      barra: 'from-red-500 to-rose-500',
      etiqueta: 'bg-red-50 text-red-600'
    }
  };

  const estilo = estilos[tono] || estilos.indigo;

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-100 opacity-60 transition group-hover:scale-125" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${estilo.etiqueta}`}>
            {etiqueta}
          </span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {titulo}
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-950">
            {valor}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {descripcion}
          </p>
        </div>

        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${estilo.icono}`}>
          <Icono size={22} />
        </div>
      </div>

      <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${estilo.barra}`} />
    </article>
  );
}


function Pestana({

  activa,

  icono: Icono,

  texto,

  onClick

}) {

  return (

    <button

      type="button"

      onClick={onClick}

      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${

        activa

          ? 'bg-indigo-600 text-white'

          : 'text-slate-600 hover:bg-slate-100'

      }`}

    >

      <Icono size={17} />

      {texto}

    </button>

  );

}



export default AlertasPage;
