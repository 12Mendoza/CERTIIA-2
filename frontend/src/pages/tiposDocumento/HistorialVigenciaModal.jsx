import {

  CalendarClock,

  Clock3,

  History,

  RefreshCw,

  ShieldAlert,

  X

} from 'lucide-react';





function HistorialVigenciaModal({

  abierto,

  tipoDocumento = null,

  historial = [],

  cargando = false,

  error = '',

  onCerrar

}) {

  if (!abierto) {

    return null;

  }





  // ===================================================
  // ETIQUETA TIPO DE VIGENCIA
  // ===================================================
  function etiquetaVigencia(

    tipo

  ) {

    switch (tipo) {

      case 'DETERMINADA':

        return 'Determinada';



      case 'TEMPORAL':

        return 'Temporal';



      case 'INDETERMINADA':

        return 'Indeterminada';



      default:

        return tipo || 'Sin definir';

    }

  }





  // ===================================================
  // DURACIÓN
  // ===================================================
  function textoDuracion(

    regla

  ) {

    if (

      regla.tipoVigencia ===

      'DETERMINADA'

    ) {

      const unidad =

        regla.duracionUnidad === 'DIAS'

          ? 'día(s)'

          : 'mes(es)';





      return `${regla.duracionValor} ${unidad}`;

    }





    if (

      regla.tipoVigencia ===

      'TEMPORAL'

    ) {

      return 'Definida por documento';

    }





    return 'Sin vencimiento';

  }





  // ===================================================
  // FECHA
  // ===================================================
  function formatearFecha(

    valor

  ) {

    if (!valor) {

      return 'Actual';

    }





    const fecha =

      new Date(valor);





    if (

      Number.isNaN(

        fecha.getTime()

      )

    ) {

      return valor;

    }





    return fecha.toLocaleString(

      'es-PE',

      {

        dateStyle: 'medium',

        timeStyle: 'short'

      }

    );

  }






  return (

    <div
      className="
        fixed
        inset-0
        z-[120]
        flex
        items-center
        justify-center
        p-4
      "
    >
      <button
        type="button"
        aria-label="Cerrar historial"
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


      <div
        className="
          relative
          z-10
          w-full
          max-w-5xl
          overflow-hidden
          rounded-[28px]
          border
          border-slate-200
          bg-white
          shadow-2xl
        "
      >

        <div
          className="
            relative
            overflow-hidden
            bg-gradient-to-br
            from-slate-950
            via-slate-900
            to-violet-950
            px-6
            py-6
            text-white
            sm:px-7
          "
        >
          <div
            className="
              absolute
              -right-20
              -top-20
              h-48
              w-48
              rounded-full
              bg-violet-500/20
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
            <div className="flex items-center gap-4">
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
                  text-violet-200
                "
              >
                <History size={23} />
              </div>

              <div>
                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-violet-300
                  "
                >
                  Trazabilidad
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Historial de vigencia
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {
                    tipoDocumento?.nombre ||
                    'Tipo de documento'
                  }
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onCerrar}
              disabled={cargando}
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-white/10
                text-slate-300
                transition
                hover:bg-white/20
                hover:text-white
                disabled:opacity-50
              "
            >
              <X size={20} />
            </button>
          </div>
        </div>


        <div
          className="
            max-h-[78vh]
            overflow-y-auto
            px-6
            py-6
            sm:px-7
          "
        >

          {
            cargando && (
              <div
                className="
                  flex
                  min-h-[300px]
                  items-center
                  justify-center
                "
              >
                <div className="flex flex-col items-center gap-4">
                  <div
                    className="
                      h-10
                      w-10
                      animate-spin
                      rounded-full
                      border-4
                      border-slate-200
                      border-t-violet-600
                    "
                  />

                  <p className="text-sm font-medium text-slate-500">
                    Cargando historial...
                  </p>
                </div>
              </div>
            )
          }


          {
            !cargando &&
            error && (
              <div
                className="
                  rounded-xl
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
            !cargando &&
            !error &&
            historial.length === 0 && (
              <div className="py-16 text-center">
                <div
                  className="
                    mx-auto
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
                  <History size={30} />
                </div>

                <p className="mt-4 text-sm font-bold text-slate-700">
                  No hay configuraciones registradas
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Todavía no se ha configurado la vigencia de este tipo documental.
                </p>
              </div>
            )
          }


          {
            !cargando &&
            !error &&
            historial.length > 0 && (
              <div className="space-y-4">

                <div
                  className="
                    rounded-2xl
                    border
                    border-violet-100
                    bg-violet-50
                    px-5
                    py-4
                  "
                >
                  <p className="text-xs leading-5 text-violet-700">
                    Cada cambio de vigencia crea una nueva versión. Las versiones
                    anteriores se conservan para mantener la trazabilidad de los
                    documentos registrados bajo cada configuración.
                  </p>
                </div>


                {
                  historial.map(
                    (regla) => (
                      <article
                        key={regla.id}
                        className={`
                          overflow-hidden
                          rounded-2xl
                          border
                          transition
                          ${
                            regla.esActual
                              ? 'border-violet-300 bg-violet-50/40 shadow-sm'
                              : 'border-slate-200 bg-white'
                          }
                        `}
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
                          <div className="flex items-center gap-3">
                            <div
                              className={`
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-xl
                                ${
                                  regla.esActual
                                    ? 'bg-violet-100 text-violet-700'
                                    : 'bg-slate-100 text-slate-500'
                                }
                              `}
                            >
                              <History size={19} />
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-bold text-slate-900">
                                  Versión {regla.version}
                                </h3>

                                {
                                  regla.esActual && (
                                    <span
                                      className="
                                        rounded-full
                                        bg-violet-100
                                        px-2.5
                                        py-1
                                        text-[11px]
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-violet-700
                                      "
                                    >
                                      Actual
                                    </span>
                                  )
                                }
                              </div>

                              <p className="mt-1 text-xs text-slate-400">
                                Registrada:
                                {' '}
                                {
                                  formatearFecha(
                                    regla.fechaCreacion
                                  )
                                }
                              </p>
                            </div>
                          </div>

                          <span
                            className="
                              inline-flex
                              w-fit
                              rounded-full
                              border
                              border-indigo-100
                              bg-indigo-50
                              px-3
                              py-1
                              text-xs
                              font-bold
                              text-indigo-700
                            "
                          >
                            {
                              etiquetaVigencia(
                                regla.tipoVigencia
                              )
                            }
                          </span>
                        </div>


                        <div
                          className="
                            grid
                            gap-4
                            p-5
                            sm:grid-cols-2
                            lg:grid-cols-4
                          "
                        >
                          <DatoHistorial
                            icono={Clock3}
                            titulo="Duración"
                            valor={
                              textoDuracion(
                                regla
                              )
                            }
                            tono="slate"
                          />

                          <DatoHistorial
                            icono={RefreshCw}
                            titulo="Renovación"
                            valor={
                              regla.requiereRenovacion
                                ? 'Sí requiere'
                                : 'No requiere'
                            }
                            tono="indigo"
                          />

                          <DatoHistorial
                            icono={CalendarClock}
                            titulo="Por vencer"
                            valor={
                              regla.umbralPorVencerDias !== null &&
                              regla.umbralPorVencerDias !== undefined
                                ? `${regla.umbralPorVencerDias} días`
                                : 'No aplica'
                            }
                            tono="amber"
                          />

                          <DatoHistorial
                            icono={ShieldAlert}
                            titulo="Crítico"
                            valor={
                              regla.umbralCriticoDias !== null &&
                              regla.umbralCriticoDias !== undefined
                                ? `${regla.umbralCriticoDias} días`
                                : 'No aplica'
                            }
                            tono="red"
                          />
                        </div>


                        <div
                          className="
                            grid
                            gap-3
                            border-t
                            border-slate-100
                            bg-slate-50/70
                            px-5
                            py-4
                            text-xs
                            sm:grid-cols-2
                          "
                        >
                          <div>
                            <span className="font-semibold text-slate-500">
                              Vigente desde:
                            </span>

                            <span className="ml-2 text-slate-700">
                              {
                                formatearFecha(
                                  regla.vigenteDesde
                                )
                              }
                            </span>
                          </div>

                          <div>
                            <span className="font-semibold text-slate-500">
                              Vigente hasta:
                            </span>

                            <span className="ml-2 text-slate-700">
                              {
                                regla.esActual
                                  ? 'Actual'
                                  : formatearFecha(
                                      regla.vigenteHasta
                                    )
                              }
                            </span>
                          </div>
                        </div>
                      </article>
                    )
                  )
                }
              </div>
            )
          }


          <div
            className="
              mt-6
              flex
              justify-end
              border-t
              border-slate-100
              pt-5
            "
          >
            <button
              type="button"
              onClick={onCerrar}
              disabled={cargando}
              className="
                inline-flex
                h-11
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                px-5
                text-sm
                font-semibold
                text-slate-600
                transition
                hover:bg-slate-50
                disabled:opacity-60
              "
            >
              Cerrar
            </button>
          </div>

        </div>

      </div>

    </div>

  );

}


function DatoHistorial({
  icono: Icono,
  titulo,
  valor,
  tono
}) {

  const estilos = {
    slate:
      'bg-slate-100 text-slate-600',
    indigo:
      'bg-indigo-50 text-indigo-600',
    amber:
      'bg-amber-50 text-amber-600',
    red:
      'bg-red-50 text-red-600'
  };

  return (
    <div
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        p-4
      "
    >
      <div className="flex items-center gap-2">
        <div
          className={`
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            ${estilos[tono]}
          `}
        >
          <Icono size={15} />
        </div>

        <p
          className="
            text-[11px]
            font-bold
            uppercase
            tracking-wider
            text-slate-400
          "
        >
          {titulo}
        </p>
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-700">
        {valor}
      </p>
    </div>
  );

}


export default HistorialVigenciaModal;
