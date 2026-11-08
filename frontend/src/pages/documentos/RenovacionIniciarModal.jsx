import {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  FileText,
  Link2,
  RefreshCw,
  ShieldCheck,
  UserRound,
  X
} from 'lucide-react';

import {
  api
} from '../../services/api.js';


// ============================================================
// FECHA LOCAL ACTUAL
// ============================================================

function obtenerFechaActual() {

  const ahora =
    new Date();

  const local =
    new Date(
      ahora.getTime() -
      ahora.getTimezoneOffset() *
      60000
    );

  return local
    .toISOString()
    .slice(0, 10);

}


// ============================================================
// MODAL
// HU-031 - INICIAR RENOVACIÓN
// ============================================================

function RenovacionIniciarModal({

  abierto,

  documento,

  usuarios = [],

  cargando = false,

  error = '',

  onCerrar,

  onGuardar

}) {

  const [
    cargandoTramites,
    setCargandoTramites
  ] = useState(false);


  const [
    tramites,
    setTramites
  ] = useState([]);


  const [
    errorTramites,
    setErrorTramites
  ] = useState('');


  const [
    formulario,
    setFormulario
  ] = useState({

    responsableUsuarioId: '',

    tramiteId: '',

    fechaInicio:
      obtenerFechaActual(),

    observaciones: ''

  });


  // ==========================================================
  // RESPONSABLE SUGERIDO
  // ==========================================================

  const responsableDocumento =
    useMemo(
      () =>
        documento?.responsable?.id ||
        '',
      [
        documento
      ]
    );


  // ==========================================================
  // CARGAR TRÁMITES
  // ==========================================================

  useEffect(
    () => {

      if (
        !abierto ||
        !documento?.id
      ) {
        return;
      }


      setFormulario({

        responsableUsuarioId:
          responsableDocumento
            ? String(
                responsableDocumento
              )
            : '',

        tramiteId: '',

        fechaInicio:
          obtenerFechaActual(),

        observaciones: ''

      });


      async function cargarTramites() {

        setCargandoTramites(
          true
        );

        setErrorTramites(
          ''
        );


        try {

          const respuesta =
            await api.get(
              '/tramites'
            );


          const lista =
            Array.isArray(
              respuesta?.tramites
            )
              ? respuesta.tramites
              : [];


          const relacionados =
            lista.filter(
              (tramite) =>
                Number(
                  tramite
                    ?.documento
                    ?.id
                ) ===
                Number(
                  documento.id
                )
            );


          setTramites(
            relacionados
          );

        } catch (errorPeticion) {

          console.error(
            'Error cargando trámites:',
            errorPeticion
          );


          setTramites(
            []
          );


          setErrorTramites(
            errorPeticion
              ?.message ||
            'No se pudieron cargar los trámites.'
          );

        } finally {

          setCargandoTramites(
            false
          );

        }

      }


      cargarTramites();

    },
    [
      abierto,
      documento,
      responsableDocumento
    ]
  );


  // ==========================================================
  // CAMBIAR CAMPO
  // ==========================================================

  function cambiarCampo(
    evento
  ) {

    const {
      name,
      value
    } = evento.target;


    setFormulario(
      (anterior) => ({

        ...anterior,

        [name]:
          value

      })
    );

  }


  // ==========================================================
  // GUARDAR
  // ==========================================================

  async function enviarFormulario(
    evento
  ) {

    evento.preventDefault();


    if (
      !documento?.id ||
      !formulario
        .responsableUsuarioId ||
      !formulario
        .fechaInicio
    ) {
      return;
    }


    await onGuardar({

      documentoId:
        Number(
          documento.id
        ),

      responsableUsuarioId:
        Number(
          formulario
            .responsableUsuarioId
        ),

      tramiteId:
        formulario.tramiteId
          ? Number(
              formulario
                .tramiteId
            )
          : null,

      fechaInicio:
        formulario
          .fechaInicio,

      observaciones:
        formulario
          .observaciones
          .trim() ||
        null

    });

  }


  // ==========================================================
  // CERRADO
  // ==========================================================

  if (!abierto) {
    return null;
  }


  // ==========================================================
  // DATOS DOCUMENTO
  // ==========================================================

  const codigoDocumento =
    documento
      ?.codigoInterno ||
    documento
      ?.codigo_interno ||
    '—';


  const numeroDocumento =
    documento
      ?.numeroDocumento ||
    documento
      ?.numero_documento ||
    '—';


  const tienda =
    documento
      ?.tienda
      ?.nombre ||
    '—';


  const tipoDocumento =
    documento
      ?.tipoDocumento
      ?.nombre ||
    '—';


  const responsableSeleccionado =
    usuarios.find(
      (usuario) =>
        String(
          usuario.id
        ) ===
        String(
          formulario.responsableUsuarioId
        )
    );


  const tramiteSeleccionado =
    tramites.find(
      (tramite) =>
        String(
          tramite.id
        ) ===
        String(
          formulario.tramiteId
        )
    );


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        p-4
      "
    >

      {/* FONDO */}

      <button
        type="button"
        aria-label="Cerrar modal"
        onClick={
          cargando
            ? undefined
            : onCerrar
        }
        className="
          absolute
          inset-0
          bg-slate-950/65
          backdrop-blur-sm
        "
      />


      {/* MODAL */}

      <div
        className="
          relative
          z-10
          max-h-[94vh]
          w-full
          max-w-3xl
          overflow-hidden
          rounded-[28px]
          border
          border-white/10
          bg-white
          shadow-2xl
        "
      >

        {/* ================================================= */}
        {/* CABECERA */}
        {/* ================================================= */}

        <div
          className="
            relative
            overflow-hidden
            bg-gradient-to-br
            from-slate-950
            via-slate-900
            to-indigo-950
            px-6
            py-6
            text-white
            sm:px-7
          "
        >

          <div
            className="
              absolute
              -right-16
              -top-16
              h-52
              w-52
              rounded-full
              bg-blue-500/20
              blur-3xl
            "
          />

          <div
            className="
              absolute
              -bottom-20
              left-1/3
              h-44
              w-44
              rounded-full
              bg-indigo-500/10
              blur-3xl
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

            <div
              className="
                flex
                min-w-0
                items-start
                gap-4
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
                  border
                  border-white/10
                  bg-white/10
                  text-blue-200
                "
              >
                <RefreshCw size={23} />
              </div>

              <div className="min-w-0">

                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-blue-300
                  "
                >
                  Renovación documental
                </p>

                <h2
                  className="
                    mt-1
                    text-xl
                    font-bold
                    tracking-tight
                    text-white
                    sm:text-2xl
                  "
                >
                  Iniciar renovación
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-400
                    sm:text-sm
                  "
                >
                  Registra el responsable, fecha y relación operativa de la renovación.
                </p>

              </div>

            </div>


            <button
              type="button"
              onClick={onCerrar}
              disabled={cargando}
              aria-label="Cerrar"
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-white/10
                bg-white/10
                text-slate-300
                transition
                hover:bg-white/20
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <X size={20} />
            </button>

          </div>

        </div>


        {/* ================================================= */}
        {/* FORMULARIO */}
        {/* ================================================= */}

        <form
          onSubmit={
            enviarFormulario
          }
        >

          <div
            className="
              max-h-[calc(94vh-190px)]
              space-y-6
              overflow-y-auto
              bg-slate-50/70
              px-6
              py-6
              sm:px-7
            "
          >

            {/* ================================================= */}
            {/* DOCUMENTO ORIGINAL */}
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
                  items-center
                  gap-3
                  border-b
                  border-slate-100
                  bg-gradient-to-r
                  from-white
                  to-blue-50/50
                  px-5
                  py-5
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
                    bg-blue-50
                    text-blue-600
                  "
                >
                  <FileText size={19} />
                </div>

                <div>

                  <h3
                    className="
                      font-bold
                      text-slate-900
                    "
                  >
                    Documento a renovar
                  </h3>

                  <p
                    className="
                      mt-0.5
                      text-xs
                      text-slate-500
                    "
                  >
                    La renovación quedará vinculada a este registro documental.
                  </p>

                </div>

              </div>


              <div
                className="
                  grid
                  gap-4
                  p-5
                  sm:grid-cols-2
                "
              >

                <DatoDocumento
                  titulo="Código"
                  valor={codigoDocumento}
                />

                <DatoDocumento
                  titulo="Número"
                  valor={numeroDocumento}
                />

                <DatoDocumento
                  titulo="Tienda"
                  valor={tienda}
                />

                <DatoDocumento
                  titulo="Tipo documental"
                  valor={tipoDocumento}
                />

              </div>

            </section>


            {/* ================================================= */}
            {/* DATOS RENOVACIÓN */}
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
                  items-center
                  gap-3
                  border-b
                  border-slate-100
                  bg-gradient-to-r
                  from-white
                  to-slate-50
                  px-5
                  py-5
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
                  <RefreshCw size={19} />
                </div>

                <div>

                  <h3
                    className="
                      font-bold
                      text-slate-900
                    "
                  >
                    Datos de la renovación
                  </h3>

                  <p
                    className="
                      mt-0.5
                      text-xs
                      text-slate-500
                    "
                  >
                    Define quién gestionará el proceso y cuándo inicia.
                  </p>

                </div>

              </div>


              <div
                className="
                  grid
                  gap-5
                  p-5
                  md:grid-cols-2
                "
              >

                {/* RESPONSABLE */}

                <div>

                  <label
                    htmlFor="responsableUsuarioId"
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
                    <UserRound
                      size={16}
                      className="text-slate-400"
                    />
                    Responsable *
                  </label>


                  <select
                    id="responsableUsuarioId"
                    name="responsableUsuarioId"
                    value={
                      formulario
                        .responsableUsuarioId
                    }
                    onChange={
                      cambiarCampo
                    }
                    required
                    disabled={
                      cargando
                    }
                    className={claseCampo()}
                  >

                    <option value="">
                      Seleccione responsable
                    </option>


                    {
                      usuarios.map(
                        (usuario) => (

                          <option
                            key={
                              usuario.id
                            }
                            value={
                              usuario.id
                            }
                          >
                            {
                              usuario
                                .nombreCompleto ||
                              `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim() ||
                              usuario.email ||
                              `Usuario ${usuario.id}`
                            }
                          </option>

                        )
                      )
                    }

                  </select>


                  {
                    responsableSeleccionado && (

                      <p
                        className="
                          mt-2
                          text-xs
                          text-slate-500
                        "
                      >
                        Responsable seleccionado:{' '}
                        <span
                          className="
                            font-semibold
                            text-slate-700
                          "
                        >
                          {
                            responsableSeleccionado.nombreCompleto ||
                            `${responsableSeleccionado.nombres || ''} ${responsableSeleccionado.apellidos || ''}`.trim() ||
                            responsableSeleccionado.email
                          }
                        </span>
                      </p>

                    )
                  }

                </div>


                {/* FECHA */}

                <div>

                  <label
                    htmlFor="fechaInicio"
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
                      size={16}
                      className="text-slate-400"
                    />
                    Fecha de inicio *
                  </label>


                  <input
                    id="fechaInicio"
                    name="fechaInicio"
                    type="date"
                    value={
                      formulario
                        .fechaInicio
                    }
                    onChange={
                      cambiarCampo
                    }
                    required
                    disabled={
                      cargando
                    }
                    className={claseCampo()}
                  />

                </div>

              </div>

            </section>


            {/* ================================================= */}
            {/* TRÁMITE ASOCIADO */}
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
                  items-center
                  gap-3
                  border-b
                  border-slate-100
                  bg-gradient-to-r
                  from-white
                  to-slate-50
                  px-5
                  py-5
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
                    bg-violet-50
                    text-violet-600
                  "
                >
                  <Link2 size={18} />
                </div>

                <div>

                  <h3
                    className="
                      font-bold
                      text-slate-900
                    "
                  >
                    Trámite asociado
                  </h3>

                  <p
                    className="
                      mt-0.5
                      text-xs
                      text-slate-500
                    "
                  >
                    La asociación es opcional y solo muestra trámites del documento.
                  </p>

                </div>

              </div>


              <div className="p-5">

                <select
                  id="tramiteId"
                  name="tramiteId"
                  value={
                    formulario
                      .tramiteId
                  }
                  onChange={
                    cambiarCampo
                  }
                  disabled={
                    cargando ||
                    cargandoTramites
                  }
                  className={claseCampo()}
                >

                  <option value="">
                    {
                      cargandoTramites
                        ? 'Cargando trámites...'
                        : 'Sin trámite asociado'
                    }
                  </option>


                  {
                    tramites.map(
                      (tramite) => (

                        <option
                          key={
                            tramite.id
                          }
                          value={
                            tramite.id
                          }
                        >
                          {
                            tramite.numeroExpediente
                          }
                          {' · '}
                          {
                            tramite.estadoNombre ||
                            tramite.estado
                          }
                        </option>

                      )
                    )
                  }

                </select>


                {
                  cargandoTramites && (

                    <div
                      className="
                        mt-3
                        flex
                        items-center
                        gap-2
                        text-xs
                        text-slate-500
                      "
                    >
                      <RefreshCw
                        size={14}
                        className="animate-spin"
                      />
                      Consultando trámites relacionados...
                    </div>

                  )
                }


                {
                  !cargandoTramites &&
                  tramites.length === 0 &&
                  !errorTramites && (

                    <div
                      className="
                        mt-3
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        px-4
                        py-3
                        text-xs
                        leading-5
                        text-slate-500
                      "
                    >
                      Este documento no tiene trámites registrados.
                      La renovación puede iniciarse sin asociar uno.
                    </div>

                  )
                }


                {
                  tramiteSeleccionado && (

                    <div
                      className="
                        mt-3
                        flex
                        items-start
                        gap-3
                        rounded-xl
                        border
                        border-violet-100
                        bg-violet-50
                        p-4
                      "
                    >
                      <CheckCircle2
                        size={18}
                        className="
                          mt-0.5
                          shrink-0
                          text-violet-600
                        "
                      />

                      <div>

                        <p
                          className="
                            text-xs
                            font-bold
                            text-violet-800
                          "
                        >
                          Trámite vinculado
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            leading-5
                            text-violet-700
                          "
                        >
                          Expediente{' '}
                          {
                            tramiteSeleccionado.numeroExpediente
                          }
                          {' · '}
                          {
                            tramiteSeleccionado.estadoNombre ||
                            tramiteSeleccionado.estado
                          }
                        </p>

                      </div>

                    </div>

                  )
                }


                {
                  errorTramites && (

                    <div
                      className="
                        mt-3
                        flex
                        items-start
                        gap-3
                        rounded-xl
                        border
                        border-amber-200
                        bg-amber-50
                        px-4
                        py-3
                        text-xs
                        text-amber-700
                      "
                    >
                      <CircleAlert
                        size={16}
                        className="mt-0.5 shrink-0"
                      />

                      <span>
                        {errorTramites}
                      </span>
                    </div>

                  )
                }

              </div>

            </section>


            {/* ================================================= */}
            {/* OBSERVACIONES */}
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
                  items-center
                  gap-3
                  border-b
                  border-slate-100
                  bg-gradient-to-r
                  from-white
                  to-slate-50
                  px-5
                  py-5
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
                    bg-slate-100
                    text-slate-600
                  "
                >
                  <FileText size={18} />
                </div>

                <div>

                  <h3
                    className="
                      font-bold
                      text-slate-900
                    "
                  >
                    Observaciones
                  </h3>

                  <p
                    className="
                      mt-0.5
                      text-xs
                      text-slate-500
                    "
                  >
                    Información adicional sobre el inicio del proceso.
                  </p>

                </div>

              </div>


              <div className="p-5">

                <textarea
                  id="observaciones"
                  name="observaciones"
                  value={
                    formulario
                      .observaciones
                  }
                  onChange={
                    cambiarCampo
                  }
                  maxLength={1500}
                  rows={5}
                  disabled={
                    cargando
                  }
                  placeholder="Ingrese información adicional sobre el inicio de la renovación..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-slate-800
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-indigo-500
                    focus:ring-4
                    focus:ring-indigo-500/10
                    disabled:bg-slate-100
                    disabled:text-slate-500
                  "
                />


                <p
                  className="
                    mt-2
                    text-right
                    text-xs
                    font-semibold
                    text-slate-400
                  "
                >
                  {
                    formulario
                      .observaciones
                      .length
                  }
                  /1500
                </p>

              </div>

            </section>


            {/* ================================================= */}
            {/* RESUMEN */}
            {/* ================================================= */}

            <section
              className="
                rounded-2xl
                border
                border-indigo-100
                bg-indigo-50/70
                p-4
              "
            >

              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >

                <ShieldCheck
                  size={18}
                  className="
                    mt-0.5
                    shrink-0
                    text-indigo-600
                  "
                />

                <div>

                  <p
                    className="
                      text-xs
                      font-bold
                      uppercase
                      tracking-wide
                      text-indigo-700
                    "
                  >
                    Inicio de renovación
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      leading-6
                      text-indigo-800
                    "
                  >
                    Al confirmar, CERTIIA registrará una nueva renovación vinculada
                    al documento y al responsable seleccionado.
                  </p>

                </div>

              </div>

            </section>


            {/* ================================================= */}
            {/* ERROR */}
            {/* ================================================= */}

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
                    px-4
                    py-3
                    text-sm
                    text-red-700
                  "
                >
                  <CircleAlert
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    {error}
                  </span>
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
              flex-col-reverse
              gap-3
              border-t
              border-slate-200
              bg-white
              px-6
              py-4
              sm:flex-row
              sm:justify-end
              sm:px-7
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
                inline-flex
                h-11
                items-center
                justify-center
                rounded-xl
                border
                border-slate-300
                bg-white
                px-5
                text-sm
                font-semibold
                text-slate-700
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Cancelar
            </button>


            <button
              type="submit"
              disabled={
                cargando ||
                !formulario
                  .responsableUsuarioId ||
                !formulario
                  .fechaInicio
              }
              className="
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-indigo-600
                px-5
                text-sm
                font-bold
                text-white
                shadow-lg
                shadow-indigo-600/20
                transition
                hover:bg-indigo-700
                focus:outline-none
                focus:ring-4
                focus:ring-indigo-500/20
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              <RefreshCw
                size={17}
                className={
                  cargando
                    ? 'animate-spin'
                    : ''
                }
              />


              {
                cargando
                  ? 'Iniciando...'
                  : 'Iniciar renovación'
              }

            </button>

          </div>

        </form>

      </div>

    </div>

  );

}


// ============================================================
// COMPONENTES VISUALES
// ============================================================

function claseCampo() {

  return `
    h-12
    w-full
    rounded-xl
    border
    border-slate-300
    bg-white
    px-4
    text-sm
    text-slate-800
    outline-none
    transition
    focus:border-indigo-500
    focus:ring-4
    focus:ring-indigo-500/10
    disabled:cursor-not-allowed
    disabled:bg-slate-100
    disabled:text-slate-500
  `;

}


function DatoDocumento({
  titulo,
  valor
}) {

  return (

    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-slate-50
        p-4
      "
    >

      <p
        className="
          text-[10px]
          font-bold
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
          break-words
          text-sm
          font-bold
          text-slate-800
        "
      >
        {valor}
      </p>

    </div>

  );

}


export default RenovacionIniciarModal;
