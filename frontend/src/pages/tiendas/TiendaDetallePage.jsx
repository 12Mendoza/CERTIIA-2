import {
  useEffect,
  useState
} from 'react';

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  FileText,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Store
} from 'lucide-react';

import {
  useNavigate,
  useParams
} from 'react-router-dom';

import {
  api
} from '../../services/api';


function TiendaDetallePage() {

  const {
    id
  } = useParams();

  const navigate =
    useNavigate();

  const [
    tienda,
    setTienda
  ] = useState(null);

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


  // ============================================================
  // CARGAR FICHA
  // ============================================================

  async function cargarTienda(
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
          `/tiendas/${id}`
        );

      setTienda(
        respuesta.tienda || null
      );

    } catch (errorTienda) {

      setError(
        errorTienda.message ||
        'No se pudo cargar la ficha de la tienda.'
      );

    } finally {

      setCargando(false);
      setRecargando(false);

    }

  }


  useEffect(() => {

    cargarTienda();

  }, [id]);


  // ============================================================
  // UTILIDADES
  // ============================================================

  function formatearFecha(
    fecha
  ) {

    if (!fecha) {
      return 'No disponible';
    }

    const valor =
      new Date(fecha);

    if (
      Number.isNaN(
        valor.getTime()
      )
    ) {
      return 'No disponible';
    }

    return valor.toLocaleString(
      'es-PE',
      {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    );

  }


  function estiloRiesgo(
    nivel
  ) {

    if (nivel === 'ALTO') {
      return (
        'border-red-200 bg-red-50 text-red-700'
      );
    }

    if (nivel === 'MEDIO') {
      return (
        'border-amber-200 bg-amber-50 text-amber-700'
      );
    }

    return (
      'border-emerald-200 bg-emerald-50 text-emerald-700'
    );

  }


  function colorRiesgo(
    nivel
  ) {

    if (nivel === 'ALTO') {
      return 'bg-red-500';
    }

    if (nivel === 'MEDIO') {
      return 'bg-amber-500';
    }

    return 'bg-emerald-500';

  }


  // ============================================================
  // CARGANDO
  // ============================================================

  if (cargando) {

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
            w-full
            max-w-sm
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
              h-40
              w-40
              rounded-full
              bg-indigo-100
              blur-3xl
            "
          />

          <div
            className="
              relative
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-indigo-50
              text-indigo-600
            "
          >

            <Store size={28} />

            <div
              className="
                absolute
                inset-0
                animate-spin
                rounded-2xl
                border-2
                border-transparent
                border-t-indigo-500
              "
            />

          </div>

          <h2
            className="
              mt-5
              text-lg
              font-bold
              text-slate-900
            "
          >
            Cargando ficha de tienda
          </h2>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-500
            "
          >
            Estamos obteniendo la información
            general del local seleccionado.
          </p>

        </div>

      </div>

    );

  }


  // ============================================================
  // ERROR SIN TIENDA
  // ============================================================

  if (
    error &&
    !tienda
  ) {

    return (

      <div className="space-y-6">

        <button
          type="button"
          onClick={() =>
            navigate('/tiendas')
          }
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-slate-500
            transition
            hover:text-indigo-600
          "
        >
          <ArrowLeft size={18} />
          Volver a tiendas
        </button>

        <div
          className="
            rounded-3xl
            border
            border-red-200
            bg-red-50
            p-6
          "
        >

          <div
            className="
              flex
              items-start
              gap-3
            "
          >
            <CircleAlert
              size={22}
              className="
                mt-0.5
                shrink-0
                text-red-600
              "
            />

            <div>

              <h2
                className="
                  font-bold
                  text-red-800
                "
              >
                No se pudo cargar la tienda
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-red-700
                "
              >
                {error}
              </p>

            </div>
          </div>

        </div>

      </div>

    );

  }


  if (!tienda) {
    return null;
  }


  return (

    <div className="space-y-6">


      {/* ================================================= */}
      {/* VOLVER */}
      {/* ================================================= */}

      <button
        type="button"
        onClick={() =>
          navigate('/tiendas')
        }
        className="
          inline-flex
          items-center
          gap-2
          text-sm
          font-semibold
          text-slate-500
          transition
          hover:text-indigo-600
        "
      >
        <ArrowLeft size={18} />
        Volver a tiendas
      </button>


      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <section
        className="
          relative
          overflow-hidden
          rounded-[28px]
          border
          border-slate-800
          bg-gradient-to-br
          from-slate-950
          via-slate-900
          to-indigo-950
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
            bg-indigo-500/20
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -bottom-32
            left-1/3
            h-72
            w-72
            rounded-full
            bg-violet-500/10
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
              '28px 28px'
          }}
        />

        <div
          className="
            relative
            grid
            gap-6
            px-6
            py-7
            lg:grid-cols-[1fr_320px]
            lg:px-8
            lg:py-8
          "
        >

          <div
            className="
              flex
              items-start
              gap-4
            "
          >

            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-2xl
                border
                border-white/10
                bg-white/10
                text-white
                backdrop-blur
              "
            >
              <Store size={27} />
            </div>

            <div>

              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.22em]
                  text-indigo-300
                "
              >
                Ficha integral
              </p>

              <div
                className="
                  mt-2
                  flex
                  flex-wrap
                  items-center
                  gap-3
                "
              >
                <h1
                  className="
                    text-2xl
                    font-bold
                    tracking-tight
                    text-white
                    sm:text-3xl
                  "
                >
                  {tienda.nombre}
                </h1>

                <span
                  className="
                    rounded-lg
                    border
                    border-white/10
                    bg-white/10
                    px-2.5
                    py-1
                    text-xs
                    font-bold
                    text-slate-200
                  "
                >
                  {tienda.codigo}
                </span>
              </div>

              <p
                className="
                  mt-3
                  max-w-2xl
                  text-sm
                  leading-6
                  text-slate-300
                "
              >
                Información general, ubicación,
                clasificación de riesgo y control
                del registro de la tienda.
              </p>

              <div
                className="
                  mt-5
                  flex
                  flex-wrap
                  gap-2
                "
              >

                <EtiquetaHero>
                  <MapPin size={14} />
                  {tienda.distrito || 'Sin distrito'}
                </EtiquetaHero>

                <EtiquetaHero>
                  <Building2 size={14} />
                  RUC {tienda.ruc || 'No registrado'}
                </EtiquetaHero>

              </div>

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
                items-center
                justify-between
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
                  Estado operativo
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
                    tienda.activo
                      ? 'Tienda activa'
                      : 'Tienda inactiva'
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
                    tienda.activo
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-slate-500/15 text-slate-300'
                  }
                `}
              >
                <CheckCircle2 size={22} />
              </div>

            </div>

            <div
              className="
                mt-5
                space-y-3
              "
            >

              <FilaResumen
                etiqueta="Código"
                valor={
                  tienda.codigo ||
                  'N/D'
                }
                clase="bg-indigo-400"
              />

              <FilaResumen
                etiqueta="Nivel de riesgo"
                valor={
                  tienda.nivelRiesgo ||
                  'N/D'
                }
                clase={
                  colorRiesgo(
                    tienda.nivelRiesgo
                  )
                }
              />

              <FilaResumen
                etiqueta="Estado"
                valor={
                  tienda.activo
                    ? 'ACTIVA'
                    : 'INACTIVA'
                }
                clase={
                  tienda.activo
                    ? 'bg-emerald-400'
                    : 'bg-slate-400'
                }
              />

            </div>

            <button
              type="button"
              onClick={() =>
                cargarTienda(
                  true
                )
              }
              disabled={
                recargando
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
                disabled:opacity-60
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
                  : 'Actualizar ficha'
              }
            </button>

          </div>

        </div>

      </section>


      {/* ================================================= */}
      {/* ERROR DE RECARGA */}
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
            <CircleAlert
              size={20}
              className="mt-0.5 shrink-0"
            />

            <span>
              {error}
            </span>
          </div>

        )
      }


      {/* ================================================= */}
      {/* RESUMEN PRINCIPAL */}
      {/* ================================================= */}

      <section
        className="
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >

        <TarjetaResumen
          titulo="Código"
          valor={
            tienda.codigo ||
            'N/D'
          }
          subtitulo="Identificador interno"
          icono={Store}
          tono="indigo"
        />

        <TarjetaResumen
          titulo="RUC"
          valor={
            tienda.ruc ||
            'N/D'
          }
          subtitulo="Identificación tributaria"
          icono={Building2}
          tono="violet"
        />

        <TarjetaResumen
          titulo="Riesgo"
          valor={
            tienda.nivelRiesgo ||
            'N/D'
          }
          subtitulo="Clasificación operativa"
          icono={ShieldAlert}
          tono={
            tienda.nivelRiesgo === 'ALTO'
              ? 'red'
              : tienda.nivelRiesgo === 'MEDIO'
                ? 'amber'
                : 'emerald'
          }
        />

        <TarjetaResumen
          titulo="Estado"
          valor={
            tienda.activo
              ? 'ACTIVA'
              : 'INACTIVA'
          }
          subtitulo="Disponibilidad operativa"
          icono={CheckCircle2}
          tono={
            tienda.activo
              ? 'emerald'
              : 'slate'
          }
        />

      </section>


      {/* ================================================= */}
      {/* IDENTIFICACIÓN + RIESGO */}
      {/* ================================================= */}

      <section
        className="
          grid
          gap-6
          xl:grid-cols-[1.5fr_0.7fr]
        "
      >

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

          <EncabezadoSeccion
            icono={Building2}
            titulo="Información general"
            descripcion="Datos principales de identificación de la tienda."
            tono="indigo"
          />

          <div
            className="
              grid
              gap-x-8
              gap-y-6
              p-6
              sm:grid-cols-2
            "
          >
            <Dato
              titulo="Código"
              valor={
                tienda.codigo
              }
            />

            <Dato
              titulo="RUC"
              valor={
                tienda.ruc
              }
            />

            <Dato
              titulo="Nombre"
              valor={
                tienda.nombre
              }
            />

            <Dato
              titulo="Estado"
              valor={
                tienda.activo
                  ? 'Activa'
                  : 'Inactiva'
              }
            />
          </div>

        </article>


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

          <EncabezadoSeccion
            icono={ShieldAlert}
            titulo="Nivel de riesgo"
            descripcion="Clasificación operativa actual."
            tono="red"
          />

          <div className="p-6">

            <div
              className="
                rounded-2xl
                bg-slate-50
                p-5
              "
            >

              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-400
                "
              >
                Clasificación
              </p>

              <span
                className={`
                  mt-3
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  px-4
                  py-2
                  text-sm
                  font-bold
                  ${estiloRiesgo(
                    tienda.nivelRiesgo
                  )}
                `}
              >
                <span
                  className={`
                    h-2.5
                    w-2.5
                    rounded-full
                    ${colorRiesgo(
                      tienda.nivelRiesgo
                    )}
                  `}
                />

                {
                  tienda.nivelRiesgo ||
                  'No registrado'
                }
              </span>

              <p
                className="
                  mt-4
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Este nivel corresponde a la
                clasificación registrada actualmente
                para la tienda.
              </p>

            </div>

          </div>

        </article>

      </section>


      {/* ================================================= */}
      {/* UBICACIÓN */}
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

        <EncabezadoSeccion
          icono={MapPin}
          titulo="Ubicación"
          descripcion="Dirección y ubicación administrativa registrada."
          tono="emerald"
        />

        <div
          className="
            grid
            gap-x-8
            gap-y-6
            p-6
            md:grid-cols-2
            xl:grid-cols-4
          "
        >

          <Dato
            titulo="Dirección"
            valor={
              tienda.direccion
            }
          />

          <Dato
            titulo="Departamento"
            valor={
              tienda.departamento
            }
          />

          <Dato
            titulo="Provincia"
            valor={
              tienda.provincia
            }
          />

          <Dato
            titulo="Distrito"
            valor={
              tienda.distrito
            }
          />

        </div>

      </section>


      {/* ================================================= */}
      {/* CONTROL DEL REGISTRO */}
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

        <EncabezadoSeccion
          icono={CalendarDays}
          titulo="Control del registro"
          descripcion="Fechas de creación y última actualización."
          tono="slate"
        />

        <div
          className="
            grid
            gap-4
            p-6
            sm:grid-cols-2
          "
        >

          <FechaCard
            titulo="Fecha de creación"
            valor={
              formatearFecha(
                tienda.fechaCreacion
              )
            }
          />

          <FechaCard
            titulo="Última actualización"
            valor={
              formatearFecha(
                tienda.fechaActualizacion
              )
            }
          />

        </div>

      </section>


      {/* ================================================= */}
      {/* MÓDULOS RELACIONADOS */}
      {/* ================================================= */}

      <section>

        <div className="mb-4">

          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.16em]
              text-indigo-600
            "
          >
            Ecosistema CERTIIA
          </p>

          <h2
            className="
              mt-1
              text-lg
              font-bold
              text-slate-900
            "
          >
            Información relacionada
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            La tienda puede relacionarse con documentos,
            alertas y trámites del sistema.
          </p>

        </div>

        <div
          className="
            grid
            gap-4
            md:grid-cols-3
          "
        >

          <ModuloRelacionado
            icono={FileText}
            titulo="Documentos"
            descripcion="Los documentos de operatividad asociados se gestionan desde el módulo Documentos."
            tono="indigo"
          />

          <ModuloRelacionado
            icono={CircleAlert}
            titulo="Alertas"
            descripcion="Las alertas de vigencia y próximos vencimientos se administran desde Alertas y Calendario."
            tono="amber"
          />

          <ModuloRelacionado
            icono={ClipboardList}
            titulo="Trámites"
            descripcion="Los expedientes y seguimientos relacionados se gestionan desde el módulo Trámites."
            tono="violet"
          />

        </div>

      </section>

    </div>

  );

}


// ============================================================
// COMPONENTES VISUALES
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


function FilaResumen({
  etiqueta,
  valor,
  clase
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

      <div
        className="
          flex
          items-center
          gap-2
        "
      >
        <span
          className={`
            h-2
            w-2
            rounded-full
            ${clase}
          `}
        />

        <span
          className="
            text-xs
            font-medium
            text-slate-300
          "
        >
          {etiqueta}
        </span>
      </div>

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


function TarjetaResumen({
  titulo,
  valor,
  subtitulo,
  icono: Icono,
  tono
}) {

  const estilos = {
    indigo:
      'bg-indigo-50 text-indigo-600',
    violet:
      'bg-violet-50 text-violet-600',
    red:
      'bg-red-50 text-red-600',
    amber:
      'bg-amber-50 text-amber-600',
    emerald:
      'bg-emerald-50 text-emerald-600',
    slate:
      'bg-slate-100 text-slate-600'
  };

  return (

    <article
      className="
        rounded-3xl
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
          items-start
          justify-between
          gap-4
        "
      >

        <div>

          <p
            className="
              text-xs
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
              mt-2
              break-words
              text-xl
              font-bold
              text-slate-900
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
            {subtitulo}
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
            ${estilos[tono] || estilos.indigo}
          `}
        >
          <Icono size={20} />
        </div>

      </div>

    </article>

  );

}


function EncabezadoSeccion({
  icono: Icono,
  titulo,
  descripcion,
  tono
}) {

  const estilos = {
    indigo:
      'bg-indigo-50 text-indigo-600',
    emerald:
      'bg-emerald-50 text-emerald-600',
    red:
      'bg-red-50 text-red-600',
    slate:
      'bg-slate-100 text-slate-600'
  };

  return (

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
        px-6
        py-5
      "
    >

      <div
        className={`
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          ${estilos[tono] || estilos.indigo}
        `}
      >
        <Icono size={19} />
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
            mt-0.5
            text-xs
            text-slate-500
          "
        >
          {descripcion}
        </p>

      </div>

    </div>

  );

}


function Dato({
  titulo,
  valor
}) {

  return (

    <div>

      <p
        className="
          text-xs
          font-bold
          uppercase
          tracking-wider
          text-slate-400
        "
      >
        {titulo}
      </p>

      <p
        className="
          mt-1.5
          break-words
          text-sm
          font-semibold
          text-slate-700
        "
      >
        {valor || 'No registrado'}
      </p>

    </div>

  );

}


function FechaCard({
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
            text-slate-500
            shadow-sm
          "
        >
          <CalendarDays size={17} />
        </div>

        <div>
          <p
            className="
              text-xs
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
              text-sm
              font-semibold
              text-slate-700
            "
          >
            {valor}
          </p>
        </div>
      </div>

    </div>

  );

}


function ModuloRelacionado({
  icono: Icono,
  titulo,
  descripcion,
  tono
}) {

  const estilos = {
    indigo:
      'bg-indigo-50 text-indigo-600',
    amber:
      'bg-amber-50 text-amber-600',
    violet:
      'bg-violet-50 text-violet-600'
  };

  return (

    <article
      className="
        group
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:shadow-md
      "
    >

      <div
        className={`
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-2xl
          ${estilos[tono] || estilos.indigo}
        `}
      >
        <Icono size={21} />
      </div>

      <h3
        className="
          mt-4
          font-bold
          text-slate-800
        "
      >
        {titulo}
      </h3>

      <p
        className="
          mt-2
          text-sm
          leading-6
          text-slate-500
        "
      >
        {descripcion}
      </p>

    </article>

  );

}


export default TiendaDetallePage;
