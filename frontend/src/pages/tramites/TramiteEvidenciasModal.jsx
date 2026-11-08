import {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  CheckCircle2,
  FileCheck2,
  FileText,
  LoaderCircle,
  Paperclip,
  Upload,
  X
} from 'lucide-react';

import {
  api
} from '../../services/api.js';


// ============================================================
// UTILIDADES
// ============================================================

const MAX_ARCHIVO_BYTES =
  10 * 1024 * 1024;


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
    (1024 * 1024)
  ).toFixed(2)} MB`;
};


// ============================================================
// COMPONENTE
// ============================================================

const TramiteEvidenciasModal = ({
  abierto,
  tramite,
  onCerrar
}) => {

  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [
    cargando,
    setCargando
  ] = useState(false);


  const [
    guardando,
    setGuardando
  ] = useState(false);


  const [
    evidencias,
    setEvidencias
  ] = useState([]);


  const [
    observaciones,
    setObservaciones
  ] = useState([]);


  const [
    archivo,
    setArchivo
  ] = useState(null);


  const [
    descripcion,
    setDescripcion
  ] = useState('');


  const [
    relacion,
    setRelacion
  ] = useState('TRAMITE');


  const [
    error,
    setError
  ] = useState('');


  const [
    mensaje,
    setMensaje
  ] = useState('');


  // ==========================================================
  // EVENTOS DISPONIBLES
  // ==========================================================

  const eventos =
    useMemo(
      () => {

        const resultado = [];


        observaciones.forEach(
          (
            observacion
          ) => {

            resultado.push({
              valor:
                `OBSERVACION:${observacion.id}`,

              etiqueta:
                `Observación #${observacion.id} - ${observacion.descripcion}`
            });


            if (
              Array.isArray(
                observacion.subsanaciones
              )
            ) {

              observacion.subsanaciones.forEach(
                (
                  subsanacion
                ) => {

                  resultado.push({
                    valor:
                      `SUBSANACION:${subsanacion.id}`,

                    etiqueta:
                      `Subsanación #${subsanacion.id} - ${subsanacion.descripcion}`
                  });
                }
              );
            }
          }
        );


        return resultado;

      },
      [
        observaciones
      ]
    );


  // ==========================================================
  // CARGAR INFORMACIÓN
  // ==========================================================

  const cargarDatos =
    async () => {

      if (
        !tramite?.id
      ) {
        return;
      }


      setCargando(true);
      setError('');


      try {

        const [
          respuestaEvidencias,
          respuestaObservaciones
        ] =
          await Promise.all([

            api.get(
              `/tramites/${tramite.id}/evidencias`
            ),

            api.get(
              `/tramites/${tramite.id}/observaciones`
            )

          ]);


        const datosEvidencias =
          obtenerDatosRespuesta(
            respuestaEvidencias
          );


        const datosObservaciones =
          obtenerDatosRespuesta(
            respuestaObservaciones
          );


        setEvidencias(
          Array.isArray(
            datosEvidencias.evidencias
          )
            ? datosEvidencias.evidencias
            : []
        );


        setObservaciones(
          Array.isArray(
            datosObservaciones.observaciones
          )
            ? datosObservaciones.observaciones
            : []
        );


      } catch (
        errorPeticion
      ) {

        console.error(
          'Error cargando evidencias:',
          errorPeticion
        );


        setError(
          obtenerMensajeError(
            errorPeticion,
            'No se pudieron cargar las evidencias.'
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

        setArchivo(null);
        setDescripcion('');
        setRelacion('TRAMITE');
        setMensaje('');
        setError('');

        cargarDatos();
      }

    },
    [
      abierto,
      tramite?.id
    ]
  );


  // ==========================================================
  // SELECCIONAR ARCHIVO
  // ==========================================================

  const seleccionarArchivo = (
    evento
  ) => {

    const archivoSeleccionado =
      evento.target.files?.[0] ||
      null;


    setError('');
    setMensaje('');


    if (
      !archivoSeleccionado
    ) {

      setArchivo(null);

      return;
    }


    const extension =
      archivoSeleccionado.name
        .toLowerCase()
        .endsWith('.pdf');


    if (
      !extension
    ) {

      setArchivo(null);

      evento.target.value = '';


      setError(
        'Solo se permiten archivos PDF.'
      );

      return;
    }


    if (
      archivoSeleccionado.type !==
      'application/pdf'
    ) {

      setArchivo(null);

      evento.target.value = '';


      setError(
        'El tipo de archivo debe ser PDF.'
      );

      return;
    }


    if (
      archivoSeleccionado.size >
      MAX_ARCHIVO_BYTES
    ) {

      setArchivo(null);

      evento.target.value = '';


      setError(
        'El archivo no puede superar 10 MB.'
      );

      return;
    }


    if (
      archivoSeleccionado.size <=
      0
    ) {

      setArchivo(null);

      evento.target.value = '';


      setError(
        'El archivo seleccionado está vacío.'
      );

      return;
    }


    setArchivo(
      archivoSeleccionado
    );
  };


  // ==========================================================
  // REGISTRAR EVIDENCIA
  // ==========================================================

  const registrarEvidencia =
    async (
      evento
    ) => {

      evento.preventDefault();


      if (
        !archivo
      ) {

        setError(
          'Seleccione un archivo PDF.'
        );

        return;
      }


      if (
        descripcion.trim().length >
        500
      ) {

        setError(
          'La descripción no puede superar 500 caracteres.'
        );

        return;
      }


      setGuardando(true);
      setError('');
      setMensaje('');


      try {

        const formData =
          new FormData();


        formData.append(
          'archivo',
          archivo
        );


        if (
          descripcion.trim()
        ) {

          formData.append(
            'descripcion',
            descripcion.trim()
          );
        }


        if (
          relacion.startsWith(
            'OBSERVACION:'
          )
        ) {

          formData.append(
            'observacionId',
            relacion.split(':')[1]
          );
        }


        if (
          relacion.startsWith(
            'SUBSANACION:'
          )
        ) {

          formData.append(
            'subsanacionId',
            relacion.split(':')[1]
          );
        }


        /*
         * No establecer Content-Type manualmente.
         * El navegador agregará multipart/form-data
         * con el boundary correspondiente.
         */

        const respuesta =
          await api.post(
            `/tramites/${tramite.id}/evidencias`,
            formData
          );


        const datos =
          obtenerDatosRespuesta(
            respuesta
          );


        setMensaje(
          datos.mensaje ||
          'Evidencia adjuntada correctamente.'
        );


        setArchivo(null);
        setDescripcion('');
        setRelacion('TRAMITE');


        const input =
          document.getElementById(
            'archivo-evidencia-tramite'
          );


        if (
          input
        ) {

          input.value = '';
        }


        await cargarDatos();


      } catch (
        errorPeticion
      ) {

        console.error(
          'Error adjuntando evidencia:',
          errorPeticion
        );


        setError(
          obtenerMensajeError(
            errorPeticion,
            'No se pudo adjuntar la evidencia.'
          )
        );


      } finally {

        setGuardando(false);
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

        {/* CABECERA */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-indigo-100 p-2.5">

              <Paperclip className="h-5 w-5 text-indigo-600" />

            </div>


            <div>

              <h3 className="text-lg font-bold text-slate-900">

                Evidencias del trámite

              </h3>

              <p className="mt-1 text-sm text-slate-500">

                Expediente: {tramite.numeroExpediente}

              </p>

            </div>

          </div>


          <button
            type="button"
            disabled={
              guardando
            }
            onClick={
              onCerrar
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >

            <X className="h-5 w-5" />

          </button>

        </div>


        {/* CONTENIDO */}

        <div className="max-h-[80vh] overflow-y-auto p-6">

          <div className="space-y-6">

            {/* MENSAJES */}

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


            {/* FORMULARIO */}

            <form
              onSubmit={
                registrarEvidencia
              }
              className="space-y-5 rounded-xl border border-indigo-200 bg-indigo-50 p-5"
            >

              <div>

                <h4 className="font-bold text-slate-900">

                  Adjuntar nueva evidencia

                </h4>

                <p className="mt-1 text-xs text-slate-500">

                  Solo PDF. Tamaño máximo 10 MB.

                </p>

              </div>


              {/* RELACIÓN */}

              <div>

                <label className="mb-1.5 block text-sm font-semibold text-slate-700">

                  Asociar evidencia a *

                </label>


                <select
                  value={
                    relacion
                  }
                  onChange={
                    (
                      evento
                    ) => {

                      setRelacion(
                        evento.target.value
                      );

                      setError('');
                    }
                  }
                  className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >

                  <option value="TRAMITE">

                    Trámite general

                  </option>


                  {eventos.map(
                    (
                      item
                    ) => (

                      <option
                        key={
                          item.valor
                        }
                        value={
                          item.valor
                        }
                      >

                        {item.etiqueta}

                      </option>

                    )
                  )}

                </select>

              </div>


              {/* ARCHIVO */}

              <div>

                <label className="mb-1.5 block text-sm font-semibold text-slate-700">

                  Archivo PDF *

                </label>


                <input
                  id="archivo-evidencia-tramite"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={
                    seleccionarArchivo
                  }
                  className="block w-full cursor-pointer rounded-xl border border-indigo-200 bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:bg-indigo-600 file:px-4 file:py-2.5 file:font-semibold file:text-white hover:file:bg-indigo-700"
                />


                {archivo && (

                  <div className="mt-3 flex items-center gap-3 rounded-lg border border-indigo-200 bg-white p-3">

                    <FileText className="h-5 w-5 shrink-0 text-indigo-600" />


                    <div className="min-w-0">

                      <p className="truncate text-sm font-semibold text-slate-800">

                        {archivo.name}

                      </p>

                      <p className="text-xs text-slate-400">

                        {formatearTamano(
                          archivo.size
                        )}

                      </p>

                    </div>

                  </div>

                )}

              </div>


              {/* DESCRIPCIÓN */}

              <div>

                <label className="mb-1.5 block text-sm font-semibold text-slate-700">

                  Descripción

                </label>


                <textarea
                  rows={3}
                  maxLength={500}
                  value={
                    descripcion
                  }
                  onChange={
                    (
                      evento
                    ) => {

                      setDescripcion(
                        evento.target.value
                      );

                      setError('');
                    }
                  }
                  placeholder="Ej. Cargo de recepción presentado ante la entidad..."
                  className="w-full resize-none rounded-xl border border-indigo-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />


                <p className="mt-1 text-right text-xs text-slate-400">

                  {descripcion.length}/500

                </p>

              </div>


              <div className="flex justify-end">

                <button
                  type="submit"
                  disabled={
                    guardando ||
                    !archivo
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {guardando ? (

                    <LoaderCircle className="h-4 w-4 animate-spin" />

                  ) : (

                    <Upload className="h-4 w-4" />

                  )}


                  {guardando
                    ? 'Adjuntando...'
                    : 'Adjuntar evidencia'}

                </button>

              </div>

            </form>


            {/* EVIDENCIAS */}

            <div>

              <div className="mb-4 flex items-center justify-between">

                <h4 className="font-bold text-slate-900">

                  Evidencias registradas

                </h4>


                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">

                  {evidencias.length}

                </span>

              </div>


              {cargando ? (

                <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">

                  <LoaderCircle className="h-5 w-5 animate-spin" />

                  Cargando evidencias...

                </div>

              ) : evidencias.length ===
                0 ? (

                <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center">

                  <Paperclip className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-2 text-sm text-slate-500">

                    No existen evidencias registradas.

                  </p>

                </div>

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
                        className="rounded-xl border border-slate-200 p-4"
                      >

                        <div className="flex gap-3">

                          <div className="rounded-lg bg-emerald-100 p-2">

                            <FileCheck2 className="h-5 w-5 text-emerald-600" />

                          </div>


                          <div className="min-w-0 flex-1">

                            <p className="truncate font-semibold text-slate-900">

                              {evidencia.nombreOriginal}

                            </p>


                            {evidencia.descripcion && (

                              <p className="mt-1 text-sm text-slate-600">

                                {evidencia.descripcion}

                              </p>

                            )}


                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">

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

                                {evidencia.usuario?.nombreCompleto ||
                                  '—'}

                              </span>

                            </div>


                            <div className="mt-3">

                              {evidencia.observacionId ? (

                                <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">

                                  Observación #{evidencia.observacionId}

                                </span>

                              ) : evidencia.subsanacionId ? (

                                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">

                                  Subsanación #{evidencia.subsanacionId}

                                </span>

                              ) : (

                                <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">

                                  Trámite general

                                </span>

                              )}

                            </div>


                            <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2">

                              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">

                                SHA-256

                              </p>

                              <p className="mt-1 break-all font-mono text-[11px] text-slate-600">

                                {evidencia.hashSha256}

                              </p>

                            </div>

                          </div>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};


export default TramiteEvidenciasModal;