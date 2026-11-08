import {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Building2,
  CalendarDays,
  Clock3,
  FileText,
  Save,
  Store,
  UserRound,
  X
} from 'lucide-react';


function DocumentoModal({
  abierto,
  tiendas = [],
  tiposDocumento = [],
  entidades = [],
  usuarios = [],
  cargando = false,
  error = '',
  onCerrar,
  onGuardar
}) {
  const [
    tiendaId,
    setTiendaId
  ] = useState('');


  const [
    tipoDocumentoId,
    setTipoDocumentoId
  ] = useState('');


  const [
    entidadEmisoraId,
    setEntidadEmisoraId
  ] = useState('');


  const [
    numeroDocumento,
    setNumeroDocumento
  ] = useState('');


  const [
    numeroExpediente,
    setNumeroExpediente
  ] = useState('');


  const [
    fechaEmision,
    setFechaEmision
  ] = useState('');


  const [
    fechaVencimiento,
    setFechaVencimiento
  ] = useState('');


  const [
    responsableUsuarioId,
    setResponsableUsuarioId
  ] = useState('');


  const [
    observaciones,
    setObservaciones
  ] = useState('');


  const [
    errorLocal,
    setErrorLocal
  ] = useState('');


  // ===================================================
  // LIMPIAR FORMULARIO
  // ===================================================

  useEffect(() => {
    if (!abierto) {
      return;
    }

    setTiendaId('');
    setTipoDocumentoId('');
    setEntidadEmisoraId('');
    setNumeroDocumento('');
    setNumeroExpediente('');
    setFechaEmision('');
    setFechaVencimiento('');
    setResponsableUsuarioId('');
    setObservaciones('');
    setErrorLocal('');
  }, [abierto]);


  // ===================================================
  // TIPO DOCUMENTAL SELECCIONADO
  // ===================================================

  const tipoSeleccionado =
    useMemo(() => {
      return (
        tiposDocumento.find(
          (tipo) =>
            String(tipo.id) ===
            String(tipoDocumentoId)
        ) || null
      );
    }, [
      tiposDocumento,
      tipoDocumentoId
    ]);


  const tipoVigencia =
    tipoSeleccionado
      ?.tipoVigencia ||
    null;


  const esDeterminada =
    tipoVigencia ===
    'DETERMINADA';


  const esTemporal =
    tipoVigencia ===
    'TEMPORAL';


  const esIndeterminada =
    tipoVigencia ===
    'INDETERMINADA';


  // ===================================================
  // CAMBIAR TIPO DOCUMENTAL
  // ===================================================

  function handleCambiarTipo(
    event
  ) {
    setTipoDocumentoId(
      event.target.value
    );

    setFechaVencimiento('');
    setErrorLocal('');
  }


  // ===================================================
  // TEXTO DE VIGENCIA
  // ===================================================

  function obtenerTextoVigencia() {
    if (!tipoSeleccionado) {
      return null;
    }


    if (esDeterminada) {
      const valor =
        tipoSeleccionado
          .duracionValor;

      const unidad =
        tipoSeleccionado
          .duracionUnidad;


      return (
        `Vigencia determinada: ${valor} ${
          unidad === 'DIAS'
            ? 'días'
            : 'meses'
        }. CERTIIA calculará automáticamente la fecha de vencimiento.`
      );
    }


    if (esTemporal) {
      return (
        'Vigencia temporal: debes indicar la fecha de vencimiento de este documento.'
      );
    }


    if (esIndeterminada) {
      return (
        'Vigencia indeterminada: este documento no tendrá fecha de vencimiento.'
      );
    }


    return (
      'CERTIIA utilizará la regla de vigencia configurada para este tipo documental.'
    );
  }


  // ===================================================
  // VALIDAR FORMULARIO
  // ===================================================

  function validarFormulario() {
    if (!tiendaId) {
      return 'Selecciona una tienda.';
    }


    if (!tipoDocumentoId) {
      return 'Selecciona un tipo de documento.';
    }


    if (!entidadEmisoraId) {
      return 'Selecciona una entidad emisora.';
    }


    if (
      numeroDocumento
        .trim()
        .length === 0
    ) {
      return 'Ingresa el número del documento.';
    }


    if (!fechaEmision) {
      return 'Ingresa la fecha de emisión.';
    }


    if (
      esTemporal &&
      !fechaVencimiento
    ) {
      return (
        'La fecha de vencimiento es obligatoria para este tipo de documento.'
      );
    }


    if (
      esTemporal &&
      fechaVencimiento <
        fechaEmision
    ) {
      return (
        'La fecha de vencimiento no puede ser anterior a la fecha de emisión.'
      );
    }


    if (!responsableUsuarioId) {
      return 'Selecciona un responsable.';
    }


    if (
      observaciones.length >
      1000
    ) {
      return (
        'Las observaciones no pueden superar los 1000 caracteres.'
      );
    }


    return '';
  }


  // ===================================================
  // GUARDAR
  // ===================================================

  function handleSubmit(
    event
  ) {
    event.preventDefault();

    setErrorLocal('');


    const mensajeValidacion =
      validarFormulario();


    if (mensajeValidacion) {
      setErrorLocal(
        mensajeValidacion
      );

      return;
    }


    onGuardar({
      tiendaId:
        Number(tiendaId),

      tipoDocumentoId:
        Number(tipoDocumentoId),

      entidadEmisoraId:
        Number(entidadEmisoraId),

      numeroDocumento:
        numeroDocumento.trim(),

      numeroExpediente:
        numeroExpediente.trim() ||
        null,

      fechaEmision,

      fechaVencimiento:
        esTemporal
          ? fechaVencimiento
          : null,

      responsableUsuarioId:
        Number(
          responsableUsuarioId
        ),

      observaciones:
        observaciones.trim() ||
        null
    });
  }


  if (!abierto) {
    return null;
  }


  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">

      {/* FONDO */}
      <button
        type="button"
        aria-label="Cerrar formulario"
        onClick={
          cargando
            ? undefined
            : onCerrar
        }
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />


      {/* MODAL */}
      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

        {/* CABECERA */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 sm:px-7">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <FileText size={24} />
            </div>


            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
                Gestión documental
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Registrar documento
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Registra un documento de operatividad o cumplimiento.
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={onCerrar}
            disabled={cargando}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>

        </div>


        {/* FORMULARIO */}
        <form
          onSubmit={handleSubmit}
          className="max-h-[80vh] overflow-y-auto px-6 py-6 sm:px-7"
        >

          {/* CATÁLOGOS */}
          <div className="grid gap-5 md:grid-cols-2">

            {/* TIENDA */}
            <div>

              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Store size={16} />
                Tienda
              </label>

              <select
                value={tiendaId}
                onChange={(event) => {
                  setTiendaId(
                    event.target.value
                  );

                  setErrorLocal('');
                }}
                disabled={cargando}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              >

                <option value="">
                  Selecciona una tienda
                </option>

                {
                  tiendas.map(
                    (tienda) => (
                      <option
                        key={tienda.id}
                        value={tienda.id}
                      >
                        {
                          tienda.codigo
                            ? `${tienda.codigo} - ${tienda.nombre}`
                            : tienda.nombre
                        }
                      </option>
                    )
                  )
                }

              </select>

            </div>


            {/* TIPO DOCUMENTAL */}
            <div>

              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FileText size={16} />
                Tipo de documento
              </label>

              <select
                value={tipoDocumentoId}
                onChange={
                  handleCambiarTipo
                }
                disabled={cargando}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              >

                <option value="">
                  Selecciona un tipo documental
                </option>

                {
                  tiposDocumento.map(
                    (tipo) => (
                      <option
                        key={tipo.id}
                        value={tipo.id}
                      >
                        {
                          tipo.categoria
                            ? `${tipo.nombre} - ${tipo.categoria}`
                            : tipo.nombre
                        }
                      </option>
                    )
                  )
                }

              </select>

            </div>


            {/* ENTIDAD EMISORA */}
            <div>

              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Building2 size={16} />
                Entidad emisora
              </label>

              <select
                value={entidadEmisoraId}
                onChange={(event) => {
                  setEntidadEmisoraId(
                    event.target.value
                  );

                  setErrorLocal('');
                }}
                disabled={cargando}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              >

                <option value="">
                  Selecciona una entidad
                </option>

                {
                  entidades.map(
                    (entidad) => (
                      <option
                        key={entidad.id}
                        value={entidad.id}
                      >
                        {
                          entidad.tipo
                            ? `${entidad.nombre} - ${entidad.tipo}`
                            : entidad.nombre
                        }
                      </option>
                    )
                  )
                }

              </select>

            </div>


            {/* RESPONSABLE */}
            <div>

              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <UserRound size={16} />
                Responsable
              </label>

              <select
                value={responsableUsuarioId}
                onChange={(event) => {
                  setResponsableUsuarioId(
                    event.target.value
                  );

                  setErrorLocal('');
                }}
                disabled={cargando}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              >

                <option value="">
                  Selecciona un responsable
                </option>

                {
                  usuarios.map(
                    (usuario) => (
                      <option
                        key={usuario.id}
                        value={usuario.id}
                      >
                        {
                          usuario.nombreCompleto ||
                          `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim() ||
                          usuario.email
                        }
                      </option>
                    )
                  )
                }

              </select>

            </div>

          </div>


          {/* REGLA DE VIGENCIA */}
          {
            tipoSeleccionado && (
              <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                    <Clock3 size={19} />
                  </div>


                  <div>

                    <p className="text-sm font-bold text-indigo-900">
                      Regla de vigencia
                    </p>

                    <p className="mt-1 text-sm leading-6 text-indigo-700">
                      {obtenerTextoVigencia()}
                    </p>


                    <div className="mt-3 flex flex-wrap gap-2">

                      <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-indigo-700">
                        {
                          tipoVigencia ||
                          'Sin definir'
                        }
                      </span>


                      {
                        tipoSeleccionado
                          .reglaVersion && (
                          <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                            Regla v
                            {
                              tipoSeleccionado
                                .reglaVersion
                            }
                          </span>
                        )
                      }


                      <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {
                          tipoSeleccionado
                            .requiereRenovacion
                            ? 'Requiere renovación'
                            : 'No requiere renovación'
                        }
                      </span>

                    </div>

                  </div>

                </div>

              </div>
            )
          }


          {/* INFORMACIÓN DEL DOCUMENTO */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">

            <h3 className="text-sm font-bold text-slate-800">
              Información del documento
            </h3>


            <div className="mt-4 grid gap-5 md:grid-cols-2">

              {/* NÚMERO DOCUMENTO */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Número de documento
                </label>

                <input
                  type="text"
                  value={numeroDocumento}
                  onChange={(event) => {
                    setNumeroDocumento(
                      event.target.value
                    );

                    setErrorLocal('');
                  }}
                  required
                  disabled={cargando}
                  maxLength={120}
                  placeholder="Ej. LF-2026-001245"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />

              </div>


              {/* EXPEDIENTE */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Número de expediente
                </label>

                <input
                  type="text"
                  value={numeroExpediente}
                  onChange={(event) =>
                    setNumeroExpediente(
                      event.target.value
                    )
                  }
                  disabled={cargando}
                  maxLength={120}
                  placeholder="Opcional"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />

              </div>


              {/* FECHA EMISIÓN */}
              <div>

                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <CalendarDays size={16} />
                  Fecha de emisión
                </label>

                <input
                  type="date"
                  value={fechaEmision}
                  onChange={(event) => {
                    setFechaEmision(
                      event.target.value
                    );

                    setErrorLocal('');
                  }}
                  required
                  disabled={cargando}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />

              </div>


              {/* FECHA VENCIMIENTO */}
              <div>

                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <CalendarDays size={16} />

                  Fecha de vencimiento

                  {
                    esTemporal && (
                      <span className="text-red-500">
                        *
                      </span>
                    )
                  }

                </label>


                <input
                  type="date"
                  value={
                    esTemporal
                      ? fechaVencimiento
                      : ''
                  }
                  onChange={(event) => {
                    setFechaVencimiento(
                      event.target.value
                    );

                    setErrorLocal('');
                  }}
                  min={
                    fechaEmision ||
                    undefined
                  }
                  required={
                    esTemporal
                  }
                  disabled={
                    cargando ||
                    !tipoSeleccionado ||
                    esDeterminada ||
                    esIndeterminada
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                />


                {
                  !tipoSeleccionado && (
                    <p className="mt-1.5 text-xs text-slate-400">
                      Primero selecciona un tipo documental.
                    </p>
                  )
                }


                {
                  esDeterminada && (
                    <p className="mt-1.5 text-xs leading-5 text-indigo-600">
                      No debes ingresar esta fecha. CERTIIA la calculará automáticamente usando la regla configurada.
                    </p>
                  )
                }


                {
                  esTemporal && (
                    <p className="mt-1.5 text-xs leading-5 text-amber-600">
                      Debes indicar la fecha de vencimiento específica de este documento.
                    </p>
                  )
                }


                {
                  esIndeterminada && (
                    <p className="mt-1.5 text-xs leading-5 text-emerald-600">
                      Este tipo documental no posee fecha de vencimiento.
                    </p>
                  )
                }

              </div>

            </div>

          </div>


          {/* OBSERVACIONES */}
          <div className="mt-5">

            <div className="mb-2 flex items-center justify-between gap-3">

              <label className="text-sm font-semibold text-slate-700">
                Observaciones
              </label>

              <span className="text-xs text-slate-400">
                {observaciones.length}/1000
              </span>

            </div>


            <textarea
              value={observaciones}
              onChange={(event) =>
                setObservaciones(
                  event.target.value
                )
              }
              disabled={cargando}
              maxLength={1000}
              rows="4"
              placeholder="Información adicional del documento..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />

          </div>


          {/* ERROR LOCAL */}
          {
            errorLocal && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {errorLocal}
              </div>
            )
          }


          {/* ERROR BACKEND */}
          {
            error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )
          }


          {/* BOTONES */}
          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onCerrar}
              disabled={cargando}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancelar
            </button>


            <button
              type="submit"
              disabled={cargando}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {
                cargando
                  ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Registrando...
                    </>
                  )
                  : (
                    <>
                      <Save size={18} />
                      Registrar documento
                    </>
                  )
              }

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


export default DocumentoModal;