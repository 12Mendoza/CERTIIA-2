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
  FileText,
  Landmark,
  Mail,
  MapPin,
  ShieldCheck,
  UserRound,
  UsersRound
} from 'lucide-react';

import {
  useNavigate,
  useParams
} from 'react-router-dom';

import {
  api
} from '../../services/api';


function EntidadDetallePage() {

  const navigate =
    useNavigate();

  const {
    id
  } = useParams();

  const [
    entidad,
    setEntidad
  ] = useState(null);

  const [
    cargando,
    setCargando
  ] = useState(true);

  const [
    error,
    setError
  ] = useState('');


  useEffect(() => {

    async function cargarEntidad() {

      try {

        setCargando(true);
        setError('');

        const respuesta =
          await api.get(
            `/entidades/${id}`
          );

        setEntidad(
          respuesta.entidad
        );

      } catch (errorEntidad) {

        setError(
          errorEntidad.message ||
          'No se pudo cargar la entidad emisora.'
        );

      } finally {

        setCargando(false);

      }

    }

    cargarEntidad();

  }, [
    id
  ]);


  function etiquetaTipo(
    tipo
  ) {

    switch (tipo) {
      case 'MUNICIPALIDAD':
        return 'Municipalidad';
      case 'ENTIDAD_PUBLICA':
        return 'Entidad pública';
      case 'EMPRESA_PRIVADA':
        return 'Empresa privada';
      case 'PROFESIONAL':
        return 'Profesional';
      default:
        return tipo || 'Sin tipo';
    }

  }


  function iconoTipo(
    tipo,
    size = 25
  ) {

    switch (tipo) {
      case 'MUNICIPALIDAD':
        return <Landmark size={size} />;
      case 'ENTIDAD_PUBLICA':
        return <Building2 size={size} />;
      case 'EMPRESA_PRIVADA':
        return <UsersRound size={size} />;
      case 'PROFESIONAL':
        return <UserRound size={size} />;
      default:
        return <Building2 size={size} />;
    }

  }


  function estiloTipo(
    tipo
  ) {

    switch (tipo) {
      case 'MUNICIPALIDAD':
        return 'border-indigo-200 bg-indigo-50 text-indigo-700';
      case 'ENTIDAD_PUBLICA':
        return 'border-sky-200 bg-sky-50 text-sky-700';
      case 'EMPRESA_PRIVADA':
        return 'border-violet-200 bg-violet-50 text-violet-700';
      case 'PROFESIONAL':
        return 'border-amber-200 bg-amber-50 text-amber-700';
      default:
        return 'border-slate-200 bg-slate-50 text-slate-700';
    }

  }


  function formatearFecha(
    valor
  ) {

    if (!valor) {
      return 'No disponible';
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
            <Building2 size={28} />

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

          <h2 className="mt-5 text-lg font-bold text-slate-900">
            Cargando entidad emisora
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Estamos obteniendo la ficha completa de la entidad.
          </p>
        </div>
      </div>
    );

  }


  if (
    error ||
    !entidad
  ) {

    return (
      <div className="mx-auto max-w-3xl">

        <button
          type="button"
          onClick={() =>
            navigate(
              '/entidades'
            )
          }
          className="
            mb-5
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-indigo-600
            transition
            hover:text-indigo-700
          "
        >
          <ArrowLeft size={18} />
          Volver a Entidades Emisoras
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
          <div className="flex items-start gap-3">
            <CircleAlert
              size={22}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <p className="font-semibold text-red-700">
                No se pudo mostrar la entidad.
              </p>

              <p className="mt-2 text-sm text-red-600">
                {
                  error ||
                  'La entidad emisora no existe.'
                }
              </p>
            </div>
          </div>
        </div>

      </div>
    );

  }


  return (

    <div className="space-y-6">


      <button
        type="button"
        onClick={() =>
          navigate(
            '/entidades'
          )
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
        Volver a Entidades Emisoras
      </button>


      {/* HERO */}

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
            lg:grid-cols-[1fr_310px]
            lg:px-8
            lg:py-8
          "
        >

          <div className="flex items-start gap-4">

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
                text-indigo-200
                backdrop-blur
              "
            >
              {
                iconoTipo(
                  entidad.tipo,
                  27
                )
              }
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
                Entidad emisora
              </p>

              <h1
                className="
                  mt-2
                  text-2xl
                  font-bold
                  tracking-tight
                  text-white
                  sm:text-3xl
                "
              >
                {entidad.nombre}
              </h1>

              <div className="mt-3 flex flex-wrap gap-2">

                <span
                  className={`
                    rounded-full
                    border
                    px-3
                    py-1
                    text-xs
                    font-bold
                    ${estiloTipo(
                      entidad.tipo
                    )}
                  `}
                >
                  {
                    etiquetaTipo(
                      entidad.tipo
                    )
                  }
                </span>

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
                    py-1
                    text-xs
                    font-semibold
                    text-slate-200
                  "
                >
                  <MapPin size={13} />
                  {entidad.ubicacion}
                </span>
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

            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wide
                text-slate-400
              "
            >
              Estado del registro
            </p>

            <div className="mt-3 flex items-center gap-3">

              <div
                className={`
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  ${
                    entidad.activo
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-slate-500/15 text-slate-300'
                  }
                `}
              >
                <CheckCircle2 size={22} />
              </div>

              <div>
                <p className="font-bold text-white">
                  {
                    entidad.activo
                      ? 'Entidad activa'
                      : 'Entidad inactiva'
                  }
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {
                    entidad.activo
                      ? 'Disponible para operaciones'
                      : 'Conservada para trazabilidad'
                  }
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* RESUMEN */}

      <section
        className="
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >

        <TarjetaResumen
          titulo="Tipo"
          valor={
            etiquetaTipo(
              entidad.tipo
            )
          }
          icono={Building2}
          tono="indigo"
        />

        <TarjetaResumen
          titulo="RUC"
          valor={
            entidad.ruc ||
            'No aplica'
          }
          icono={Landmark}
          tono="violet"
        />

        <TarjetaResumen
          titulo="Estado"
          valor={
            entidad.activo
              ? 'ACTIVA'
              : 'INACTIVA'
          }
          icono={ShieldCheck}
          tono={
            entidad.activo
              ? 'emerald'
              : 'slate'
          }
        />

        <TarjetaResumen
          titulo="Ubicación"
          valor={
            entidad.ubicacion ||
            'No registrada'
          }
          icono={MapPin}
          tono="sky"
        />

      </section>


      {/* INFORMACIÓN PRINCIPAL */}

      <section
        className="
          grid
          gap-6
          xl:grid-cols-2
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
            descripcion="Datos principales de identificación."
            tono="indigo"
          />

          <div className="grid gap-6 p-6 sm:grid-cols-2">

            <Dato
              titulo="Tipo"
              valor={
                etiquetaTipo(
                  entidad.tipo
                )
              }
            />

            <Dato
              titulo="Nombre"
              valor={
                entidad.nombre
              }
            />

            <Dato
              titulo="RUC"
              valor={
                entidad.ruc ||
                'No aplica'
              }
            />

            <Dato
              titulo="Estado"
              valor={
                entidad.activo
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
            icono={MapPin}
            titulo="Ubicación y contacto"
            descripcion="Información para identificación y comunicación."
            tono="sky"
          />

          <div className="space-y-5 p-6">

            <BloqueInfo
              icono={MapPin}
              titulo="Ubicación"
              valor={
                entidad.ubicacion
              }
            />

            <BloqueInfo
              icono={Mail}
              titulo="Datos de contacto"
              valor={
                entidad.datosContacto ||
                'No registrados'
              }
            />

          </div>

        </article>

      </section>


      {/* TRAZABILIDAD */}

      <section
        className="
          grid
          gap-4
          md:grid-cols-2
        "
      >

        <FechaCard
          titulo="Fecha de creación"
          valor={
            formatearFecha(
              entidad.fechaCreacion
            )
          }
          tono="violet"
        />

        <FechaCard
          titulo="Última actualización"
          valor={
            formatearFecha(
              entidad.fechaActualizacion
            )
          }
          tono="emerald"
        />

      </section>


      {/* DOCUMENTOS */}

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
            items-start
            gap-4
            p-6
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
              bg-indigo-50
              text-indigo-600
            "
          >
            <FileText size={22} />
          </div>

          <div>
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

            <h2 className="mt-1 font-bold text-slate-900">
              Documentos asociados
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Los documentos emitidos o gestionados por esta entidad
              se administran desde el módulo Documentos. Esta ficha
              conserva los datos maestros de la entidad emisora.
            </p>
          </div>
        </div>

      </section>

    </div>

  );

}


function TarjetaResumen({
  titulo,
  valor,
  icono: Icono,
  tono
}) {

  const estilos = {
    indigo:
      'bg-indigo-50 text-indigo-600',
    violet:
      'bg-violet-50 text-violet-600',
    emerald:
      'bg-emerald-50 text-emerald-600',
    slate:
      'bg-slate-100 text-slate-600',
    sky:
      'bg-sky-50 text-sky-600'
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
      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">
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
              text-lg
              font-bold
              text-slate-900
            "
          >
            {valor}
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
    sky:
      'bg-sky-50 text-sky-600'
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
        <h2 className="font-bold text-slate-900">
          {titulo}
        </h2>

        <p className="mt-0.5 text-xs text-slate-500">
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


function BloqueInfo({
  icono: Icono,
  titulo,
  valor
}) {

  return (
    <div
      className="
        flex
        items-start
        gap-3
        rounded-2xl
        bg-slate-50
        p-4
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
          bg-white
          text-slate-500
          shadow-sm
        "
      >
        <Icono size={16} />
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
            break-words
            text-sm
            font-semibold
            leading-6
            text-slate-700
          "
        >
          {valor}
        </p>
      </div>
    </div>
  );

}


function FechaCard({
  titulo,
  valor,
  tono
}) {

  const estilos = {
    violet:
      'bg-violet-50 text-violet-600',
    emerald:
      'bg-emerald-50 text-emerald-600'
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
      <div className="flex items-start gap-4">

        <div
          className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${estilos[tono]}
          `}
        >
          <CalendarDays size={20} />
        </div>

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

          <p className="mt-2 text-sm font-semibold text-slate-700">
            {valor}
          </p>
        </div>

      </div>
    </article>
  );

}


export default EntidadDetallePage;
