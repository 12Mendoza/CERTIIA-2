/* eslint-disable react-hooks/exhaustive-deps */

import {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  BellRing,
  Check,
  CircleAlert,
  Database,
  Layers3,
  LockKeyhole,
  Mail,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

import {
  api
} from '../../services/api.js';


const TABS = [
  {
    id: 'PARAMETROS',
    nombre: 'Parámetros generales',
    descripcion: 'Seguridad, límites operativos y políticas del sistema.',
    icono: SlidersHorizontal
  },
  {
    id: 'CATALOGOS',
    nombre: 'Catálogos',
    descripcion: 'Valores configurables utilizados en los módulos de CERTIIA.',
    icono: Database
  },
  {
    id: 'NOTIFICACIONES',
    nombre: 'Notificaciones',
    descripcion: 'Canales, destinatarios y reglas automáticas de comunicación.',
    icono: BellRing
  }
];


function obtenerMensajeError(
  error,
  predeterminado
) {
  return (
    error?.response?.data?.mensaje ||
    error?.data?.mensaje ||
    error?.message ||
    predeterminado
  );
}


function CampoParametro({
  parametro,
  procesando,
  onGuardar
}) {
  const [
    valor,
    setValor
  ] = useState(
    parametro.valor ?? ''
  );

  useEffect(
    () => {
      setValor(
        parametro.valor ?? ''
      );
    },
    [
      parametro.valor
    ]
  );

  const modificado =
    String(valor) !==
    String(
      parametro.valor ?? ''
    );

  const bloqueado =
    Boolean(
      parametro.sensible ||
      !parametro.editable
    );

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
        shadow-sm
        transition
        duration-300
        hover:-translate-y-0.5
        hover:shadow-lg
        hover:shadow-slate-200/60
      "
    >
      <div
        className="
          absolute
          -right-12
          -top-12
          h-32
          w-32
          rounded-full
          bg-indigo-50
          opacity-70
          transition
          duration-300
          group-hover:scale-125
        "
      />

      <div
        className="
          relative
          p-5
          sm:p-6
        "
      >
        <div
          className="
            flex
            flex-col
            gap-5
            xl:flex-row
            xl:items-center
            xl:justify-between
          "
        >
          <div
            className="
              flex
              max-w-3xl
              items-start
              gap-4
            "
          >
            <div
              className={`
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                ${
                  bloqueado
                    ? 'bg-slate-100 text-slate-500'
                    : 'bg-indigo-50 text-indigo-600'
                }
              `}
            >
              {
                parametro.sensible
                  ? (
                    <LockKeyhole
                      size={21}
                    />
                  )
                  : (
                    <Settings2
                      size={21}
                    />
                  )
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
                <h3
                  className="
                    text-sm
                    font-bold
                    text-slate-900
                    sm:text-base
                  "
                >
                  {parametro.nombre}
                </h3>

                {
                  bloqueado && (
                    <span
                      className="
                        rounded-full
                        bg-slate-100
                        px-2.5
                        py-1
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-slate-500
                      "
                    >
                      Solo lectura
                    </span>
                  )
                }

                {
                  modificado &&
                  !bloqueado && (
                    <span
                      className="
                        rounded-full
                        bg-amber-50
                        px-2.5
                        py-1
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-amber-700
                      "
                    >
                      Cambio pendiente
                    </span>
                  )
                }
              </div>

              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                {
                  parametro.descripcion ||
                  'Parámetro operativo del sistema.'
                }
              </p>

              <div
                className="
                  mt-3
                  flex
                  flex-wrap
                  gap-2
                "
              >
                <span
                  className="
                    rounded-lg
                    border
                    border-slate-200
                    bg-slate-50
                    px-2.5
                    py-1
                    font-mono
                    text-[10px]
                    font-semibold
                    text-slate-500
                  "
                >
                  {parametro.clave}
                </span>

                <span
                  className="
                    rounded-lg
                    bg-indigo-50
                    px-2.5
                    py-1
                    text-[10px]
                    font-bold
                    text-indigo-600
                  "
                >
                  {parametro.tipo}
                </span>

                {
                  parametro.minimo !== null &&
                  parametro.minimo !== undefined &&
                  parametro.maximo !== null &&
                  parametro.maximo !== undefined && (
                    <span
                      className="
                        rounded-lg
                        bg-slate-100
                        px-2.5
                        py-1
                        text-[10px]
                        font-semibold
                        text-slate-500
                      "
                    >
                      Rango: {parametro.minimo} – {parametro.maximo}
                    </span>
                  )
                }
              </div>
            </div>
          </div>

          <div
            className="
              flex
              w-full
              flex-col
              gap-2
              sm:flex-row
              xl:max-w-md
            "
          >
            <input
              value={valor}
              onChange={
                (event) =>
                  setValor(
                    event.target.value
                  )
              }
              disabled={
                procesando ||
                bloqueado
              }
              type={
                parametro.tipo === 'ENTERO' ||
                parametro.tipo === 'DECIMAL'
                  ? 'number'
                  : 'text'
              }
              min={
                parametro.minimo ??
                undefined
              }
              max={
                parametro.maximo ??
                undefined
              }
              className="
                h-12
                min-w-0
                flex-1
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
                disabled:cursor-not-allowed
                disabled:bg-slate-100
                disabled:text-slate-400
              "
            />

            <button
              type="button"
              disabled={
                procesando ||
                bloqueado ||
                !modificado
              }
              onClick={
                () =>
                  onGuardar(
                    parametro,
                    valor
                  )
              }
              className="
                inline-flex
                h-12
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-indigo-600
                px-4
                text-sm
                font-bold
                text-white
                shadow-lg
                shadow-indigo-600/15
                transition
                hover:bg-indigo-700
                disabled:cursor-not-allowed
                disabled:opacity-40
                disabled:shadow-none
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
                    <Save
                      size={17}
                    />
                  )
              }

              Guardar
            </button>
          </div>
        </div>
      </div>

      <div
        className={`
          h-1
          w-full
          ${
            modificado &&
            !bloqueado
              ? 'bg-gradient-to-r from-amber-400 to-orange-400'
              : 'bg-gradient-to-r from-indigo-500 to-violet-500'
          }
        `}
      />
    </article>
  );
}


export default function ConfiguracionPage() {
  const [
    tab,
    setTab
  ] = useState(
    'PARAMETROS'
  );

  const [
    datos,
    setDatos
  ] = useState({
    parametros: [],
    catalogos: [],
    canales: [],
    reglas: [],
    roles: []
  });

  const [
    cargando,
    setCargando
  ] = useState(true);

  const [
    recargando,
    setRecargando
  ] = useState(false);

  const [
    procesando,
    setProcesando
  ] = useState('');

  const [
    mensaje,
    setMensaje
  ] = useState('');

  const [
    error,
    setError
  ] = useState('');

  const [
    catalogoSeleccionado,
    setCatalogoSeleccionado
  ] = useState('');

  const [
    nuevoValor,
    setNuevoValor
  ] = useState({
    codigo: '',
    nombre: '',
    descripcion: ''
  });

  const [
    nuevaRegla,
    setNuevaRegla
  ] = useState({
    nivel: 'POR_VENCER',
    rolId: '',
    canal: 'SISTEMA',
    maxReintentos: 3,
    descripcion: ''
  });


  async function cargar(
    mostrarRecarga = false
  ) {
    try {
      setError('');

      if (
        mostrarRecarga
      ) {
        setRecargando(true);
      } else {
        setCargando(true);
      }

      const respuesta =
        await api.get(
          '/configuracion/resumen'
        );

      setDatos({
        parametros:
          respuesta?.parametros ||
          [],
        catalogos:
          respuesta?.catalogos ||
          [],
        canales:
          respuesta?.canales ||
          [],
        reglas:
          respuesta?.reglas ||
          [],
        roles:
          respuesta?.roles ||
          []
      });

      if (
        !catalogoSeleccionado &&
        respuesta
          ?.catalogos
          ?.length
      ) {
        setCatalogoSeleccionado(
          String(
            respuesta.catalogos[0].id
          )
        );
      }

      if (
        !nuevaRegla.rolId &&
        respuesta
          ?.roles
          ?.length
      ) {
        setNuevaRegla(
          (actual) => ({
            ...actual,
            rolId:
              String(
                respuesta.roles[0].id
              )
          })
        );
      }
    } catch (
      errorCarga
    ) {
      setError(
        obtenerMensajeError(
          errorCarga,
          'No se pudo cargar la configuración.'
        )
      );
    } finally {
      setCargando(false);
      setRecargando(false);
    }
  }


  useEffect(
    () => {
      cargar();
    },
    []
  );


  const catalogoActual =
    useMemo(
      () =>
        datos.catalogos.find(
          (catalogo) =>
            String(
              catalogo.id
            ) ===
            String(
              catalogoSeleccionado
            )
        ) ||
        null,
      [
        datos.catalogos,
        catalogoSeleccionado
      ]
    );


  const resumenVisual =
    useMemo(
      () => {
        const parametrosEditables =
          datos.parametros.filter(
            (parametro) =>
              parametro.editable &&
              !parametro.sensible
          ).length;

        const valoresCatalogo =
          datos.catalogos.reduce(
            (
              total,
              catalogo
            ) =>
              total +
              (
                catalogo
                  ?.valores
                  ?.length ||
                0
              ),
            0
          );

        const canalesActivos =
          datos.canales.filter(
            (canal) =>
              canal.activo
          ).length;

        const reglasActivas =
          datos.reglas.filter(
            (regla) =>
              regla.activo
          ).length;

        return {
          parametrosEditables,
          valoresCatalogo,
          canalesActivos,
          reglasActivas
        };
      },
      [
        datos
      ]
    );


  async function ejecutar(
    clave,
    accion,
    mensajeOk
  ) {
    try {
      setProcesando(
        clave
      );

      setError('');
      setMensaje('');

      await accion();

      setMensaje(
        mensajeOk
      );

      await cargar();

      window.setTimeout(
        () =>
          setMensaje(''),
        3500
      );
    } catch (
      errorAccion
    ) {
      setError(
        obtenerMensajeError(
          errorAccion,
          'No se pudo completar la operación.'
        )
      );
    } finally {
      setProcesando('');
    }
  }


  async function guardarParametro(
    parametro,
    valor
  ) {
    await ejecutar(
      `param-${parametro.clave}`,
      () =>
        api.patch(
          `/configuracion/parametros/${encodeURIComponent(
            parametro.clave
          )}`,
          {
            valor
          }
        ),
      'Parámetro actualizado correctamente.'
    );
  }


  async function crearValor() {
    if (
      !catalogoActual ||
      !nuevoValor.codigo.trim() ||
      !nuevoValor.nombre.trim()
    ) {
      setError(
        'Código y nombre son obligatorios.'
      );

      return;
    }

    await ejecutar(
      'catalogo-nuevo',
      () =>
        api.post(
          `/configuracion/catalogos/${catalogoActual.id}/valores`,
          nuevoValor
        ),
      'Valor de catálogo creado correctamente.'
    );

    setNuevoValor({
      codigo: '',
      nombre: '',
      descripcion: ''
    });
  }


  async function cambiarEstadoValor(
    valor
  ) {
    await ejecutar(
      `valor-${valor.id}`,
      () =>
        api.patch(
          `/configuracion/catalogos/valores/${valor.id}`,
          {
            activo:
              !valor.activo
          }
        ),
      valor.activo
        ? 'Valor desactivado sin eliminar su historial.'
        : 'Valor reactivado correctamente.'
    );
  }


  async function cambiarCanal(
    canal
  ) {
    await ejecutar(
      `canal-${canal.codigo}`,
      () =>
        api.patch(
          `/configuracion/notificaciones/canales/${canal.codigo}`,
          {
            activo:
              !canal.activo
          }
        ),
      `Canal ${
        canal.activo
          ? 'deshabilitado'
          : 'habilitado'
      } correctamente.`
    );
  }


  async function crearRegla() {
    if (
      !nuevaRegla.rolId
    ) {
      setError(
        'Selecciona un rol destinatario.'
      );

      return;
    }

    await ejecutar(
      'regla-nueva',
      () =>
        api.post(
          '/configuracion/notificaciones/reglas',
          {
            ...nuevaRegla,
            rolId:
              Number(
                nuevaRegla.rolId
              ),
            maxReintentos:
              Number(
                nuevaRegla.maxReintentos
              )
          }
        ),
      'Regla de notificación creada correctamente.'
    );
  }


  async function cambiarRegla(
    regla
  ) {
    await ejecutar(
      `regla-${regla.id}`,
      () =>
        api.patch(
          `/configuracion/notificaciones/reglas/${regla.id}`,
          {
            activo:
              !regla.activo
          }
        ),
      regla.activo
        ? 'Regla desactivada correctamente.'
        : 'Regla activada correctamente.'
    );
  }


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
            <Settings2
              size={28}
            />

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
            Cargando configuración
          </h2>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-500
            "
          >
            Preparando parámetros, catálogos y
            reglas operativas de CERTIIA.
          </p>
        </div>
      </div>
    );
  }


  return (
    <div
      className="
        space-y-6
      "
    >
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
            -bottom-24
            left-1/4
            h-64
            w-64
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
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/10
                  text-indigo-300
                  backdrop-blur
                "
              >
                <Settings2
                  size={22}
                />
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
                  Administración central
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  Centro de control CERTIIA
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
              Configuración del sistema
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
              Administra parámetros globales,
              catálogos y reglas de notificación
              sin modificar valores rígidos en
              el código.
            </p>

            <div
              className="
                mt-6
                flex
                flex-wrap
                gap-2
              "
            >
              <HeroPill>
                <ShieldCheck
                  size={14}
                />
                Configuración protegida
              </HeroPill>

              <HeroPill>
                <Database
                  size={14}
                />
                Catálogos trazables
              </HeroPill>

              <HeroPill>
                <BellRing
                  size={14}
                />
                Reglas automáticas
              </HeroPill>
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
                  Estado del sistema
                </p>

                <p
                  className="
                    mt-1
                    text-lg
                    font-bold
                    text-white
                  "
                >
                  Configuración operativa
                </p>
              </div>

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  bg-emerald-500/15
                  text-emerald-300
                "
              >
                <ShieldCheck
                  size={22}
                />
              </div>
            </div>

            <div
              className="
                mt-5
                space-y-3
              "
            >
              <HeroStatusRow
                label="Parámetros editables"
                value={
                  resumenVisual
                    .parametrosEditables
                }
                color="bg-indigo-400"
              />

              <HeroStatusRow
                label="Canales activos"
                value={
                  `${resumenVisual.canalesActivos}/${datos.canales.length}`
                }
                color="bg-emerald-400"
              />

              <HeroStatusRow
                label="Reglas activas"
                value={
                  `${resumenVisual.reglasActivas}/${datos.reglas.length}`
                }
                color="bg-violet-400"
              />
            </div>

            <button
              type="button"
              onClick={
                () =>
                  cargar(true)
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
                disabled:cursor-not-allowed
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
                  : 'Actualizar configuración'
              }
            </button>
          </div>
        </div>
      </section>


      {/* MENSAJES */}

      {
        mensaje && (
          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-emerald-200
              bg-emerald-50
              px-5
              py-4
              text-sm
              font-medium
              text-emerald-700
              shadow-sm
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
                bg-emerald-100
              "
            >
              <Check
                size={18}
              />
            </div>

            {mensaje}
          </div>
        )
      }

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
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-red-100
              "
            >
              <CircleAlert
                size={18}
              />
            </div>

            <div>
              <p
                className="
                  font-bold
                "
              >
                No se pudo completar la operación
              </p>

              <p
                className="
                  mt-1
                "
              >
                {error}
              </p>
            </div>
          </div>
        )
      }


      {/* KPIS */}

      <section
        className="
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <KpiCard
          title="Parámetros"
          value={
            datos.parametros.length
          }
          subtitle={
            `${resumenVisual.parametrosEditables} editables`
          }
          icon={SlidersHorizontal}
          tone="indigo"
        />

        <KpiCard
          title="Catálogos"
          value={
            datos.catalogos.length
          }
          subtitle={
            `${resumenVisual.valoresCatalogo} valores registrados`
          }
          icon={Database}
          tone="blue"
        />

        <KpiCard
          title="Canales activos"
          value={
            resumenVisual.canalesActivos
          }
          subtitle={
            `${datos.canales.length} disponibles`
          }
          icon={BellRing}
          tone="emerald"
        />

        <KpiCard
          title="Reglas activas"
          value={
            resumenVisual.reglasActivas
          }
          subtitle={
            `${datos.reglas.length} configuradas`
          }
          icon={Sparkles}
          tone="violet"
        />
      </section>


      {/* NAVEGACIÓN */}

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
            grid
            gap-2
            p-2
            lg:grid-cols-3
          "
        >
          {
            TABS.map(
              (item) => {
                const Icono =
                  item.icono;

                const activo =
                  item.id ===
                  tab;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={
                      () =>
                        setTab(
                          item.id
                        )
                    }
                    className={`
                      group
                      flex
                      items-center
                      gap-3
                      rounded-2xl
                      px-4
                      py-3.5
                      text-left
                      transition
                      ${
                        activo
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
                          : 'text-slate-600 hover:bg-slate-50'
                      }
                    `}
                  >
                    <div
                      className={`
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        ${
                          activo
                            ? 'bg-white/15 text-white'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-white'
                        }
                      `}
                    >
                      <Icono
                        size={18}
                      />
                    </div>

                    <div>
                      <p
                        className="
                          text-sm
                          font-bold
                        "
                      >
                        {item.nombre}
                      </p>

                      <p
                        className={`
                          mt-0.5
                          text-[11px]
                          leading-4
                          ${
                            activo
                              ? 'text-indigo-100'
                              : 'text-slate-400'
                          }
                        `}
                      >
                        {item.descripcion}
                      </p>
                    </div>
                  </button>
                );
              }
            )
          }
        </div>
      </section>


      {/* PARÁMETROS */}

      {
        tab ===
          'PARAMETROS' && (
          <section
            className="
              space-y-5
            "
          >
            <InfoPanel
              icon={ShieldCheck}
              title="Políticas operativas protegidas"
              description="Los valores se validan en el backend según su tipo y rango. Los secretos técnicos no se muestran ni se administran desde esta pantalla."
              tone="indigo"
            />

            <div
              className="
                grid
                gap-4
              "
            >
              {
                datos.parametros.map(
                  (
                    parametro
                  ) => (
                    <CampoParametro
                      key={
                        parametro.clave
                      }
                      parametro={
                        parametro
                      }
                      procesando={
                        procesando ===
                        `param-${parametro.clave}`
                      }
                      onGuardar={
                        guardarParametro
                      }
                    />
                  )
                )
              }

              {
                datos.parametros.length ===
                  0 && (
                  <EmptyState
                    icon={
                      SlidersHorizontal
                    }
                    title="Sin parámetros disponibles"
                    description="No se recibieron parámetros configurables desde el backend."
                  />
                )
              }
            </div>
          </section>
        )
      }


      {/* CATÁLOGOS */}

      {
        tab ===
          'CATALOGOS' && (
          <section
            className="
              space-y-5
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
              <div
                className="
                  border-b
                  border-slate-100
                  bg-gradient-to-r
                  from-white
                  to-indigo-50/50
                  px-5
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
                    <Plus
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
                      Agregar valor al catálogo
                    </h2>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-500
                      "
                    >
                      Crea nuevos valores sin modificar
                      el código de la aplicación.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="
                  grid
                  gap-4
                  p-5
                  md:grid-cols-2
                  xl:grid-cols-[240px_0.8fr_1fr_1.4fr_auto]
                "
              >
                <FieldGroup
                  label="Catálogo"
                >
                  <select
                    value={
                      catalogoSeleccionado
                    }
                    onChange={
                      (event) =>
                        setCatalogoSeleccionado(
                          event.target.value
                        )
                    }
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-slate-300
                      bg-white
                      px-3
                      text-sm
                      text-slate-700
                      outline-none
                      transition
                      focus:border-indigo-500
                      focus:ring-4
                      focus:ring-indigo-50
                    "
                  >
                    {
                      datos.catalogos.map(
                        (
                          catalogo
                        ) => (
                          <option
                            key={
                              catalogo.id
                            }
                            value={
                              catalogo.id
                            }
                          >
                            {
                              catalogo.nombre
                            }
                          </option>
                        )
                      )
                    }
                  </select>
                </FieldGroup>

                <FieldGroup
                  label="Código"
                >
                  <input
                    value={
                      nuevoValor.codigo
                    }
                    onChange={
                      (event) =>
                        setNuevoValor(
                          (
                            actual
                          ) => ({
                            ...actual,
                            codigo:
                              event.target.value.toUpperCase()
                          })
                        )
                    }
                    placeholder="CÓDIGO"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-slate-300
                      px-3
                      text-sm
                      font-medium
                      text-slate-700
                      outline-none
                      transition
                      focus:border-indigo-500
                      focus:ring-4
                      focus:ring-indigo-50
                    "
                  />
                </FieldGroup>

                <FieldGroup
                  label="Nombre"
                >
                  <input
                    value={
                      nuevoValor.nombre
                    }
                    onChange={
                      (event) =>
                        setNuevoValor(
                          (
                            actual
                          ) => ({
                            ...actual,
                            nombre:
                              event.target.value
                          })
                        )
                    }
                    placeholder="Nombre visible"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-slate-300
                      px-3
                      text-sm
                      text-slate-700
                      outline-none
                      transition
                      focus:border-indigo-500
                      focus:ring-4
                      focus:ring-indigo-50
                    "
                  />
                </FieldGroup>

                <FieldGroup
                  label="Descripción"
                >
                  <input
                    value={
                      nuevoValor.descripcion
                    }
                    onChange={
                      (event) =>
                        setNuevoValor(
                          (
                            actual
                          ) => ({
                            ...actual,
                            descripcion:
                              event.target.value
                          })
                        )
                    }
                    placeholder="Descripción opcional"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-slate-300
                      px-3
                      text-sm
                      text-slate-700
                      outline-none
                      transition
                      focus:border-indigo-500
                      focus:ring-4
                      focus:ring-indigo-50
                    "
                  />
                </FieldGroup>

                <div
                  className="
                    flex
                    items-end
                  "
                >
                  <button
                    type="button"
                    onClick={
                      crearValor
                    }
                    disabled={
                      procesando ===
                      'catalogo-nuevo'
                    }
                    className="
                      inline-flex
                      h-12
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
                      shadow-lg
                      shadow-indigo-600/15
                      transition
                      hover:bg-indigo-700
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                      xl:w-auto
                    "
                  >
                    {
                      procesando ===
                      'catalogo-nuevo'
                        ? (
                          <RefreshCw
                            size={17}
                            className="animate-spin"
                          />
                        )
                        : (
                          <Plus
                            size={17}
                          />
                        )
                    }

                    Agregar
                  </button>
                </div>
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
              <div
                className="
                  flex
                  flex-col
                  gap-3
                  border-b
                  border-slate-100
                  px-5
                  py-5
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <div>
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <Layers3
                      size={18}
                      className="text-indigo-600"
                    />

                    <h2
                      className="
                        font-bold
                        text-slate-900
                      "
                    >
                      {
                        catalogoActual
                          ?.nombre ||
                        'Catálogo'
                      }
                    </h2>
                  </div>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-500
                    "
                  >
                    Los valores históricos no se
                    eliminan; se desactivan para
                    conservar trazabilidad.
                  </p>
                </div>

                <span
                  className="
                    inline-flex
                    w-fit
                    items-center
                    rounded-full
                    bg-slate-100
                    px-3
                    py-1.5
                    text-xs
                    font-bold
                    text-slate-600
                  "
                >
                  {
                    catalogoActual
                      ?.valores
                      ?.length ||
                    0
                  } valores
                </span>
              </div>

              <div
                className="
                  grid
                  gap-3
                  p-4
                  md:grid-cols-2
                  xl:grid-cols-3
                "
              >
                {
                  catalogoActual
                    ?.valores
                    ?.map(
                      (
                        valor
                      ) => (
                        <CatalogValueCard
                          key={
                            valor.id
                          }
                          valor={
                            valor
                          }
                          procesando={
                            procesando ===
                            `valor-${valor.id}`
                          }
                          onToggle={
                            cambiarEstadoValor
                          }
                        />
                      )
                    )
                }

                {
                  (
                    catalogoActual
                      ?.valores
                      ?.length ||
                    0
                  ) ===
                    0 && (
                    <div
                      className="
                        md:col-span-2
                        xl:col-span-3
                      "
                    >
                      <EmptyState
                        icon={
                          Database
                        }
                        title="Catálogo sin valores"
                        description="Agrega el primer valor utilizando el formulario superior."
                      />
                    </div>
                  )
                }
              </div>
            </article>
          </section>
        )
      }


      {/* NOTIFICACIONES */}

      {
        tab ===
          'NOTIFICACIONES' && (
          <section
            className="
              space-y-5
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
              <div
                className="
                  flex
                  flex-col
                  gap-3
                  border-b
                  border-slate-100
                  bg-gradient-to-r
                  from-white
                  to-indigo-50/40
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
                    <BellRing
                      size={21}
                    />
                  </div>

                  <div>
                    <h2
                      className="
                        font-bold
                        text-slate-900
                      "
                    >
                      Canales disponibles
                    </h2>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-500
                      "
                    >
                      Un canal deshabilitado no
                      genera nuevos envíos.
                    </p>
                  </div>
                </div>

                <span
                  className="
                    inline-flex
                    w-fit
                    rounded-full
                    bg-emerald-50
                    px-3
                    py-1.5
                    text-xs
                    font-bold
                    text-emerald-700
                  "
                >
                  {
                    resumenVisual
                      .canalesActivos
                  } activos
                </span>
              </div>

              <div
                className="
                  grid
                  gap-4
                  p-5
                  md:grid-cols-2
                "
              >
                {
                  datos.canales.map(
                    (
                      canal
                    ) => (
                      <ChannelCard
                        key={
                          canal.codigo
                        }
                        canal={
                          canal
                        }
                        procesando={
                          procesando ===
                          `canal-${canal.codigo}`
                        }
                        onToggle={
                          cambiarCanal
                        }
                      />
                    )
                  )
                }

                {
                  datos.canales.length ===
                    0 && (
                    <div
                      className="
                        md:col-span-2
                      "
                    >
                      <EmptyState
                        icon={
                          BellRing
                        }
                        title="Sin canales configurados"
                        description="No se recibieron canales de notificación desde el backend."
                      />
                    </div>
                  )
                }
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
              <div
                className="
                  border-b
                  border-slate-100
                  px-5
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
                    <Sparkles
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
                      Nueva regla de notificación
                    </h2>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-500
                      "
                    >
                      Define cuándo notificar, a qué
                      rol y mediante qué canal.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="
                  grid
                  gap-4
                  p-5
                  md:grid-cols-2
                  xl:grid-cols-[0.9fr_1fr_1fr_0.8fr_1.5fr_auto]
                "
              >
                <FieldGroup
                  label="Nivel"
                >
                  <select
                    value={
                      nuevaRegla.nivel
                    }
                    onChange={
                      (event) =>
                        setNuevaRegla(
                          (
                            actual
                          ) => ({
                            ...actual,
                            nivel:
                              event.target.value
                          })
                        )
                    }
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-slate-300
                      bg-white
                      px-3
                      text-sm
                      text-slate-700
                      outline-none
                      focus:border-indigo-500
                      focus:ring-4
                      focus:ring-indigo-50
                    "
                  >
                    <option
                      value="POR_VENCER"
                    >
                      Por vencer
                    </option>

                    <option
                      value="CRITICO"
                    >
                      Crítico
                    </option>

                    <option
                      value="VENCIDO"
                    >
                      Vencido
                    </option>
                  </select>
                </FieldGroup>

                <FieldGroup
                  label="Destinatario"
                >
                  <select
                    value={
                      nuevaRegla.rolId
                    }
                    onChange={
                      (event) =>
                        setNuevaRegla(
                          (
                            actual
                          ) => ({
                            ...actual,
                            rolId:
                              event.target.value
                          })
                        )
                    }
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-slate-300
                      bg-white
                      px-3
                      text-sm
                      text-slate-700
                      outline-none
                      focus:border-indigo-500
                      focus:ring-4
                      focus:ring-indigo-50
                    "
                  >
                    {
                      datos.roles.map(
                        (
                          rol
                        ) => (
                          <option
                            key={
                              rol.id
                            }
                            value={
                              rol.id
                            }
                          >
                            {
                              rol.nombre
                            }
                          </option>
                        )
                      )
                    }
                  </select>
                </FieldGroup>

                <FieldGroup
                  label="Canal"
                >
                  <select
                    value={
                      nuevaRegla.canal
                    }
                    onChange={
                      (event) =>
                        setNuevaRegla(
                          (
                            actual
                          ) => ({
                            ...actual,
                            canal:
                              event.target.value
                          })
                        )
                    }
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-slate-300
                      bg-white
                      px-3
                      text-sm
                      text-slate-700
                      outline-none
                      focus:border-indigo-500
                      focus:ring-4
                      focus:ring-indigo-50
                    "
                  >
                    {
                      datos.canales.map(
                        (
                          canal
                        ) => (
                          <option
                            key={
                              canal.codigo
                            }
                            value={
                              canal.codigo
                            }
                            disabled={
                              !canal.activo
                            }
                          >
                            {
                              canal.nombre
                            }
                          </option>
                        )
                      )
                    }
                  </select>
                </FieldGroup>

                <FieldGroup
                  label="Reintentos"
                >
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={
                      nuevaRegla.maxReintentos
                    }
                    onChange={
                      (event) =>
                        setNuevaRegla(
                          (
                            actual
                          ) => ({
                            ...actual,
                            maxReintentos:
                              event.target.value
                          })
                        )
                    }
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-slate-300
                      px-3
                      text-sm
                      text-slate-700
                      outline-none
                      focus:border-indigo-500
                      focus:ring-4
                      focus:ring-indigo-50
                    "
                  />
                </FieldGroup>

                <FieldGroup
                  label="Descripción"
                >
                  <input
                    value={
                      nuevaRegla.descripcion
                    }
                    onChange={
                      (event) =>
                        setNuevaRegla(
                          (
                            actual
                          ) => ({
                            ...actual,
                            descripcion:
                              event.target.value
                          })
                        )
                    }
                    placeholder="Descripción opcional"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-slate-300
                      px-3
                      text-sm
                      text-slate-700
                      outline-none
                      focus:border-indigo-500
                      focus:ring-4
                      focus:ring-indigo-50
                    "
                  />
                </FieldGroup>

                <div
                  className="
                    flex
                    items-end
                  "
                >
                  <button
                    type="button"
                    onClick={
                      crearRegla
                    }
                    disabled={
                      procesando ===
                      'regla-nueva'
                    }
                    className="
                      inline-flex
                      h-12
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
                      shadow-lg
                      shadow-indigo-600/15
                      transition
                      hover:bg-indigo-700
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                      xl:w-auto
                    "
                  >
                    {
                      procesando ===
                      'regla-nueva'
                        ? (
                          <RefreshCw
                            size={17}
                            className="animate-spin"
                          />
                        )
                        : (
                          <Plus
                            size={17}
                          />
                        )
                    }

                    Crear regla
                  </button>
                </div>
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
              <div
                className="
                  flex
                  flex-col
                  gap-3
                  border-b
                  border-slate-100
                  px-5
                  py-5
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
                    Reglas configuradas
                  </h2>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-500
                    "
                  >
                    Activa o pausa reglas sin perder
                    su configuración histórica.
                  </p>
                </div>

                <span
                  className="
                    inline-flex
                    w-fit
                    rounded-full
                    bg-violet-50
                    px-3
                    py-1.5
                    text-xs
                    font-bold
                    text-violet-700
                  "
                >
                  {
                    resumenVisual
                      .reglasActivas
                  } activas
                </span>
              </div>

              <div
                className="
                  grid
                  gap-3
                  p-4
                  lg:grid-cols-2
                "
              >
                {
                  datos.reglas.map(
                    (
                      regla
                    ) => (
                      <NotificationRuleCard
                        key={
                          regla.id
                        }
                        regla={
                          regla
                        }
                        procesando={
                          procesando ===
                          `regla-${regla.id}`
                        }
                        onToggle={
                          cambiarRegla
                        }
                      />
                    )
                  )
                }

                {
                  datos.reglas.length ===
                    0 && (
                    <div
                      className="
                        lg:col-span-2
                      "
                    >
                      <EmptyState
                        icon={
                          Sparkles
                        }
                        title="Sin reglas configuradas"
                        description="Crea la primera regla de notificación utilizando el formulario superior."
                      />
                    </div>
                  )
                }
              </div>
            </article>
          </section>
        )
      }
    </div>
  );
}


function HeroPill({
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


function HeroStatusRow({
  label,
  value,
  color
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
            ${color}
          `}
        />

        <span
          className="
            text-xs
            font-medium
            text-slate-300
          "
        >
          {label}
        </span>
      </div>

      <span
        className="
          text-sm
          font-bold
          text-white
        "
      >
        {value}
      </span>
    </div>
  );
}


function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone
}) {
  const tones = {
    indigo: {
      icon:
        'bg-indigo-50 text-indigo-600',
      badge:
        'bg-indigo-50 text-indigo-600',
      bar:
        'from-indigo-500 to-violet-500'
    },
    blue: {
      icon:
        'bg-blue-50 text-blue-600',
      badge:
        'bg-blue-50 text-blue-600',
      bar:
        'from-blue-500 to-cyan-500'
    },
    emerald: {
      icon:
        'bg-emerald-50 text-emerald-600',
      badge:
        'bg-emerald-50 text-emerald-600',
      bar:
        'from-emerald-500 to-teal-500'
    },
    violet: {
      icon:
        'bg-violet-50 text-violet-600',
      badge:
        'bg-violet-50 text-violet-600',
      bar:
        'from-violet-500 to-fuchsia-500'
    }
  };

  const style =
    tones[tone] ||
    tones.indigo;

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
          duration-300
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
              rounded-full
              px-2.5
              py-1
              text-[10px]
              font-bold
              uppercase
              tracking-wide
              ${style.badge}
            `}
          >
            Sistema
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
            {title}
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
            {value}
          </p>

          <p
            className="
              mt-1
              text-xs
              text-slate-500
            "
          >
            {subtitle}
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
            ${style.icon}
          `}
        >
          <Icon
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
          ${style.bar}
        `}
      />
    </article>
  );
}


function InfoPanel({
  icon: Icon,
  title,
  description,
  tone = 'indigo'
}) {
  const tones = {
    indigo:
      'border-indigo-100 bg-indigo-50/70 text-indigo-900',
    amber:
      'border-amber-100 bg-amber-50/70 text-amber-900'
  };

  return (
    <div
      className={`
        flex
        items-start
        gap-3
        rounded-2xl
        border
        px-5
        py-4
        ${tones[tone] || tones.indigo}
      `}
    >
      <Icon
        size={20}
        className="
          mt-0.5
          shrink-0
        "
      />

      <div>
        <p
          className="
            text-sm
            font-bold
          "
        >
          {title}
        </p>

        <p
          className="
            mt-1
            text-xs
            leading-5
            opacity-80
          "
        >
          {description}
        </p>
      </div>
    </div>
  );
}


function FieldGroup({
  label,
  children
}) {
  return (
    <label
      className="
        block
      "
    >
      <span
        className="
          mb-2
          block
          text-xs
          font-bold
          uppercase
          tracking-wide
          text-slate-500
        "
      >
        {label}
      </span>

      {children}
    </label>
  );
}


function CatalogValueCard({
  valor,
  procesando,
  onToggle
}) {
  return (
    <div
      className={`
        rounded-2xl
        border
        p-4
        transition
        ${
          valor.activo
            ? 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm'
            : 'border-slate-200 bg-slate-50 opacity-80'
        }
      `}
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <div
          className="
            min-w-0
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
            <p
              className="
                font-bold
                text-slate-800
              "
            >
              {valor.nombre}
            </p>

            <span
              className="
                rounded-lg
                bg-slate-100
                px-2
                py-1
                font-mono
                text-[10px]
                font-semibold
                text-slate-500
              "
            >
              {valor.codigo}
            </span>
          </div>

          {
            valor.descripcion && (
              <p
                className="
                  mt-2
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                {valor.descripcion}
              </p>
            )
          }

          <div
            className="
              mt-3
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
                ${
                  valor.activo
                    ? 'bg-emerald-500'
                    : 'bg-slate-400'
                }
              `}
            />

            <span
              className="
                text-[11px]
                font-semibold
                text-slate-500
              "
            >
              {
                valor.activo
                  ? 'Disponible para nuevas operaciones'
                  : 'Desactivado; se conserva para trazabilidad'
              }
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={
            () =>
              onToggle(
                valor
              )
          }
          disabled={
            procesando
          }
          className={`
            inline-flex
            h-10
            shrink-0
            items-center
            gap-2
            rounded-xl
            border
            px-3
            text-xs
            font-bold
            transition
            disabled:opacity-50
            ${
              valor.activo
                ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }
          `}
        >
          {
            procesando
              ? (
                <RefreshCw
                  size={16}
                  className="animate-spin"
                />
              )
              : valor.activo
                ? (
                  <ToggleRight
                    size={18}
                  />
                )
                : (
                  <ToggleLeft
                    size={18}
                  />
                )
          }

          {
            valor.activo
              ? 'Desactivar'
              : 'Reactivar'
          }
        </button>
      </div>
    </div>
  );
}


function ChannelCard({
  canal,
  procesando,
  onToggle
}) {
  const esCorreo =
    String(
      canal.codigo
    ).toUpperCase()
      .includes(
        'MAIL'
      ) ||
    String(
      canal.codigo
    ).toUpperCase()
      .includes(
        'CORREO'
      ) ||
    String(
      canal.codigo
    ).toUpperCase() ===
      'EMAIL';

  const Icon =
    esCorreo
      ? Mail
      : BellRing;

  return (
    <div
      className={`
        relative
        overflow-hidden
        rounded-2xl
        border
        p-5
        transition
        ${
          canal.activo
            ? 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50/60'
            : 'border-slate-200 bg-slate-50'
        }
      `}
    >
      <div
        className="
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
                canal.activo
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-200 text-slate-500'
              }
            `}
          >
            <Icon
              size={20}
            />
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
                  text-slate-800
                "
              >
                {canal.nombre}
              </p>

              <span
                className={`
                  rounded-full
                  px-2.5
                  py-1
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                  ${
                    canal.activo
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-500'
                  }
                `}
              >
                {
                  canal.activo
                    ? 'Activo'
                    : 'Inactivo'
                }
              </span>
            </div>

            <p
              className="
                mt-2
                text-xs
                leading-5
                text-slate-500
              "
            >
              {
                canal.descripcion ||
                'Canal de notificación configurado en CERTIIA.'
              }
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={
            () =>
              onToggle(
                canal
              )
          }
          disabled={
            procesando
          }
          className={`
            shrink-0
            transition
            disabled:opacity-50
            ${
              canal.activo
                ? 'text-emerald-600 hover:text-emerald-700'
                : 'text-slate-400 hover:text-slate-600'
            }
          `}
          title={
            canal.activo
              ? 'Deshabilitar canal'
              : 'Habilitar canal'
          }
        >
          {
            procesando
              ? (
                <RefreshCw
                  size={29}
                  className="animate-spin"
                />
              )
              : canal.activo
                ? (
                  <ToggleRight
                    size={32}
                  />
                )
                : (
                  <ToggleLeft
                    size={32}
                  />
                )
          }
        </button>
      </div>
    </div>
  );
}


function NotificationRuleCard({
  regla,
  procesando,
  onToggle
}) {
  const levelStyle =
    regla.nivel ===
      'VENCIDO'
      ? 'bg-red-50 text-red-700'
      : regla.nivel ===
          'CRITICO'
        ? 'bg-orange-50 text-orange-700'
        : 'bg-amber-50 text-amber-700';

  return (
    <div
      className={`
        rounded-2xl
        border
        p-5
        transition
        ${
          regla.activo
            ? 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm'
            : 'border-slate-200 bg-slate-50 opacity-80'
        }
      `}
    >
      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div
          className="
            min-w-0
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
            <span
              className={`
                rounded-lg
                px-2.5
                py-1
                text-[10px]
                font-bold
                uppercase
                tracking-wide
                ${levelStyle}
              `}
            >
              {
                String(
                  regla.nivel ||
                  ''
                ).replaceAll(
                  '_',
                  ' '
                )
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
                regla.rol_nombre
              }
            </span>
          </div>

          <div
            className="
              mt-3
              flex
              flex-wrap
              gap-2
              text-[11px]
              font-semibold
              text-slate-500
            "
          >
            <span
              className="
                rounded-lg
                bg-slate-100
                px-2.5
                py-1
              "
            >
              Canal: {
                regla.canal
              }
            </span>

            <span
              className="
                rounded-lg
                bg-slate-100
                px-2.5
                py-1
              "
            >
              {
                regla.max_reintentos
              } reintentos
            </span>
          </div>

          {
            regla.descripcion && (
              <p
                className="
                  mt-3
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                {regla.descripcion}
              </p>
            )
          }
        </div>

        <button
          type="button"
          onClick={
            () =>
              onToggle(
                regla
              )
          }
          disabled={
            procesando
          }
          className={`
            inline-flex
            h-10
            shrink-0
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            px-3
            text-xs
            font-bold
            transition
            disabled:opacity-50
            ${
              regla.activo
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-white text-slate-500'
            }
          `}
        >
          {
            procesando
              ? (
                <RefreshCw
                  size={16}
                  className="animate-spin"
                />
              )
              : regla.activo
                ? (
                  <ToggleRight
                    size={18}
                  />
                )
                : (
                  <ToggleLeft
                    size={18}
                  />
                )
          }

          {
            regla.activo
              ? 'Activa'
              : 'Inactiva'
          }
        </button>
      </div>
    </div>
  );
}


function EmptyState({
  icon: Icon,
  title,
  description
}) {
  return (
    <div
      className="
        flex
        min-h-56
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-slate-300
        bg-slate-50
        px-6
        py-10
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
          bg-white
          text-slate-400
          shadow-sm
        "
      >
        <Icon
          size={25}
        />
      </div>

      <h3
        className="
          mt-4
          font-bold
          text-slate-800
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2
          max-w-md
          text-sm
          leading-6
          text-slate-500
        "
      >
        {description}
      </p>
    </div>
  );
}
