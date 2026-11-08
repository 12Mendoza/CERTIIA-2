import {

  useEffect,

  useMemo,

  useState

} from 'react';



import {

  Building2,

  CalendarDays,

  CheckCircle2,

  ChevronRight,

  ClipboardList,

  FileText,

  History,

  LoaderCircle,

  MessageSquareText,

  Paperclip,

  RefreshCw,

  Save,

  UserRound,

  X

} from 'lucide-react';



import {

  api

} from '../../services/api.js';



import TramiteObservacionesModal

  from './TramiteObservacionesModal.jsx';



import TramiteEvidenciasModal

  from './TramiteEvidenciasModal.jsx';



import TramiteSeguimientoModal

  from './TramiteSeguimientoModal.jsx';





// ============================================================

// UTILIDADES

// ============================================================



const obtenerDatosRespuesta = (

  respuesta

) => {



  return (

    respuesta?.data ??

    respuesta ??

    {}

  );

};





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





const fechaHoy = () => {



  const fecha =

    new Date();



  const anio =

    fecha.getFullYear();



  const mes =

    String(

      fecha.getMonth() + 1

    ).padStart(

      2,

      '0'

    );



  const dia =

    String(

      fecha.getDate()

    ).padStart(

      2,

      '0'

    );



  return `${anio}-${mes}-${dia}`;

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



  return `${partes[2]}/${partes[1]}/${partes[0]}`;

};





const formatearFechaHora = (

  valor

) => {



  if (!valor) {

    return '—';

  }



  const fecha =

    new Date(valor);



  if (

    Number.isNaN(

      fecha.getTime()

    )

  ) {

    return String(valor);

  }



  return fecha.toLocaleString(

    'es-PE'

  );

};





const claseEstado = (

  estado

) => {



  switch (estado) {



    case 'PENDIENTE':

      return 'bg-amber-100 text-amber-700';



    case 'EN_TRAMITE':

      return 'bg-blue-100 text-blue-700';



    case 'OBSERVADO':

      return 'bg-orange-100 text-orange-700';



    case 'SUBSANADO':

      return 'bg-violet-100 text-violet-700';



    case 'APROBADO':

      return 'bg-emerald-100 text-emerald-700';



    case 'EMITIDO':

      return 'bg-teal-100 text-teal-700';



    case 'RECHAZADO':

      return 'bg-red-100 text-red-700';



    default:

      return 'bg-slate-100 text-slate-700';

  }

};





const textoEstado = (

  estado

) => {



  switch (estado) {



    case 'PENDIENTE':

      return 'Pendiente';



    case 'EN_TRAMITE':

      return 'En trámite';



    case 'OBSERVADO':

      return 'Observado';



    case 'SUBSANADO':

      return 'Subsanado';



    case 'APROBADO':

      return 'Aprobado';



    case 'RECHAZADO':

      return 'Rechazado';



    case 'EMITIDO':

      return 'Emitido';



    default:

      return estado || '—';

  }

};





// ============================================================

// COMPONENTE

// ============================================================



const TramitesPage = () => {



  // ==========================================================

  // CATÁLOGOS

  // ==========================================================



  const [

    catalogos,

    setCatalogos

  ] = useState({

    documentos: [],

    entidades: [],

    usuarios: [],

    estados: []

  });





  // ==========================================================

  // TRÁMITES

  // ==========================================================



  const [

    tramites,

    setTramites

  ] = useState([]);





  const [

    cargando,

    setCargando

  ] = useState(true);





  const [

    actualizando,

    setActualizando

  ] = useState(false);





  // ==========================================================

  // FORMULARIO

  // ==========================================================



  const [

    formulario,

    setFormulario

  ] = useState({



    documentoId: '',



    entidadEmisoraId: '',



    numeroExpediente: '',



    fechaInicio:

      fechaHoy(),



    responsableUsuarioId: '',



    observaciones: ''

  });





  const [

    guardando,

    setGuardando

  ] = useState(false);





  // ==========================================================

  // MENSAJES

  // ==========================================================



  const [

    error,

    setError

  ] = useState('');





  const [

    mensajeExito,

    setMensajeExito

  ] = useState('');





  // ==========================================================

  // CAMBIO DE ESTADO

  // ==========================================================



  const [

    tramiteEstado,

    setTramiteEstado

  ] = useState(null);





  const [

    estadoNuevo,

    setEstadoNuevo

  ] = useState('');





  const [

    comentarioEstado,

    setComentarioEstado

  ] = useState('');





  const [

    errorEstado,

    setErrorEstado

  ] = useState('');





  // ==========================================================

  // HISTORIAL

  // ==========================================================



  const [

    tramiteHistorial,

    setTramiteHistorial

  ] = useState(null);





  const [

    historial,

    setHistorial

  ] = useState([]);





  const [

    cargandoHistorial,

    setCargandoHistorial

  ] = useState(false);





  const [

    errorHistorial,

    setErrorHistorial

  ] = useState('');





  // ==========================================================

  // OBSERVACIONES Y SUBSANACIONES

  // ==========================================================



  const [

    tramiteObservaciones,

    setTramiteObservaciones

  ] = useState(null);





  const [

    observacionesAbierto,

    setObservacionesAbierto

  ] = useState(false);





  // ==========================================================

  // EVIDENCIAS

  // ==========================================================



  const [

    tramiteEvidencias,

    setTramiteEvidencias

  ] = useState(null);





  const [

    evidenciasAbierto,

    setEvidenciasAbierto

  ] = useState(false);





  // ==========================================================

  // SEGUIMIENTO

  // ==========================================================



  const [

    tramiteSeguimiento,

    setTramiteSeguimiento

  ] = useState(null);





  const [

    seguimientoAbierto,

    setSeguimientoAbierto

  ] = useState(false);





  // ==========================================================

  // DOCUMENTO SELECCIONADO

  // ==========================================================



  const documentoSeleccionado =

    useMemo(

      () => {



        return (

          catalogos.documentos.find(

            (documento) =>

              String(

                documento.id

              ) ===

              String(

                formulario.documentoId

              )

          ) ||

          null

        );



      },

      [

        catalogos.documentos,

        formulario.documentoId

      ]

    );





  // ==========================================================

  // CARGAR CATÁLOGOS

  // ==========================================================



  const cargarCatalogos =

    async () => {



      const respuesta =

        await api.get(

          '/tramites/catalogos'

        );





      const datos =

        obtenerDatosRespuesta(

          respuesta

        );





      setCatalogos({



        documentos:

          Array.isArray(

            datos.documentos

          )

            ? datos.documentos

            : [],



        entidades:

          Array.isArray(

            datos.entidades

          )

            ? datos.entidades

            : [],



        usuarios:

          Array.isArray(

            datos.usuarios

          )

            ? datos.usuarios

            : [],



        estados:

          Array.isArray(

            datos.estados

          )

            ? datos.estados

            : []

      });

    };





  // ==========================================================

  // CARGAR TRÁMITES

  // ==========================================================



  const cargarTramites =

    async () => {



      const respuesta =

        await api.get(

          '/tramites'

        );





      const datos =

        obtenerDatosRespuesta(

          respuesta

        );





      setTramites(

        Array.isArray(

          datos.tramites

        )

          ? datos.tramites

          : []

      );

    };





  // ==========================================================

  // CARGA GENERAL

  // ==========================================================



  const cargarDatos =

    async () => {



      setCargando(true);

      setError('');





      try {



        await Promise.all([

          cargarCatalogos(),

          cargarTramites()

        ]);



      } catch (

        errorPeticion

      ) {



        console.error(

          'Error cargando módulo de trámites:',

          errorPeticion

        );





        setError(

          obtenerMensajeError(

            errorPeticion,

            'No se pudo cargar la información de trámites.'

          )

        );



      } finally {



        setCargando(false);

      }

    };





  useEffect(

    () => {



      cargarDatos();



    },

    []

  );





  // ==========================================================

  // CAMBIAR CAMPO

  // ==========================================================



  const cambiarCampo = (

    campo,

    valor

  ) => {



    setFormulario(

      (actual) => ({

        ...actual,

        [campo]:

          valor

      })

    );





    setError('');

    setMensajeExito('');

  };





  // ==========================================================

  // SELECCIONAR DOCUMENTO

  // ==========================================================



  const cambiarDocumento = (

    valor

  ) => {



    const documento =

      catalogos.documentos.find(

        (item) =>

          String(

            item.id

          ) ===

          String(

            valor

          )

      );





    setFormulario(

      (actual) => ({



        ...actual,



        documentoId:

          valor,



        entidadEmisoraId:

          documento?.entidadEmisora?.id

            ? String(

                documento.entidadEmisora.id

              )

            : ''

      })

    );





    setError('');

    setMensajeExito('');

  };





  // ==========================================================

  // VALIDAR REGISTRO

  // ==========================================================



  const formularioValido =

    Boolean(

      formulario.documentoId &&

      formulario.entidadEmisoraId &&

      formulario.numeroExpediente.trim() &&

      formulario.fechaInicio &&

      formulario.responsableUsuarioId

    );





  // ==========================================================

  // REGISTRAR TRÁMITE

  // ==========================================================



  const registrarTramite =

    async (

      evento

    ) => {



      evento.preventDefault();





      if (

        !formularioValido

      ) {



        setError(

          'Complete todos los campos obligatorios.'

        );



        return;

      }





      setGuardando(true);

      setError('');

      setMensajeExito('');





      try {



        const payload = {



          documentoId:

            Number(

              formulario.documentoId

            ),



          entidadEmisoraId:

            Number(

              formulario.entidadEmisoraId

            ),



          numeroExpediente:

            formulario.numeroExpediente

              .trim(),



          fechaInicio:

            formulario.fechaInicio,



          responsableUsuarioId:

            Number(

              formulario.responsableUsuarioId

            ),



          observaciones:

            formulario.observaciones

              .trim() ||

            null

        };





        const respuesta =

          await api.post(

            '/tramites',

            payload

          );





        const datos =

          obtenerDatosRespuesta(

            respuesta

          );





        setMensajeExito(

          datos.mensaje ||

          'Trámite registrado correctamente.'

        );





        setFormulario({



          documentoId: '',



          entidadEmisoraId: '',



          numeroExpediente: '',



          fechaInicio:

            fechaHoy(),



          responsableUsuarioId: '',



          observaciones: ''

        });





        await cargarTramites();



      } catch (

        errorPeticion

      ) {



        console.error(

          'Error registrando trámite:',

          errorPeticion

        );





        setError(

          obtenerMensajeError(

            errorPeticion,

            'No se pudo registrar el trámite.'

          )

        );



      } finally {



        setGuardando(false);

      }

    };





  // ==========================================================

  // CAMBIO DE ESTADO

  // ==========================================================



  const abrirCambioEstado = (

    tramite

  ) => {



    setTramiteEstado(

      tramite

    );



    setEstadoNuevo('');

    setComentarioEstado('');

    setErrorEstado('');

  };





  const cerrarCambioEstado =

    () => {



      if (

        actualizando

      ) {

        return;

      }



      setTramiteEstado(null);

      setEstadoNuevo('');

      setComentarioEstado('');

      setErrorEstado('');

    };





  const guardarCambioEstado =

    async (

      evento

    ) => {



      evento.preventDefault();





      if (

        !tramiteEstado

      ) {

        return;

      }





      if (

        !estadoNuevo

      ) {



        setErrorEstado(

          'Seleccione el nuevo estado.'

        );



        return;

      }





      if (

        !comentarioEstado.trim()

      ) {



        setErrorEstado(

          'Ingrese un comentario para justificar el cambio.'

        );



        return;

      }





      setActualizando(true);

      setErrorEstado('');





      try {



        const respuesta =

          await api.patch(

            `/tramites/${tramiteEstado.id}/estado`,

            {

              estadoCodigo:

                estadoNuevo,



              comentario:

                comentarioEstado.trim()

            }

          );





        const datos =

          obtenerDatosRespuesta(

            respuesta

          );





        setMensajeExito(

          datos.mensaje ||

          'Estado actualizado correctamente.'

        );





        setTramiteEstado(null);

        setEstadoNuevo('');

        setComentarioEstado('');

        setErrorEstado('');





        await cargarTramites();



      } catch (

        errorPeticion

      ) {



        console.error(

          'Error actualizando estado:',

          errorPeticion

        );





        setErrorEstado(

          obtenerMensajeError(

            errorPeticion,

            'No se pudo actualizar el estado del trámite.'

          )

        );



      } finally {



        setActualizando(false);

      }

    };





  // ==========================================================

  // HISTORIAL

  // ==========================================================



  const abrirHistorial =

    async (

      tramite

    ) => {



      setTramiteHistorial(

        tramite

      );



      setHistorial([]);

      setErrorHistorial('');

      setCargandoHistorial(true);





      try {



        const respuesta =

          await api.get(

            `/tramites/${tramite.id}/historial`

          );





        const datos =

          obtenerDatosRespuesta(

            respuesta

          );





        setHistorial(

          Array.isArray(

            datos.historial

          )

            ? datos.historial

            : []

        );



      } catch (

        errorPeticion

      ) {



        console.error(

          'Error obteniendo historial:',

          errorPeticion

        );





        setErrorHistorial(

          obtenerMensajeError(

            errorPeticion,

            'No se pudo obtener el historial.'

          )

        );



      } finally {



        setCargandoHistorial(false);

      }

    };





  // ==========================================================

  // OBSERVACIONES

  // ==========================================================



  const abrirObservaciones = (

    tramite

  ) => {



    setTramiteObservaciones(

      tramite

    );



    setObservacionesAbierto(

      true

    );

  };





  const cerrarObservaciones =

    () => {



      setObservacionesAbierto(

        false

      );



      setTramiteObservaciones(

        null

      );

    };





  // ==========================================================

  // EVIDENCIAS

  // ==========================================================



  const abrirEvidencias = (

    tramite

  ) => {



    setTramiteEvidencias(

      tramite

    );



    setEvidenciasAbierto(

      true

    );

  };





  const cerrarEvidencias =

    () => {



      setEvidenciasAbierto(

        false

      );



      setTramiteEvidencias(

        null

      );

    };





  // ==========================================================

  // SEGUIMIENTO

  // ==========================================================



  const abrirSeguimiento = (

    tramite

  ) => {



    setTramiteSeguimiento(

      tramite

    );



    setSeguimientoAbierto(

      true

    );

  };





  const cerrarSeguimiento =

    () => {



      setSeguimientoAbierto(

        false

      );



      setTramiteSeguimiento(

        null

      );

    };





  // ==========================================================
  // RESUMEN VISUAL
  // ==========================================================

  const resumenTramites =
    useMemo(
      () => {

        const conteo = {
          total: tramites.length,
          pendiente: 0,
          enTramite: 0,
          observado: 0,
          subsanado: 0,
          aprobado: 0,
          emitido: 0,
          rechazado: 0
        };

        tramites.forEach(
          (tramite) => {

            switch (
              tramite.estado
            ) {

              case 'PENDIENTE':
                conteo.pendiente += 1;
                break;

              case 'EN_TRAMITE':
                conteo.enTramite += 1;
                break;

              case 'OBSERVADO':
                conteo.observado += 1;
                break;

              case 'SUBSANADO':
                conteo.subsanado += 1;
                break;

              case 'APROBADO':
                conteo.aprobado += 1;
                break;

              case 'EMITIDO':
                conteo.emitido += 1;
                break;

              case 'RECHAZADO':
                conteo.rechazado += 1;
                break;

              default:
                break;
            }
          }
        );

        return {
          ...conteo,
          activos:
            conteo.pendiente +
            conteo.enTramite +
            conteo.observado +
            conteo.subsanado +
            conteo.aprobado,
          finalizados:
            conteo.emitido +
            conteo.rechazado
        };
      },
      [
        tramites
      ]
    );


  // ==========================================================

  // RENDER

  // ==========================================================



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
            bg-violet-500/20
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

          {/* LADO IZQUIERDO */}

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
                <ClipboardList size={24} />
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
                  Expedientes y seguimiento CERTIIA
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
              Trámites y expedientes
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
              Registra expedientes, controla cambios de estado
              y centraliza observaciones, evidencias, seguimiento
              e historial de cada trámite.
            </p>


            <div
              className="
                mt-6
                flex
                flex-wrap
                gap-2
              "
            >

              <EtiquetaHeroTramites>
                <ClipboardList size={14} />
                {cargando
                  ? '...'
                  : resumenTramites.total}{' '}
                trámite(s)
              </EtiquetaHeroTramites>

              <EtiquetaHeroTramites>
                <History size={14} />
                {cargando
                  ? '...'
                  : resumenTramites.activos}{' '}
                activo(s)
              </EtiquetaHeroTramites>

              <EtiquetaHeroTramites>
                <CheckCircle2 size={14} />
                {cargando
                  ? '...'
                  : resumenTramites.finalizados}{' '}
                finalizado(s)
              </EtiquetaHeroTramites>

            </div>

          </div>


          {/* PANEL LATERAL */}

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
                    : `${resumenTramites.activos} en gestión`}
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
                  bg-indigo-500/15
                  text-indigo-200
                "
              >
                <History size={22} />
              </div>

            </div>


            <div
              className="
                mt-5
                space-y-3
              "
            >

              <FilaHeroTramites
                etiqueta="En trámite"
                valor={
                  cargando
                    ? '...'
                    : resumenTramites.enTramite
                }
              />

              <FilaHeroTramites
                etiqueta="Observados"
                valor={
                  cargando
                    ? '...'
                    : resumenTramites.observado
                }
              />

              <FilaHeroTramites
                etiqueta="Finalizados"
                valor={
                  cargando
                    ? '...'
                    : resumenTramites.finalizados
                }
              />

            </div>


            <button
              type="button"
              onClick={
                cargarDatos
              }
              disabled={
                cargando
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
                size={16}
                className={
                  cargando
                    ? 'animate-spin'
                    : ''
                }
              />

              {
                cargando
                  ? 'Actualizando...'
                  : 'Actualizar datos'
              }
            </button>

          </div>

        </div>

      </section>


      {/* ===================================================== */}
      {/* KPIs */}
      {/* ===================================================== */}

      <section
        className="
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >

        <TarjetaKpiTramites
          titulo="Total de trámites"
          valor={
            cargando
              ? '...'
              : resumenTramites.total
          }
          descripcion="Expedientes registrados"
          icono={ClipboardList}
          tono="indigo"
          etiqueta="Total"
        />

        <TarjetaKpiTramites
          titulo="En trámite"
          valor={
            cargando
              ? '...'
              : resumenTramites.enTramite
          }
          descripcion="Gestión en curso"
          icono={History}
          tono="blue"
          etiqueta="Operación"
        />

        <TarjetaKpiTramites
          titulo="Observados"
          valor={
            cargando
              ? '...'
              : resumenTramites.observado
          }
          descripcion="Requieren atención"
          icono={MessageSquareText}
          tono="amber"
          etiqueta="Atención"
        />

        <TarjetaKpiTramites
          titulo="Finalizados"
          valor={
            cargando
              ? '...'
              : resumenTramites.finalizados
          }
          descripcion="Emitidos o rechazados"
          icono={CheckCircle2}
          tono="emerald"
          etiqueta="Cierre"
        />

      </section>


      {/* MENSAJES */}



      {error && (



        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

          {error}

        </div>



      )}





      {mensajeExito && (



        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">



          <CheckCircle2 className="h-5 w-5" />



          {mensajeExito}



        </div>



      )}





      {/* ===================================================== */}

      {/* REGISTRAR TRÁMITE */}

      {/* ===================================================== */}



      <form

        onSubmit={

          registrarTramite

        }

        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"

      >



        <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-5">



          <h2 className="text-lg font-bold text-slate-900">

            Registrar trámite

          </h2>



          <p className="mt-1 text-sm text-slate-500">

            Registre un nuevo expediente asociado a un documento.

          </p>



        </div>





        <div className="space-y-6 p-6">



          <div>



            <label className="mb-1.5 block text-sm font-semibold text-slate-700">

              Documento \*

            </label>



            <div className="relative">



              <FileText className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />



              <select

                value={

                  formulario.documentoId

                }

                onChange={

                  (evento) =>

                    cambiarDocumento(

                      evento.target.value

                    )

                }

                required

                className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"

              >



                <option value="">

                  Seleccione un documento

                </option>





                {catalogos.documentos.map(

                  (documento) => (



                    <option

                      key={

                        documento.id

                      }

                      value={

                        documento.id

                      }

                    >



                      {documento.codigoInterno}

                      {' — '}

                      {documento.numeroDocumento}

                      {' — '}

                      {documento.tienda?.nombre || 'Sin tienda'}



                    </option>



                  )

                )}



              </select>



            </div>



          </div>





          {documentoSeleccionado && (



            <div className="grid gap-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4 md:grid-cols-3">



              <div>



                <p className="text-xs font-semibold uppercase text-indigo-500">

                  Tienda

                </p>



                <p className="mt-1 text-sm font-semibold text-slate-800">

                  {documentoSeleccionado.tienda?.nombre || '—'}

                </p>



              </div>





              <div>



                <p className="text-xs font-semibold uppercase text-indigo-500">

                  Tipo documental

                </p>



                <p className="mt-1 text-sm font-semibold text-slate-800">

                  {documentoSeleccionado.tipoDocumento?.nombre || '—'}

                </p>



              </div>





              <div>



                <p className="text-xs font-semibold uppercase text-indigo-500">

                  Estado documento

                </p>



                <p className="mt-1 text-sm font-semibold text-slate-800">

                  {documentoSeleccionado.estado || '—'}

                </p>



              </div>



            </div>



          )}





          <div className="grid gap-5 md:grid-cols-2">



            <div>



              <label className="mb-1.5 block text-sm font-semibold text-slate-700">

                Entidad emisora \*

              </label>



              <div className="relative">



                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />



                <select

                  value={

                    formulario.entidadEmisoraId

                  }

                  onChange={

                    (evento) =>

                      cambiarCampo(

                        'entidadEmisoraId',

                        evento.target.value

                      )

                  }

                  required

                  className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"

                >



                  <option value="">

                    Seleccione una entidad

                  </option>





                  {catalogos.entidades.map(

                    (entidad) => (



                      <option

                        key={

                          entidad.id

                        }

                        value={

                          entidad.id

                        }

                      >

                        {entidad.nombre}

                      </option>



                    )

                  )}



                </select>



              </div>



            </div>





            <div>



              <label className="mb-1.5 block text-sm font-semibold text-slate-700">

                Número de expediente \*

              </label>



              <input

                type="text"

                maxLength={120}

                value={

                  formulario.numeroExpediente

                }

                onChange={

                  (evento) =>

                    cambiarCampo(

                      'numeroExpediente',

                      evento.target.value

                    )

                }

                required

                placeholder="Ej. EXP-2026-00125"

                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"

              />



            </div>





            <div>



              <label className="mb-1.5 block text-sm font-semibold text-slate-700">

                Fecha de inicio \*

              </label>



              <div className="relative">



                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />



                <input

                  type="date"

                  value={

                    formulario.fechaInicio

                  }

                  onChange={

                    (evento) =>

                      cambiarCampo(

                        'fechaInicio',

                        evento.target.value

                      )

                  }

                  required

                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"

                />



              </div>



            </div>





            <div>



              <label className="mb-1.5 block text-sm font-semibold text-slate-700">

                Responsable \*

              </label>



              <div className="relative">



                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />



                <select

                  value={

                    formulario.responsableUsuarioId

                  }

                  onChange={

                    (evento) =>

                      cambiarCampo(

                        'responsableUsuarioId',

                        evento.target.value

                      )

                  }

                  required

                  className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"

                >



                  <option value="">

                    Seleccione un responsable

                  </option>





                  {catalogos.usuarios.map(

                    (usuario) => (



                      <option

                        key={

                          usuario.id

                        }

                        value={

                          usuario.id

                        }

                      >



                        {usuario.nombreCompleto}

                        {' — '}

                        {usuario.rol?.nombre || usuario.email}



                      </option>



                    )

                  )}



                </select>



              </div>



            </div>



          </div>





          <div>



            <label className="mb-1.5 block text-sm font-semibold text-slate-700">

              Observaciones iniciales

            </label>



            <textarea

              rows={3}

              maxLength={1500}

              value={

                formulario.observaciones

              }

              onChange={

                (evento) =>

                  cambiarCampo(

                    'observaciones',

                    evento.target.value

                  )

              }

              placeholder="Información adicional..."

              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"

            />



          </div>





          <div className="flex justify-end">



            <button

              type="submit"

              disabled={

                guardando ||

                !formularioValido

              }

              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"

            >



              {guardando ? (



                <LoaderCircle className="h-4 w-4 animate-spin" />



              ) : (



                <Save className="h-4 w-4" />



              )}



              {guardando

                ? 'Registrando...'

                : 'Registrar trámite'}



            </button>



          </div>



        </div>



      </form>





      {/* ===================================================== */}

      {/* LISTADO */}

      {/* ===================================================== */}



      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">



        <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-5">



          <h2 className="text-lg font-bold text-slate-900">

            Trámites registrados

          </h2>



          <p className="mt-1 text-sm text-slate-500">

            {tramites.length} trámite(s) registrado(s).

          </p>



        </div>





        {cargando ? (



          <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">



            <LoaderCircle className="h-5 w-5 animate-spin" />



            Cargando trámites...



          </div>



        ) : tramites.length === 0 ? (



          <div className="py-16 text-center text-sm text-slate-500">

            No existen trámites registrados.

          </div>



        ) : (



          <div className="overflow-x-auto">



            <table className="min-w-full divide-y divide-slate-100">



              <thead className="bg-slate-50/80">



                <tr>



                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">

                    Expediente

                  </th>



                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">

                    Documento

                  </th>



                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">

                    Tienda

                  </th>



                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">

                    Responsable

                  </th>



                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">

                    Inicio

                  </th>



                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">

                    Estado

                  </th>



                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">

                    Acciones

                  </th>



                </tr>



              </thead>





              <tbody className="divide-y divide-slate-100">



                {tramites.map(

                  (tramite) => (



                    <tr

                      key={

                        tramite.id

                      }

                      className="transition hover:bg-indigo-50/30"

                    >



                      <td className="whitespace-nowrap px-5 py-4">



                        <p className="font-semibold text-slate-900">

                          {tramite.numeroExpediente}

                        </p>



                        <p className="text-xs text-slate-400">

                          Trámite #{tramite.id}

                        </p>



                      </td>





                      <td className="px-5 py-4 text-sm text-slate-700">



                        <p className="font-medium">

                          {tramite.documento?.codigoInterno || '—'}

                        </p>



                        <p className="text-xs text-slate-400">

                          {tramite.documento?.numeroDocumento || '—'}

                        </p>



                      </td>





                      <td className="px-5 py-4 text-sm text-slate-700">

                        {tramite.tienda?.nombre || '—'}

                      </td>





                      <td className="px-5 py-4 text-sm text-slate-700">

                        {tramite.responsable?.nombreCompleto || '—'}

                      </td>





                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">



                        {formatearFecha(

                          tramite.fechaInicio

                        )}



                      </td>





                      <td className="px-5 py-4">



                        <span

                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${claseEstado(

                            tramite.estado

                          )}`}

                        >



                          {tramite.estadoNombre ||

                            textoEstado(

                              tramite.estado

                            )}



                        </span>



                      </td>





                      <td className="px-5 py-4">



                        <div className="flex flex-wrap justify-end gap-2">



                          <button

                            type="button"

                            onClick={() =>

                              abrirSeguimiento(

                                tramite

                              )

                            }

                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"

                          >



                            <History className="h-4 w-4" />



                            Seguimiento



                          </button>





                          <button

                            type="button"

                            onClick={() =>

                              abrirEvidencias(

                                tramite

                              )

                            }

                            disabled={

                              tramite.estado === 'EMITIDO' ||

                              tramite.estado === 'RECHAZADO'

                            }

                            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"

                          >



                            <Paperclip className="h-4 w-4" />



                            Evidencias



                          </button>





                          <button

                            type="button"

                            onClick={() =>

                              abrirObservaciones(

                                tramite

                              )

                            }

                            className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-100"

                          >



                            <MessageSquareText className="h-4 w-4" />



                            Observaciones



                          </button>





                          <button

                            type="button"

                            onClick={() =>

                              abrirHistorial(

                                tramite

                              )

                            }

                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"

                          >



                            <History className="h-4 w-4" />



                            Historial



                          </button>





                          <button

                            type="button"

                            disabled={

                              tramite.estado === 'EMITIDO' ||

                              tramite.estado === 'RECHAZADO'

                            }

                            onClick={() =>

                              abrirCambioEstado(

                                tramite

                              )

                            }

                            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"

                          >



                            Estado



                            <ChevronRight className="h-4 w-4" />



                          </button>



                        </div>



                      </td>



                    </tr>



                  )

                )}



              </tbody>



            </table>



          </div>



        )}



      </div>





      {/* ===================================================== */}

      {/* MODAL CAMBIO DE ESTADO */}

      {/* ===================================================== */}



      {tramiteEstado && (



        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">



          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">



            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">



              <div>



                <h3 className="text-lg font-bold text-slate-900">

                  Actualizar estado

                </h3>



                <p className="mt-1 text-sm text-slate-500">

                  {tramiteEstado.numeroExpediente}

                </p>



              </div>





              <button

                type="button"

                onClick={

                  cerrarCambioEstado

                }

                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"

              >



                <X className="h-5 w-5" />



              </button>



            </div>





            <form

              onSubmit={

                guardarCambioEstado

              }

              className="space-y-5 p-6"

            >



              <div>



                <p className="mb-2 text-sm font-semibold text-slate-700">

                  Estado actual

                </p>



                <span

                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${claseEstado(

                    tramiteEstado.estado

                  )}`}

                >



                  {textoEstado(

                    tramiteEstado.estado

                  )}



                </span>



              </div>





              <div>



                <label className="mb-1.5 block text-sm font-semibold text-slate-700">

                  Nuevo estado \*

                </label>



                <select

                  value={

                    estadoNuevo

                  }

                  onChange={

                    (evento) => {

                      setEstadoNuevo(

                        evento.target.value

                      );

                      setErrorEstado('');

                    }

                  }

                  required

                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"

                >



                  <option value="">

                    Seleccione un estado

                  </option>





                  {catalogos.estados

                    .filter(

                      (estado) =>

                        estado.codigo !==

                        tramiteEstado.estado

                    )

                    .map(

                      (estado) => (



                        <option

                          key={

                            estado.codigo

                          }

                          value={

                            estado.codigo

                          }

                        >

                          {estado.nombre}

                        </option>



                      )

                    )}



                </select>



              </div>





              <div>



                <label className="mb-1.5 block text-sm font-semibold text-slate-700">

                  Comentario \*

                </label>



                <textarea

                  rows={4}

                  maxLength={1500}

                  value={

                    comentarioEstado

                  }

                  onChange={

                    (evento) => {

                      setComentarioEstado(

                        evento.target.value

                      );

                      setErrorEstado('');

                    }

                  }

                  placeholder="Explique el motivo o avance realizado..."

                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"

                />



              </div>





              {errorEstado && (



                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

                  {errorEstado}

                </div>



              )}





              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">



                <button

                  type="button"

                  disabled={

                    actualizando

                  }

                  onClick={

                    cerrarCambioEstado

                  }

                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"

                >

                  Cancelar

                </button>





                <button

                  type="submit"

                  disabled={

                    actualizando ||

                    !estadoNuevo ||

                    !comentarioEstado.trim()

                  }

                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"

                >



                  {actualizando && (

                    <LoaderCircle className="h-4 w-4 animate-spin" />

                  )}



                  Guardar cambio



                </button>



              </div>



            </form>



          </div>



        </div>



      )}





      {/* ===================================================== */}

      {/* MODAL HISTORIAL */}

      {/* ===================================================== */}



      {tramiteHistorial && (



        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">



          <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">



            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">



              <div>



                <h3 className="text-lg font-bold text-slate-900">

                  Historial del trámite

                </h3>



                <p className="mt-1 text-sm text-slate-500">

                  {tramiteHistorial.numeroExpediente}

                </p>



              </div>





              <button

                type="button"

                onClick={() =>

                  setTramiteHistorial(

                    null

                  )

                }

                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"

              >



                <X className="h-5 w-5" />



              </button>



            </div>





            <div className="max-h-[70vh] overflow-y-auto p-6">



              {cargandoHistorial ? (



                <div className="flex justify-center gap-2 py-12 text-sm text-slate-500">



                  <LoaderCircle className="h-5 w-5 animate-spin" />



                  Cargando historial...



                </div>



              ) : errorHistorial ? (



                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                  {errorHistorial}

                </div>



              ) : historial.length === 0 ? (



                <p className="py-10 text-center text-sm text-slate-500">

                  No existe historial para este trámite.

                </p>



              ) : (



                <div className="space-y-4">



                  {historial.map(

                    (item) => (



                      <div

                        key={

                          item.id

                        }

                        className="rounded-xl border border-slate-200 p-4"

                      >



                        <div className="flex flex-wrap items-center gap-2">



                          {item.estadoAnterior && (



                            <>

                              <span

                                className={`rounded-full px-2.5 py-1 text-xs font-bold ${claseEstado(

                                  item.estadoAnterior

                                )}`}

                              >

                                {textoEstado(

                                  item.estadoAnterior

                                )}

                              </span>



                              <ChevronRight className="h-4 w-4 text-slate-400" />

                            </>



                          )}





                          <span

                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${claseEstado(

                              item.estadoNuevo

                            )}`}

                          >

                            {textoEstado(

                              item.estadoNuevo

                            )}

                          </span>



                        </div>





                        <p className="mt-3 text-sm text-slate-700">

                          {item.comentario}

                        </p>





                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">



                          <span>

                            Usuario: {item.usuario}

                          </span>



                          <span>

                            {formatearFechaHora(

                              item.fecha

                            )}

                          </span>



                        </div>



                      </div>



                    )

                  )}



                </div>



              )}



            </div>



          </div>



        </div>



      )}





      {/* ===================================================== */}

      {/* MODAL OBSERVACIONES / SUBSANACIONES */}

      {/* ===================================================== */}



      <TramiteObservacionesModal

        abierto={

          observacionesAbierto

        }

        tramite={

          tramiteObservaciones

        }

        onCerrar={

          cerrarObservaciones

        }

        onActualizado={

          cargarTramites

        }

      />





      {/* ===================================================== */}

      {/* MODAL EVIDENCIAS */}

      {/* ===================================================== */}



      <TramiteEvidenciasModal

        abierto={

          evidenciasAbierto

        }

        tramite={

          tramiteEvidencias

        }

        onCerrar={

          cerrarEvidencias

        }

      />





      {/* ===================================================== */}

      {/* MODAL SEGUIMIENTO */}

      {/* ===================================================== */}



      <TramiteSeguimientoModal

        abierto={

          seguimientoAbierto

        }

        tramite={

          tramiteSeguimiento

        }

        onCerrar={

          cerrarSeguimiento

        }

      />



    </div>

  );

};






// ============================================================
// COMPONENTES VISUALES DEL HERO
// ============================================================

function EtiquetaHeroTramites({
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


function FilaHeroTramites({
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


function TarjetaKpiTramites({
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
    blue: {
      icono:
        'bg-blue-50 text-blue-600',
      barra:
        'from-blue-500 to-cyan-500',
      etiqueta:
        'bg-blue-50 text-blue-600'
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


export default TramitesPage;