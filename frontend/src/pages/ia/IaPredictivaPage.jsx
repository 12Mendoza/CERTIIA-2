import {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Database,
  ExternalLink,
  Gauge,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react';

import {
  useNavigate
} from 'react-router-dom';

import {
  api
} from '../../services/api.js';

import {
  useAuth
} from '../../context/AuthContext.jsx';


function porcentaje(valor) {
  if (
    valor === null ||
    valor === undefined
  ) {
    return 'N/D';
  }

  return `${(
    Number(valor) * 100
  ).toFixed(1)}%`;
}


function porcentajeNumerico(valor) {
  const numero =
    Number(valor);

  if (
    !Number.isFinite(numero)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      100,
      numero * 100
    )
  );
}


function fecha(valor) {
  if (!valor) {
    return 'Sin fecha';
  }

  const fechaValor =
    new Date(valor);

  if (
    Number.isNaN(
      fechaValor.getTime()
    )
  ) {
    return String(valor);
  }

  return fechaValor.toLocaleString(
    'es-PE',
    {
      dateStyle: 'short',
      timeStyle: 'short'
    }
  );
}


function nivelClase(nivel) {
  if (nivel === 'ALTO') {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  if (nivel === 'MEDIO') {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  return 'border-emerald-200 bg-emerald-50 text-emerald-700';
}


function IaPredictivaPage() {

  const navigate =
    useNavigate();

  const {
    usuario
  } = useAuth();

  const permisos =
    usuario?.permisos ||
    [];


  const puedeEntrenar =
    permisos.includes(
      'ia.entrenar'
    );

  const puedeActivar =
    permisos.includes(
      'ia.activar'
    );


  const [
    tab,
    setTab
  ] = useState(
    'PREDICCION'
  );

  const [
    casos,
    setCasos
  ] = useState([]);

  const [
    casoSeleccionado,
    setCasoSeleccionado
  ] = useState('');

  const [
    prediccion,
    setPrediccion
  ] = useState(null);

  const [
    predicciones,
    setPredicciones
  ] = useState([]);

  const [
    resultados,
    setResultados
  ] = useState([]);

  const [
    modelos,
    setModelos
  ] = useState([]);

  const [
    resumen,
    setResumen
  ] = useState(null);

  const [
    cargando,
    setCargando
  ] = useState(true);

  const [
    procesando,
    setProcesando
  ] = useState(false);

  const [
    error,
    setError
  ] = useState('');

  const [
    mensaje,
    setMensaje
  ] = useState('');


  const caso =
    useMemo(
      () =>
        casos.find(
          (item) =>
            `${item.tipo_objeto}:${item.objeto_id}` ===
            casoSeleccionado
        ) ||
        null,
      [
        casos,
        casoSeleccionado
      ]
    );


  async function cargarTodo() {

    try {

      setError('');

      setCargando(true);


      const [
        rResumen,
        rCasos,
        rPred,
        rResultados,
        rModelos
      ] = await Promise.all([

        api.get(
          '/ia/resumen'
        ),

        api.get(
          '/ia/casos'
        ),

        api.get(
          '/ia/predicciones?limite=80'
        ),

        api.get(
          '/ia/resultados'
        ),

        api.get(
          '/ia/modelos'
        )

      ]);


      setResumen(
        rResumen
      );

      setCasos(
        rCasos?.casos ||
        []
      );

      setPredicciones(
        rPred?.predicciones ||
        []
      );

      setResultados(
        rResultados?.resultados ||
        []
      );

      setModelos(
        rModelos?.modelos ||
        []
      );


    } catch (e) {

      setError(
        e?.response
          ?.data
          ?.mensaje ||
        e?.data
          ?.mensaje ||
        e?.message ||
        'No se pudo cargar IA Predictiva.'
      );


    } finally {

      setCargando(false);

    }

  }


  useEffect(
    () => {

      const timer =
        window.setTimeout(
          () => {
            cargarTodo();
          },
          0
        );


      return () => {

        window.clearTimeout(
          timer
        );

      };

    },
    []
  );


  async function generarPrediccion() {

    if (!caso) {

      setError(
        'Selecciona un trámite o renovación.'
      );

      return;

    }


    try {

      setProcesando(true);

      setError('');

      setMensaje('');


      const respuesta =
        await api.post(
          '/ia/predicciones',
          {
            tipoObjeto:
              caso.tipo_objeto,

            objetoId:
              caso.objeto_id
          }
        );


      setPrediccion(
        respuesta?.prediccion ||
        null
      );


      setMensaje(
        'Predicción registrada correctamente.'
      );


      await cargarTodo();


    } catch (e) {

      setPrediccion(null);

      setError(
        e?.response
          ?.data
          ?.mensaje ||
        e?.data
          ?.mensaje ||
        e?.message ||
        'No se pudo generar la predicción.'
      );


    } finally {

      setProcesando(false);

    }

  }


  async function sincronizar() {

    try {

      setProcesando(true);

      setError('');

      setMensaje('');


      const respuesta =
        await api.post(
          '/ia/resultados/sincronizar',
          {}
        );


      setMensaje(
        `Se incorporaron ${
          respuesta?.totalNuevos ||
          0
        } resultados reales nuevos.`
      );


      await cargarTodo();


    } catch (e) {

      setError(
        e?.response
          ?.data
          ?.mensaje ||
        e?.data
          ?.mensaje ||
        e?.message ||
        'No se pudieron sincronizar resultados reales.'
      );


    } finally {

      setProcesando(false);

    }

  }


  async function entrenar() {

    try {

      setProcesando(true);

      setError('');

      setMensaje('');


      const respuesta =
        await api.post(
          '/ia/modelos/entrenar',
          {}
        );


      setMensaje(
        respuesta?.ok

          ? 'Se generaron nuevas versiones candidatas. Revise sus métricas antes de activarlas.'

          : respuesta?.mensaje
      );


      await cargarTodo();


    } catch (e) {

      setError(
        e?.response
          ?.data
          ?.mensaje ||
        e?.data
          ?.mensaje ||
        e?.message ||
        'No se pudo entrenar el modelo.'
      );


    } finally {

      setProcesando(false);

    }

  }


  async function activar(
    id
  ) {

    try {

      setProcesando(true);

      setError('');

      setMensaje('');


      await api.patch(
        `/ia/modelos/${id}/activar`,
        {}
      );


      setMensaje(
        'Modelo activado correctamente.'
      );


      await cargarTodo();


    } catch (e) {

      setError(
        e?.response
          ?.data
          ?.mensaje ||
        e?.data
          ?.mensaje ||
        e?.message ||
        'No se pudo activar el modelo.'
      );


    } finally {

      setProcesando(false);

    }

  }


  async function cambiarApto(
    resultado,
    aptoMl
  ) {

    let motivoExclusion =
      '';


    if (!aptoMl) {

      motivoExclusion =
        window.prompt(
          'Indica el motivo para excluir este resultado del dataset:'
        ) ||
        '';


      if (
        !motivoExclusion.trim()
      ) {
        return;
      }

    }


    try {

      setProcesando(true);

      setError('');


      await api.patch(
        `/ia/resultados/${resultado.id}`,
        {
          aptoMl,
          motivoExclusion
        }
      );


      await cargarTodo();


    } catch (e) {

      setError(
        e?.response
          ?.data
          ?.mensaje ||
        e?.data
          ?.mensaje ||
        e?.message ||
        'No se pudo actualizar el resultado.'
      );


    } finally {

      setProcesando(false);

    }

  }


  function navegarCaso(
    tipo,
    id
  ) {

    if (
      tipo ===
      'TRAMITE'
    ) {

      navigate(
        `/tramites?tramiteId=${id}`,
        {
          state: {
            tramiteId: id,
            origen:
              'ia-predictiva'
          }
        }
      );

      return;

    }


    navigate(
      `/renovaciones?renovacionId=${id}`,
      {
        state: {
          renovacionId: id,
          origen:
            'ia-predictiva'
        }
      }
    );

  }


  const activos =
    modelos.filter(
      (modelo) =>
        modelo.estado ===
        'ACTIVO'
    );


  const modeloActivo =
    activos[0] ||
    null;


  const aptos =
    Number(
      resumen
        ?.resultados
        ?.aptos ||
      0
    );


  const totalPredicciones =
    Number(
      resumen
        ?.totalPredicciones ||
      0
    );


  if (
    cargando
  ) {

    return (

      <div
        className="
          flex
          min-h-[65vh]
          items-center
          justify-center
        "
      >

        <div
          className="
            relative
            flex
            w-full
            max-w-sm
            flex-col
            items-center
            overflow-hidden
            rounded-3xl
            border
            border-slate-200
            bg-white
            px-8
            py-12
            text-center
            shadow-sm
          "
        >

          <div
            className="
              absolute
              -right-16
              -top-16
              h-44
              w-44
              rounded-full
              bg-violet-100
              blur-3xl
            "
          />


          <div
            className="
              relative
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-indigo-500
              to-violet-600
              text-white
              shadow-lg
              shadow-indigo-500/20
            "
          >

            <BrainCircuit
              size={29}
            />


            <div
              className="
                absolute
                -inset-2
                animate-pulse
                rounded-3xl
                border
                border-indigo-200
              "
            />

          </div>


          <h2
            className="
              mt-6
              text-lg
              font-bold
              text-slate-900
            "
          >
            Preparando IA Predictiva
          </h2>


          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-500
            "
          >
            Cargando modelos, casos,
            resultados y predicciones
            registradas.
          </p>

        </div>

      </div>

    );

  }


  return (

    <div className="space-y-6">

      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <section
        className="
          relative
          overflow-hidden
          rounded-[30px]
          border
          border-slate-800
          bg-gradient-to-br
          from-slate-950
          via-indigo-950
          to-violet-950
          shadow-xl
          shadow-slate-900/10
        "
      >

        <div
          className="
            absolute
            -right-24
            -top-24
            h-80
            w-80
            rounded-full
            bg-violet-500/20
            blur-3xl
          "
        />


        <div
          className="
            absolute
            -bottom-28
            left-1/4
            h-72
            w-72
            rounded-full
            bg-indigo-500/20
            blur-3xl
          "
        />


        <div
          className="
            absolute
            inset-0
            opacity-[0.05]
          "
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize:
              '26px 26px'
          }}
        />


        <div
          className="
            relative
            grid
            gap-6
            px-6
            py-7
            lg:grid-cols-[1fr_330px]
            lg:px-8
            lg:py-8
          "
        >

          <div
            className="
              flex
              flex-col
              justify-center
            "
          >

            <div
              className="
                mb-4
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/10
                  text-violet-200
                  backdrop-blur
                "
              >

                <BrainCircuit
                  size={24}
                />

              </div>


              <div>

                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.22em]
                    text-violet-300
                  "
                >
                  Inteligencia aplicada
                </p>


                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  Motor predictivo CERTIIA
                </p>

              </div>

            </div>


            <h1
              className="
                text-3xl
                font-bold
                tracking-tight
                text-white
                sm:text-4xl
              "
            >
              IA Predictiva
            </h1>


            <p
              className="
                mt-3
                max-w-2xl
                text-sm
                leading-6
                text-slate-300
              "
            >
              Anticipa el riesgo de retraso,
              estima la duración de los casos y
              utiliza resultados históricos
              validados para apoyar la
              priorización operativa.
            </p>


            <div
              className="
                mt-6
                flex
                flex-wrap
                gap-2
              "
            >

              <EtiquetaHero>
                <BrainCircuit size={14} />
                {activos.length} modelo(s) activo(s)
              </EtiquetaHero>


              <EtiquetaHero>
                <Database size={14} />
                {aptos} resultados aptos
              </EtiquetaHero>


              <EtiquetaHero>
                <Sparkles size={14} />
                {totalPredicciones} predicciones
              </EtiquetaHero>

            </div>

          </div>


          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/[0.07]
              p-5
              backdrop-blur-md
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
                  Modelo operativo
                </p>


                <p
                  className="
                    mt-1
                    text-lg
                    font-bold
                    text-white
                  "
                >
                  {
                    modeloActivo
                      ? modeloActivo.version
                      : 'Sin modelo activo'
                  }
                </p>

              </div>


              <div
                className={`
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl

                  ${
                    modeloActivo
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-amber-500/15 text-amber-300'
                  }
                `}
              >

                {
                  modeloActivo
                    ? (
                      <CheckCircle2
                        size={22}
                      />
                    )
                    : (
                      <AlertTriangle
                        size={22}
                      />
                    )
                }

              </div>

            </div>


            <div
              className="
                mt-5
                space-y-3
              "
            >

              <FilaHero
                etiqueta="Casos abiertos"
                valor={casos.length}
              />


              <FilaHero
                etiqueta="Dataset apto"
                valor={aptos}
              />


              <FilaHero
                etiqueta="Historial predictivo"
                valor={predicciones.length}
              />

            </div>


            <button
              type="button"
              onClick={
                cargarTodo
              }
              className="
                mt-5
                inline-flex
                h-11
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-white
                px-4
                text-sm
                font-bold
                text-slate-900
                transition
                hover:bg-slate-100
              "
            >

              <RefreshCw
                size={17}
              />

              Actualizar datos

            </button>

          </div>

        </div>

      </section>


      {/* ================================================= */}
      {/* PRINCIPIO DE USO */}
      {/* ================================================= */}

      <div
        className="
          flex
          items-start
          gap-3
          rounded-2xl
          border
          border-amber-200
          bg-gradient-to-r
          from-amber-50
          to-orange-50
          px-5
          py-4
          text-sm
          leading-6
          text-amber-900
          shadow-sm
        "
      >

        <div
          className="
            mt-0.5
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-amber-100
            text-amber-700
          "
        >

          <AlertTriangle
            size={18}
          />

        </div>


        <div>

          <p className="font-bold">
            La IA funciona como apoyo a la decisión
          </p>


          <p className="mt-0.5 text-amber-800">
            Las estimaciones no son plazos oficiales,
            no modifican automáticamente los estados
            del trámite o renovación y la decisión
            final continúa siendo humana.
          </p>

        </div>

      </div>


      {/* ================================================= */}
      {/* MENSAJES */}
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
              px-5
              py-4
              text-sm
              text-red-700
              shadow-sm
            "
          >

            <AlertTriangle
              size={19}
              className="mt-0.5 shrink-0"
            />


            <div>

              <p className="font-bold">
                No se pudo completar la operación
              </p>


              <p className="mt-1">
                {error}
              </p>

            </div>

          </div>

        )
      }


      {
        mensaje && (

          <div
            className="
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-emerald-200
              bg-emerald-50
              px-5
              py-4
              text-sm
              text-emerald-700
              shadow-sm
            "
          >

            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0"
            />


            <div>

              <p className="font-bold">
                Operación completada
              </p>


              <p className="mt-1">
                {mensaje}
              </p>

            </div>

          </div>

        )
      }


      {/* ================================================= */}
      {/* KPIs */}
      {/* ================================================= */}

      <section
        className="
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >

        <TarjetaKpi
          titulo="Modelos activos"
          valor={activos.length}
          descripcion="Versiones aprobadas"
          icono={BrainCircuit}
          tono="indigo"
          etiqueta={
            modeloActivo
              ? modeloActivo.version
              : 'Sin activo'
          }
        />


        <TarjetaKpi
          titulo="Resultados aptos"
          valor={aptos}
          descripcion="Dataset validado"
          icono={Database}
          tono="emerald"
          etiqueta="Aprendizaje"
        />


        <TarjetaKpi
          titulo="Predicciones"
          valor={totalPredicciones}
          descripcion="Historial generado"
          icono={Sparkles}
          tono="violet"
          etiqueta="Trazables"
        />


        <TarjetaKpi
          titulo="Casos abiertos"
          valor={casos.length}
          descripcion="Disponibles para estimar"
          icono={Clock3}
          tono="amber"
          etiqueta="Operación"
        />

      </section>


      {/* ================================================= */}
      {/* NAVEGACIÓN */}
      {/* ================================================= */}

      <nav
        className="
          grid
          gap-2
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-2
          shadow-sm
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >

        <TabButton
          activo={
            tab ===
            'PREDICCION'
          }
          icono={Sparkles}
          texto="Predicción"
          descripcion="Analizar caso"
          onClick={() =>
            setTab(
              'PREDICCION'
            )
          }
        />


        <TabButton
          activo={
            tab ===
            'HISTORIAL'
          }
          icono={Clock3}
          texto="Historial"
          descripcion="Predicciones previas"
          onClick={() =>
            setTab(
              'HISTORIAL'
            )
          }
        />


        <TabButton
          activo={
            tab ===
            'RESULTADOS'
          }
          icono={Database}
          texto="Resultados reales"
          descripcion="Dataset"
          onClick={() =>
            setTab(
              'RESULTADOS'
            )
          }
        />


        <TabButton
          activo={
            tab ===
            'MODELOS'
          }
          icono={BrainCircuit}
          texto="Modelos"
          descripcion="Versiones y métricas"
          onClick={() =>
            setTab(
              'MODELOS'
            )
          }
        />

      </nav>


      {/* ================================================= */}
      {/* PREDICCIÓN */}
      {/* ================================================= */}

      {
        tab ===
          'PREDICCION' && (

          <section
            className="
              grid
              gap-6
              xl:grid-cols-[0.85fr_1.15fr]
            "
          >

            {/* Selección */}

            <article
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
                  border-b
                  border-slate-100
                  bg-gradient-to-r
                  from-white
                  to-indigo-50/50
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
                      rounded-2xl
                      bg-indigo-50
                      text-indigo-600
                    "
                  >

                    <Target
                      size={20}
                    />

                  </div>


                  <div>

                    <h2
                      className="
                        font-bold
                        text-slate-900
                      "
                    >
                      Seleccionar caso
                    </h2>


                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-500
                      "
                    >
                      Trámites y renovaciones
                      que todavía están abiertos.
                    </p>

                  </div>

                </div>

              </div>


              <div className="p-6">

                <label
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-wide
                    text-slate-500
                  "
                >
                  Caso operativo
                </label>


                <select
                  value={
                    casoSeleccionado
                  }
                  onChange={
                    (e) =>
                      setCasoSeleccionado(
                        e.target.value
                      )
                  }
                  className="
                    mt-2
                    h-12
                    w-full
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
                    Selecciona un caso
                  </option>


                  {
                    casos.map(
                      (item) => (

                        <option
                          key={
                            `${item.tipo_objeto}:${item.objeto_id}`
                          }
                          value={
                            `${item.tipo_objeto}:${item.objeto_id}`
                          }
                        >
                          {item.tipo_objeto} #{item.objeto_id}
                          {' · '}
                          {item.tienda}
                          {' · '}
                          {item.referencia || 'Sin referencia'}
                        </option>

                      )
                    )
                  }

                </select>


                {
                  caso && (

                    <div
                      className="
                        mt-5
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200
                        bg-slate-50
                      "
                    >

                      <div
                        className="
                          border-b
                          border-slate-200
                          bg-white
                          px-4
                          py-3
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            gap-3
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
                              Caso seleccionado
                            </p>


                            <p
                              className="
                                mt-1
                                font-bold
                                text-slate-900
                              "
                            >
                              {caso.tipo_objeto}
                              {' #'}
                              {caso.objeto_id}
                            </p>

                          </div>


                          <span
                            className="
                              rounded-full
                              bg-indigo-50
                              px-3
                              py-1
                              text-xs
                              font-bold
                              text-indigo-600
                            "
                          >
                            {caso.estado}
                          </span>

                        </div>

                      </div>


                      <div
                        className="
                          grid
                          gap-3
                          p-4
                          text-sm
                          sm:grid-cols-2
                        "
                      >

                        <DatoCaso
                          etiqueta="Tienda"
                          valor={caso.tienda}
                        />


                        <DatoCaso
                          etiqueta="Tipo documental"
                          valor={
                            caso.tipo_documento
                          }
                        />


                        <DatoCaso
                          etiqueta="Referencia"
                          valor={
                            caso.referencia ||
                            'Sin referencia'
                          }
                        />


                        <DatoCaso
                          etiqueta="Estado actual"
                          valor={caso.estado}
                        />

                      </div>

                    </div>

                  )
                }


                <button
                  type="button"
                  onClick={
                    generarPrediccion
                  }
                  disabled={
                    !caso ||
                    procesando
                  }
                  className="
                    mt-5
                    inline-flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-indigo-600
                    to-violet-600
                    px-5
                    text-sm
                    font-bold
                    text-white
                    shadow-lg
                    shadow-indigo-600/20
                    transition
                    hover:from-indigo-700
                    hover:to-violet-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  {
                    procesando
                      ? (
                        <RefreshCw
                          size={18}
                          className="animate-spin"
                        />
                      )
                      : (
                        <Sparkles
                          size={18}
                        />
                      )
                  }


                  {
                    procesando
                      ? 'Analizando...'
                      : 'Generar estimación'
                  }

                </button>


                <p
                  className="
                    mt-3
                    text-center
                    text-xs
                    leading-5
                    text-slate-400
                  "
                >
                  La predicción quedará
                  registrada junto con la versión
                  exacta del modelo utilizado.
                </p>

              </div>

            </article>


            {/* Resultado */}

            <article
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
                  justify-between
                  gap-3
                  border-b
                  border-slate-100
                  bg-gradient-to-r
                  from-white
                  to-violet-50/50
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
                      rounded-2xl
                      bg-violet-50
                      text-violet-600
                    "
                  >

                    <BrainCircuit
                      size={20}
                    />

                  </div>


                  <div>

                    <h2
                      className="
                        font-bold
                        text-slate-900
                      "
                    >
                      Resultado predictivo
                    </h2>


                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-500
                      "
                    >
                      Riesgo, duración y
                      factores explicativos.
                    </p>

                  </div>

                </div>


                {
                  prediccion && (

                    <span
                      className="
                        rounded-full
                        bg-emerald-50
                        px-3
                        py-1.5
                        text-xs
                        font-bold
                        text-emerald-700
                      "
                    >
                      Análisis generado
                    </span>

                  )
                }

              </div>


              {
                !prediccion && (

                  <div
                    className="
                      flex
                      min-h-[430px]
                      flex-col
                      items-center
                      justify-center
                      px-8
                      py-12
                      text-center
                    "
                  >

                    <div
                      className="
                        relative
                        flex
                        h-20
                        w-20
                        items-center
                        justify-center
                        rounded-3xl
                        bg-gradient-to-br
                        from-indigo-50
                        to-violet-100
                        text-indigo-600
                      "
                    >

                      <BrainCircuit
                        size={32}
                      />


                      <span
                        className="
                          absolute
                          -right-1
                          -top-1
                          flex
                          h-7
                          w-7
                          items-center
                          justify-center
                          rounded-full
                          bg-white
                          text-violet-500
                          shadow
                        "
                      >
                        <Sparkles
                          size={14}
                        />
                      </span>

                    </div>


                    <h3
                      className="
                        mt-5
                        font-bold
                        text-slate-800
                      "
                    >
                      Listo para analizar
                    </h3>


                    <p
                      className="
                        mt-2
                        max-w-sm
                        text-sm
                        leading-6
                        text-slate-500
                      "
                    >
                      Selecciona un trámite o
                      renovación y genera una
                      estimación para visualizar
                      el riesgo y la duración.
                    </p>

                  </div>

                )
              }


              {
                prediccion && (

                  <div
                    className="
                      space-y-5
                      p-6
                    "
                  >

                    <div
                      className="
                        grid
                        gap-4
                        md:grid-cols-2
                      "
                    >

                      <TarjetaRiesgo
                        riesgo={
                          prediccion.riesgo
                        }
                      />


                      <TarjetaDuracion
                        duracion={
                          prediccion.duracion
                        }
                      />

                    </div>


                    {
                      (
                        prediccion
                          .riesgo
                          ?.factores ||

                        prediccion
                          .duracion
                          ?.factores
                      ) && (

                        <div
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
                                rounded-xl
                                bg-white
                                text-indigo-600
                                shadow-sm
                              "
                            >

                              <Target
                                size={17}
                              />

                            </div>


                            <div>

                              <h3
                                className="
                                  font-bold
                                  text-slate-900
                                "
                              >
                                Factores explicativos
                              </h3>


                              <p
                                className="
                                  mt-0.5
                                  text-xs
                                  text-slate-500
                                "
                              >
                                Variables que influyeron
                                en esta recomendación.
                              </p>

                            </div>

                          </div>


                          <div
                            className="
                              mt-4
                              grid
                              gap-3
                            "
                          >

                            {
                              (
                                prediccion
                                  .riesgo
                                  ?.factores ||

                                prediccion
                                  .duracion
                                  ?.factores ||

                                []
                              ).map(
                                (
                                  factor,
                                  indice
                                ) => (

                                  <div
                                    key={
                                      factor.factor ||
                                      indice
                                    }
                                    className="
                                      flex
                                      gap-3
                                      rounded-xl
                                      border
                                      border-slate-200
                                      bg-white
                                      px-4
                                      py-3
                                    "
                                  >

                                    <span
                                      className="
                                        flex
                                        h-7
                                        w-7
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-lg
                                        bg-indigo-50
                                        text-xs
                                        font-bold
                                        text-indigo-600
                                      "
                                    >
                                      {indice + 1}
                                    </span>


                                    <p
                                      className="
                                        text-sm
                                        leading-6
                                        text-slate-600
                                      "
                                    >
                                      {
                                        factor.interpretacion ||
                                        factor.factor ||
                                        'Factor considerado por el modelo'
                                      }
                                    </p>

                                  </div>

                                )
                              )
                            }

                          </div>

                        </div>

                      )
                    }


                    <div
                      className="
                        flex
                        flex-col
                        gap-3
                        rounded-2xl
                        border
                        border-indigo-100
                        bg-indigo-50/60
                        p-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                      "
                    >

                      <div>

                        <p
                          className="
                            text-sm
                            font-bold
                            text-indigo-900
                          "
                        >
                          Verificar contexto operativo
                        </p>


                        <p
                          className="
                            mt-1
                            text-xs
                            text-indigo-700
                          "
                        >
                          Revisa el trámite o renovación
                          antes de tomar una decisión.
                        </p>

                      </div>


                      <button
                        type="button"
                        onClick={() =>
                          navegarCaso(
                            prediccion
                              .caso
                              .tipoObjeto,

                            prediccion
                              .caso
                              .objetoId
                          )
                        }
                        className="
                          inline-flex
                          h-10
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-indigo-600
                          px-4
                          text-xs
                          font-bold
                          text-white
                          transition
                          hover:bg-indigo-700
                        "
                      >

                        <ExternalLink
                          size={15}
                        />

                        Ir al caso

                      </button>

                    </div>

                  </div>

                )
              }

            </article>

          </section>

        )
      }


      {/* ================================================= */}
      {/* HISTORIAL */}
      {/* ================================================= */}

      {
        tab ===
          'HISTORIAL' && (

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

            <CabeceraSeccion
              icono={Clock3}
              titulo="Predicciones históricas"
              descripcion="Cada resultado conserva la versión exacta del modelo que lo produjo."
              contador={predicciones.length}
            />


            <div
              className="
                overflow-x-auto
              "
            >

              <table
                className="
                  w-full
                  min-w-[980px]
                "
              >

                <thead
                  className="
                    bg-slate-50
                    text-left
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-slate-500
                  "
                >

                  <tr>

                    <th className="px-5 py-4">
                      Fecha
                    </th>

                    <th className="px-5 py-4">
                      Caso
                    </th>

                    <th className="px-5 py-4">
                      Predicción
                    </th>

                    <th className="px-5 py-4">
                      Resultado
                    </th>

                    <th className="px-5 py-4">
                      Modelo
                    </th>

                    <th className="px-5 py-4">
                      Solicitado por
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
                    predicciones.map(
                      (p) => (

                        <tr
                          key={p.id}
                          className="
                            transition
                            hover:bg-indigo-50/30
                          "
                        >

                          <td
                            className="
                              whitespace-nowrap
                              px-5
                              py-4
                              text-sm
                              text-slate-500
                            "
                          >
                            {
                              fecha(
                                p.fecha_prediccion
                              )
                            }
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
                                font-bold
                                text-slate-700
                              "
                            >
                              {p.tipo_objeto}
                              {' #'}
                              {p.objeto_id}
                            </span>

                          </td>


                          <td
                            className="
                              px-5
                              py-4
                              text-sm
                              font-medium
                              text-slate-600
                            "
                          >
                            {
                              p.tipo_prediccion ===
                                'RIESGO_RETRASO'
                                ? 'Riesgo de retraso'
                                : 'Duración estimada'
                            }
                          </td>


                          <td
                            className="
                              px-5
                              py-4
                            "
                          >

                            {
                              p.tipo_prediccion ===
                                'RIESGO_RETRASO'

                                ? (

                                  <div
                                    className="
                                      flex
                                      items-center
                                      gap-2
                                    "
                                  >

                                    <span
                                      className={`
                                        rounded-lg
                                        border
                                        px-2.5
                                        py-1
                                        text-xs
                                        font-bold
                                        ${nivelClase(
                                          p.nivel_riesgo
                                        )}
                                      `}
                                    >
                                      {
                                        p.nivel_riesgo
                                      }
                                    </span>


                                    <span
                                      className="
                                        text-sm
                                        font-bold
                                        text-slate-800
                                      "
                                    >
                                      {
                                        porcentaje(
                                          p.probabilidad
                                        )
                                      }
                                    </span>

                                  </div>

                                )

                                : (

                                  <span
                                    className="
                                      font-bold
                                      text-slate-800
                                    "
                                  >
                                    {
                                      Number(
                                        p.duracion_estimada_dias
                                      ).toFixed(1)
                                    }
                                    {' días'}
                                  </span>

                                )
                            }

                          </td>


                          <td
                            className="
                              px-5
                              py-4
                            "
                          >

                            <span
                              className="
                                rounded-lg
                                bg-indigo-50
                                px-2.5
                                py-1
                                text-xs
                                font-bold
                                text-indigo-600
                              "
                            >
                              {
                                p.modelo_version
                              }
                            </span>

                          </td>


                          <td
                            className="
                              px-5
                              py-4
                              text-sm
                              text-slate-500
                            "
                          >
                            {
                              `${p.nombres || ''} ${p.apellidos || ''}`
                                .trim() ||
                              'Sistema'
                            }
                          </td>

                        </tr>

                      )
                    )
                  }


                  {
                    predicciones.length ===
                      0 && (

                      <tr>

                        <td
                          colSpan="6"
                          className="
                            px-5
                            py-16
                            text-center
                          "
                        >

                          <EstadoVacio
                            icono={Clock3}
                            titulo="Aún no existen predicciones"
                            descripcion="Las estimaciones generadas aparecerán aquí junto con la versión del modelo utilizada."
                          />

                        </td>

                      </tr>

                    )
                  }

                </tbody>

              </table>

            </div>

          </section>

        )
      }


      {/* ================================================= */}
      {/* RESULTADOS REALES */}
      {/* ================================================= */}

      {
        tab ===
          'RESULTADOS' && (

          <section className="space-y-4">

            <div
              className="
                flex
                flex-col
                gap-4
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-5
                shadow-sm
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
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-2xl
                    bg-emerald-50
                    text-emerald-600
                  "
                >

                  <Database
                    size={20}
                  />

                </div>


                <div>

                  <h2
                    className="
                      font-bold
                      text-slate-900
                    "
                  >
                    Resultados reales
                  </h2>


                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-500
                    "
                  >
                    Solo los registros completos,
                    validados y aptos alimentan el
                    aprendizaje.
                  </p>

                </div>

              </div>


              <button
                type="button"
                onClick={
                  sincronizar
                }
                disabled={
                  procesando
                }
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-emerald-600
                  px-4
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-emerald-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >

                {
                  procesando
                    ? (
                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />
                    )
                    : (
                      <Database
                        size={18}
                      />
                    )
                }

                Sincronizar concluidos

              </button>

            </div>


            <div
              className="
                grid
                gap-4
                sm:grid-cols-3
              "
            >

              <MiniResumen
                etiqueta="Resultados"
                valor={resultados.length}
                tono="indigo"
              />


              <MiniResumen
                etiqueta="Aptos para ML"
                valor={
                  resultados.filter(
                    (r) =>
                      r.apto_ml
                  ).length
                }
                tono="emerald"
              />


              <MiniResumen
                etiqueta="Excluidos"
                valor={
                  resultados.filter(
                    (r) =>
                      !r.apto_ml
                  ).length
                }
                tono="red"
              />

            </div>


            <div
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
                  overflow-x-auto
                "
              >

                <table
                  className="
                    w-full
                    min-w-[900px]
                  "
                >

                  <thead
                    className="
                      bg-slate-50
                      text-left
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >

                    <tr>

                      <th className="px-5 py-4">
                        Caso
                      </th>

                      <th className="px-5 py-4">
                        Duración real
                      </th>

                      <th className="px-5 py-4">
                        Resultado
                      </th>

                      <th className="px-5 py-4">
                        Predicciones previas
                      </th>

                      <th className="px-5 py-4">
                        Dataset
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
                      resultados.map(
                        (r) => (

                          <tr
                            key={r.id}
                            className="
                              transition
                              hover:bg-slate-50
                            "
                          >

                            <td
                              className="
                                px-5
                                py-4
                              "
                            >

                              <span
                                className="
                                  rounded-lg
                                  bg-slate-100
                                  px-2.5
                                  py-1
                                  text-xs
                                  font-bold
                                  text-slate-700
                                "
                              >
                                {r.tipo_objeto}
                                {' #'}
                                {r.objeto_id}
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
                                  font-bold
                                  text-slate-800
                                "
                              >
                                {
                                  r.duracion_real_dias
                                }
                                {' días'}
                              </span>

                            </td>


                            <td
                              className="
                                px-5
                                py-4
                                text-sm
                                text-slate-600
                              "
                            >
                              {
                                r.resultado ||
                                '—'
                              }
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
                                  h-8
                                  min-w-8
                                  items-center
                                  justify-center
                                  rounded-full
                                  bg-violet-50
                                  px-2
                                  text-xs
                                  font-bold
                                  text-violet-600
                                "
                              >
                                {
                                  r.predicciones_previas ??
                                  0
                                }
                              </span>

                            </td>


                            <td
                              className="
                                px-5
                                py-4
                              "
                            >

                              <button
                                type="button"
                                onClick={() =>
                                  cambiarApto(
                                    r,
                                    !r.apto_ml
                                  )
                                }
                                disabled={
                                  procesando
                                }
                                className={`
                                  rounded-xl
                                  border
                                  px-3
                                  py-2
                                  text-xs
                                  font-bold
                                  transition
                                  disabled:cursor-not-allowed
                                  disabled:opacity-50

                                  ${
                                    r.apto_ml
                                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                      : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                                  }
                                `}
                              >
                                {
                                  r.apto_ml
                                    ? 'APTO'
                                    : 'EXCLUIDO'
                                }
                              </button>

                            </td>

                          </tr>

                        )
                      )
                    }


                    {
                      resultados.length ===
                        0 && (

                        <tr>

                          <td
                            colSpan="5"
                            className="
                              px-5
                              py-16
                              text-center
                            "
                          >

                            <EstadoVacio
                              icono={Database}
                              titulo="Sin resultados reales"
                              descripcion="Usa “Sincronizar concluidos” para incorporar casos finalizados al dataset."
                            />

                          </td>

                        </tr>

                      )
                    }

                  </tbody>

                </table>

              </div>

            </div>

          </section>

        )
      }


      {/* ================================================= */}
      {/* MODELOS */}
      {/* ================================================= */}

      {
        tab ===
          'MODELOS' && (

          <section className="space-y-4">

            <div
              className="
                flex
                flex-col
                gap-4
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-5
                shadow-sm
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
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-2xl
                    bg-violet-50
                    text-violet-600
                  "
                >

                  <BrainCircuit
                    size={20}
                  />

                </div>


                <div>

                  <h2
                    className="
                      font-bold
                      text-slate-900
                    "
                  >
                    Versiones de modelos
                  </h2>


                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-500
                    "
                  >
                    El entrenamiento genera
                    candidatos; la activación es
                    una decisión separada.
                  </p>

                </div>

              </div>


              {
                puedeEntrenar && (

                  <button
                    type="button"
                    onClick={
                      entrenar
                    }
                    disabled={
                      procesando
                    }
                    className="
                      inline-flex
                      h-11
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-gradient-to-r
                      from-indigo-600
                      to-violet-600
                      px-4
                      text-sm
                      font-bold
                      text-white
                      transition
                      hover:from-indigo-700
                      hover:to-violet-700
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >

                    {
                      procesando
                        ? (
                          <RefreshCw
                            size={17}
                            className="animate-spin"
                          />
                        )
                        : (
                          <TrendingUp
                            size={18}
                          />
                        )
                    }

                    Entrenar nueva versión

                  </button>

                )
              }

            </div>


            <div
              className="
                grid
                gap-4
                xl:grid-cols-2
              "
            >

              {
                modelos.map(
                  (m) => (

                    <article
                      key={m.id}
                      className={`
                        relative
                        overflow-hidden
                        rounded-3xl
                        border
                        bg-white
                        p-5
                        shadow-sm
                        transition
                        hover:-translate-y-0.5
                        hover:shadow-md

                        ${
                          m.estado ===
                            'ACTIVO'
                            ? 'border-emerald-200'
                            : 'border-slate-200'
                        }
                      `}
                    >

                      {
                        m.estado ===
                          'ACTIVO' && (

                          <div
                            className="
                              absolute
                              right-0
                              top-0
                              rounded-bl-2xl
                              bg-emerald-500
                              px-3
                              py-1.5
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-wide
                              text-white
                            "
                          >
                            En producción
                          </div>

                        )
                      }


                      <div
                        className="
                          flex
                          items-start
                          gap-3
                        "
                      >

                        <div
                          className={`
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-2xl

                            ${
                              m.estado ===
                                'ACTIVO'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-indigo-50 text-indigo-600'
                            }
                          `}
                        >

                          <BrainCircuit
                            size={20}
                          />

                        </div>


                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >

                          <div
                            className="
                              flex
                              flex-wrap
                              items-center
                              gap-2
                            "
                          >

                            <h3
                              className="
                                text-lg
                                font-bold
                                text-slate-900
                              "
                            >
                              {m.version}
                            </h3>


                            <span
                              className="
                                rounded-lg
                                bg-slate-100
                                px-2.5
                                py-1
                                text-[10px]
                                font-bold
                                text-slate-600
                              "
                            >
                              {m.tipo_modelo}
                            </span>

                          </div>


                          <p
                            className="
                              mt-1
                              text-sm
                              text-slate-500
                            "
                          >
                            {m.algoritmo}
                            {' · Dataset '}
                            {
                              m.dataset_version ||
                              `#${m.dataset_version_id}`
                            }
                          </p>

                        </div>

                      </div>


                      <div
                        className="
                          mt-5
                          grid
                          gap-3
                          sm:grid-cols-2
                        "
                      >

                        <EstadoModelo
                          cumple={
                            m.cumple_criterios
                          }
                        />


                        <div
                          className="
                            rounded-xl
                            border
                            border-slate-200
                            bg-slate-50
                            px-3
                            py-3
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
                            Estado
                          </p>


                          <p
                            className={`
                              mt-1
                              text-sm
                              font-bold

                              ${
                                m.estado ===
                                  'ACTIVO'
                                  ? 'text-emerald-600'
                                  : m.estado ===
                                    'CANDIDATO'
                                    ? 'text-indigo-600'
                                    : 'text-slate-700'
                              }
                            `}
                          >
                            {m.estado}
                          </p>

                        </div>

                      </div>


                      <MetricasModelo
                        metricas={
                          m.metricas
                        }
                      />


                      {
                        puedeActivar &&
                        m.estado ===
                          'CANDIDATO' &&
                        m.cumple_criterios && (

                          <button
                            type="button"
                            onClick={() =>
                              activar(
                                m.id
                              )
                            }
                            disabled={
                              procesando
                            }
                            className="
                              mt-5
                              inline-flex
                              h-11
                              w-full
                              items-center
                              justify-center
                              gap-2
                              rounded-xl
                              bg-indigo-600
                              px-4
                              text-sm
                              font-bold
                              text-white
                              transition
                              hover:bg-indigo-700
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                          >

                            <CheckCircle2
                              size={17}
                            />

                            Aprobar y activar

                          </button>

                        )
                      }

                    </article>

                  )
                )
              }

            </div>


            {
              modelos.length ===
                0 && (

                <div
                  className="
                    rounded-3xl
                    border
                    border-dashed
                    border-slate-300
                    bg-white
                    p-12
                  "
                >

                  <EstadoVacio
                    icono={BrainCircuit}
                    titulo="Aún no existen modelos entrenados"
                    descripcion="Cuando exista información histórica suficiente podrás entrenar una nueva versión candidata."
                  />

                </div>

              )
            }

          </section>

        )
      }

    </div>

  );

}


// ============================================================
// HERO
// ============================================================

function EtiquetaHero({
  children
}) {

  return (

    <span
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        border-white/10
        bg-white/[0.08]
        px-3
        py-1.5
        text-xs
        font-semibold
        text-slate-200
        backdrop-blur
      "
    >
      {children}
    </span>

  );

}


function FilaHero({
  etiqueta,
  valor
}) {

  return (

    <div
      className="
        flex
        items-center
        justify-between
        rounded-xl
        border
        border-white/10
        bg-black/10
        px-3
        py-2.5
      "
    >

      <span
        className="
          text-xs
          font-medium
          text-slate-300
        "
      >
        {etiqueta}
      </span>


      <span
        className="
          text-sm
          font-bold
          text-white
        "
      >
        {valor}
      </span>

    </div>

  );

}


// ============================================================
// KPI
// ============================================================

function TarjetaKpi({

  titulo,
  valor,
  descripcion,
  icono: Icono,
  tono,
  etiqueta

}) {

  const estilos = {

    indigo: {
      icono:
        'bg-indigo-50 text-indigo-600',
      barra:
        'from-indigo-500 to-blue-500',
      etiqueta:
        'bg-indigo-50 text-indigo-600'
    },

    emerald: {
      icono:
        'bg-emerald-50 text-emerald-600',
      barra:
        'from-emerald-500 to-teal-500',
      etiqueta:
        'bg-emerald-50 text-emerald-600'
    },

    violet: {
      icono:
        'bg-violet-50 text-violet-600',
      barra:
        'from-violet-500 to-fuchsia-500',
      etiqueta:
        'bg-violet-50 text-violet-600'
    },

    amber: {
      icono:
        'bg-amber-50 text-amber-600',
      barra:
        'from-amber-500 to-orange-500',
      etiqueta:
        'bg-amber-50 text-amber-600'
    }

  };


  const estilo =
    estilos[tono] ||
    estilos.indigo;


  return (

    <article
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        transition
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
        hover:shadow-slate-200/60
      "
    >

      <div
        className="
          absolute
          -right-8
          -top-8
          h-24
          w-24
          rounded-full
          bg-slate-100
          opacity-60
          transition
          group-hover:scale-125
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

        <div>

          <span
            className={`
              inline-flex
              max-w-[150px]
              truncate
              rounded-full
              px-2.5
              py-1
              text-[10px]
              font-bold
              uppercase
              tracking-wide
              ${estilo.etiqueta}
            `}
          >
            {etiqueta}
          </span>


          <p
            className="
              mt-4
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
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            ${estilo.icono}
          `}
        >

          <Icono
            size={22}
          />

        </div>

      </div>


      <div
        className={`
          absolute
          bottom-0
          left-0
          h-1
          w-full
          bg-gradient-to-r
          ${estilo.barra}
        `}
      />

    </article>

  );

}


// ============================================================
// TABS
// ============================================================

function TabButton({

  activo,
  icono: Icono,
  texto,
  descripcion,
  onClick

}) {

  return (

    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        items-center
        gap-3
        rounded-xl
        px-4
        py-3
        text-left
        transition

        ${
          activo
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-50'
        }
      `}
    >

      <span
        className={`
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl

          ${
            activo
              ? 'bg-white/15 text-white'
              : 'bg-slate-100 text-slate-500'
          }
        `}
      >

        <Icono
          size={17}
        />

      </span>


      <span>

        <span
          className="
            block
            text-sm
            font-bold
          "
        >
          {texto}
        </span>


        <span
          className={`
            mt-0.5
            block
            text-[10px]

            ${
              activo
                ? 'text-indigo-100'
                : 'text-slate-400'
            }
          `}
        >
          {descripcion}
        </span>

      </span>

    </button>

  );

}


// ============================================================
// CASO
// ============================================================

function DatoCaso({
  etiqueta,
  valor
}) {

  return (

    <div>

      <p
        className="
          text-[10px]
          font-bold
          uppercase
          tracking-wide
          text-slate-400
        "
      >
        {etiqueta}
      </p>


      <p
        className="
          mt-1
          font-semibold
          text-slate-700
        "
      >
        {valor || '—'}
      </p>

    </div>

  );

}


// ============================================================
// RIESGO
// ============================================================

function TarjetaRiesgo({
  riesgo
}) {

  if (!riesgo) {

    return (

      <div
        className="
          rounded-2xl
          border
          border-dashed
          border-slate-300
          bg-slate-50
          p-5
        "
      >

        <Gauge
          size={22}
          className="text-slate-400"
        />


        <p
          className="
            mt-3
            text-xs
            font-semibold
            uppercase
            tracking-wide
            text-slate-400
          "
        >
          Riesgo de retraso
        </p>


        <p
          className="
            mt-2
            text-sm
            text-slate-500
          "
        >
          Sin modelo activo de riesgo.
        </p>

      </div>

    );

  }


  const valor =
    porcentajeNumerico(
      riesgo.probabilidad
    );


  const color =
    riesgo.nivel ===
      'ALTO'

      ? '#ef4444'

      : riesgo.nivel ===
        'MEDIO'

        ? '#f59e0b'

        : '#10b981';


  return (

    <div
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
      "
    >

      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >

        <div>

          <Gauge
            size={22}
            className="text-indigo-600"
          />


          <p
            className="
              mt-3
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-slate-400
            "
          >
            Riesgo de retraso
          </p>

        </div>


        <span
          className={`
            rounded-lg
            border
            px-2.5
            py-1
            text-xs
            font-bold
            ${nivelClase(
              riesgo.nivel
            )}
          `}
        >
          {riesgo.nivel}
        </span>

      </div>


      <div
        className="
          mt-5
          flex
          items-center
          gap-5
        "
      >

        <div
          className="
            relative
            flex
            h-24
            w-24
            shrink-0
            items-center
            justify-center
            rounded-full
          "
          style={{
            background:
              `conic-gradient(${color} ${valor}%, #e2e8f0 ${valor}% 100%)`
          }}
        >

          <div
            className="
              flex
              h-[74px]
              w-[74px]
              items-center
              justify-center
              rounded-full
              bg-white
              shadow-inner
            "
          >

            <span
              className="
                text-lg
                font-bold
                text-slate-900
              "
            >
              {
                porcentaje(
                  riesgo.probabilidad
                )
              }
            </span>

          </div>

        </div>


        <div>

          <p
            className="
              text-sm
              font-bold
              text-slate-800
            "
          >
            Probabilidad estimada
          </p>


          <p
            className="
              mt-1
              text-xs
              leading-5
              text-slate-500
            "
          >
            Nivel calculado a partir del
            comportamiento histórico de
            casos similares.
          </p>


          <p
            className="
              mt-2
              text-[10px]
              font-semibold
              uppercase
              tracking-wide
              text-slate-400
            "
          >
            Modelo {riesgo.modelo?.version || 'N/D'}
          </p>

        </div>

      </div>

    </div>

  );

}


// ============================================================
// DURACIÓN
// ============================================================

function TarjetaDuracion({
  duracion
}) {

  if (!duracion) {

    return (

      <div
        className="
          rounded-2xl
          border
          border-dashed
          border-slate-300
          bg-slate-50
          p-5
        "
      >

        <Clock3
          size={22}
          className="text-slate-400"
        />


        <p
          className="
            mt-3
            text-xs
            font-semibold
            uppercase
            tracking-wide
            text-slate-400
          "
        >
          Duración estimada
        </p>


        <p
          className="
            mt-2
            text-sm
            text-slate-500
          "
        >
          Sin modelo activo de duración.
        </p>

      </div>

    );

  }


  return (

    <div
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-violet-100
        bg-gradient-to-br
        from-white
        to-violet-50
        p-5
      "
    >

      <div
        className="
          absolute
          -right-8
          -top-8
          h-24
          w-24
          rounded-full
          bg-violet-100
          opacity-70
        "
      />


      <Clock3
        size={22}
        className="relative text-violet-600"
      />


      <p
        className="
          relative
          mt-3
          text-xs
          font-semibold
          uppercase
          tracking-wide
          text-slate-400
        "
      >
        Duración estimada
      </p>


      <div
        className="
          relative
          mt-4
          flex
          items-end
          gap-2
        "
      >

        <span
          className="
            text-5xl
            font-bold
            tracking-tight
            text-slate-900
          "
        >
          {
            duracion.diasEstimados
          }
        </span>


        <span
          className="
            mb-1
            text-base
            font-bold
            text-slate-500
          "
        >
          días
        </span>

      </div>


      <p
        className="
          relative
          mt-4
          text-xs
          leading-5
          text-slate-500
        "
      >
        Es una estimación estadística y
        no representa un plazo oficial
        de la entidad emisora.
      </p>


      <p
        className="
          relative
          mt-3
          text-[10px]
          font-semibold
          uppercase
          tracking-wide
          text-violet-500
        "
      >
        Modelo {duracion.modelo?.version || 'N/D'}
      </p>

    </div>

  );

}


// ============================================================
// CABECERA SECCIÓN
// ============================================================

function CabeceraSeccion({

  icono: Icono,
  titulo,
  descripcion,
  contador

}) {

  return (

    <div
      className="
        flex
        flex-col
        gap-3
        border-b
        border-slate-100
        bg-gradient-to-r
        from-white
        to-slate-50
        px-5
        py-5
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
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            bg-indigo-50
            text-indigo-600
          "
        >

          <Icono
            size={19}
          />

        </div>


        <div>

          <h2
            className="
              font-bold
              text-slate-900
            "
          >
            {titulo}
          </h2>


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

      </div>


      <span
        className="
          inline-flex
          w-fit
          rounded-full
          bg-slate-100
          px-3
          py-1.5
          text-xs
          font-bold
          text-slate-600
        "
      >
        {contador} registros
      </span>

    </div>

  );

}


// ============================================================
// RESUMEN DATASET
// ============================================================

function MiniResumen({

  etiqueta,
  valor,
  tono

}) {

  const estilos = {

    indigo:
      'border-indigo-100 bg-indigo-50/60 text-indigo-700',

    emerald:
      'border-emerald-100 bg-emerald-50/60 text-emerald-700',

    red:
      'border-red-100 bg-red-50/60 text-red-700'

  };


  return (

    <div
      className={`
        rounded-2xl
        border
        p-4
        ${estilos[tono] || estilos.indigo}
      `}
    >

      <p
        className="
          text-[10px]
          font-bold
          uppercase
          tracking-wide
          text-slate-500
        "
      >
        {etiqueta}
      </p>


      <p
        className="
          mt-1
          text-2xl
          font-bold
        "
      >
        {valor}
      </p>

    </div>

  );

}


// ============================================================
// MODELO
// ============================================================

function EstadoModelo({
  cumple
}) {

  return (

    <div
      className={`
        rounded-xl
        border
        px-3
        py-3

        ${
          cumple
            ? 'border-emerald-200 bg-emerald-50'
            : 'border-red-200 bg-red-50'
        }
      `}
    >

      <div
        className="
          flex
          items-center
          gap-2
        "
      >

        {
          cumple
            ? (
              <CheckCircle2
                size={16}
                className="text-emerald-600"
              />
            )
            : (
              <AlertTriangle
                size={16}
                className="text-red-600"
              />
            )
        }


        <span
          className={`
            text-xs
            font-bold

            ${
              cumple
                ? 'text-emerald-700'
                : 'text-red-700'
            }
          `}
        >
          {
            cumple
              ? 'Cumple calidad mínima'
              : 'No cumple calidad mínima'
          }
        </span>

      </div>

    </div>

  );

}


function MetricasModelo({
  metricas
}) {

  const entradas =
    metricas &&
    typeof metricas ===
      'object'

      ? Object.entries(
          metricas
        )

      : [];


  if (
    entradas.length ===
    0
  ) {

    return (

      <div
        className="
          mt-4
          rounded-xl
          border
          border-dashed
          border-slate-300
          bg-slate-50
          px-4
          py-4
          text-xs
          text-slate-500
        "
      >
        No hay métricas registradas.
      </div>

    );

  }


  return (

    <div
      className="
        mt-5
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
        Métricas del modelo
      </p>


      <div
        className="
          mt-3
          grid
          gap-2
          sm:grid-cols-2
        "
      >

        {
          entradas.map(
            (
              [
                clave,
                valor
              ]
            ) => (

              <div
                key={clave}
                className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3
                  py-3
                "
              >

                <p
                  className="
                    truncate
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-slate-400
                  "
                >
                  {
                    clave.replaceAll(
                      '_',
                      ' '
                    )
                  }
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
                  {
                    typeof valor ===
                      'object'

                      ? JSON.stringify(
                          valor
                        )

                      : String(
                          valor
                        )
                  }
                </p>

              </div>

            )
          )
        }

      </div>

    </div>

  );

}


// ============================================================
// ESTADO VACÍO
// ============================================================

function EstadoVacio({

  icono: Icono,
  titulo,
  descripcion

}) {

  return (

    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        text-center
      "
    >

      <div
        className="
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

        <Icono
          size={25}
        />

      </div>


      <p
        className="
          mt-4
          font-bold
          text-slate-700
        "
      >
        {titulo}
      </p>


      <p
        className="
          mt-2
          max-w-sm
          text-sm
          leading-6
          text-slate-500
        "
      >
        {descripcion}
      </p>

    </div>

  );

}


export default IaPredictivaPage;

