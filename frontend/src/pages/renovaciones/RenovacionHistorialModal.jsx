import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  X
} from 'lucide-react';


// ============================================================
// UTILIDADES
// ============================================================

function formatearFecha(
  valor
) {

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
}


function textoEstado(
  estado
) {

  switch (estado) {

    case 'EN_PROCESO':
      return 'En proceso';

    case 'COMPLETADA':
      return 'Completada';

    case 'CANCELADA':
      return 'Cancelada';

    case 'VIGENTE':
      return 'Vigente';

    case 'POR_VENCER':
      return 'Por vencer';

    case 'CRITICO':
      return 'Crítico';

    case 'VENCIDO':
      return 'Vencido';

    case 'EN_RENOVACION':
      return 'En renovación';

    default:
      return estado || '—';
  }
}


function claseEstado(
  estado
) {

  switch (estado) {

    case 'COMPLETADA':
    case 'VIGENTE':
      return (
        'bg-emerald-100 text-emerald-700'
      );

    case 'EN_PROCESO':
    case 'EN_RENOVACION':
    case 'POR_VENCER':
      return (
        'bg-amber-100 text-amber-700'
      );

    case 'CRITICO':
      return (
        'bg-orange-100 text-orange-700'
      );

    case 'VENCIDO':
    case 'CANCELADA':
      return (
        'bg-red-100 text-red-700'
      );

    default:
      return (
        'bg-slate-100 text-slate-700'
      );
  }
}


// ============================================================
// HU-033
// HISTORIAL DE RENOVACIONES
// ============================================================

function RenovacionHistorialModal({

  abierto,

  cargando = false,

  error = '',

  historial = null,

  onCerrar

}) {

  if (!abierto) {

    return null;
  }


  const versiones =
    Array.isArray(
      historial?.versiones
    )
      ? historial.versiones
      : [];


  const renovaciones =
    Array.isArray(
      historial?.renovaciones
    )
      ? historial.renovaciones
      : [];


  const resumen =
    historial?.resumen ||
    {};


  return (

    <div
      className="
        fixed
        inset-0
        z-[160]
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
          max-w-5xl
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
                bg-indigo-100
                text-indigo-700
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
                Historial de renovaciones
              </h2>


              <p
                className="
                  text-sm
                  text-slate-500
                "
              >
                HU-033 · Cadena documental
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={
              onCerrar
            }
            className="
              rounded-lg
              p-2
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-slate-800
            "
          >

            <X
              size={21}
            />

          </button>

        </div>


        {/* ================================================= */}
        {/* CONTENIDO */}
        {/* ================================================= */}

        <div
          className="
            max-h-[78vh]
            overflow-y-auto
            px-6
            py-6
          "
        >

          {
            cargando ? (

              <div
                className="
                  flex
                  min-h-64
                  items-center
                  justify-center
                  gap-3
                  text-slate-500
                "
              >

                <RefreshCw
                  size={20}
                  className="
                    animate-spin
                  "
                />

                Cargando historial...

              </div>

            ) : error ? (

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
                {error}
              </div>

            ) : (

              <div
                className="
                  space-y-8
                "
              >

                {/* ========================================= */}
                {/* RESUMEN */}
                {/* ========================================= */}

                <div
                  className="
                    grid
                    gap-4
                    sm:grid-cols-2
                    lg:grid-cols-4
                  "
                >

                  <ResumenCard
                    titulo="Versiones"
                    valor={
                      resumen.totalVersiones ||
                      0
                    }
                    icono={
                      FileText
                    }
                  />


                  <ResumenCard
                    titulo="Renovaciones"
                    valor={
                      resumen.totalRenovaciones ||
                      0
                    }
                    icono={
                      RefreshCw
                    }
                  />


                  <ResumenCard
                    titulo="Primera versión"
                    valor={
                      resumen.primeraVersionId
                        ? `#${resumen.primeraVersionId}`
                        : '—'
                    }
                    icono={
                      CalendarDays
                    }
                  />


                  <ResumenCard
                    titulo="Versión actual"
                    valor={
                      resumen.versionActualId
                        ? `#${resumen.versionActualId}`
                        : '—'
                    }
                    icono={
                      CheckCircle2
                    }
                  />

                </div>


                {/* ========================================= */}
                {/* VERSIONES DOCUMENTALES */}
                {/* ========================================= */}

                <section>

                  <div
                    className="
                      mb-4
                    "
                  >

                    <h3
                      className="
                        text-base
                        font-bold
                        text-slate-900
                      "
                    >
                      Versiones documentales
                    </h3>


                    <p
                      className="
                        mt-1
                        text-sm
                        text-slate-500
                      "
                    >
                      Evolución cronológica del documento.
                    </p>

                  </div>


                  {
                    versiones.length ===
                    0 ? (

                      <div
                        className="
                          rounded-xl
                          border
                          border-slate-200
                          bg-slate-50
                          px-4
                          py-6
                          text-center
                          text-sm
                          text-slate-500
                        "
                      >
                        No existen versiones registradas.
                      </div>

                    ) : (

                      <div
                        className="
                          relative
                          space-y-5
                        "
                      >

                        {
                          versiones.map(
                            (
                              version,
                              indice
                            ) => (

                              <div
                                key={
                                  version.id
                                }
                                className="
                                  relative
                                  rounded-2xl
                                  border
                                  border-slate-200
                                  bg-white
                                  p-5
                                  shadow-sm
                                "
                              >

                                <div
                                  className="
                                    flex
                                    flex-col
                                    gap-4
                                    lg:flex-row
                                    lg:items-start
                                    lg:justify-between
                                  "
                                >

                                  <div
                                    className="
                                      flex
                                      gap-4
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
                                        rounded-full
                                        bg-indigo-100
                                        text-sm
                                        font-bold
                                        text-indigo-700
                                      "
                                    >
                                      {
                                        version
                                          .numeroVersion ||
                                        indice + 1
                                      }
                                    </div>


                                    <div>

                                      <div
                                        className="
                                          flex
                                          flex-wrap
                                          items-center
                                          gap-2
                                        "
                                      >

                                        <p
                                          className="
                                            font-bold
                                            text-slate-900
                                          "
                                        >
                                          {
                                            version
                                              .codigoInterno ||
                                            'Sin código'
                                          }
                                        </p>


                                        <span
                                          className={`
                                            rounded-full
                                            px-2.5
                                            py-1
                                            text-xs
                                            font-semibold
                                            ${claseEstado(
                                              version.estado
                                            )}
                                          `}
                                        >
                                          {
                                            textoEstado(
                                              version.estado
                                            )
                                          }
                                        </span>


                                        {
                                          version
                                            .condicionRegistro && (

                                            <span
                                              className="
                                                rounded-full
                                                bg-slate-100
                                                px-2.5
                                                py-1
                                                text-xs
                                                font-semibold
                                                text-slate-600
                                              "
                                            >
                                              {
                                                version
                                                  .condicionRegistro
                                              }
                                            </span>

                                          )
                                        }

                                      </div>


                                      <p
                                        className="
                                          mt-1
                                          text-sm
                                          text-slate-600
                                        "
                                      >
                                        Documento: {
                                          version
                                            .numeroDocumento ||
                                          '—'
                                        }
                                      </p>


                                      <p
                                        className="
                                          mt-1
                                          text-xs
                                          text-slate-500
                                        "
                                      >
                                        {
                                          version
                                            ?.tienda
                                            ?.nombre ||
                                          '—'
                                        }
                                        {' · '}
                                        {
                                          version
                                            ?.tipoDocumento
                                            ?.nombre ||
                                          '—'
                                        }
                                      </p>

                                    </div>

                                  </div>


                                  <div
                                    className="
                                      text-sm
                                      text-slate-600
                                      lg:text-right
                                    "
                                  >

                                    <p>
                                      Emisión:{' '}
                                      <strong>
                                        {
                                          formatearFecha(
                                            version.fechaEmision
                                          )
                                        }
                                      </strong>
                                    </p>


                                    <p
                                      className="
                                        mt-1
                                      "
                                    >
                                      Vencimiento:{' '}
                                      <strong>
                                        {
                                          formatearFecha(
                                            version.fechaVencimiento
                                          )
                                        }
                                      </strong>
                                    </p>

                                  </div>

                                </div>


                                <div
                                  className="
                                    mt-4
                                    grid
                                    gap-4
                                    border-t
                                    border-slate-100
                                    pt-4
                                    md:grid-cols-3
                                  "
                                >

                                  <Dato
                                    titulo="Entidad emisora"
                                    valor={
                                      version
                                        ?.entidadEmisora
                                        ?.nombre ||
                                      '—'
                                    }
                                  />


                                  <Dato
                                    titulo="Responsable"
                                    valor={
                                      version
                                        ?.responsable
                                        ?.nombreCompleto ||
                                      '—'
                                    }
                                  />


                                  <Dato
                                    titulo="Expediente"
                                    valor={
                                      version
                                        .numeroExpediente ||
                                      '—'
                                    }
                                  />

                                </div>

                              </div>

                            )
                          )
                        }

                      </div>

                    )
                  }

                </section>


                {/* ========================================= */}
                {/* CICLOS DE RENOVACIÓN */}
                {/* ========================================= */}

                <section>

                  <div
                    className="
                      mb-4
                    "
                  >

                    <h3
                      className="
                        text-base
                        font-bold
                        text-slate-900
                      "
                    >
                      Ciclos de renovación
                    </h3>


                    <p
                      className="
                        mt-1
                        text-sm
                        text-slate-500
                      "
                    >
                      Procesos que conectan una versión con la siguiente.
                    </p>

                  </div>


                  {
                    renovaciones.length ===
                    0 ? (

                      <div
                        className="
                          rounded-xl
                          border
                          border-slate-200
                          bg-slate-50
                          px-4
                          py-6
                          text-center
                          text-sm
                          text-slate-500
                        "
                      >
                        El documento todavía no tiene procesos de renovación.
                      </div>

                    ) : (

                      <div
                        className="
                          space-y-4
                        "
                      >

                        {
                          renovaciones.map(
                            (
                              renovacion
                            ) => (

                              <div
                                key={
                                  renovacion.id
                                }
                                className="
                                  rounded-2xl
                                  border
                                  border-slate-200
                                  bg-slate-50
                                  p-5
                                "
                              >

                                <div
                                  className="
                                    flex
                                    flex-col
                                    gap-4
                                    lg:flex-row
                                    lg:items-center
                                    lg:justify-between
                                  "
                                >

                                  <div>

                                    <div
                                      className="
                                        flex
                                        flex-wrap
                                        items-center
                                        gap-2
                                      "
                                    >

                                      <RefreshCw
                                        size={17}
                                        className="
                                          text-indigo-600
                                        "
                                      />


                                      <span
                                        className="
                                          font-semibold
                                          text-slate-900
                                        "
                                      >
                                        Renovación #{renovacion.id}
                                      </span>


                                      <span
                                        className={`
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

                                    </div>


                                    <p
                                      className="
                                        mt-2
                                        text-sm
                                        text-slate-600
                                      "
                                    >
                                      {
                                        renovacion
                                          ?.documentoAnterior
                                          ?.codigoInterno ||
                                        '—'
                                      }

                                      {' → '}

                                      {
                                        renovacion
                                          ?.documentoRenovado
                                          ?.codigoInterno ||
                                        'Pendiente'
                                      }
                                    </p>

                                  </div>


                                  <div
                                    className="
                                      flex
                                      items-center
                                      gap-2
                                      text-sm
                                      text-slate-600
                                    "
                                  >

                                    <Clock3
                                      size={17}
                                      className="
                                        text-slate-400
                                      "
                                    />

                                    {
                                      Number.isFinite(
                                        Number(
                                          renovacion
                                            .duracionDias
                                        )
                                      )
                                        ? `${renovacion.duracionDias} días`
                                        : '—'
                                    }

                                  </div>

                                </div>


                                <div
                                  className="
                                    mt-4
                                    grid
                                    gap-4
                                    border-t
                                    border-slate-200
                                    pt-4
                                    md:grid-cols-4
                                  "
                                >

                                  <Dato
                                    titulo="Inicio"
                                    valor={
                                      formatearFecha(
                                        renovacion
                                          .fechaInicio
                                      )
                                    }
                                  />


                                  <Dato
                                    titulo="Finalización"
                                    valor={
                                      formatearFecha(
                                        renovacion
                                          .fechaFinalizacion
                                      )
                                    }
                                  />


                                  <Dato
                                    titulo="Responsable"
                                    valor={
                                      renovacion
                                        ?.responsable
                                        ?.nombreCompleto ||
                                      '—'
                                    }
                                  />


                                  <Dato
                                    titulo="Trámite"
                                    valor={
                                      renovacion
                                        ?.tramite
                                        ?.numeroExpediente ||
                                      'Sin trámite'
                                    }
                                  />

                                </div>


                                {
                                  renovacion
                                    .observaciones && (

                                    <div
                                      className="
                                        mt-4
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-white
                                        px-4
                                        py-3
                                      "
                                    >

                                      <p
                                        className="
                                          text-xs
                                          font-semibold
                                          uppercase
                                          tracking-wide
                                          text-slate-500
                                        "
                                      >
                                        Observaciones
                                      </p>


                                      <p
                                        className="
                                          mt-1
                                          text-sm
                                          text-slate-700
                                        "
                                      >
                                        {
                                          renovacion
                                            .observaciones
                                        }
                                      </p>

                                    </div>

                                  )
                                }

                              </div>

                            )
                          )
                        }

                      </div>

                    )
                  }

                </section>

              </div>

            )
          }

        </div>


        {/* ================================================= */}
        {/* PIE */}
        {/* ================================================= */}

        <div
          className="
            flex
            justify-end
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
            "
          >
            Cerrar
          </button>

        </div>

      </div>

    </div>
  );
}


// ============================================================
// RESUMEN
// ============================================================

function ResumenCard({
  titulo,
  valor,
  icono: Icono
}) {

  return (

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
          flex
          items-center
          gap-3
        "
      >

        <div
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            bg-indigo-100
            text-indigo-700
          "
        >

          <Icono
            size={18}
          />

        </div>


        <div>

          <p
            className="
              text-xs
              font-medium
              text-slate-500
            "
          >
            {titulo}
          </p>


          <p
            className="
              mt-0.5
              font-bold
              text-slate-900
            "
          >
            {valor}
          </p>

        </div>

      </div>

    </div>
  );
}


// ============================================================
// DATO
// ============================================================

function Dato({
  titulo,
  valor
}) {

  return (

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
          mt-1
          text-sm
          font-medium
          text-slate-700
        "
      >
        {valor}
      </p>

    </div>
  );
}


export default RenovacionHistorialModal;