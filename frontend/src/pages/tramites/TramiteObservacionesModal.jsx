import {
  useEffect,
  useState
} from 'react';

import {
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
  MessageSquarePlus,
  Send,
  X
} from 'lucide-react';

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


// ============================================================
// COMPONENTE
// ============================================================

const TramiteObservacionesModal = ({
  abierto,
  tramite,
  onCerrar,
  onActualizado
}) => {

  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [
    cargando,
    setCargando
  ] = useState(false);


  const [
    guardandoObservacion,
    setGuardandoObservacion
  ] = useState(false);


  const [
    guardandoSubsanacion,
    setGuardandoSubsanacion
  ] = useState(false);


  const [
    observaciones,
    setObservaciones
  ] = useState([]);


  const [
    nuevaObservacion,
    setNuevaObservacion
  ] = useState('');


  const [
    observacionSubsanar,
    setObservacionSubsanar
  ] = useState(null);


  const [
    textoSubsanacion,
    setTextoSubsanacion
  ] = useState('');


  const [
    error,
    setError
  ] = useState('');


  const [
    mensaje,
    setMensaje
  ] = useState('');


  // ==========================================================
  // CARGAR OBSERVACIONES
  // ==========================================================

  const cargarObservaciones =
    async () => {

      if (
        !tramite?.id
      ) {
        return;
      }


      setCargando(
        true
      );

      setError('');


      try {

        const respuesta =
          await api.get(
            `/tramites/${tramite.id}/observaciones`
          );


        const datos =
          obtenerDatosRespuesta(
            respuesta
          );


        setObservaciones(
          Array.isArray(
            datos.observaciones
          )
            ? datos.observaciones
            : []
        );


      } catch (
        errorPeticion
      ) {

        console.error(
          'Error cargando observaciones:',
          errorPeticion
        );


        setError(
          obtenerMensajeError(
            errorPeticion,
            'No se pudieron cargar las observaciones.'
          )
        );


      } finally {

        setCargando(
          false
        );
      }
    };


  useEffect(
    () => {

      if (
        abierto &&
        tramite?.id
      ) {

        setNuevaObservacion('');
        setObservacionSubsanar(null);
        setTextoSubsanacion('');
        setError('');
        setMensaje('');

        cargarObservaciones();
      }

    },
    [
      abierto,
      tramite?.id
    ]
  );


  // ==========================================================
  // REGISTRAR OBSERVACIÓN
  // ==========================================================

  const registrarObservacion =
    async (
      evento
    ) => {

      evento.preventDefault();


      const descripcion =
        nuevaObservacion.trim();


      if (
        !descripcion
      ) {

        setError(
          'Ingrese la descripción de la observación.'
        );

        return;
      }


      setGuardandoObservacion(
        true
      );

      setError('');
      setMensaje('');


      try {

        const respuesta =
          await api.post(
            `/tramites/${tramite.id}/observaciones`,
            {
              descripcion
            }
          );


        const datos =
          obtenerDatosRespuesta(
            respuesta
          );


        setNuevaObservacion('');


        setMensaje(
          datos.mensaje ||
          'Observación registrada correctamente.'
        );


        await cargarObservaciones();


        if (
          onActualizado
        ) {

          await onActualizado();
        }


      } catch (
        errorPeticion
      ) {

        console.error(
          'Error registrando observación:',
          errorPeticion
        );


        setError(
          obtenerMensajeError(
            errorPeticion,
            'No se pudo registrar la observación.'
          )
        );


      } finally {

        setGuardandoObservacion(
          false
        );
      }
    };


  // ==========================================================
  // ABRIR SUBSANACIÓN
  // ==========================================================

  const abrirSubsanacion = (
    observacion
  ) => {

    setObservacionSubsanar(
      observacion
    );

    setTextoSubsanacion('');
    setError('');
    setMensaje('');
  };


  // ==========================================================
  // REGISTRAR SUBSANACIÓN
  // ==========================================================

  const registrarSubsanacion =
    async (
      evento
    ) => {

      evento.preventDefault();


      if (
        !observacionSubsanar
      ) {
        return;
      }


      const descripcion =
        textoSubsanacion.trim();


      if (
        !descripcion
      ) {

        setError(
          'Ingrese la descripción de la subsanación.'
        );

        return;
      }


      setGuardandoSubsanacion(
        true
      );

      setError('');
      setMensaje('');


      try {

        const respuesta =
          await api.post(
            `/tramites/observaciones/${observacionSubsanar.id}/subsanaciones`,
            {
              descripcion
            }
          );


        const datos =
          obtenerDatosRespuesta(
            respuesta
          );


        setObservacionSubsanar(
          null
        );

        setTextoSubsanacion('');


        setMensaje(
          datos.mensaje ||
          'Subsanación registrada correctamente.'
        );


        await cargarObservaciones();


        if (
          onActualizado
        ) {

          await onActualizado();
        }


      } catch (
        errorPeticion
      ) {

        console.error(
          'Error registrando subsanación:',
          errorPeticion
        );


        setError(
          obtenerMensajeError(
            errorPeticion,
            'No se pudo registrar la subsanación.'
          )
        );


      } finally {

        setGuardandoSubsanacion(
          false
        );
      }
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


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* =================================================== */}
        {/* CABECERA */}
        {/* =================================================== */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

          <div>

            <h3 className="text-lg font-bold text-slate-900">

              Observaciones y subsanaciones

            </h3>

            <p className="mt-1 text-sm text-slate-500">

              Expediente: {tramite.numeroExpediente}

            </p>

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


        {/* =================================================== */}
        {/* CONTENIDO */}
        {/* =================================================== */}

        <div className="max-h-[80vh] overflow-y-auto p-6">

          <div className="space-y-6">

            {/* ================================================= */}
            {/* MENSAJES */}
            {/* ================================================= */}

            {error && (

              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                {error}

              </div>

            )}


            {mensaje && (

              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">

                <CheckCircle2 className="h-5 w-5" />

                {mensaje}

              </div>

            )}


            {/* ================================================= */}
            {/* NUEVA OBSERVACIÓN */}
            {/* ================================================= */}

            <form
              onSubmit={
                registrarObservacion
              }
              className="rounded-xl border border-orange-200 bg-orange-50 p-5"
            >

              <div className="mb-4 flex items-center gap-2">

                <MessageSquarePlus className="h-5 w-5 text-orange-600" />

                <h4 className="font-bold text-slate-900">

                  Registrar observación

                </h4>

              </div>


              <textarea
                rows={4}
                maxLength={1500}
                value={
                  nuevaObservacion
                }
                onChange={
                  (evento) => {

                    setNuevaObservacion(
                      evento.target.value
                    );

                    setError('');
                  }
                }
                placeholder="Describa la observación realizada por la entidad..."
                className="w-full resize-none rounded-xl border border-orange-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />


              <div className="mt-3 flex items-center justify-between">

                <span className="text-xs text-slate-400">

                  {nuevaObservacion.length}/1500

                </span>


                <button
                  type="submit"
                  disabled={
                    guardandoObservacion ||
                    !nuevaObservacion.trim()
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {guardandoObservacion ? (

                    <LoaderCircle className="h-4 w-4 animate-spin" />

                  ) : (

                    <Send className="h-4 w-4" />

                  )}


                  Registrar observación

                </button>

              </div>

            </form>


            {/* ================================================= */}
            {/* HISTORIAL */}
            {/* ================================================= */}

            <div>

              <h4 className="mb-4 text-base font-bold text-slate-900">

                Observaciones registradas

              </h4>


              {cargando ? (

                <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">

                  <LoaderCircle className="h-5 w-5 animate-spin" />

                  Cargando...

                </div>

              ) : observaciones.length === 0 ? (

                <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">

                  No existen observaciones registradas.

                </div>

              ) : (

                <div className="space-y-4">

                  {observaciones.map(
                    (observacion) => (

                      <div
                        key={
                          observacion.id
                        }
                        className="overflow-hidden rounded-xl border border-slate-200"
                      >

                        {/* OBSERVACIÓN */}

                        <div className="p-5">

                          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">

                            <div className="flex gap-3">

                              <div className="rounded-lg bg-orange-100 p-2">

                                <AlertTriangle className="h-5 w-5 text-orange-600" />

                              </div>


                              <div>

                                <div className="flex flex-wrap items-center gap-2">

                                  <p className="font-bold text-slate-900">

                                    Observación #{observacion.id}

                                  </p>


                                  <span
                                    className={
                                      observacion.estado === 'SUBSANADA'
                                        ? 'rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700'
                                        : 'rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700'
                                    }
                                  >

                                    {observacion.estado}

                                  </span>

                                </div>


                                <p className="mt-2 text-sm leading-relaxed text-slate-700">

                                  {observacion.descripcion}

                                </p>


                                <div className="mt-3 space-y-1 text-xs text-slate-400">

                                  <p>

                                    Responsable:{' '}

                                    {observacion.responsable?.nombreCompleto || '—'}

                                  </p>

                                  <p>

                                    Fecha:{' '}

                                    {formatearFechaHora(
                                      observacion.fechaObservacion
                                    )}

                                  </p>

                                </div>

                              </div>

                            </div>


                            {observacion.estado === 'ABIERTA' && (

                              <button
                                type="button"
                                onClick={() =>
                                  abrirSubsanacion(
                                    observacion
                                  )
                                }
                                className="shrink-0 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                              >

                                Subsanar

                              </button>

                            )}

                          </div>

                        </div>


                        {/* SUBSANACIONES */}

                        {observacion.subsanaciones?.length > 0 && (

                          <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">

                            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">

                              Subsanación relacionada

                            </p>


                            <div className="space-y-3">

                              {observacion.subsanaciones.map(
                                (subsanacion) => (

                                  <div
                                    key={
                                      subsanacion.id
                                    }
                                    className="rounded-lg border border-emerald-200 bg-emerald-50 p-4"
                                  >

                                    <div className="flex gap-3">

                                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />


                                      <div>

                                        <p className="text-sm font-semibold text-emerald-800">

                                          {subsanacion.descripcion}

                                        </p>


                                        <p className="mt-2 text-xs text-emerald-700">

                                          {subsanacion.responsable?.nombreCompleto || '—'}
                                          {' · '}
                                          {formatearFechaHora(
                                            subsanacion.fechaSubsanacion
                                          )}

                                        </p>

                                      </div>

                                    </div>

                                  </div>

                                )
                              )}

                            </div>

                          </div>

                        )}

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          </div>

        </div>

      </div>


      {/* ===================================================== */}
      {/* SUBMODAL DE SUBSANACIÓN */}
      {/* ===================================================== */}

      {observacionSubsanar && (

        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-slate-950/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>

                <h3 className="text-lg font-bold text-slate-900">

                  Registrar subsanación

                </h3>

                <p className="mt-1 text-sm text-slate-500">

                  Observación #{observacionSubsanar.id}

                </p>

              </div>


              <button
                type="button"
                disabled={
                  guardandoSubsanacion
                }
                onClick={() => {

                  setObservacionSubsanar(
                    null
                  );

                  setTextoSubsanacion('');
                  setError('');
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >

                <X className="h-5 w-5" />

              </button>

            </div>


            <form
              onSubmit={
                registrarSubsanacion
              }
              className="space-y-5 p-6"
            >

              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">

                <p className="text-xs font-bold uppercase text-orange-600">

                  Observación

                </p>

                <p className="mt-2 text-sm text-slate-700">

                  {observacionSubsanar.descripcion}

                </p>

              </div>


              <div>

                <label className="mb-1.5 block text-sm font-semibold text-slate-700">

                  Descripción de la subsanación *

                </label>


                <textarea
                  rows={5}
                  maxLength={1500}
                  value={
                    textoSubsanacion
                  }
                  onChange={
                    (evento) => {

                      setTextoSubsanacion(
                        evento.target.value
                      );

                      setError('');
                    }
                  }
                  placeholder="Describa cómo fue atendida o corregida la observación..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

              </div>


              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">

                <button
                  type="button"
                  disabled={
                    guardandoSubsanacion
                  }
                  onClick={() => {

                    setObservacionSubsanar(
                      null
                    );

                    setTextoSubsanacion('');
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >

                  Cancelar

                </button>


                <button
                  type="submit"
                  disabled={
                    guardandoSubsanacion ||
                    !textoSubsanacion.trim()
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {guardandoSubsanacion && (

                    <LoaderCircle className="h-4 w-4 animate-spin" />

                  )}

                  Registrar subsanación

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};


export default TramiteObservacionesModal;