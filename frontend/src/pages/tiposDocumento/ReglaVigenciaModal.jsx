import {

  useEffect,

  useState

} from 'react';



import {

  AlertTriangle,

  CalendarClock,

  Clock3,

  RefreshCw,

  Save,

  ShieldAlert,

  X

} from 'lucide-react';





function ReglaVigenciaModal({

  abierto,

  tipoDocumento = null,

  reglaActual = null,

  cargando = false,

  error = '',

  onCerrar,

  onGuardar

}) {

  const [

    tipoVigencia,

    setTipoVigencia

  ] = useState('DETERMINADA');





  const [

    duracionValor,

    setDuracionValor

  ] = useState('');





  const [

    duracionUnidad,

    setDuracionUnidad

  ] = useState('MESES');





  const [

    requiereRenovacion,

    setRequiereRenovacion

  ] = useState(true);





  const [

    umbralPorVencerDias,

    setUmbralPorVencerDias

  ] = useState('30');





  const [

    umbralCriticoDias,

    setUmbralCriticoDias

  ] = useState('7');





  // ===================================================
  // CARGAR CONFIGURACIÓN ACTUAL
  // ===================================================
  useEffect(() => {

    if (!abierto) {

      return;

    }





    if (reglaActual) {

      setTipoVigencia(

        reglaActual.tipoVigencia ||

        'DETERMINADA'

      );





      setDuracionValor(

        reglaActual.duracionValor !== null &&

        reglaActual.duracionValor !== undefined

          ? String(

              reglaActual.duracionValor

            )

          : ''

      );





      setDuracionUnidad(

        reglaActual.duracionUnidad ||

        'MESES'

      );





      setRequiereRenovacion(

        Boolean(

          reglaActual.requiereRenovacion

        )

      );





      setUmbralPorVencerDias(

        reglaActual.umbralPorVencerDias !== null &&

        reglaActual.umbralPorVencerDias !== undefined

          ? String(

              reglaActual.umbralPorVencerDias

            )

          : ''

      );





      setUmbralCriticoDias(

        reglaActual.umbralCriticoDias !== null &&

        reglaActual.umbralCriticoDias !== undefined

          ? String(

              reglaActual.umbralCriticoDias

            )

          : ''

      );



      return;

    }





    // =================================================
    // CONFIGURACIÓN INICIAL
    // =================================================
    setTipoVigencia(

      'DETERMINADA'

    );



    setDuracionValor(

      ''

    );



    setDuracionUnidad(

      'MESES'

    );



    setRequiereRenovacion(

      true

    );



    setUmbralPorVencerDias(

      '30'

    );



    setUmbralCriticoDias(

      '7'

    );



  }, [

    abierto,

    reglaActual

  ]);





  // ===================================================
  // CAMBIAR TIPO DE VIGENCIA
  // ===================================================
  function cambiarTipoVigencia(

    nuevoTipo

  ) {

    setTipoVigencia(

      nuevoTipo

    );





    // ===============================================
    // DETERMINADA
    // ===============================================
    if (

      nuevoTipo ===

      'DETERMINADA'

    ) {

      setDuracionUnidad(

        'MESES'

      );





      if (

        umbralPorVencerDias === ''

      ) {

        setUmbralPorVencerDias(

          '30'

        );

      }





      if (

        umbralCriticoDias === ''

      ) {

        setUmbralCriticoDias(

          '7'

        );

      }



      return;

    }





    // ===============================================
    // TEMPORAL
    // ===============================================
    if (

      nuevoTipo ===

      'TEMPORAL'

    ) {

      setDuracionValor(

        ''

      );



      setDuracionUnidad(

        ''

      );





      if (

        umbralPorVencerDias === ''

      ) {

        setUmbralPorVencerDias(

          '30'

        );

      }





      if (

        umbralCriticoDias === ''

      ) {

        setUmbralCriticoDias(

          '7'

        );

      }



      return;

    }





    // ===============================================
    // INDETERMINADA
    // ===============================================
    if (

      nuevoTipo ===

      'INDETERMINADA'

    ) {

      setDuracionValor(

        ''

      );



      setDuracionUnidad(

        ''

      );



      setRequiereRenovacion(

        false

      );



      setUmbralPorVencerDias(

        ''

      );



      setUmbralCriticoDias(

        ''

      );

    }

  }





  // ===================================================
  // SOLO NÚMEROS ENTEROS
  // ===================================================
  function soloNumeros(

    valor

  ) {

    return valor.replace(

      /\D/g,

      ''

    );

  }





  // ===================================================
  // GUARDAR
  // ===================================================
  function handleSubmit(

    event

  ) {

    event.preventDefault();





    const datos = {

      tipoVigencia,



      duracionValor:

        tipoVigencia === 'DETERMINADA'

          ? Number(

              duracionValor

            )

          : null,



      duracionUnidad:

        tipoVigencia === 'DETERMINADA'

          ? duracionUnidad

          : null,



      requiereRenovacion:

        tipoVigencia === 'INDETERMINADA'

          ? false

          : requiereRenovacion,



      umbralPorVencerDias:

        tipoVigencia === 'INDETERMINADA'

          ? null

          : Number(

              umbralPorVencerDias

            ),



      umbralCriticoDias:

        tipoVigencia === 'INDETERMINADA'

          ? null

          : Number(

              umbralCriticoDias

            )

    };





    onGuardar(

      datos

    );

  }





  if (!abierto) {

    return null;

  }





  const esDeterminada =

    tipoVigencia ===

    'DETERMINADA';





  const esIndeterminada =

    tipoVigencia ===

    'INDETERMINADA';






  return (

    <div
      className="
        fixed
        inset-0
        z-[110]
        flex
        items-center
        justify-center
        p-4
      "
    >
      <button
        type="button"
        aria-label="Cerrar configuración"
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
          max-w-4xl
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
                <CalendarClock size={24} />
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
                  Vigencia y alertas
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Configurar regla
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


        <form
          onSubmit={handleSubmit}
          className="
            max-h-[80vh]
            overflow-y-auto
            px-6
            py-6
            sm:px-7
          "
        >

          <div>
            <div className="mb-3">
              <h3 className="text-sm font-bold text-slate-800">
                Tipo de vigencia
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Selecciona cómo se determina el vencimiento de este tipo documental.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">

              <button
                type="button"
                onClick={() =>
                  cambiarTipoVigencia(
                    'DETERMINADA'
                  )
                }
                className={`
                  rounded-2xl
                  border
                  p-4
                  text-left
                  transition
                  ${
                    tipoVigencia === 'DETERMINADA'
                      ? 'border-indigo-500 bg-indigo-50 ring-4 ring-indigo-500/10'
                      : 'border-slate-200 bg-white hover:border-indigo-200'
                  }
                `}
              >
                <Clock3
                  size={20}
                  className={
                    tipoVigencia === 'DETERMINADA'
                      ? 'text-indigo-600'
                      : 'text-slate-400'
                  }
                />

                <p className="mt-3 text-sm font-bold text-slate-800">
                  Determinada
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Usa una duración fija configurada en días o meses.
                </p>
              </button>


              <button
                type="button"
                onClick={() =>
                  cambiarTipoVigencia(
                    'TEMPORAL'
                  )
                }
                className={`
                  rounded-2xl
                  border
                  p-4
                  text-left
                  transition
                  ${
                    tipoVigencia === 'TEMPORAL'
                      ? 'border-violet-500 bg-violet-50 ring-4 ring-violet-500/10'
                      : 'border-slate-200 bg-white hover:border-violet-200'
                  }
                `}
              >
                <CalendarClock
                  size={20}
                  className={
                    tipoVigencia === 'TEMPORAL'
                      ? 'text-violet-600'
                      : 'text-slate-400'
                  }
                />

                <p className="mt-3 text-sm font-bold text-slate-800">
                  Temporal
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  El vencimiento se registra de forma específica en cada documento.
                </p>
              </button>


              <button
                type="button"
                onClick={() =>
                  cambiarTipoVigencia(
                    'INDETERMINADA'
                  )
                }
                className={`
                  rounded-2xl
                  border
                  p-4
                  text-left
                  transition
                  ${
                    tipoVigencia === 'INDETERMINADA'
                      ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-500/10'
                      : 'border-slate-200 bg-white hover:border-emerald-200'
                  }
                `}
              >
                <RefreshCw
                  size={20}
                  className={
                    tipoVigencia === 'INDETERMINADA'
                      ? 'text-emerald-600'
                      : 'text-slate-400'
                  }
                />

                <p className="mt-3 text-sm font-bold text-slate-800">
                  Indeterminada
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  No genera vencimiento automático ni umbrales de alerta.
                </p>
              </button>

            </div>
          </div>


          {
            esDeterminada && (
              <section
                className="
                  mt-6
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    border-b
                    border-slate-200
                    bg-white
                    px-5
                    py-4
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
                    <Clock3 size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Duración de la vigencia
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Define cuánto tiempo será válido un documento nuevo.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 p-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="duracion-valor"
                      className="
                        mb-2
                        block
                        text-sm
                        font-semibold
                        text-slate-700
                      "
                    >
                      Cantidad
                    </label>

                    <input
                      id="duracion-valor"
                      type="text"
                      inputMode="numeric"
                      value={duracionValor}
                      onChange={(event) =>
                        setDuracionValor(
                          soloNumeros(
                            event.target.value
                          )
                        )
                      }
                      placeholder="Ej. 12"
                      disabled={cargando}
                      className="
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
                        focus:ring-indigo-50
                      "
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="duracion-unidad"
                      className="
                        mb-2
                        block
                        text-sm
                        font-semibold
                        text-slate-700
                      "
                    >
                      Unidad
                    </label>

                    <select
                      id="duracion-unidad"
                      value={duracionUnidad}
                      onChange={(event) =>
                        setDuracionUnidad(
                          event.target.value
                        )
                      }
                      disabled={cargando}
                      className="
                        h-12
                        w-full
                        rounded-xl
                        border
                        border-slate-300
                        bg-white
                        px-4
                        text-sm
                        font-medium
                        text-slate-700
                        outline-none
                        transition
                        focus:border-indigo-500
                        focus:ring-4
                        focus:ring-indigo-50
                      "
                    >
                      <option value="DIAS">
                        Días
                      </option>

                      <option value="MESES">
                        Meses
                      </option>
                    </select>
                  </div>
                </div>
              </section>
            )
          }


          <section
            className="
              mt-6
              rounded-2xl
              border
              border-slate-200
              p-5
            "
          >
            <div className="flex items-start justify-between gap-5">

              <div className="flex items-start gap-3">
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
                  <p className="text-sm font-bold text-slate-800">
                    Requiere renovación
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Indica si el tipo documental entra al ciclo de renovación.
                  </p>

                  {
                    esIndeterminada && (
                      <p className="mt-2 text-xs font-medium text-amber-600">
                        Una vigencia indeterminada no requiere renovación.
                      </p>
                    )
                  }
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={requiereRenovacion}
                disabled={
                  cargando ||
                  esIndeterminada
                }
                onClick={() =>
                  setRequiereRenovacion(
                    !requiereRenovacion
                  )
                }
                className={`
                  relative
                  mt-1
                  h-7
                  w-12
                  shrink-0
                  rounded-full
                  transition
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  ${
                    requiereRenovacion
                      ? 'bg-indigo-600'
                      : 'bg-slate-300'
                  }
                `}
              >
                <span
                  className={`
                    absolute
                    top-1
                    h-5
                    w-5
                    rounded-full
                    bg-white
                    shadow-sm
                    transition-all
                    ${
                      requiereRenovacion
                        ? 'left-6'
                        : 'left-1'
                    }
                  `}
                />
              </button>

            </div>
          </section>


          {
            !esIndeterminada && (
              <section className="mt-6">

                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-800">
                    Umbrales de alerta
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Define cuándo el documento pasa a Por vencer y cuándo entra
                    al nivel Crítico.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">

                  <div
                    className="
                      rounded-2xl
                      border
                      border-amber-200
                      bg-amber-50/60
                      p-5
                    "
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle
                        size={20}
                        className="text-amber-600"
                      />

                      <div>
                        <p className="text-sm font-bold text-amber-800">
                          Por vencer
                        </p>

                        <p className="text-xs text-amber-700/70">
                          Primer nivel preventivo
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="umbral-por-vencer"
                        className="
                          mb-2
                          block
                          text-xs
                          font-semibold
                          text-amber-800
                        "
                      >
                        Días antes del vencimiento
                      </label>

                      <input
                        id="umbral-por-vencer"
                        type="text"
                        inputMode="numeric"
                        value={umbralPorVencerDias}
                        onChange={(event) =>
                          setUmbralPorVencerDias(
                            soloNumeros(
                              event.target.value
                            )
                          )
                        }
                        placeholder="Ej. 30"
                        disabled={cargando}
                        className="
                          h-12
                          w-full
                          rounded-xl
                          border
                          border-amber-200
                          bg-white
                          px-4
                          text-sm
                          text-slate-800
                          outline-none
                          transition
                          focus:border-amber-500
                          focus:ring-4
                          focus:ring-amber-100
                        "
                      />
                    </div>
                  </div>


                  <div
                    className="
                      rounded-2xl
                      border
                      border-red-200
                      bg-red-50/60
                      p-5
                    "
                  >
                    <div className="flex items-center gap-3">
                      <ShieldAlert
                        size={20}
                        className="text-red-600"
                      />

                      <div>
                        <p className="text-sm font-bold text-red-800">
                          Crítico
                        </p>

                        <p className="text-xs text-red-700/70">
                          Nivel de mayor urgencia
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="umbral-critico"
                        className="
                          mb-2
                          block
                          text-xs
                          font-semibold
                          text-red-800
                        "
                      >
                        Días antes del vencimiento
                      </label>

                      <input
                        id="umbral-critico"
                        type="text"
                        inputMode="numeric"
                        value={umbralCriticoDias}
                        onChange={(event) =>
                          setUmbralCriticoDias(
                            soloNumeros(
                              event.target.value
                            )
                          )
                        }
                        placeholder="Ej. 7"
                        disabled={cargando}
                        className="
                          h-12
                          w-full
                          rounded-xl
                          border
                          border-red-200
                          bg-white
                          px-4
                          text-sm
                          text-slate-800
                          outline-none
                          transition
                          focus:border-red-500
                          focus:ring-4
                          focus:ring-red-100
                        "
                      />
                    </div>
                  </div>

                </div>

                <div
                  className="
                    mt-3
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    py-3
                  "
                >
                  <p className="text-xs leading-5 text-slate-500">
                    Regla de consistencia:
                    {' '}
                    <strong className="text-slate-700">
                      Crítico debe ser menor que Por vencer.
                    </strong>
                  </p>
                </div>
              </section>
            )
          }


          {
            esIndeterminada && (
              <div
                className="
                  mt-6
                  rounded-2xl
                  border
                  border-emerald-200
                  bg-emerald-50
                  p-5
                "
              >
                <div className="flex gap-3">
                  <CalendarClock
                    size={21}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <div>
                    <p className="text-sm font-bold text-emerald-800">
                      Vigencia indeterminada
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-700">
                      Este tipo documental no tendrá duración fija, fecha de
                      vencimiento automática, renovación ni umbrales de alerta.
                    </p>
                  </div>
                </div>
              </div>
            )
          }


          {
            reglaActual && (
              <div
                className="
                  mt-6
                  rounded-2xl
                  border
                  border-violet-200
                  bg-violet-50
                  px-4
                  py-4
                "
              >
                <p className="text-xs font-medium leading-5 text-violet-700">
                  Configuración actual:
                  {' '}
                  <strong>
                    versión {reglaActual.version}
                  </strong>
                  .
                  {' '}
                  Al guardar, esta versión se conservará en el historial y
                  CERTIIA creará una nueva versión como configuración vigente.
                </p>
              </div>
            )
          }


          {
            error && (
              <div
                className="
                  mt-6
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


          <div
            className="
              mt-7
              flex
              flex-col-reverse
              gap-3
              border-t
              border-slate-100
              pt-6
              sm:flex-row
              sm:justify-end
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
              Cancelar
            </button>

            <button
              type="submit"
              disabled={cargando}
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
                font-semibold
                text-white
                shadow-lg
                shadow-indigo-600/20
                transition
                hover:bg-indigo-700
                disabled:opacity-60
              "
            >
              {
                cargando
                  ? (
                    <>
                      <span
                        className="
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-white/30
                          border-t-white
                        "
                      />
                      Guardando...
                    </>
                  )
                  : (
                    <>
                      <Save size={18} />
                      {
                        reglaActual
                          ? 'Crear nueva versión'
                          : 'Guardar configuración'
                      }
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


export default ReglaVigenciaModal;
