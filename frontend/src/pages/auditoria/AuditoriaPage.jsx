/* eslint-disable react-hooks/exhaustive-deps */

import {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Activity,
  CircleAlert,
  Clock3,
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound
} from 'lucide-react';

import {
  api
} from '../../services/api.js';


function AuditoriaPage() {

  const [
    eventos,
    setEventos
  ] = useState([]);


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
    busqueda,
    setBusqueda
  ] = useState('');


  const [
    filtroModulo,
    setFiltroModulo
  ] = useState('');


  const [
    filtroEvento,
    setFiltroEvento
  ] = useState('');


  // ============================================================
  // CARGAR AUDITORÍA
  // ============================================================

  async function cargarAuditoria(
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
          '/auditoria?limite=300'
        );


      setEventos(
        Array.isArray(
          respuesta?.eventos
        )
          ? respuesta.eventos
          : []
      );


    } catch (
      errorAuditoria
    ) {

      setError(
        errorAuditoria
          ?.response
          ?.data
          ?.mensaje ||
        errorAuditoria
          ?.data
          ?.mensaje ||
        errorAuditoria
          ?.message ||
        'No se pudo cargar la auditoría.'
      );


    } finally {

      setCargando(false);

      setRecargando(false);

    }

  }


  useEffect(
    () => {

      cargarAuditoria();

    },
    []
  );


  // ============================================================
  // MÓDULOS
  // ============================================================

  const modulos =
    useMemo(
      () => {

        return [
          ...new Set(

            eventos
              .map(
                (evento) =>
                  evento.modulo
              )
              .filter(Boolean)

          )
        ].sort();

      },
      [
        eventos
      ]
    );


  // ============================================================
  // TIPOS DE EVENTO
  // ============================================================

  const tiposEvento =
    useMemo(
      () => {

        return [
          ...new Set(

            eventos
              .map(
                (evento) =>
                  evento.evento
              )
              .filter(Boolean)

          )
        ].sort();

      },
      [
        eventos
      ]
    );


  // ============================================================
  // FILTRAR EVENTOS
  // ============================================================

  const eventosFiltrados =
    useMemo(
      () => {

        const texto =
          busqueda
            .trim()
            .toLowerCase();


        return eventos.filter(
          (registro) => {

            const usuario =
              `${registro.nombres || ''} ${registro.apellidos || ''}`
                .trim()
                .toLowerCase();


            const email =
              registro
                .email
                ?.toLowerCase() ||
              '';


            const descripcion =
              registro
                .descripcion
                ?.toLowerCase() ||
              '';


            const evento =
              registro
                .evento
                ?.toLowerCase() ||
              '';


            const modulo =
              registro
                .modulo
                ?.toLowerCase() ||
              '';


            const ip =
              registro
                .ip
                ?.toLowerCase() ||
              '';


            const coincideTexto =

              !texto ||

              usuario.includes(
                texto
              ) ||

              email.includes(
                texto
              ) ||

              descripcion.includes(
                texto
              ) ||

              evento.includes(
                texto
              ) ||

              modulo.includes(
                texto
              ) ||

              ip.includes(
                texto
              );


            const coincideModulo =

              !filtroModulo ||

              registro.modulo ===
                filtroModulo;


            const coincideEvento =

              !filtroEvento ||

              registro.evento ===
                filtroEvento;


            return (

              coincideTexto &&

              coincideModulo &&

              coincideEvento

            );

          }
        );

      },
      [

        eventos,

        busqueda,

        filtroModulo,

        filtroEvento

      ]
    );


  // ============================================================
  // ESTADÍSTICAS
  // ============================================================

  const totalEventos =
    eventos.length;


  const loginsExitosos =
    eventos.filter(
      (evento) =>
        evento.evento ===
        'LOGIN_EXITOSO'
    ).length;


  const loginsFallidos =
    eventos.filter(
      (evento) =>
        evento.evento ===
        'LOGIN_FALLIDO'
    ).length;


  const bloqueos =
    eventos.filter(
      (evento) =>
        evento.evento ===
        'BLOQUEO_TEMPORAL'
    ).length;


  const filtrosActivos =
    [

      busqueda.trim(),

      filtroModulo,

      filtroEvento

    ].filter(Boolean).length;


  // ============================================================
  // LIMPIAR FILTROS
  // ============================================================

  function limpiarFiltros() {

    setBusqueda('');

    setFiltroModulo('');

    setFiltroEvento('');

  }


  // ============================================================
  // FORMATEAR FECHA
  // ============================================================

  function formatearFecha(
    fecha
  ) {

    if (!fecha) {

      return 'Sin fecha';

    }


    const valor =
      new Date(
        fecha
      );


    if (
      Number.isNaN(
        valor.getTime()
      )
    ) {

      return String(
        fecha
      );

    }


    return valor.toLocaleString(
      'es-PE',
      {

        dateStyle:
          'short',

        timeStyle:
          'medium'

      }
    );

  }


  // ============================================================
  // COLOR DEL EVENTO
  // ============================================================

  function obtenerEstiloEvento(
    evento
  ) {

    if (
      evento ===
        'LOGIN_EXITOSO' ||

      evento ===
        'USUARIO_ACTIVADO' ||

      evento ===
        'USUARIO_CREADO'
    ) {

      return (
        'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
      );

    }


    if (
      evento ===
        'LOGIN_FALLIDO' ||

      evento ===
        'BLOQUEO_TEMPORAL' ||

      evento ===
        'USUARIO_DESACTIVADO'
    ) {

      return (
        'bg-red-50 text-red-700 ring-1 ring-red-200'
      );

    }


    if (
      evento ===
        'PERMISO_ASIGNADO' ||

      evento ===
        'PERMISO_RETIRADO'
    ) {

      return (
        'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
      );

    }


    if (
      evento
        ?.includes(
          'PASSWORD'
        )
    ) {

      return (
        'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
      );

    }


    return (
      'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
    );

  }


  // ============================================================
  // CARGANDO
  // ============================================================

  if (
    cargando
  ) {

    return (

      <div
        className="
          flex
          min-h-[60vh]
          items-center
          justify-center
        "
      >

        <div
          className="
            flex
            flex-col
            items-center
            gap-4
          "
        >

          <div
            className="
              h-10
              w-10
              animate-spin
              rounded-full
              border-4
              border-slate-200
              border-t-indigo-600
            "
          />


          <p
            className="
              text-sm
              font-medium
              text-slate-500
            "
          >
            Cargando auditoría...
          </p>

        </div>

      </div>

    );

  }


  return (

    <div className="space-y-6">

      {/* ================================================= */}
      {/* CABECERA */}
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
            relative
            overflow-hidden
            bg-gradient-to-br
            from-slate-950
            via-slate-900
            to-indigo-950
            px-6
            py-6
            text-white
            sm:px-8
          "
        >

          <div
            className="
              absolute
              -right-20
              -top-24
              h-72
              w-72
              rounded-full
              bg-indigo-500/10
              blur-3xl
            "
          />


          <div
            className="
              relative
              flex
              flex-col
              gap-5
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >

            <div>

              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-indigo-300
                "
              >
                Seguridad y trazabilidad
              </p>


              <h1
                className="
                  mt-2
                  text-2xl
                  font-bold
                  tracking-tight
                  sm:text-3xl
                "
              >
                Auditoría
              </h1>


              <p
                className="
                  mt-2
                  max-w-3xl
                  text-sm
                  leading-6
                  text-slate-300
                "
              >
                Supervisa eventos de seguridad,
                accesos y operaciones relevantes
                ejecutadas dentro de CERTIIA.
              </p>


              <div
                className="
                  mt-5
                  flex
                  flex-wrap
                  gap-2
                "
              >

                <span
                  className="
                    rounded-full
                    border
                    border-white/10
                    bg-white/10
                    px-3
                    py-1.5
                    text-xs
                    font-semibold
                    text-slate-200
                    backdrop-blur
                  "
                >
                  {totalEventos} eventos recientes
                </span>


                <span
                  className="
                    rounded-full
                    border
                    border-white/10
                    bg-white/10
                    px-3
                    py-1.5
                    text-xs
                    font-semibold
                    text-slate-200
                    backdrop-blur
                  "
                >
                  Registro de solo lectura
                </span>

              </div>

            </div>


            <button

              type="button"

              onClick={() =>
                cargarAuditoria(
                  true
                )
              }

              disabled={
                recargando
              }

              className="
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                self-start
                rounded-xl
                border
                border-white/10
                bg-white/10
                px-4
                text-sm
                font-semibold
                text-white
                backdrop-blur
                transition
                hover:bg-white/15
                disabled:cursor-not-allowed
                disabled:opacity-60
                lg:self-auto
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


              {
                recargando
                  ? 'Actualizando...'
                  : 'Actualizar'
              }

            </button>

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

              size={19}

              className="
                mt-0.5
                shrink-0
              "

            />


            <span>
              {error}
            </span>

          </div>

        )
      }


      {/* ================================================= */}
      {/* INDICADORES */}
      {/* ================================================= */}

      <section
        className="
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >

        <TarjetaIndicador

          titulo="Eventos"

          valor={
            totalEventos
          }

          descripcion="Actividad registrada"

          icono={
            Activity
          }

          tono="indigo"

        />


        <TarjetaIndicador

          titulo="Logins exitosos"

          valor={
            loginsExitosos
          }

          descripcion="Accesos autorizados"

          icono={
            ShieldCheck
          }

          tono="emerald"

        />


        <TarjetaIndicador

          titulo="Logins fallidos"

          valor={
            loginsFallidos
          }

          descripcion="Intentos rechazados"

          icono={
            CircleAlert
          }

          tono="red"

        />


        <TarjetaIndicador

          titulo="Bloqueos"

          valor={
            bloqueos
          }

          descripcion="Protección automática"

          icono={
            ShieldCheck
          }

          tono="amber"

        />

      </section>


      {/* ================================================= */}
      {/* FILTROS */}
      {/* ================================================= */}

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
            gap-4
            border-b
            border-slate-100
            px-5
            py-4
            sm:flex-row
            sm:items-center
            sm:justify-between
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
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-indigo-50
                text-indigo-600
              "
            >

              <Filter
                size={18}
              />

            </div>


            <div>

              <h2
                className="
                  font-bold
                  text-slate-900
                "
              >
                Filtros de auditoría
              </h2>


              <p
                className="
                  mt-0.5
                  text-xs
                  text-slate-500
                "
              >
                Busca por usuario, correo,
                descripción, evento, módulo o IP.
              </p>

            </div>

          </div>


          {
            filtrosActivos > 0 && (

              <button

                type="button"

                onClick={
                  limpiarFiltros
                }

                className="
                  text-sm
                  font-semibold
                  text-indigo-600
                  transition
                  hover:text-indigo-800
                "
              >
                Limpiar filtros
              </button>

            )
          }

        </div>


        <div
          className="
            grid
            gap-4
            p-5
            lg:grid-cols-[1.5fr_1fr_1fr]
          "
        >

          <div
            className="
              relative
            "
          >

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

              value={
                busqueda
              }

              onChange={
                (event) =>
                  setBusqueda(
                    event.target.value
                  )
              }

              placeholder="Buscar usuario, correo, evento, descripción o IP..."

              className="
                h-11
                w-full
                rounded-xl
                border
                border-slate-300
                bg-white
                pl-11
                pr-4
                text-sm
                text-slate-800
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
              filtroModulo
            }

            onChange={
              (event) =>
                setFiltroModulo(
                  event.target.value
                )
            }

            className="
              h-11
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

            <option value="">
              Todos los módulos
            </option>


            {
              modulos.map(
                (modulo) => (

                  <option
                    key={
                      modulo
                    }
                    value={
                      modulo
                    }
                  >
                    {modulo}
                  </option>

                )
              )
            }

          </select>


          <select

            value={
              filtroEvento
            }

            onChange={
              (event) =>
                setFiltroEvento(
                  event.target.value
                )
            }

            className="
              h-11
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

            <option value="">
              Todos los eventos
            </option>


            {
              tiposEvento.map(
                (evento) => (

                  <option
                    key={
                      evento
                    }
                    value={
                      evento
                    }
                  >
                    {
                      evento.replaceAll(
                        '_',
                        ' '
                      )
                    }
                  </option>

                )
              )
            }

          </select>

        </div>

      </section>


      {/* ================================================= */}
      {/* TABLA */}
      {/* ================================================= */}

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
              Registro de actividad
            </h2>


            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Trazabilidad de operaciones y eventos
              de seguridad.
            </p>

          </div>


          <div
            className="
              inline-flex
              w-fit
              items-center
              rounded-full
              bg-slate-100
              px-3
              py-1.5
              text-xs
              font-semibold
              text-slate-600
            "
          >

            {
              eventosFiltrados.length
            }

            {' '}

            {
              eventosFiltrados.length ===
              1

                ? 'evento'

                : 'eventos'
            }

          </div>

        </div>


        <div
          className="
            overflow-x-auto
          "
        >

          <table
            className="
              w-full
              min-w-[1150px]
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
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >

                <th
                  className="
                    px-5
                    py-4
                  "
                >
                  Fecha
                </th>


                <th
                  className="
                    px-5
                    py-4
                  "
                >
                  Usuario
                </th>


                <th
                  className="
                    px-5
                    py-4
                  "
                >
                  Evento
                </th>


                <th
                  className="
                    px-5
                    py-4
                  "
                >
                  Módulo
                </th>


                <th
                  className="
                    px-5
                    py-4
                  "
                >
                  Descripción
                </th>


                <th
                  className="
                    px-5
                    py-4
                  "
                >
                  IP
                </th>

              </tr>

            </thead>


            <tbody
              className="
                divide-y
                divide-slate-100
              "
            >

              {
                eventosFiltrados.length ===
                0

                  ? (

                    <tr>

                      <td

                        colSpan="6"

                        className="
                          px-6
                          py-16
                          text-center
                        "
                      >

                        <div
                          className="
                            mx-auto
                            flex
                            h-14
                            w-14
                            items-center
                            justify-center
                            rounded-2xl
                            bg-slate-100
                            text-slate-400
                          "
                        >

                          <Activity
                            size={26}
                          />

                        </div>


                        <p
                          className="
                            mt-4
                            text-sm
                            font-semibold
                            text-slate-700
                          "
                        >
                          No se encontraron eventos
                        </p>


                        <p
                          className="
                            mt-1
                            text-xs
                            text-slate-400
                          "
                        >
                          Cambia los filtros para ampliar
                          la búsqueda.
                        </p>

                      </td>

                    </tr>

                  )

                  : (

                    eventosFiltrados.map(
                      (
                        registro
                      ) => {

                        const nombreUsuario =

                          registro.usuario_id

                            ? `${registro.nombres || ''} ${registro.apellidos || ''}`
                                .trim()

                            : 'Sistema / desconocido';


                        return (

                          <tr

                            key={
                              registro.id
                            }

                            className="
                              align-top
                              transition
                              hover:bg-indigo-50/30
                            "
                          >

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
                                  text-slate-500
                                "
                              >

                                <Clock3

                                  size={15}

                                  className="
                                    shrink-0
                                    text-slate-400
                                  "

                                />


                                {
                                  formatearFecha(
                                    registro.fecha_evento
                                  )
                                }

                              </div>

                            </td>


                            <td
                              className="
                                px-5
                                py-4
                              "
                            >

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
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-slate-100
                                    text-slate-500
                                  "
                                >

                                  <UserRound
                                    size={17}
                                  />

                                </div>


                                <div
                                  className="
                                    min-w-0
                                  "
                                >

                                  <p
                                    className="
                                      font-semibold
                                      text-slate-800
                                    "
                                  >
                                    {
                                      nombreUsuario ||
                                      'Usuario'
                                    }
                                  </p>


                                  <p
                                    className="
                                      mt-0.5
                                      max-w-[220px]
                                      truncate
                                      text-xs
                                      text-slate-400
                                    "
                                  >
                                    {
                                      registro.email ||
                                      'Sin correo asociado'
                                    }
                                  </p>

                                </div>

                              </div>

                            </td>


                            <td
                              className="
                                px-5
                                py-4
                              "
                            >

                              <span
                                className={`
                                  inline-flex
                                  rounded-lg
                                  px-2.5
                                  py-1
                                  text-[11px]
                                  font-bold
                                  ${obtenerEstiloEvento(
                                    registro.evento
                                  )}
                                `}
                              >
                                {
                                  registro.evento ||
                                  'SIN_EVENTO'
                                }
                              </span>

                            </td>


                            <td
                              className="
                                px-5
                                py-4
                              "
                            >

                              <span
                                className="
                                  inline-flex
                                  rounded-lg
                                  bg-slate-100
                                  px-2.5
                                  py-1
                                  text-xs
                                  font-semibold
                                  text-slate-600
                                "
                              >
                                {
                                  registro.modulo ||
                                  'SIN_MÓDULO'
                                }
                              </span>

                            </td>


                            <td
                              className="
                                max-w-md
                                px-5
                                py-4
                                text-sm
                                leading-6
                                text-slate-600
                              "
                            >
                              {
                                registro.descripcion ||
                                'Sin descripción'
                              }
                            </td>


                            <td
                              className="
                                whitespace-nowrap
                                px-5
                                py-4
                              "
                            >

                              <span
                                className="
                                  rounded-lg
                                  bg-slate-50
                                  px-2.5
                                  py-1
                                  font-mono
                                  text-xs
                                  font-medium
                                  text-slate-500
                                "
                              >
                                {
                                  registro.ip ||
                                  'N/D'
                                }
                              </span>

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

  );

}


// ============================================================
// TARJETA DE INDICADOR
// ============================================================

function TarjetaIndicador({

  titulo,

  valor,

  descripcion,

  icono: Icono,

  tono =
    'indigo'

}) {

  const estilos = {

    indigo: {

      icono:
        'bg-indigo-50 text-indigo-600',

      barra:
        'bg-indigo-500'

    },

    emerald: {

      icono:
        'bg-emerald-50 text-emerald-600',

      barra:
        'bg-emerald-500'

    },

    red: {

      icono:
        'bg-red-50 text-red-600',

      barra:
        'bg-red-500'

    },

    amber: {

      icono:
        'bg-amber-50 text-amber-600',

      barra:
        'bg-amber-500'

    }

  };


  const estilo =

    estilos[tono] ||

    estilos.indigo;


  return (

    <article
      className="
        group
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:shadow-md
      "
    >

      <div
        className="
          p-5
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
              {titulo}
            </p>


            <p
              className="
                mt-2
                text-3xl
                font-bold
                tracking-tight
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
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-2xl
              ${estilo.icono}
            `}
          >

            <Icono
              size={21}
            />

          </div>

        </div>

      </div>


      <div
        className={`
          h-1
          w-full
          ${estilo.barra}
        `}
      />

    </article>

  );

}


export default AuditoriaPage;
