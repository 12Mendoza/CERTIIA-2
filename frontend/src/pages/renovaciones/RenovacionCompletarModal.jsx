import {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  CalendarDays,
  FileText,
  FileUp,
  RefreshCw,
  Save,
  X
} from 'lucide-react';


// ============================================================
// HU-032
// REGISTRAR DOCUMENTO RENOVADO
// ============================================================

function RenovacionCompletarModal({

  abierto,

  renovacion,

  entidades = [],

  cargando = false,

  error = '',

  onCerrar,

  onGuardar

}) {

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
    entidadEmisoraId,
    setEntidadEmisoraId
  ] = useState('');


  const [
    observaciones,
    setObservaciones
  ] = useState('');


  const [
    archivo,
    setArchivo
  ] = useState(null);


  const [
    errorLocal,
    setErrorLocal
  ] = useState('');


  // ==========================================================
  // DOCUMENTO ANTERIOR
  // ==========================================================

  const documentoAnterior =
    renovacion?.documentoAnterior ||
    renovacion?.documento ||
    null;


  // ==========================================================
  // REGLA DE VIGENCIA
  // ==========================================================

  const tipoVigencia =
    documentoAnterior
      ?.reglaVigencia
      ?.tipoVigencia ||
    renovacion
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


  // ==========================================================
  // ENTIDAD ANTERIOR
  // ==========================================================

  const entidadAnteriorId =
    useMemo(
      () => {

        return (
          documentoAnterior
            ?.entidadEmisora
            ?.id ||
          renovacion
            ?.entidadEmisoraId ||
          ''
        );

      },
      [
        documentoAnterior,
        renovacion
      ]
    );


  // ==========================================================
  // REINICIAR FORMULARIO
  // ==========================================================

  useEffect(
    () => {

      if (!abierto) {
        return;
      }


      setNumeroDocumento(
        ''
      );

      setNumeroExpediente(
        ''
      );

      setFechaEmision(
        ''
      );

      setFechaVencimiento(
        ''
      );

      setEntidadEmisoraId(
        entidadAnteriorId
          ? String(
              entidadAnteriorId
            )
          : ''
      );

      setObservaciones(
        ''
      );

      setArchivo(
        null
      );

      setErrorLocal(
        ''
      );

    },
    [
      abierto,
      entidadAnteriorId
    ]
  );


  // ==========================================================
  // ARCHIVO
  // ==========================================================

  function cambiarArchivo(
    evento
  ) {

    setErrorLocal(
      ''
    );


    const seleccionado =
      evento.target.files?.[0] ||
      null;


    if (!seleccionado) {

      setArchivo(
        null
      );

      return;
    }


    // ========================================================
    // SOLO PDF
    // ========================================================

    if (
      seleccionado.type !==
      'application/pdf'
    ) {

      setArchivo(
        null
      );

      evento.target.value =
        '';


      setErrorLocal(
        'Solo se permiten archivos PDF.'
      );

      return;
    }


    // ========================================================
    // MÁXIMO 10 MB
    // ========================================================

    const limite =
      10 *
      1024 *
      1024;


    if (
      seleccionado.size >
      limite
    ) {

      setArchivo(
        null
      );

      evento.target.value =
        '';


      setErrorLocal(
        'El archivo no puede superar los 10 MB.'
      );

      return;
    }


    setArchivo(
      seleccionado
    );
  }


  // ==========================================================
  // VALIDACIÓN
  // ==========================================================

  function validarFormulario() {

    if (
      numeroDocumento
        .trim()
        .length === 0
    ) {

      return (
        'Ingresa el número del nuevo documento.'
      );
    }


    if (
      !fechaEmision
    ) {

      return (
        'Ingresa la fecha de emisión.'
      );
    }


    if (
      !entidadEmisoraId
    ) {

      return (
        'Selecciona la entidad emisora.'
      );
    }


    if (
      esTemporal &&
      !fechaVencimiento
    ) {

      return (
        'La fecha de vencimiento es obligatoria para este tipo documental.'
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


  // ==========================================================
  // GUARDAR
  // ==========================================================

  async function enviarFormulario(
    evento
  ) {

    evento.preventDefault();


    setErrorLocal(
      ''
    );


    const mensaje =
      validarFormulario();


    if (mensaje) {

      setErrorLocal(
        mensaje
      );

      return;
    }


    await onGuardar({

      renovacionId:
        renovacion?.id,


      datos: {

        numeroDocumento:
          numeroDocumento
            .trim(),


        numeroExpediente:
          numeroExpediente
            .trim() ||
          null,


        fechaEmision,


        fechaVencimiento:
          esTemporal
            ? fechaVencimiento
            : null,


        entidadEmisoraId:
          Number(
            entidadEmisoraId
          ),


        observaciones:
          observaciones
            .trim() ||
          null
      },


      archivo
    });
  }


  // ==========================================================
  // TEXTO DE VIGENCIA
  // ==========================================================

  function obtenerTextoVigencia() {

    if (esDeterminada) {

      return (
        'La fecha de vencimiento será calculada automáticamente usando la regla vigente del tipo documental.'
      );
    }


    if (esTemporal) {

      return (
        'Debes indicar la nueva fecha de vencimiento.'
      );
    }


    if (esIndeterminada) {

      return (
        'El nuevo documento tendrá vigencia indeterminada y no requerirá fecha de vencimiento.'
      );
    }


    return (
      'CERTIIA aplicará la regla de vigencia configurada para el tipo documental.'
    );
  }


  // ==========================================================
  // CERRADO
  // ==========================================================

  if (!abierto) {

    return null;
  }


  const codigoAnterior =
    documentoAnterior
      ?.codigoInterno ||
    documentoAnterior
      ?.codigo_interno ||
    '—';


  const numeroAnterior =
    documentoAnterior
      ?.numeroDocumento ||
    documentoAnterior
      ?.numero_documento ||
    '—';


  const tienda =
    documentoAnterior
      ?.tienda
      ?.nombre ||
    renovacion
      ?.tiendaNombre ||
    '—';


  const tipoDocumento =
    documentoAnterior
      ?.tipoDocumento
      ?.nombre ||
    renovacion
      ?.tipoDocumentoNombre ||
    '—';


  return (

    <div
      className="
        fixed inset-0
        z-[140]
        flex
        items-center
        justify-center
        bg-slate-950/60
        p-4
        backdrop-blur-sm
      "
    >

      <div
        className="
          w-full
          max-w-3xl
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >

        {/* ================================================= */}
        {/* CABECERA */}
        {/* ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-200
            px-6
            py-5
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
                rounded-xl
                bg-emerald-100
                text-emerald-700
              "
            >

              <RefreshCw
                size={22}
              />

            </div>


            <div>

              <h2
                className="
                  text-lg
                  font-bold
                  text-slate-900
                "
              >
                Registrar documento renovado
              </h2>


              <p
                className="
                  text-sm
                  text-slate-500
                "
              >
                HU-032 · Finalizar renovación
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={
              onCerrar
            }
            disabled={
              cargando
            }
            className="
              rounded-lg
              p-2
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-slate-800
              disabled:opacity-50
            "
          >

            <X
              size={21}
            />

          </button>

        </div>


        <form
          onSubmit={
            enviarFormulario
          }
        >

          <div
            className="
              max-h-[72vh]
              space-y-6
              overflow-y-auto
              px-6
              py-6
            "
          >

            {/* ============================================= */}
            {/* DOCUMENTO ANTERIOR */}
            {/* ============================================= */}

            <div
              className="
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                p-4
              "
            >

              <div
                className="
                  mb-4
                  flex
                  items-center
                  gap-2
                  font-semibold
                  text-slate-800
                "
              >

                <FileText
                  size={18}
                />

                Documento anterior

              </div>


              <div
                className="
                  grid
                  gap-4
                  sm:grid-cols-2
                "
              >

                <div>

                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Código
                  </p>

                  <p
                    className="
                      mt-1
                      font-semibold
                      text-slate-900
                    "
                  >
                    {codigoAnterior}
                  </p>

                </div>


                <div>

                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Número
                  </p>

                  <p
                    className="
                      mt-1
                      font-semibold
                      text-slate-900
                    "
                  >
                    {numeroAnterior}
                  </p>

                </div>


                <div>

                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Tienda
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-700
                    "
                  >
                    {tienda}
                  </p>

                </div>


                <div>

                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Tipo documental
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-700
                    "
                  >
                    {tipoDocumento}
                  </p>

                </div>

              </div>

            </div>


            {/* ============================================= */}
            {/* NÚMERO NUEVO */}
            {/* ============================================= */}

            <div
              className="
                grid
                gap-5
                md:grid-cols-2
              "
            >

              <div>

                <label
                  htmlFor="numeroDocumentoRenovado"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Número del nuevo documento *
                </label>


                <input
                  id="numeroDocumentoRenovado"
                  type="text"
                  value={
                    numeroDocumento
                  }
                  onChange={
                    (event) =>
                      setNumeroDocumento(
                        event.target.value
                      )
                  }
                  disabled={
                    cargando
                  }
                  maxLength={100}
                  placeholder="Ej. LIC-2026-00125"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                />

              </div>


              <div>

                <label
                  htmlFor="numeroExpedienteRenovado"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Número de expediente
                </label>


                <input
                  id="numeroExpedienteRenovado"
                  type="text"
                  value={
                    numeroExpediente
                  }
                  onChange={
                    (event) =>
                      setNumeroExpediente(
                        event.target.value
                      )
                  }
                  disabled={
                    cargando
                  }
                  maxLength={100}
                  placeholder="Opcional"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                />

              </div>

            </div>


            {/* ============================================= */}
            {/* ENTIDAD EMISORA */}
            {/* ============================================= */}

            <div>

              <label
                htmlFor="entidadRenovada"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Entidad emisora *
              </label>


              <select
                id="entidadRenovada"
                value={
                  entidadEmisoraId
                }
                onChange={
                  (event) =>
                    setEntidadEmisoraId(
                      event.target.value
                    )
                }
                disabled={
                  cargando
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-3
                  py-2.5
                  text-sm
                  outline-none
                  transition
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              >

                <option value="">
                  Seleccione entidad emisora
                </option>


                {
                  entidades.map(
                    (entidad) => (

                      <option
                        key={
                          entidad.id
                        }
                        value={
                          entidad.id
                        }
                      >
                        {
                          entidad.nombre
                        }
                      </option>

                    )
                  )
                }

              </select>

            </div>


            {/* ============================================= */}
            {/* FECHAS */}
            {/* ============================================= */}

            <div
              className="
                grid
                gap-5
                md:grid-cols-2
              "
            >

              <div>

                <label
                  htmlFor="fechaEmisionRenovada"
                  className="
                    mb-2
                    flex
                    items-center
                    gap-2
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >

                  <CalendarDays
                    size={17}
                  />

                  Fecha de emisión *

                </label>


                <input
                  id="fechaEmisionRenovada"
                  type="date"
                  value={
                    fechaEmision
                  }
                  onChange={
                    (event) =>
                      setFechaEmision(
                        event.target.value
                      )
                  }
                  disabled={
                    cargando
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                />

              </div>


              {
                esTemporal && (

                  <div>

                    <label
                      htmlFor="fechaVencimientoRenovada"
                      className="
                        mb-2
                        flex
                        items-center
                        gap-2
                        text-sm
                        font-semibold
                        text-slate-700
                      "
                    >

                      <CalendarDays
                        size={17}
                      />

                      Fecha de vencimiento *

                    </label>


                    <input
                      id="fechaVencimientoRenovada"
                      type="date"
                      value={
                        fechaVencimiento
                      }
                      min={
                        fechaEmision ||
                        undefined
                      }
                      onChange={
                        (event) =>
                          setFechaVencimiento(
                            event.target.value
                          )
                      }
                      disabled={
                        cargando
                      }
                      className="
                        w-full
                        rounded-xl
                        border
                        border-slate-300
                        px-3
                        py-2.5
                        text-sm
                        outline-none
                        transition
                        focus:border-blue-500
                        focus:ring-2
                        focus:ring-blue-100
                      "
                    />

                  </div>

                )
              }

            </div>


            {/* ============================================= */}
            {/* INFORMACIÓN DE VIGENCIA */}
            {/* ============================================= */}

            <div
              className="
                rounded-xl
                border
                border-blue-200
                bg-blue-50
                px-4
                py-3
                text-sm
                text-blue-800
              "
            >
              {obtenerTextoVigencia()}
            </div>


            {/* ============================================= */}
            {/* ARCHIVO PDF */}
            {/* ============================================= */}

            <div>

              <label
                htmlFor="archivoDocumentoRenovado"
                className="
                  mb-2
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >

                <FileUp
                  size={17}
                />

                Documento digital PDF

              </label>


              <input
                id="archivoDocumentoRenovado"
                type="file"
                accept="application/pdf,.pdf"
                onChange={
                  cambiarArchivo
                }
                disabled={
                  cargando
                }
                className="
                  block
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-3
                  py-2.5
                  text-sm
                  text-slate-700
                "
              />


              <p
                className="
                  mt-2
                  text-xs
                  text-slate-500
                "
              >
                Opcional. Solo PDF, máximo 10 MB.
              </p>


              {
                archivo && (

                  <div
                    className="
                      mt-3
                      rounded-lg
                      border
                      border-emerald-200
                      bg-emerald-50
                      px-3
                      py-2
                      text-sm
                      text-emerald-800
                    "
                  >
                    Archivo seleccionado: {archivo.name}
                  </div>

                )
              }

            </div>


            {/* ============================================= */}
            {/* OBSERVACIONES */}
            {/* ============================================= */}

            <div>

              <label
                htmlFor="observacionesRenovacion"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Observaciones
              </label>


              <textarea
                id="observacionesRenovacion"
                rows={4}
                maxLength={1000}
                value={
                  observaciones
                }
                onChange={
                  (event) =>
                    setObservaciones(
                      event.target.value
                    )
                }
                disabled={
                  cargando
                }
                placeholder="Información adicional del nuevo documento..."
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-slate-300
                  px-3
                  py-2.5
                  text-sm
                  outline-none
                  transition
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              />


              <p
                className="
                  mt-1
                  text-right
                  text-xs
                  text-slate-400
                "
              >
                {observaciones.length}/1000
              </p>

            </div>


            {/* ============================================= */}
            {/* ERRORES */}
            {/* ============================================= */}

            {
              (errorLocal || error) && (

                <div
                  className="
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50
                    px-4
                    py-3
                    text-sm
                    text-red-700
                  "
                >
                  {
                    errorLocal ||
                    error
                  }
                </div>

              )
            }

          </div>


          {/* ================================================= */}
          {/* BOTONES */}
          {/* ================================================= */}

          <div
            className="
              flex
              justify-end
              gap-3
              border-t
              border-slate-200
              bg-slate-50
              px-6
              py-4
            "
          >

            <button
              type="button"
              onClick={
                onCerrar
              }
              disabled={
                cargando
              }
              className="
                rounded-xl
                border
                border-slate-300
                bg-white
                px-4
                py-2.5
                text-sm
                font-semibold
                text-slate-700
                transition
                hover:bg-slate-100
                disabled:opacity-50
              "
            >
              Cancelar
            </button>


            <button
              type="submit"
              disabled={
                cargando
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-emerald-600
                px-4
                py-2.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-emerald-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              <Save
                size={17}
              />


              {
                cargando
                  ? 'Registrando...'
                  : 'Registrar documento renovado'
              }

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


export default RenovacionCompletarModal;