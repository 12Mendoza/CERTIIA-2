import {
  useEffect,
  useState
} from 'react';

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  FileText,
  History,
  LoaderCircle,
  MessageSquareText,
  Paperclip,
  RefreshCw,
  Store,
  UserRound,
  X
} from 'lucide-react';

import {
  useNavigate
} from 'react-router-dom';

import {
  api
} from '../../services/api.js';


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


const formatearFecha = (
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


  return fecha.toLocaleDateString(
    'es-PE'
  );
};


const formatearTamano = (
  bytes
) => {

  const valor =
    Number(bytes);


  if (
    !Number.isFinite(valor) ||
    valor <= 0
  ) {
    return '—';
  }


  if (
    valor < 1024
  ) {
    return `${valor} B`;
  }


  if (
    valor <
    1024 * 1024
  ) {

    return `${(
      valor / 1024
    ).toFixed(1)} KB`;
  }


  return `${(
    valor /
    (
      1024 *
      1024
    )
  ).toFixed(2)} MB`;
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

    case 'EMITIDO':
      return 'Emitido';

    case 'RECHAZADO':
      return 'Rechazado';

    default:
      return estado || '—';
  }
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


const obtenerIconoEvento = (
  tipo
) => {

  switch (tipo) {

    case 'CREACION_TRAMITE':
      return FileText;

    case 'CAMBIO_ESTADO':
      return RefreshCw;

    case 'OBSERVACION':
      return MessageSquareText;

    case 'SUBSANACION':
      return CheckCircle2;

    case 'EVIDENCIA':
      return Paperclip;

    default:
      return History;
  }
};


const obtenerClaseEvento = (
  tipo
) => {

  switch (tipo) {

    case 'CREACION_TRAMITE':
      return 'bg-indigo-100 text-indigo-700';

    case 'CAMBIO_ESTADO':
      return 'bg-blue-100 text-blue-700';

    case 'OBSERVACION':
      return 'bg-orange-100 text-orange-700';

    case 'SUBSANACION':
      return 'bg-emerald-100 text-emerald-700';

    case 'EVIDENCIA':
      return 'bg-violet-100 text-violet-700';

    default:
      return 'bg-slate-100 text-slate-700';
  }
};


// ============================================================
// COMPONENTE
// ============================================================

const TramiteSeguimientoModal = ({
  abierto,
  tramite,
  onCerrar
}) => {

  const navigate =
    useNavigate();


  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [
    cargando,
    setCargando
  ] = useState(false);


  const [
    datos,
    setDatos
  ] = useState(null);


  const [
    error,
    setError
  ] = useState('');


  // ==========================================================
  // CARGAR SEGUIMIENTO
  // ==========================================================

  const cargarSeguimiento =
    async () => {

      if (
        !tramite?.id
      ) {
        return;
      }


      setCargando(true);
      setError('');


      try {

        const respuesta =
          await api.get(
            `/tramites/${tramite.id}/seguimiento`
          );


        const contenido =
          obtenerDatosRespuesta(
            respuesta
          );


        setDatos(
          contenido
        );


      } catch (
        errorPeticion
      ) {

        console.error(
          'Error obteniendo seguimiento:',
          errorPeticion
        );


        setDatos(null);


        setError(
          obtenerMensajeError(
            errorPeticion,
            'No se pudo obtener el seguimiento del trámite.'
          )
        );


      } finally {

        setCargando(false);
      }
    };


  useEffect(
    () => {

      if (
        abierto &&
        tramite?.id
      ) {

        setDatos(null);
        setError('');

        cargarSeguimiento();
      }

    },
    [
      abierto,
      tramite?.id
    ]
  );


  // ==========================================================
  // NAVEGAR AL DOCUMENTO
  // ==========================================================

  const irDocumento = () => {

    if (
      !datos?.tramite?.documento?.id
    ) {
      return;
    }


    onCerrar();


    navigate(
      '/documentos',
      {
        state: {
          documentoId:
            datos.tramite.documento.id
        }
      }
    );
  };


  // ==========================================================
  // NO RENDERIZAR
  // ==========================================================

  if (
    !abierto ||
    !tramite
  ) {

    return null;
  }


  const informacion =
    datos?.tramite ||
    null;


  const lineaTiempo =
    Array.isArray(
      datos?.lineaTiempo
    )
      ? datos.lineaTiempo
      : [];


  const observaciones =
    Array.isArray(
      datos?.observaciones
    )
      ? datos.observaciones
      : [];


  const subsanaciones =
    Array.isArray(
      datos?.subsanaciones
    )
      ? datos.subsanaciones
      : [];


  const evidencias =
    Array.isArray(
      datos?.evidencias
    )
      ? datos.evidencias
      : [];


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

      <div className="max-h-[94vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* ================================================= */}
        {/* CABECERA */}
        {/* ================================================= */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-blue-100 p-2.5">

              <History className="h-5 w-5 text-blue-700" />

            </div>


            <div>

              <h3 className="text-lg font-bold text-slate-900">
                Seguimiento del trámite
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Expediente: {tramite.numeroExpediente}
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={
              onCerrar
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >

            <X className="h-5 w-5" />

          </button>

        </div>


        {/* ================================================= */}
        {/* CONTENIDO */}
        {/* ================================================= */}

        <div className="max-h-[82vh] overflow-y-auto p-6">

          {cargando ? (

            <div className="flex items-center justify-center gap-3 py-20 text-sm text-slate-500">

              <LoaderCircle className="h-5 w-5 animate-spin" />

              Cargando seguimiento...

            </div>

          ) : error ? (

            <div className="rounded-xl border border-red-200 bg-red-50 p-5">

              <div className="flex items-center gap-3">

                <AlertCircle className="h-5 w-5 text-red-600" />

                <p className="text-sm text-red-700">
                  {error}
                </p>

              </div>

            </div>

          ) : informacion ? (

            <div className="space-y-6">

              {/* =========================================== */}
              {/* RESUMEN */}
              {/* =========================================== */}

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                <div className="rounded-xl border border-slate-200 p-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Estado actual
                  </p>

                  <div className="mt-2">

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${claseEstado(
                        informacion.estado
                      )}`}
                    >
                      {informacion.estadoNombre ||
                        textoEstado(
                          informacion.estado
                        )}
                    </span>

                  </div>

                </div>


                <div className="rounded-xl border border-slate-200 p-4">

                  <div className="flex items-center gap-2 text-slate-400">

                    <CalendarDays className="h-4 w-4" />

                    <p className="text-xs font-semibold uppercase tracking-wide">
                      Inicio
                    </p>

                  </div>

                  <p className="mt-2 font-semibold text-slate-900">
                    {formatearFecha(
                      informacion.fechas?.inicio
                    )}
                  </p>

                </div>


                <div className="rounded-xl border border-slate-200 p-4">

                  <div className="flex items-center gap-2 text-slate-400">

                    <Clock3 className="h-4 w-4" />

                    <p className="text-xs font-semibold uppercase tracking-wide">
                      Duración
                    </p>

                  </div>

                  <p className="mt-2 font-semibold text-slate-900">

                    {informacion.duracion?.dias ?? 0} días

                  </p>

                  <p className="mt-1 text-xs text-slate-400">

                    {informacion.duracion?.finalizado
                      ? 'Trámite finalizado'
                      : 'Duración acumulada'}

                  </p>

                </div>


                <div className="rounded-xl border border-slate-200 p-4">

                  <div className="flex items-center gap-2 text-slate-400">

                    <UserRound className="h-4 w-4" />

                    <p className="text-xs font-semibold uppercase tracking-wide">
                      Responsable
                    </p>

                  </div>

                  <p className="mt-2 font-semibold text-slate-900">
                    {informacion.responsable?.nombreCompleto || '—'}
                  </p>

                </div>

              </div>


              {/* =========================================== */}
              {/* DATOS RELACIONADOS */}
              {/* =========================================== */}

              <div className="grid gap-4 lg:grid-cols-3">

                <div className="rounded-xl border border-slate-200 p-5">

                  <div className="mb-3 flex items-center gap-2">

                    <FileText className="h-5 w-5 text-indigo-600" />

                    <h4 className="font-bold text-slate-900">
                      Documento
                    </h4>

                  </div>


                  <p className="text-sm font-semibold text-slate-800">
                    {informacion.documento?.codigoInterno || '—'}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {informacion.documento?.numeroDocumento || '—'}
                  </p>


                  <button
                    type="button"
                    onClick={
                      irDocumento
                    }
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                  >

                    Ir al documento

                    <ChevronRight className="h-4 w-4" />

                  </button>

                </div>


                <div className="rounded-xl border border-slate-200 p-5">

                  <div className="mb-3 flex items-center gap-2">

                    <Store className="h-5 w-5 text-blue-600" />

                    <h4 className="font-bold text-slate-900">
                      Tienda
                    </h4>

                  </div>

                  <p className="text-sm font-semibold text-slate-800">
                    {informacion.tienda?.nombre || '—'}
                  </p>

                </div>


                <div className="rounded-xl border border-slate-200 p-5">

                  <div className="mb-3 flex items-center gap-2">

                    <FileCheck2 className="h-5 w-5 text-emerald-600" />

                    <h4 className="font-bold text-slate-900">
                      Resumen
                    </h4>

                  </div>


                  <div className="space-y-2 text-sm text-slate-600">

                    <p>
                      Observaciones:{' '}
                      <strong>
                        {observaciones.length}
                      </strong>
                    </p>

                    <p>
                      Subsanaciones:{' '}
                      <strong>
                        {subsanaciones.length}
                      </strong>
                    </p>

                    <p>
                      Evidencias:{' '}
                      <strong>
                        {evidencias.length}
                      </strong>
                    </p>

                  </div>

                </div>

              </div>


              {/* =========================================== */}
              {/* EVIDENCIAS */}
              {/* =========================================== */}

              <div className="rounded-xl border border-slate-200 p-5">

                <div className="mb-4 flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <Paperclip className="h-5 w-5 text-violet-600" />

                    <h4 className="font-bold text-slate-900">
                      Evidencias
                    </h4>

                  </div>


                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {evidencias.length}
                  </span>

                </div>


                {evidencias.length === 0 ? (

                  <p className="py-4 text-center text-sm text-slate-400">
                    No existen evidencias registradas.
                  </p>

                ) : (

                  <div className="space-y-3">

                    {evidencias.map(
                      (
                        evidencia
                      ) => (

                        <div
                          key={
                            evidencia.id
                          }
                          className="rounded-lg bg-slate-50 p-4"
                        >

                          <div className="flex items-start gap-3">

                            <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />


                            <div className="min-w-0 flex-1">

                              <p className="truncate font-semibold text-slate-800">
                                {evidencia.nombreOriginal}
                              </p>


                              {evidencia.descripcion && (

                                <p className="mt-1 text-sm text-slate-600">
                                  {evidencia.descripcion}
                                </p>

                              )}


                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">

                                <span>
                                  {formatearTamano(
                                    evidencia.tamanoBytes
                                  )}
                                </span>

                                <span>
                                  {formatearFechaHora(
                                    evidencia.fechaSubida
                                  )}
                                </span>

                                <span>
                                  {evidencia.usuario?.nombreCompleto || '—'}
                                </span>

                              </div>

                            </div>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>


              {/* =========================================== */}
              {/* LÍNEA DE TIEMPO */}
              {/* =========================================== */}

              <div className="rounded-xl border border-slate-200 p-5">

                <div className="mb-5 flex items-center gap-2">

                  <History className="h-5 w-5 text-blue-600" />

                  <h4 className="font-bold text-slate-900">
                    Línea de tiempo
                  </h4>

                </div>


                {lineaTiempo.length === 0 ? (

                  <p className="py-6 text-center text-sm text-slate-400">
                    No existen movimientos registrados.
                  </p>

                ) : (

                  <div className="space-y-0">

                    {lineaTiempo.map(
                      (
                        evento,
                        indice
                      ) => {

                        const Icono =
                          obtenerIconoEvento(
                            evento.tipo
                          );


                        return (

                          <div
                            key={
                              evento.id
                            }
                            className="relative flex gap-4"
                          >

                            {indice <
                              lineaTiempo.length - 1 && (

                              <div className="absolute left-[17px] top-9 h-[calc(100%-12px)] w-px bg-slate-200" />

                            )}


                            <div
                              className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${obtenerClaseEvento(
                                evento.tipo
                              )}`}
                            >

                              <Icono className="h-4 w-4" />

                            </div>


                            <div className="min-w-0 flex-1 pb-6">

                              <div className="flex flex-col justify-between gap-1 sm:flex-row">

                                <p className="font-semibold text-slate-900">
                                  {evento.titulo}
                                </p>

                                <p className="text-xs text-slate-400">
                                  {formatearFechaHora(
                                    evento.fecha
                                  )}
                                </p>

                              </div>


                              {evento.descripcion && (

                                <p className="mt-1 text-sm text-slate-600">
                                  {evento.descripcion}
                                </p>

                              )}


                              <p className="mt-2 text-xs text-slate-400">
                                Usuario: {evento.usuario || '—'}
                              </p>


                              {evento.tipo ===
                                'CAMBIO_ESTADO' && (

                                <div className="mt-3 flex flex-wrap items-center gap-2">

                                  {evento.datos?.estadoAnterior && (

                                    <>
                                      <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${claseEstado(
                                          evento.datos.estadoAnterior
                                        )}`}
                                      >
                                        {textoEstado(
                                          evento.datos.estadoAnterior
                                        )}
                                      </span>

                                      <ChevronRight className="h-4 w-4 text-slate-400" />
                                    </>

                                  )}


                                  <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${claseEstado(
                                      evento.datos?.estadoNuevo
                                    )}`}
                                  >
                                    {textoEstado(
                                      evento.datos?.estadoNuevo
                                    )}
                                  </span>

                                </div>

                              )}


                              {evento.tipo ===
                                'EVIDENCIA' &&
                                evento.datos?.nombreOriginal && (

                                <div className="mt-3 rounded-lg bg-violet-50 px-3 py-2 text-xs text-violet-700">

                                  <p className="font-semibold">
                                    {evento.datos.nombreOriginal}
                                  </p>

                                  {evento.datos.subsanacionId && (
                                    <p className="mt-1">
                                      Vinculada a subsanación #{evento.datos.subsanacionId}
                                    </p>
                                  )}

                                  {evento.datos.observacionId && (
                                    <p className="mt-1">
                                      Vinculada a observación #{evento.datos.observacionId}
                                    </p>
                                  )}

                                </div>

                              )}

                            </div>

                          </div>

                        );

                      }
                    )}

                  </div>

                )}

              </div>

            </div>

          ) : null}

        </div>

      </div>

    </div>
  );
};


export default TramiteSeguimientoModal;
