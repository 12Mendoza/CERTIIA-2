import {



  useEffect,



  useMemo,



  useState



} from 'react';





import {



  Building2,



  CalendarDays,



  CheckCircle2,



  Clock3,



  FileText,



  LoaderCircle,



  RefreshCw,



  Search



} from 'lucide-react';





import {



  api



} from '../../services/api.js';





import RenovacionCompletarModal



  from './RenovacionCompletarModal.jsx';





import RenovacionHistorialModal



  from './RenovacionHistorialModal.jsx';





// ============================================================



// UTILIDADES



// ============================================================





const obtenerMensajeError = (



  error,



  mensajePredeterminado



) => {





  return (



    error?.response?.data?.mensaje ||



    error?.response?.data?.error ||



    error?.data?.mensaje ||



    error?.data?.error ||



    error?.message ||



    mensajePredeterminado



  );



};





const formatearFecha = (



  valor



) => {





  if (!valor) {



    return '—';



  }





  const texto =



    String(valor).slice(



      0,



      10



    );





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



};





const claseEstado = (



  estado



) => {





  switch (estado) {





    case 'EN_PROCESO':



      return (



        'bg-amber-100 text-amber-700'



      );





    case 'COMPLETADA':



      return (



        'bg-emerald-100 text-emerald-700'



      );





    case 'CANCELADA':



      return (



        'bg-red-100 text-red-700'



      );





    default:



      return (



        'bg-slate-100 text-slate-700'



      );



  }



};





const textoEstado = (



  estado



) => {





  switch (estado) {





    case 'EN_PROCESO':



      return 'En proceso';





    case 'COMPLETADA':



      return 'Completada';





    case 'CANCELADA':



      return 'Cancelada';





    default:



      return estado || '—';



  }



};





// ============================================================



// COMPONENTE



// ÉPICA 7 - RENOVACIONES



// HU-031 / HU-032 / HU-033



// ============================================================





function RenovacionesPage() {





  // ==========================================================



  // DATOS



  // ==========================================================





  const [



    renovaciones,



    setRenovaciones



  ] = useState([]);





  const [



    entidades,



    setEntidades



  ] = useState([]);





  const [



    indicadores,



    setIndicadores



  ] = useState({





    total: 0,





    enProceso: 0,





    completadas: 0,





    canceladas: 0



  });





  // ==========================================================



  // FILTROS



  // ==========================================================





  const [



    busqueda,



    setBusqueda



  ] = useState('');





  const [



    filtroEstado,



    setFiltroEstado



  ] = useState('');





  // ==========================================================



  // ESTADOS GENERALES



  // ==========================================================





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





  // ==========================================================



  // MODAL COMPLETAR RENOVACIÓN



  // HU-032



  // ==========================================================





  const [



    renovacionSeleccionada,



    setRenovacionSeleccionada



  ] = useState(null);





  const [



    modalCompletarAbierto,



    setModalCompletarAbierto



  ] = useState(false);





  const [



    completando,



    setCompletando



  ] = useState(false);





  const [



    errorCompletar,



    setErrorCompletar



  ] = useState('');





  // ==========================================================



  // MODAL HISTORIAL



  // HU-033



  // ==========================================================





  const [



    modalHistorialAbierto,



    setModalHistorialAbierto



  ] = useState(false);





  const [



    historial,



    setHistorial



  ] = useState(null);





  const [



    cargandoHistorial,



    setCargandoHistorial



  ] = useState(false);





  const [



    errorHistorial,



    setErrorHistorial



  ] = useState('');





  // ==========================================================



  // ENTIDADES ACTIVAS



  // ==========================================================





  const entidadesActivas =



    useMemo(



      () => {





        return entidades.filter(



          (entidad) =>



            entidad.activo !== false



        );



      },



      [



        entidades



      ]



    );





  // ==========================================================



  // CARGAR RENOVACIONES



  // ==========================================================





  async function cargarRenovaciones(



    mostrarRecarga = false



  ) {





    try {





      setError('');





      if (mostrarRecarga) {





        setRecargando(



          true



        );





      } else {





        setCargando(



          true



        );



      }





      const parametros =



        new URLSearchParams();





      if (



        busqueda.trim()



      ) {





        parametros.set(



          'q',



          busqueda.trim()



        );



      }





      if (



        filtroEstado



      ) {





        parametros.set(



          'estado',



          filtroEstado



        );



      }





      const consulta =



        parametros.toString();





      const respuesta =



        await api.get(



          consulta



            ? `/renovaciones?${consulta}`



            : '/renovaciones'



        );





      setRenovaciones(



        Array.isArray(



          respuesta?.renovaciones



        )



          ? respuesta.renovaciones



          : []



      );





      setIndicadores({





        total:



          Number(



            respuesta



              ?.indicadores



              ?.total ??



            respuesta?.total ??



            0



          ),





        enProceso:



          Number(



            respuesta



              ?.indicadores



              ?.enProceso ??



            0



          ),





        completadas:



          Number(



            respuesta



              ?.indicadores



              ?.completadas ??



            0



          ),





        canceladas:



          Number(



            respuesta



              ?.indicadores



              ?.canceladas ??



            0



          )



      });





    } catch (



      errorPeticion



    ) {





      console.error(



        'Error cargando renovaciones:',



        errorPeticion



      );





      setError(



        obtenerMensajeError(



          errorPeticion,



          'No se pudieron cargar las renovaciones.'



        )



      );





    } finally {





      setCargando(



        false



      );





      setRecargando(



        false



      );



    }



  }





  // ==========================================================



  // CARGAR ENTIDADES



  // ==========================================================





  async function cargarEntidades() {





    try {





      const respuesta =



        await api.get(



          '/entidades'



        );





      setEntidades(



        Array.isArray(



          respuesta?.entidades



        )



          ? respuesta.entidades



          : []



      );





    } catch (



      errorPeticion



    ) {





      console.error(



        'Error cargando entidades:',



        errorPeticion



      );



    }



  }





  // ==========================================================



  // CARGA INICIAL



  // ==========================================================





  useEffect(



    () => {





      async function cargarInicial() {





        await Promise.all([



          cargarRenovaciones(),



          cargarEntidades()



        ]);



      }





      cargarInicial();





    },



    // La carga inicial debe ejecutarse una sola vez.



    // eslint-disable-next-line react-hooks/exhaustive-deps



    []



  );





  // ==========================================================



  // BUSCAR



  // ==========================================================





  async function buscar(



    evento



  ) {





    evento.preventDefault();





    await cargarRenovaciones();



  }





  // ==========================================================



  // LIMPIAR FILTROS



  // ==========================================================





  async function limpiarFiltros() {





    setBusqueda('');





    setFiltroEstado('');





    try {





      setCargando(



        true



      );





      setError('');





      const respuesta =



        await api.get(



          '/renovaciones'



        );





      setRenovaciones(



        respuesta?.renovaciones ||



        []



      );





      setIndicadores(



        respuesta?.indicadores || {





          total:



            respuesta?.total ||



            0,





          enProceso: 0,





          completadas: 0,





          canceladas: 0



        }



      );





    } catch (



      errorPeticion



    ) {





      setError(



        obtenerMensajeError(



          errorPeticion,



          'No se pudieron cargar las renovaciones.'



        )



      );





    } finally {





      setCargando(



        false



      );



    }



  }





  // ==========================================================



  // ABRIR COMPLETAR RENOVACIÓN



  // ==========================================================





  function abrirCompletar(



    renovacion



  ) {





    if (



      !renovacion?.id ||



      renovacion.estado !==



        'EN_PROCESO'



    ) {



      return;



    }





    setRenovacionSeleccionada(



      renovacion



    );





    setErrorCompletar('');





    setModalCompletarAbierto(



      true



    );



  }





  // ==========================================================



  // CERRAR MODAL



  // ==========================================================





  function cerrarCompletar() {





    if (completando) {



      return;



    }





    setModalCompletarAbierto(



      false



    );





    setRenovacionSeleccionada(



      null



    );





    setErrorCompletar('');



  }





  // ==========================================================



  // HU-032



  // COMPLETAR RENOVACIÓN



  // ==========================================================





  async function guardarDocumentoRenovado({



    renovacionId,



    datos,



    archivo



  }) {





    if (!renovacionId) {





      setErrorCompletar(



        'No se identificó la renovación.'



      );





      return;



    }





    setCompletando(



      true



    );





    setErrorCompletar('');





    setMensaje('');





    try {





      const respuesta =



        await api.patch(



          `/renovaciones/${renovacionId}/completar`,



          datos



        );





      const documentoNuevo =



        respuesta?.documento ||



        null;





      // ======================================================



      // ARCHIVO OPCIONAL DEL NUEVO DOCUMENTO



      // ======================================================





      let mensajeFinal =



        respuesta?.mensaje ||



        'Documento renovado registrado correctamente.';





      if (



        archivo &&



        documentoNuevo?.id



      ) {





        const formData =



          new FormData();





        formData.append(



          'archivo',



          archivo



        );





        try {





          await api.post(



            `/documentos/${documentoNuevo.id}/archivo`,



            formData



          );





          mensajeFinal =



            'Renovación completada, documento renovado registrado y PDF adjuntado correctamente.';





        } catch (



          errorArchivo



        ) {





          console.error(



            'Documento renovado creado, pero falló el archivo:',



            errorArchivo



          );





          mensajeFinal =



            'La renovación fue completada y el nuevo documento fue registrado, pero no se pudo adjuntar el PDF. Puedes adjuntarlo después desde Documentos.';



        }



      }





      setMensaje(



        mensajeFinal



      );





      setModalCompletarAbierto(



        false



      );





      setRenovacionSeleccionada(



        null



      );





      await cargarRenovaciones();





    } catch (



      errorPeticion



    ) {





      console.error(



        'Error completando renovación:',



        errorPeticion



      );





      setErrorCompletar(



        obtenerMensajeError(



          errorPeticion,



          'No se pudo registrar el documento renovado.'



        )



      );





    } finally {





      setCompletando(



        false



      );



    }



  }





  // ==========================================================



  // HU-033



  // ABRIR HISTORIAL DE RENOVACIONES



  // ==========================================================





  async function abrirHistorial(



    renovacion



  ) {





    const documentoId =



      renovacion



        ?.documentoAnterior



        ?.id;





    if (!documentoId) {



      return;



    }





    setModalHistorialAbierto(



      true



    );





    setHistorial(



      null



    );





    setErrorHistorial(



      ''



    );





    setCargandoHistorial(



      true



    );





    try {





      const respuesta =



        await api.get(



          `/renovaciones/historial/${documentoId}`



        );





      setHistorial(



        respuesta



      );





    } catch (



      errorPeticion



    ) {





      console.error(



        'Error cargando historial de renovaciones:',



        errorPeticion



      );





      setErrorHistorial(



        obtenerMensajeError(



          errorPeticion,



          'No se pudo cargar el historial de renovaciones.'



        )



      );





    } finally {





      setCargandoHistorial(



        false



      );



    }



  }





  // ==========================================================



  // CERRAR HISTORIAL



  // ==========================================================





  function cerrarHistorial() {





    if (



      cargandoHistorial



    ) {



      return;



    }





    setModalHistorialAbierto(



      false



    );





    setHistorial(



      null



    );





    setErrorHistorial(



      ''



    );



  }





  // ==========================================================



  // RENDER



  // ==========================================================





  return (



    <div className="space-y-6">



            {/* =================================================== */}
      {/* HERO PRINCIPAL */}
      {/* =================================================== */}

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
                <RefreshCw size={24} />
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
                  Ciclo documental
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  Continuidad y vigencia documental
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
              Renovaciones
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
              Controla los procesos de renovación, conserva la relación
              entre documentos anteriores y nuevos, y consulta la evolución
              histórica de cada ciclo.
            </p>

            <div
              className="
                mt-6
                flex
                flex-wrap
                gap-2
              "
            >

              <EtiquetaHeroRenovaciones>
                <FileText size={14} />
                {cargando
                  ? '...'
                  : indicadores.total}{' '}
                proceso(s)
              </EtiquetaHeroRenovaciones>

              <EtiquetaHeroRenovaciones>
                <Clock3 size={14} />
                {cargando
                  ? '...'
                  : indicadores.enProceso}{' '}
                en proceso
              </EtiquetaHeroRenovaciones>

              <EtiquetaHeroRenovaciones>
                <CheckCircle2 size={14} />
                {cargando
                  ? '...'
                  : indicadores.completadas}{' '}
                completada(s)
              </EtiquetaHeroRenovaciones>

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
                items-start
                justify-between
                gap-4
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
                  Estado operativo
                </p>

                <p
                  className="
                    mt-1
                    text-lg
                    font-bold
                    text-white
                  "
                >
                  {cargando
                    ? 'Consultando...'
                    : `${indicadores.enProceso} en proceso`}
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
                  bg-amber-500/15
                  text-amber-200
                "
              >
                <Clock3 size={22} />
              </div>

            </div>

            <div
              className="
                mt-5
                space-y-3
              "
            >

              <FilaHeroRenovaciones
                etiqueta="Procesos totales"
                valor={
                  cargando
                    ? '...'
                    : indicadores.total
                }
              />

              <FilaHeroRenovaciones
                etiqueta="Completadas"
                valor={
                  cargando
                    ? '...'
                    : indicadores.completadas
                }
              />

              <FilaHeroRenovaciones
                etiqueta="Canceladas"
                valor={
                  cargando
                    ? '...'
                    : indicadores.canceladas
                }
              />

            </div>

            <button
              type="button"
              onClick={() =>
                cargarRenovaciones(
                  true
                )
              }
              disabled={
                recargando
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
                disabled:cursor-not-allowed
                disabled:opacity-50
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

              {recargando
                ? 'Actualizando...'
                : 'Actualizar datos'}
            </button>

          </div>

        </div>

      </section>


      {/* =================================================== */}
      {/* KPIs */}
      {/* =================================================== */}

      <section
        className="
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >

        <TarjetaIndicador
          titulo="Total"
          valor={
            cargando
              ? '...'
              : indicadores.total
          }
          descripcion="Procesos registrados"
          icono={FileText}
          tono="indigo"
          etiqueta="Ciclos"
        />

        <TarjetaIndicador
          titulo="En proceso"
          valor={
            cargando
              ? '...'
              : indicadores.enProceso
          }
          descripcion="Pendientes de completar"
          icono={Clock3}
          tono="amber"
          etiqueta="Operación"
        />

        <TarjetaIndicador
          titulo="Completadas"
          valor={
            cargando
              ? '...'
              : indicadores.completadas
          }
          descripcion="Nuevo documento emitido"
          icono={CheckCircle2}
          tono="emerald"
          etiqueta="Cerradas"
        />

        <TarjetaIndicador
          titulo="Canceladas"
          valor={
            cargando
              ? '...'
              : indicadores.canceladas
          }
          descripcion="Procesos cerrados"
          icono={RefreshCw}
          tono="red"
          etiqueta="Control"
        />

      </section>


{/* =================================================== */}

      {/* MENSAJES */}

      {/* =================================================== */}



      {

        error && (



          <div

            className="

              rounded-2xl

              border

              border-red-200

              bg-red-50

              px-4

              py-3

              text-sm

              font-medium

              text-red-700

            "

          >

            {error}

          </div>



        )

      }





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

              px-4

              py-3

              text-sm

              text-emerald-700

            "

          >



            <CheckCircle2

              size={19}

              className="

                mt-0.5

                shrink-0

              "

            />



            <span className="font-medium">

              {mensaje}

            </span>



          </div>



        )

      }





      {/* =================================================== */}

      {/* FILTROS */}

      {/* =================================================== */}



      <form

        onSubmit={

          buscar

        }

        className="

          overflow-hidden

          rounded-2xl

          border

          border-slate-200

          bg-white

          shadow-sm

        "

      >



        <div

          className="

            border-b

            border-slate-100

            px-5

            py-4

          "

        >



          <h2

            className="

              text-sm

              font-bold

              text-slate-900

            "

          >

            Buscar renovaciones

          </h2>



          <p

            className="

              mt-1

              text-xs

              text-slate-500

            "

          >

            Filtra por documento, tienda, tipo,

            responsable, expediente o estado.

          </p>



        </div>





        <div className="p-5">



          <div

            className="

              grid

              gap-3

              lg:grid-cols-[1fr_220px_auto_auto]

            "

          >



            <div className="relative">



              <Search

                size={18}

                className="

                  absolute

                  left-3

                  top-1/2

                  -translate-y-1/2

                  text-slate-400

                "

              />



              <input

                type="text"

                value={

                  busqueda

                }

                onChange={

                  (evento) =>

                    setBusqueda(

                      evento.target.value

                    )

                }

                placeholder="Documento, tienda, tipo, responsable o expediente..."

                className="

                  h-11

                  w-full

                  rounded-xl

                  border

                  border-slate-300

                  bg-white

                  pl-10

                  pr-3

                  text-sm

                  text-slate-700

                  outline-none

                  transition

                  placeholder:text-slate-400

                  focus:border-indigo-500

                  focus:ring-4

                  focus:ring-indigo-50

                "

              />



            </div>





            <select

              value={

                filtroEstado

              }

              onChange={

                (evento) =>

                  setFiltroEstado(

                    evento.target.value

                  )

              }

              className="

                h-11

                rounded-xl

                border

                border-slate-300

                bg-white

                px-3

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

                Todos los estados

              </option>



              <option value="EN_PROCESO">

                En proceso

              </option>



              <option value="COMPLETADA">

                Completadas

              </option>



              <option value="CANCELADA">

                Canceladas

              </option>



            </select>





            <button

              type="submit"

              disabled={

                cargando

              }

              className="

                h-11

                rounded-xl

                bg-indigo-600

                px-4

                text-sm

                font-semibold

                text-white

                transition

                hover:bg-indigo-700

                disabled:cursor-not-allowed

                disabled:opacity-50

              "

            >

              Buscar

            </button>





            <button

              type="button"

              onClick={

                limpiarFiltros

              }

              disabled={

                cargando

              }

              className="

                h-11

                rounded-xl

                border

                border-slate-300

                bg-white

                px-4

                text-sm

                font-semibold

                text-slate-600

                transition

                hover:bg-slate-50

                disabled:cursor-not-allowed

                disabled:opacity-50

              "

            >

              Limpiar

            </button>



          </div>



        </div>



      </form>





      {/* =================================================== */}

      {/* LISTADO */}

      {/* =================================================== */}



      <section

        className="

          overflow-hidden

          rounded-2xl

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

            gap-2

            border-b

            border-slate-100

            px-5

            py-4

            sm:flex-row

            sm:items-center

            sm:justify-between

          "

        >



          <div>



            <h2

              className="

                font-bold

                text-slate-900

              "

            >

              Procesos de renovación

            </h2>



            <p

              className="

                mt-1

                text-sm

                text-slate-500

              "

            >

              {

                renovaciones.length

              }

              {' '}

              {

                renovaciones.length === 1

                  ? 'registro visible'

                  : 'registros visibles'

              }

            </p>



          </div>





          <span

            className="

              text-xs

              font-medium

              text-slate-400

            "

          >

            Historial documental conservado

          </span>



        </div>





        {

          cargando

            ? (



              <div className="space-y-3 p-5">



                {

                  [1, 2, 3, 4].map(

                    (item) => (



                      <div

                        key={item}

                        className="

                          h-16

                          animate-pulse

                          rounded-xl

                          bg-slate-100

                        "

                      />



                    )

                  )

                }



              </div>



            )



            : renovaciones.length === 0



              ? (



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

                    <RefreshCw size={30} />

                  </div>



                  <p

                    className="

                      mt-4

                      font-bold

                      text-slate-800

                    "

                  >

                    No hay renovaciones

                  </p>



                  <p

                    className="

                      mt-1

                      max-w-md

                      text-sm

                      leading-6

                      text-slate-500

                    "

                  >

                    Los procesos iniciados desde

                    Documentos aparecerán en esta sección.

                  </p>



                </div>



              )



              : (



                <>



                  {/* ===================================== */}

                  {/* TABLA ESCRITORIO */}

                  {/* ===================================== */}



                  <div

                    className="

                      hidden

                      overflow-x-auto

                      md:block

                    "

                  >



                    <table

                      className="

                        min-w-full

                        divide-y

                        divide-slate-100

                      "

                    >



                      <thead

                        className="

                          bg-slate-50/80

                        "

                      >



                        <tr>



                          {

                            [

                              'Documento',

                              'Tienda / tipo',

                              'Responsable',

                              'Inicio',

                              'Duración',

                              'Estado',

                              'Acciones'

                            ].map(

                              (titulo) => (



                                <th

                                  key={titulo}

                                  className="

                                    px-5

                                    py-3

                                    text-left

                                    text-[11px]

                                    font-bold

                                    uppercase

                                    tracking-wider

                                    text-slate-400

                                  "

                                >

                                  {titulo}

                                </th>



                              )

                            )

                          }



                        </tr>



                      </thead>





                      <tbody

                        className="

                          divide-y

                          divide-slate-100

                          bg-white

                        "

                      >



                        {

                          renovaciones.map(

                            (renovacion) => (



                              <tr

                                key={

                                  renovacion.id

                                }

                                className="

                                  transition

                                  hover:bg-indigo-50/30

                                "

                              >



                                {/* DOCUMENTO */}



                                <td className="px-5 py-4">



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

                                        h-10

                                        w-10

                                        shrink-0

                                        items-center

                                        justify-center

                                        rounded-xl

                                        bg-indigo-50

                                        text-indigo-600

                                      "

                                    >

                                      <FileText size={19} />

                                    </div>





                                    <div>



                                      <p

                                        className="

                                          text-sm

                                          font-bold

                                          text-slate-900

                                        "

                                      >

                                        {

                                          renovacion

                                            ?.documentoAnterior

                                            ?.codigoInterno ||

                                          'Sin código'

                                        }

                                      </p>



                                      <p

                                        className="

                                          mt-0.5

                                          text-xs

                                          text-slate-500

                                        "

                                      >

                                        {

                                          renovacion

                                            ?.documentoAnterior

                                            ?.numeroDocumento ||

                                          'Sin número'

                                        }

                                      </p>



                                      {

                                        renovacion

                                          ?.documentoRenovado && (



                                          <div

                                            className="

                                              mt-2

                                              inline-flex

                                              items-center

                                              gap-1

                                              rounded-full

                                              bg-emerald-50

                                              px-2

                                              py-1

                                              text-[11px]

                                              font-semibold

                                              text-emerald-700

                                            "

                                          >

                                            <CheckCircle2 size={12} />

                                            Nuevo:

                                            {' '}

                                            {

                                              renovacion

                                                .documentoRenovado

                                                .codigoInterno

                                            }

                                          </div>



                                        )

                                      }



                                    </div>



                                  </div>



                                </td>





                                {/* TIENDA / TIPO */}



                                <td className="px-5 py-4">



                                  <div

                                    className="

                                      flex

                                      items-center

                                      gap-2

                                      text-sm

                                      font-medium

                                      text-slate-700

                                    "

                                  >



                                    <Building2

                                      size={16}

                                      className="text-slate-400"

                                    />



                                    {

                                      renovacion

                                        ?.documentoAnterior

                                        ?.tienda

                                        ?.nombre ||

                                      '—'

                                    }



                                  </div>



                                  <p

                                    className="

                                      mt-1

                                      text-xs

                                      text-slate-400

                                    "

                                  >

                                    {

                                      renovacion

                                        ?.documentoAnterior

                                        ?.tipoDocumento

                                        ?.nombre ||

                                      '—'

                                    }

                                  </p>



                                </td>





                                {/* RESPONSABLE */}



                                <td

                                  className="

                                    px-5

                                    py-4

                                    text-sm

                                    text-slate-700

                                  "

                                >

                                  {

                                    renovacion

                                      ?.responsable

                                      ?.nombreCompleto ||

                                    '—'

                                  }

                                </td>





                                {/* INICIO */}



                                <td

                                  className="

                                    whitespace-nowrap

                                    px-5

                                    py-4

                                  "

                                >



                                  <div

                                    className="

                                      flex

                                      items-center

                                      gap-2

                                      text-sm

                                      font-medium

                                      text-slate-700

                                    "

                                  >



                                    <CalendarDays

                                      size={16}

                                      className="text-slate-400"

                                    />



                                    {

                                      formatearFecha(

                                        renovacion.fechaInicio

                                      )

                                    }



                                  </div>



                                </td>





                                {/* DURACIÓN */}



                                <td

                                  className="

                                    whitespace-nowrap

                                    px-5

                                    py-4

                                    text-sm

                                    font-medium

                                    text-slate-700

                                  "

                                >

                                  {

                                    Number.isFinite(

                                      Number(

                                        renovacion.duracionDias

                                      )

                                    )

                                      ? `${renovacion.duracionDias} días`

                                      : '—'

                                  }

                                </td>





                                {/* ESTADO */}



                                <td

                                  className="

                                    whitespace-nowrap

                                    px-5

                                    py-4

                                  "

                                >



                                  <span

                                    className={`

                                      inline-flex

                                      rounded-full

                                      px-2.5

                                      py-1

                                      text-xs

                                      font-semibold

                                      ${claseEstado(

                                        renovacion.estado

                                      )}

                                    `}

                                  >

                                    {

                                      textoEstado(

                                        renovacion.estado

                                      )

                                    }

                                  </span>



                                </td>





                                {/* ACCIONES */}



                                <td

                                  className="

                                    min-w-[250px]

                                    px-5

                                    py-4

                                  "

                                >



                                  <div

                                    className="

                                      flex

                                      flex-wrap

                                      justify-end

                                      gap-2

                                    "

                                  >



                                    <button

                                      type="button"

                                      onClick={() =>

                                        abrirHistorial(

                                          renovacion

                                        )

                                      }

                                      className="

                                        inline-flex

                                        items-center

                                        gap-2

                                        rounded-lg

                                        border

                                        border-indigo-200

                                        bg-indigo-50

                                        px-3

                                        py-1.5

                                        text-xs

                                        font-semibold

                                        text-indigo-700

                                        transition

                                        hover:bg-indigo-100

                                      "

                                    >



                                      <FileText size={14} />



                                      Historial



                                    </button>





                                    {

                                      renovacion.estado ===

                                        'EN_PROCESO' && (



                                        <button

                                          type="button"

                                          onClick={() =>

                                            abrirCompletar(

                                              renovacion

                                            )

                                          }

                                          className="

                                            inline-flex

                                            items-center

                                            gap-2

                                            rounded-lg

                                            bg-emerald-600

                                            px-3

                                            py-1.5

                                            text-xs

                                            font-semibold

                                            text-white

                                            transition

                                            hover:bg-emerald-700

                                          "

                                        >



                                          <CheckCircle2 size={14} />



                                          Registrar renovado



                                        </button>



                                      )

                                    }



                                  </div>



                                </td>



                              </tr>



                            )

                          )

                        }



                      </tbody>



                    </table>



                  </div>





                  {/* ===================================== */}

                  {/* TARJETAS MÓVIL */}

                  {/* ===================================== */}



                  <div

                    className="

                      divide-y

                      divide-slate-100

                      md:hidden

                    "

                  >



                    {

                      renovaciones.map(

                        (renovacion) => (



                          <article

                            key={

                              `movil-${renovacion.id}`

                            }

                            className="p-5"

                          >



                            <div

                              className="

                                flex

                                items-start

                                justify-between

                                gap-3

                              "

                            >



                              <div

                                className="

                                  flex

                                  min-w-0

                                  items-start

                                  gap-3

                                "

                              >



                                <div

                                  className="

                                    flex

                                    h-10

                                    w-10

                                    shrink-0

                                    items-center

                                    justify-center

                                    rounded-xl

                                    bg-indigo-50

                                    text-indigo-600

                                  "

                                >

                                  <FileText size={19} />

                                </div>



                                <div className="min-w-0">



                                  <p

                                    className="

                                      truncate

                                      font-bold

                                      text-slate-900

                                    "

                                  >

                                    {

                                      renovacion

                                        ?.documentoAnterior

                                        ?.codigoInterno ||

                                      'Sin código'

                                    }

                                  </p>



                                  <p

                                    className="

                                      mt-0.5

                                      text-sm

                                      text-slate-500

                                    "

                                  >

                                    {

                                      renovacion

                                        ?.documentoAnterior

                                        ?.numeroDocumento ||

                                      'Sin número'

                                    }

                                  </p>



                                </div>



                              </div>





                              <span

                                className={`

                                  inline-flex

                                  shrink-0

                                  rounded-full

                                  px-2.5

                                  py-1

                                  text-[11px]

                                  font-semibold

                                  ${claseEstado(

                                    renovacion.estado

                                  )}

                                `}

                              >

                                {

                                  textoEstado(

                                    renovacion.estado

                                  )

                                }

                              </span>



                            </div>





                            <div

                              className="

                                mt-4

                                grid

                                grid-cols-2

                                gap-3

                                text-sm

                              "

                            >



                              <div>



                                <p className="text-xs text-slate-400">

                                  Tienda

                                </p>



                                <p

                                  className="

                                    mt-1

                                    font-medium

                                    text-slate-700

                                  "

                                >

                                  {

                                    renovacion

                                      ?.documentoAnterior

                                      ?.tienda

                                      ?.nombre ||

                                    '—'

                                  }

                                </p>



                              </div>





                              <div>



                                <p className="text-xs text-slate-400">

                                  Inicio

                                </p>



                                <p

                                  className="

                                    mt-1

                                    font-medium

                                    text-slate-700

                                  "

                                >

                                  {

                                    formatearFecha(

                                      renovacion.fechaInicio

                                    )

                                  }

                                </p>



                              </div>





                              <div>



                                <p className="text-xs text-slate-400">

                                  Responsable

                                </p>



                                <p

                                  className="

                                    mt-1

                                    font-medium

                                    text-slate-700

                                  "

                                >

                                  {

                                    renovacion

                                      ?.responsable

                                      ?.nombreCompleto ||

                                    '—'

                                  }

                                </p>



                              </div>





                              <div>



                                <p className="text-xs text-slate-400">

                                  Duración

                                </p>



                                <p

                                  className="

                                    mt-1

                                    font-medium

                                    text-slate-700

                                  "

                                >

                                  {

                                    Number.isFinite(

                                      Number(

                                        renovacion.duracionDias

                                      )

                                    )

                                      ? `${renovacion.duracionDias} días`

                                      : '—'

                                  }

                                </p>



                              </div>



                            </div>





                            {

                              renovacion

                                ?.documentoRenovado && (



                                <div

                                  className="

                                    mt-4

                                    rounded-xl

                                    border

                                    border-emerald-200

                                    bg-emerald-50

                                    px-3

                                    py-2

                                    text-xs

                                    font-semibold

                                    text-emerald-700

                                  "

                                >

                                  Documento renovado:

                                  {' '}

                                  {

                                    renovacion

                                      .documentoRenovado

                                      .codigoInterno

                                  }

                                </div>



                              )

                            }





                            <div

                              className="

                                mt-4

                                flex

                                gap-2

                              "

                            >



                              <button

                                type="button"

                                onClick={() =>

                                  abrirHistorial(

                                    renovacion

                                  )

                                }

                                className="

                                  flex-1

                                  rounded-xl

                                  border

                                  border-indigo-200

                                  bg-indigo-50

                                  px-3

                                  py-2

                                  text-sm

                                  font-semibold

                                  text-indigo-700

                                "

                              >

                                Historial

                              </button>





                              {

                                renovacion.estado ===

                                  'EN_PROCESO' && (



                                  <button

                                    type="button"

                                    onClick={() =>

                                      abrirCompletar(

                                        renovacion

                                      )

                                    }

                                    className="

                                      flex-1

                                      rounded-xl

                                      bg-emerald-600

                                      px-3

                                      py-2

                                      text-sm

                                      font-semibold

                                      text-white

                                    "

                                  >

                                    Completar

                                  </button>



                                )

                              }



                            </div>



                          </article>



                        )

                      )

                    }



                  </div>



                </>



              )

        }



      </section>





      {/* =================================================== */}

      {/* MODAL COMPLETAR RENOVACIÓN */}

      {/* =================================================== */}



      <RenovacionCompletarModal

        abierto={

          modalCompletarAbierto

        }

        renovacion={

          renovacionSeleccionada

        }

        entidades={

          entidadesActivas

        }

        cargando={

          completando

        }

        error={

          errorCompletar

        }

        onCerrar={

          cerrarCompletar

        }

        onGuardar={

          guardarDocumentoRenovado

        }

      />





      {/* =================================================== */}

      {/* MODAL HISTORIAL */}

      {/* =================================================== */}



      <RenovacionHistorialModal

        abierto={

          modalHistorialAbierto

        }

        cargando={

          cargandoHistorial

        }

        error={

          errorHistorial

        }

        historial={

          historial

        }

        onCerrar={

          cerrarHistorial

        }

      />



    </div>



  );



}





// ============================================================



// ============================================================



// TARJETA INDICADOR



// ============================================================





function EtiquetaHeroRenovaciones({
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


function FilaHeroRenovaciones({
  etiqueta,
  valor
}) {

  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        rounded-xl
        border
        border-white/10
        bg-black/10
        px-3
        py-2.5
      "
    >

      <span
        className="
          text-xs
          font-medium
          text-slate-300
        "
      >
        {etiqueta}
      </span>

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


function TarjetaIndicador({
  titulo,
  valor,
  descripcion,
  icono: Icono,
  tono = 'indigo',
  etiqueta = 'Indicador'
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
    amber: {
      icono:
        'bg-amber-50 text-amber-600',
      barra:
        'from-amber-500 to-orange-500',
      etiqueta:
        'bg-amber-50 text-amber-600'
    },
    emerald: {
      icono:
        'bg-emerald-50 text-emerald-600',
      barra:
        'from-emerald-500 to-teal-500',
      etiqueta:
        'bg-emerald-50 text-emerald-600'
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


export default RenovacionesPage;