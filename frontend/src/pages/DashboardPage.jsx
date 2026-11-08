import {

  useCallback,

  useEffect,

  useMemo,

  useState

} from 'react';



import {

  AlertTriangle,

  ArrowUpRight,

  BarChart3,

  Building2,

  CalendarClock,

  CircleCheck,

  Clock3,

  FileClock,

  Files,

  Filter,

  Gauge,

  LayoutDashboard,

  RefreshCw,

  ShieldAlert,

  Store,

  X

} from 'lucide-react';



import {

  useLocation,

  useNavigate

} from 'react-router-dom';



import {

  api

} from '../services/api';



import {

  useAuth

} from '../context/AuthContext.jsx';





const filtrosVacios = {

  tiendaId: '',

  tipoDocumentoId: '',

  categoria: ''

};





function formatearFecha(valor) {

  if (!valor) {

    return '—';

  }



  const partes =

    String(valor)

      .slice(0, 10)

      .split('-');



  if (partes.length !== 3) {

    return String(valor);

  }



  return `${partes[2]}/${partes[1]}/${partes[0]}`;

}





function textoEstado(estado) {

  const textos = {

    VIGENTE: 'Vigente',

    POR_VENCER: 'Por vencer',

    CRITICO: 'Crítico',

    VENCIDO: 'Vencido',

    EN_RENOVACION: 'En renovación'

  };



  return textos[estado] ||

    estado ||

    '—';

}





function claseEstado(estado) {

  const clases = {

    VIGENTE:

      'bg-emerald-100 text-emerald-700',

    POR_VENCER:

      'bg-amber-100 text-amber-700',

    CRITICO:

      'bg-orange-100 text-orange-700',

    VENCIDO:

      'bg-red-100 text-red-700',

    EN_RENOVACION:

      'bg-blue-100 text-blue-700'

  };



  return clases[estado] ||

    'bg-slate-100 text-slate-700';

}





function DashboardPage() {

  const location =

    useLocation();



  const navigate =

    useNavigate();



  const {

    usuario

  } = useAuth();





  const permisos =

    usuario?.permisos || [];



  const puedeVerDocumentos =

    permisos.includes(

      'documentos.ver'

    );



  const puedeVerTiendas =

    permisos.includes(

      'tiendas.ver'

    );





  const filtrosIniciales =

    useMemo(

      () => ({

        tiendaId:

          location.state

            ?.filtrosDashboard

            ?.tiendaId || '',

        tipoDocumentoId:

          location.state

            ?.filtrosDashboard

            ?.tipoDocumentoId || '',

        categoria:

          location.state

            ?.filtrosDashboard

            ?.categoria || ''

      }),

      [location.state]

    );





  const [datos, setDatos] =

    useState({

      resumen: {

        totalTiendas: 0,

        tiendasConDocumentos: 0,

        totalDocumentos: 0

      },

      indicadores: {

        vigente: 0,

        porVencer: 0,

        critico: 0,

        vencido: 0,

        enRenovacion: 0

      },

      proximosVencimientos: [],

      catalogos: {

        tiendas: [],

        tiposDocumento: []

      }

    });



  const [filtros, setFiltros] =

    useState(filtrosIniciales);



  const [filtrosAplicados, setFiltrosAplicados] =

    useState(filtrosIniciales);



  const [cargando, setCargando] =

    useState(true);



  const [recargando, setRecargando] =

    useState(false);



  const [error, setError] =

    useState('');





  const categorias =

    useMemo(

      () => {

        return [

          ...new Set(

            datos.catalogos

              .tiposDocumento

              .map(

                (tipo) =>

                  tipo.categoria

              )

              .filter(Boolean)

          )

        ].sort(

          (a, b) =>

            a.localeCompare(b)

        );

      },

      [datos.catalogos.tiposDocumento]

    );





  const cargarDashboard =

    useCallback(

      async (

        filtrosConsulta = filtrosVacios,

        esRecarga = false

      ) => {

        try {

          if (esRecarga) {

            setRecargando(true);

          }



          const parametros =

            new URLSearchParams();



          Object.entries(

            filtrosConsulta

          ).forEach(

            ([clave, valor]) => {

              if (

                valor !== undefined &&

                valor !== null &&

                String(valor).trim() !== ''

              ) {

                parametros.set(

                  clave,

                  String(valor).trim()

                );

              }

            }

          );



          const query =

            parametros.toString();



          const respuesta =

            await api.get(

              `/dashboard${

                query

                  ? `?${query}`

                  : ''

              }`

            );



          setError('');



          setDatos({

            resumen:

              respuesta.resumen || {

                totalTiendas: 0,

                tiendasConDocumentos: 0,

                totalDocumentos: 0

              },



            indicadores:

              respuesta.indicadores || {

                vigente: 0,

                porVencer: 0,

                critico: 0,

                vencido: 0,

                enRenovacion: 0

              },



            proximosVencimientos:

              respuesta.proximosVencimientos || [],



            catalogos:

              respuesta.catalogos || {

                tiendas: [],

                tiposDocumento: []

              }

          });



          setFiltrosAplicados({

            ...filtrosConsulta

          });



        } catch (errorDashboard) {

          setError(

            errorDashboard.message ||

            'No se pudo cargar el Dashboard.'

          );



        } finally {

          setCargando(false);

          setRecargando(false);

        }

      },

      []

    );





  useEffect(

    () => {

      let activo = true;



      queueMicrotask(

        () => {

          if (!activo) {

            return;

          }



          cargarDashboard(

            filtrosIniciales

          );

        }

      );



      return () => {

        activo = false;

      };

    },

    [

      cargarDashboard,

      filtrosIniciales

    ]

  );





  function cambiarFiltro(

    campo,

    valor

  ) {

    setFiltros(

      (actual) => ({

        ...actual,

        [campo]: valor

      })

    );

  }





  function aplicarFiltros(evento) {

    evento.preventDefault();



    setCargando(true);



    cargarDashboard(

      filtros

    );

  }





  function limpiarFiltros() {

    const nuevosFiltros = {

      ...filtrosVacios

    };



    setFiltros(

      nuevosFiltros

    );



    setCargando(true);



    cargarDashboard(

      nuevosFiltros

    );

  }





  function construirParametrosDocumentos(

    estado = ''

  ) {

    const parametros =

      new URLSearchParams();



    Object.entries(

      filtrosAplicados

    ).forEach(

      ([clave, valor]) => {

        if (

          valor !== undefined &&

          valor !== null &&

          String(valor).trim() !== ''

        ) {

          parametros.set(

            clave,

            String(valor).trim()

          );

        }

      }

    );



    if (estado) {

      parametros.set(

        'estado',

        estado

      );

    }



    return parametros;

  }





  function abrirListado(

    estado,

    etiqueta

  ) {

    if (!puedeVerDocumentos) {

      return;

    }



    const parametros =

      construirParametrosDocumentos(

        estado

      );



    navigate(

      `/documentos?${parametros.toString()}`,

      {

        state: {

          desdeDashboard: true,

          indicador:

            etiqueta,

          filtrosDashboard:

            filtrosAplicados

        }

      }

    );

  }





  function abrirDocumento(documento) {

    if (!puedeVerDocumentos) {

      return;

    }



    navigate(

      `/documentos?documentoId=${documento.id}`,

      {

        state: {

          desdeDashboard: true,

          abrirDetalle: true,

          documentoId:

            documento.id,

          indicador:

            'Próximos vencimientos',

          filtrosDashboard:

            filtrosAplicados

        }

      }

    );

  }





  const tarjetasEstado = [

    {

      clave: 'vigente',

      estado: 'VIGENTE',

      titulo: 'Vigentes',

      valor:

        datos.indicadores.vigente,

      icono: CircleCheck,

      iconoClase:

        'bg-emerald-50 text-emerald-600',

      hoverClase:

        'hover:border-emerald-200'

    },

    {

      clave: 'porVencer',

      estado: 'POR_VENCER',

      titulo: 'Por vencer',

      valor:

        datos.indicadores.porVencer,

      icono: Clock3,

      iconoClase:

        'bg-amber-50 text-amber-600',

      hoverClase:

        'hover:border-amber-200'

    },

    {

      clave: 'critico',

      estado: 'CRITICO',

      titulo: 'Críticos',

      valor:

        datos.indicadores.critico,

      icono: ShieldAlert,

      iconoClase:

        'bg-orange-50 text-orange-600',

      hoverClase:

        'hover:border-orange-200'

    },

    {

      clave: 'vencido',

      estado: 'VENCIDO',

      titulo: 'Vencidos',

      valor:

        datos.indicadores.vencido,

      icono: AlertTriangle,

      iconoClase:

        'bg-red-50 text-red-600',

      hoverClase:

        'hover:border-red-200'

    },

    {

      clave: 'enRenovacion',

      estado: 'EN_RENOVACION',

      titulo: 'En renovación',

      valor:

        datos.indicadores.enRenovacion,

      icono: FileClock,

      iconoClase:

        'bg-blue-50 text-blue-600',

      hoverClase:

        'hover:border-blue-200'

    }

  ];





  const totalEstados =
    Number(
      datos.indicadores.vigente || 0
    ) +
    Number(
      datos.indicadores.porVencer || 0
    ) +
    Number(
      datos.indicadores.critico || 0
    ) +
    Number(
      datos.indicadores.vencido || 0
    ) +
    Number(
      datos.indicadores.enRenovacion || 0
    );


  const riesgoInmediato =
    Number(
      datos.indicadores.critico || 0
    ) +
    Number(
      datos.indicadores.vencido || 0
    );


  const porcentajeCumplimiento =
    totalEstados > 0
      ? Math.round(
          (
            Number(
              datos.indicadores.vigente || 0
            ) /
            totalEstados
          ) * 100
        )
      : 0;


  const filtrosActivos =
    Object.values(
      filtrosAplicados
    ).filter(
      (valor) =>
        valor !== undefined &&
        valor !== null &&
        String(valor).trim() !== ''
    ).length;


  const estadosGrafica = [
    {
      clave: 'VIGENTE',
      etiqueta: 'Vigentes',
      valor: Number(
        datos.indicadores.vigente || 0
      ),
      color: '#10b981'
    },
    {
      clave: 'POR_VENCER',
      etiqueta: 'Por vencer',
      valor: Number(
        datos.indicadores.porVencer || 0
      ),
      color: '#f59e0b'
    },
    {
      clave: 'CRITICO',
      etiqueta: 'Críticos',
      valor: Number(
        datos.indicadores.critico || 0
      ),
      color: '#f97316'
    },
    {
      clave: 'VENCIDO',
      etiqueta: 'Vencidos',
      valor: Number(
        datos.indicadores.vencido || 0
      ),
      color: '#ef4444'
    },
    {
      clave: 'EN_RENOVACION',
      etiqueta: 'En renovación',
      valor: Number(
        datos.indicadores.enRenovacion || 0
      ),
      color: '#3b82f6'
    }
  ];


  const vencimientosPorHorizonte =
    useMemo(
      () => {

        const grupos = {
          vencidos: 0,
          semana: 0,
          mes: 0,
          posterior: 0
        };


        (
          datos.proximosVencimientos ||
          []
        ).forEach(
          (documento) => {

            const dias =
              Number(
                documento.diasRestantes
              );


            if (
              !Number.isFinite(
                dias
              )
            ) {
              return;
            }


            if (dias < 0) {
              grupos.vencidos += 1;
              return;
            }


            if (dias <= 7) {
              grupos.semana += 1;
              return;
            }


            if (dias <= 30) {
              grupos.mes += 1;
              return;
            }


            grupos.posterior += 1;

          }
        );


        return [
          {
            etiqueta: 'Vencidos',
            valor: grupos.vencidos,
            color: '#ef4444'
          },
          {
            etiqueta: '0–7 días',
            valor: grupos.semana,
            color: '#f97316'
          },
          {
            etiqueta: '8–30 días',
            valor: grupos.mes,
            color: '#f59e0b'
          },
          {
            etiqueta: 'Más de 30 días',
            valor: grupos.posterior,
            color: '#6366f1'
          }
        ];

      },
      [
        datos.proximosVencimientos
      ]
    );


  const nombreUsuario =
    usuario?.nombres ||
    usuario?.nombre ||
    'Usuario';


  return (

    <div className="space-y-6">

      {/* ===================================================== */}
      {/* HERO EJECUTIVO */}
      {/* ===================================================== */}

      <section
        className="
          relative
          overflow-hidden
          rounded-[30px]
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
            -bottom-28
            left-1/4
            h-72
            w-72
            rounded-full
            bg-violet-500/20
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
            lg:grid-cols-[1fr_360px]
            lg:px-8
            lg:py-8
          "
        >

          {/* HERO IZQUIERDO */}

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
                  text-indigo-200
                  backdrop-blur
                "
              >
                <LayoutDashboard size={24} />
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
                  Panel ejecutivo
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  Control documental CERTIIA
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
              Dashboard de operatividad
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
              Bienvenido, {nombreUsuario}. Supervisa el cumplimiento,
              riesgo y próximos vencimientos de los documentos de
              operatividad de las tiendas.
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
                <Store size={14} />
                {cargando
                  ? '...'
                  : datos.resumen.totalTiendas}{' '}
                tienda(s)
              </EtiquetaHero>

              <EtiquetaHero>
                <Files size={14} />
                {cargando
                  ? '...'
                  : datos.resumen.totalDocumentos}{' '}
                documento(s)
              </EtiquetaHero>

              <EtiquetaHero>
                <Filter size={14} />
                {filtrosActivos}{' '}
                filtro(s) activo(s)
              </EtiquetaHero>

            </div>

          </div>


          {/* PANEL LATERAL */}

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
                  {cargando
                    ? 'Consultando...'
                    : riesgoInmediato > 0
                      ? `${riesgoInmediato} requiere(n) atención`
                      : 'Sin riesgo inmediato'}
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
                    riesgoInmediato > 0
                      ? 'bg-red-500/15 text-red-200'
                      : 'bg-emerald-500/15 text-emerald-200'
                  }
                `}
              >
                {
                  riesgoInmediato > 0
                    ? <ShieldAlert size={22} />
                    : <CircleCheck size={22} />
                }
              </div>

            </div>


            <div className="mt-5 space-y-3">

              <FilaHero
                etiqueta="Cumplimiento vigente"
                valor={
                  cargando
                    ? '...'
                    : `${porcentajeCumplimiento}%`
                }
              />

              <FilaHero
                etiqueta="Críticos"
                valor={
                  cargando
                    ? '...'
                    : datos.indicadores.critico
                }
              />

              <FilaHero
                etiqueta="Vencidos"
                valor={
                  cargando
                    ? '...'
                    : datos.indicadores.vencido
                }
              />

              <FilaHero
                etiqueta="En renovación"
                valor={
                  cargando
                    ? '...'
                    : datos.indicadores.enRenovacion
                }
              />

            </div>


            <button
              type="button"
              onClick={() =>
                cargarDashboard(
                  filtrosAplicados,
                  true
                )
              }
              disabled={recargando}
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
                disabled:opacity-50
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
                  : 'Actualizar dashboard'
              }

            </button>

          </div>

        </div>

      </section>


      {/* ===================================================== */}
      {/* ERROR */}
      {/* ===================================================== */}

      {
        error && (

          <div
            className="
              rounded-2xl
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


      {/* ===================================================== */}
      {/* KPIs PRINCIPALES */}
      {/* ===================================================== */}

      <section
        className="
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >

        <KpiDashboard
          titulo="Tiendas activas"
          valor={
            cargando
              ? '...'
              : datos.resumen.totalTiendas
          }
          descripcion={`${datos.resumen.tiendasConDocumentos} con documentos en el filtro`}
          icono={Store}
          tono="indigo"
          etiqueta="Operación"
          interactivo={puedeVerTiendas}
          onClick={() => {
            if (puedeVerTiendas) {
              navigate('/tiendas');
            }
          }}
        />

        <KpiDashboard
          titulo="Documentos activos"
          valor={
            cargando
              ? '...'
              : datos.resumen.totalDocumentos
          }
          descripcion="Registros operativos"
          icono={Files}
          tono="violet"
          etiqueta="Documentos"
          interactivo={puedeVerDocumentos}
          onClick={() =>
            abrirListado(
              '',
              'Total de documentos'
            )
          }
        />

        <KpiDashboard
          titulo="Riesgo inmediato"
          valor={
            cargando
              ? '...'
              : riesgoInmediato
          }
          descripcion="Críticos + vencidos"
          icono={ShieldAlert}
          tono="red"
          etiqueta="Prioridad"
        />

        <KpiDashboard
          titulo="Próximos vencimientos"
          valor={
            cargando
              ? '...'
              : datos.proximosVencimientos.length
          }
          descripcion="Documentos próximos visibles"
          icono={CalendarClock}
          tono="cyan"
          etiqueta="Agenda"
        />

      </section>


      {/* ===================================================== */}
      {/* FILTROS */}
      {/* ===================================================== */}

      <form
        onSubmit={aplicarFiltros}
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
            to-slate-50
            px-5
            py-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div className="flex items-center gap-3">

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
              <Filter size={18} />
            </div>

            <div>

              <h2
                className="
                  font-bold
                  text-slate-900
                "
              >
                Filtros del dashboard
              </h2>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-slate-500
                "
              >
                Ajusta la lectura ejecutiva por tienda, tipo documental o categoría.
              </p>

            </div>

          </div>


          {
            filtrosActivos > 0 && (

              <span
                className="
                  inline-flex
                  self-start
                  rounded-full
                  bg-indigo-50
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  text-indigo-700
                  sm:self-auto
                "
              >
                {filtrosActivos} filtro(s) aplicado(s)
              </span>

            )
          }

        </div>


        <div className="p-5">

          <div
            className="
              grid
              gap-4
              md:grid-cols-3
            "
          >

            <CampoFiltro label="Tienda">

              <select
                value={filtros.tiendaId}
                onChange={(evento) =>
                  cambiarFiltro(
                    'tiendaId',
                    evento.target.value
                  )
                }
                className={claseCampoFiltro()}
              >

                <option value="">
                  Todas las tiendas
                </option>

                {
                  datos.catalogos.tiendas.map(
                    (tienda) => (

                      <option
                        key={tienda.id}
                        value={tienda.id}
                      >
                        {tienda.nombre}
                      </option>

                    )
                  )
                }

              </select>

            </CampoFiltro>


            <CampoFiltro label="Tipo documental">

              <select
                value={filtros.tipoDocumentoId}
                onChange={(evento) =>
                  cambiarFiltro(
                    'tipoDocumentoId',
                    evento.target.value
                  )
                }
                className={claseCampoFiltro()}
              >

                <option value="">
                  Todos los tipos
                </option>

                {
                  datos.catalogos.tiposDocumento.map(
                    (tipo) => (

                      <option
                        key={tipo.id}
                        value={tipo.id}
                      >
                        {tipo.nombre}
                      </option>

                    )
                  )
                }

              </select>

            </CampoFiltro>


            <CampoFiltro label="Categoría">

              <select
                value={filtros.categoria}
                onChange={(evento) =>
                  cambiarFiltro(
                    'categoria',
                    evento.target.value
                  )
                }
                className={claseCampoFiltro()}
              >

                <option value="">
                  Todas las categorías
                </option>

                {
                  categorias.map(
                    (categoria) => (

                      <option
                        key={categoria}
                        value={categoria}
                      >
                        {categoria}
                      </option>

                    )
                  )
                }

              </select>

            </CampoFiltro>

          </div>


          <div
            className="
              mt-4
              flex
              flex-wrap
              gap-3
            "
          >

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
                font-bold
                text-white
                shadow-lg
                shadow-indigo-600/15
                transition
                hover:bg-indigo-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <Filter size={16} />
              Aplicar filtros
            </button>


            <button
              type="button"
              onClick={limpiarFiltros}
              disabled={cargando}
              className="
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
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
              <X size={16} />
              Limpiar
            </button>

          </div>

        </div>

      </form>


      {/* ===================================================== */}
      {/* ESTADO DOCUMENTAL */}
      {/* ===================================================== */}

      <section className="space-y-4">

        <div
          className="
            flex
            flex-col
            gap-2
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >

          <div>

            <h2
              className="
                text-lg
                font-bold
                text-slate-900
              "
            >
              Estado documental
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Selecciona un indicador para consultar los documentos que componen el valor.
            </p>

          </div>


          <div
            className="
              inline-flex
              items-center
              gap-2
              self-start
              rounded-full
              bg-slate-100
              px-3
              py-1.5
              text-xs
              font-semibold
              text-slate-500
              sm:self-auto
            "
          >
            <BarChart3 size={14} />
            {totalEstados} documento(s) clasificado(s)
          </div>

        </div>


        <div
          className="
            grid
            gap-4
            sm:grid-cols-2
            xl:grid-cols-5
          "
        >

          {
            tarjetasEstado.map(
              (tarjeta) => {

                const Icono =
                  tarjeta.icono;

                return (

                  <button
                    key={tarjeta.clave}
                    type="button"
                    disabled={!puedeVerDocumentos}
                    onClick={() =>
                      abrirListado(
                        tarjeta.estado,
                        tarjeta.titulo
                      )
                    }
                    className={`
                      group
                      relative
                      overflow-hidden
                      rounded-3xl
                      border
                      border-slate-200
                      bg-white
                      p-5
                      text-left
                      shadow-sm
                      transition
                      duration-300
                      ${
                        puedeVerDocumentos
                          ? `hover:-translate-y-1 hover:shadow-lg ${tarjeta.hoverClase}`
                          : 'cursor-not-allowed opacity-80'
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
                          {tarjeta.titulo}
                        </p>

                        <p
                          className="
                            mt-2
                            text-3xl
                            font-bold
                            text-slate-950
                          "
                        >
                          {
                            cargando
                              ? '...'
                              : tarjeta.valor
                          }
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            text-slate-400
                          "
                        >
                          {
                            totalEstados > 0
                              ? `${Math.round(
                                  (
                                    Number(
                                      tarjeta.valor || 0
                                    ) /
                                    totalEstados
                                  ) * 100
                                )}% del total`
                              : '0% del total'
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
                          ${tarjeta.iconoClase}
                        `}
                      >
                        <Icono size={21} />
                      </div>

                    </div>


                    {
                      puedeVerDocumentos && (

                        <div
                          className="
                            mt-4
                            flex
                            items-center
                            gap-1
                            text-xs
                            font-semibold
                            text-slate-400
                            transition
                            group-hover:text-indigo-600
                          "
                        >
                          Ver documentos
                          <ArrowUpRight size={13} />
                        </div>

                      )
                    }

                  </button>

                );

              }
            )
          }

        </div>

      </section>


      {/* ===================================================== */}
      {/* GRÁFICAS + LECTURA EJECUTIVA */}
      {/* ===================================================== */}

      <section
        className="
          grid
          gap-5
          xl:grid-cols-2
        "
      >

        {/* =================================================== */}
        {/* GRÁFICA CIRCULAR */}
        {/* =================================================== */}

        <div
          className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            sm:p-6
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

              <h2
                className="
                  font-bold
                  text-slate-900
                "
              >
                Distribución documental
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Participación de cada estado dentro de los documentos visibles.
              </p>

            </div>


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
              <BarChart3 size={19} />
            </div>

          </div>


          <GraficaDonutEstados
            datos={estadosGrafica}
            total={totalEstados}
          />

        </div>


        {/* =================================================== */}
        {/* GRÁFICA DE VENCIMIENTOS */}
        {/* =================================================== */}

        <div
          className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            sm:p-6
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

              <h2
                className="
                  font-bold
                  text-slate-900
                "
              >
                Horizonte de vencimientos
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Distribución de los próximos vencimientos según días restantes.
              </p>

            </div>


            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-amber-50
                text-amber-600
              "
            >
              <CalendarClock size={19} />
            </div>

          </div>


          <GraficaBarrasVencimientos
            datos={vencimientosPorHorizonte}
          />

        </div>

      </section>


      {/* ===================================================== */}
      {/* DISTRIBUCIÓN + LECTURA EJECUTIVA */}
      {/* ===================================================== */}

      <section
        className="
          grid
          gap-5
          xl:grid-cols-[1.35fr_0.65fr]
        "
      >

        {/* DISTRIBUCIÓN */}

        <div
          className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            sm:p-6
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

              <h2
                className="
                  font-bold
                  text-slate-900
                "
              >
                Distribución por estado
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Comparación porcentual de los estados documentales.
              </p>

            </div>


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
              <BarChart3 size={19} />
            </div>

          </div>


          <div className="mt-6 space-y-5">

            <BarraEstado
              etiqueta="Vigentes"
              valor={datos.indicadores.vigente}
              total={totalEstados}
              barra="bg-emerald-500"
            />

            <BarraEstado
              etiqueta="Por vencer"
              valor={datos.indicadores.porVencer}
              total={totalEstados}
              barra="bg-amber-500"
            />

            <BarraEstado
              etiqueta="Críticos"
              valor={datos.indicadores.critico}
              total={totalEstados}
              barra="bg-orange-500"
            />

            <BarraEstado
              etiqueta="Vencidos"
              valor={datos.indicadores.vencido}
              total={totalEstados}
              barra="bg-red-500"
            />

            <BarraEstado
              etiqueta="En renovación"
              valor={datos.indicadores.enRenovacion}
              total={totalEstados}
              barra="bg-blue-500"
            />

          </div>

        </div>


        {/* LECTURA EJECUTIVA */}

        <div
          className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            sm:p-6
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

              <h2
                className="
                  font-bold
                  text-slate-900
                "
              >
                Lectura ejecutiva
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Resumen rápido del nivel de exposición documental.
              </p>

            </div>


            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-violet-50
                text-violet-600
              "
            >
              <Gauge size={19} />
            </div>

          </div>


          <div className="mt-6 space-y-4">

            <ResumenEjecutivo
              titulo="Cumplimiento vigente"
              valor={`${porcentajeCumplimiento}%`}
              descripcion="Documentos clasificados como vigentes"
              tono="emerald"
            />

            <ResumenEjecutivo
              titulo="Atención inmediata"
              valor={riesgoInmediato}
              descripcion="Críticos y vencidos"
              tono={
                riesgoInmediato > 0
                  ? 'red'
                  : 'emerald'
              }
            />

            <ResumenEjecutivo
              titulo="Prevención"
              valor={datos.indicadores.porVencer}
              descripcion="Documentos dentro del umbral preventivo"
              tono="amber"
            />

            <ResumenEjecutivo
              titulo="Renovación activa"
              valor={datos.indicadores.enRenovacion}
              descripcion="Procesos de renovación detectados"
              tono="blue"
            />

          </div>

        </div>

      </section>


      {/* ===================================================== */}
      {/* PRÓXIMOS VENCIMIENTOS */}
      {/* ===================================================== */}

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
            sm:px-6
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
                bg-cyan-50
                text-cyan-600
              "
            >
              <CalendarClock size={19} />
            </div>


            <div>

              <h2
                className="
                  font-bold
                  text-slate-900
                "
              >
                Próximos vencimientos
              </h2>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-slate-500
                "
              >
                Documentos ordenados por la fecha de vencimiento más cercana.
              </p>

            </div>

          </div>


          <div
            className="
              inline-flex
              items-center
              gap-2
              self-start
              rounded-full
              bg-slate-100
              px-3
              py-1.5
              text-xs
              font-medium
              text-slate-500
              sm:self-auto
            "
          >
            <Building2 size={14} />
            Datos operativos actualizados
          </div>

        </div>


        {
          cargando
            ? (

              <div
                className="
                  flex
                  min-h-64
                  items-center
                  justify-center
                  gap-3
                  text-sm
                  text-slate-500
                "
              >
                <RefreshCw
                  size={20}
                  className="animate-spin"
                />
                Cargando indicadores...
              </div>

            )
            : datos.proximosVencimientos.length === 0
              ? (

                <div
                  className="
                    flex
                    min-h-64
                    flex-col
                    items-center
                    justify-center
                    px-6
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
                      bg-emerald-50
                      text-emerald-600
                    "
                  >
                    <CircleCheck size={27} />
                  </div>

                  <p
                    className="
                      mt-4
                      font-bold
                      text-slate-800
                    "
                  >
                    Sin próximos vencimientos
                  </p>

                  <p
                    className="
                      mt-1
                      max-w-md
                      text-sm
                      leading-6
                      text-slate-500
                    "
                  >
                    No hay documentos próximos a vencer para los filtros seleccionados.
                  </p>

                </div>

              )
              : (

                <div className="overflow-x-auto">

                  <table
                    className="
                      min-w-full
                      divide-y
                      divide-slate-100
                    "
                  >

                    <thead className="bg-slate-50/80">

                      <tr>

                        {
                          [
                            'Documento',
                            'Tienda',
                            'Tipo',
                            'Vencimiento',
                            'Estado'
                          ].map(
                            (titulo) => (

                              <th
                                key={titulo}
                                className="
                                  px-5
                                  py-3
                                  text-left
                                  text-[11px]
                                  font-bold
                                  uppercase
                                  tracking-wider
                                  text-slate-400
                                "
                              >
                                {titulo}
                              </th>

                            )
                          )
                        }

                      </tr>

                    </thead>


                    <tbody
                      className="
                        divide-y
                        divide-slate-100
                        bg-white
                      "
                    >

                      {
                        datos.proximosVencimientos.map(
                          (documento) => (

                            <tr
                              key={documento.id}
                              onClick={() =>
                                abrirDocumento(
                                  documento
                                )
                              }
                              className={
                                puedeVerDocumentos
                                  ? 'cursor-pointer transition hover:bg-indigo-50/40'
                                  : ''
                              }
                            >

                              <td className="px-5 py-4">

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
                                      shrink-0
                                      items-center
                                      justify-center
                                      rounded-xl
                                      bg-indigo-50
                                      text-indigo-600
                                    "
                                  >
                                    <Files size={17} />
                                  </div>


                                  <div>

                                    <p
                                      className="
                                        font-semibold
                                        text-slate-900
                                      "
                                    >
                                      {documento.codigoInterno}
                                    </p>

                                    <p
                                      className="
                                        mt-0.5
                                        text-xs
                                        text-slate-500
                                      "
                                    >
                                      {documento.numeroDocumento}
                                    </p>

                                  </div>

                                </div>

                              </td>


                              <td
                                className="
                                  px-5
                                  py-4
                                  text-sm
                                  text-slate-700
                                "
                              >
                                {documento.tienda?.nombre || '—'}
                              </td>


                              <td
                                className="
                                  px-5
                                  py-4
                                  text-sm
                                  text-slate-700
                                "
                              >
                                {documento.tipoDocumento?.nombre || '—'}
                              </td>


                              <td className="px-5 py-4">

                                <p
                                  className="
                                    text-sm
                                    font-medium
                                    text-slate-700
                                  "
                                >
                                  {
                                    formatearFecha(
                                      documento.fechaVencimiento
                                    )
                                  }
                                </p>

                                <p
                                  className="
                                    mt-0.5
                                    text-xs
                                    text-slate-400
                                  "
                                >
                                  {
                                    textoDiasRestantes(
                                      documento.diasRestantes
                                    )
                                  }
                                </p>

                              </td>


                              <td className="px-5 py-4">

                                <span
                                  className={`
                                    inline-flex
                                    rounded-full
                                    px-2.5
                                    py-1
                                    text-xs
                                    font-semibold
                                    ${claseEstado(
                                      documento.estado
                                    )}
                                  `}
                                >
                                  {textoEstado(documento.estado)}
                                </span>

                              </td>

                            </tr>

                          )
                        )
                      }

                    </tbody>

                  </table>

                </div>

              )
        }

      </section>

    </div>

  );

}


function textoDiasRestantes(
  valor
) {

  const dias =
    Number(valor);

  if (
    !Number.isFinite(dias)
  ) {
    return 'Sin cálculo disponible';
  }

  if (dias < 0) {
    return `${Math.abs(dias)} día(s) vencido`;
  }

  if (dias === 0) {
    return 'Vence hoy';
  }

  return `${dias} día(s) restante(s)`;

}


function claseCampoFiltro() {

  return `
    h-11
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
    focus:ring-indigo-500/10
  `;

}


function CampoFiltro({
  label,
  children
}) {

  return (

    <div>

      <label
        className="
          mb-1.5
          block
          text-sm
          font-semibold
          text-slate-700
        "
      >
        {label}
      </label>

      {children}

    </div>

  );

}


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
        gap-4
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


function KpiDashboard({
  titulo,
  valor,
  descripcion,
  icono: Icono,
  tono,
  etiqueta,
  interactivo = false,
  onClick
}) {

  const estilos = {

    indigo: {
      icono:
        'bg-indigo-50 text-indigo-600',
      barra:
        'from-indigo-500 to-violet-500',
      etiqueta:
        'bg-indigo-50 text-indigo-600'
    },

    violet: {
      icono:
        'bg-violet-50 text-violet-600',
      barra:
        'from-violet-500 to-fuchsia-500',
      etiqueta:
        'bg-violet-50 text-violet-600'
    },

    red: {
      icono:
        'bg-red-50 text-red-600',
      barra:
        'from-red-500 to-orange-500',
      etiqueta:
        'bg-red-50 text-red-600'
    },

    cyan: {
      icono:
        'bg-cyan-50 text-cyan-600',
      barra:
        'from-cyan-500 to-blue-500',
      etiqueta:
        'bg-cyan-50 text-cyan-600'
    }

  };


  const estilo =
    estilos[tono] ||
    estilos.indigo;


  const contenido = (

    <>

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
          <Icono size={22} />
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

    </>

  );


  const clases = `
    group
    relative
    overflow-hidden
    rounded-3xl
    border
    border-slate-200
    bg-white
    p-5
    text-left
    shadow-sm
    transition
    duration-300
    ${
      interactivo
        ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60'
        : ''
    }
  `;


  if (interactivo) {

    return (

      <button
        type="button"
        onClick={onClick}
        className={clases}
      >
        {contenido}
      </button>

    );

  }


  return (

    <article className={clases}>
      {contenido}
    </article>

  );

}


function GraficaDonutEstados({
  datos,
  total
}) {

  const totalSeguro =
    Number(total || 0);


  let acumulado =
    0;


  const segmentos =
    datos
      .filter(
        (item) =>
          Number(item.valor) > 0
      )
      .map(
        (item) => {

          const inicio =
            totalSeguro > 0
              ? (
                  acumulado /
                  totalSeguro
                ) * 100
              : 0;


          acumulado +=
            Number(
              item.valor || 0
            );


          const fin =
            totalSeguro > 0
              ? (
                  acumulado /
                  totalSeguro
                ) * 100
              : 0;


          return `${item.color} ${inicio}% ${fin}%`;

        }
      );


  const fondo =
    totalSeguro > 0 &&
    segmentos.length > 0
      ? `conic-gradient(${segmentos.join(', ')})`
      : 'conic-gradient(#e2e8f0 0% 100%)';


  return (

    <div
      className="
        mt-6
        grid
        gap-6
        lg:grid-cols-[220px_1fr]
        lg:items-center
      "
    >

      <div
        className="
          flex
          items-center
          justify-center
        "
      >

        <div
          className="
            relative
            h-48
            w-48
            rounded-full
            shadow-inner
          "
          style={{
            background:
              fondo
          }}
        >

          <div
            className="
              absolute
              inset-[28px]
              flex
              flex-col
              items-center
              justify-center
              rounded-full
              bg-white
              shadow-sm
            "
          >

            <span
              className="
                text-3xl
                font-bold
                text-slate-950
              "
            >
              {totalSeguro}
            </span>

            <span
              className="
                mt-1
                text-xs
                font-semibold
                uppercase
                tracking-wide
                text-slate-400
              "
            >
              documentos
            </span>

          </div>

        </div>

      </div>


      <div className="space-y-3">

        {
          datos.map(
            (item) => {

              const porcentaje =
                totalSeguro > 0
                  ? Math.round(
                      (
                        Number(
                          item.valor || 0
                        ) /
                        totalSeguro
                      ) * 100
                    )
                  : 0;


              return (

                <div
                  key={item.clave}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    rounded-xl
                    border
                    border-slate-100
                    bg-slate-50/70
                    px-3
                    py-2.5
                  "
                >

                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-3
                    "
                  >

                    <span
                      className="
                        h-3
                        w-3
                        shrink-0
                        rounded-full
                      "
                      style={{
                        backgroundColor:
                          item.color
                      }}
                    />

                    <span
                      className="
                        truncate
                        text-sm
                        font-semibold
                        text-slate-700
                      "
                    >
                      {item.etiqueta}
                    </span>

                  </div>


                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >

                    <span
                      className="
                        text-sm
                        font-bold
                        text-slate-900
                      "
                    >
                      {item.valor}
                    </span>

                    <span
                      className="
                        min-w-[42px]
                        text-right
                        text-xs
                        font-semibold
                        text-slate-400
                      "
                    >
                      {porcentaje}%
                    </span>

                  </div>

                </div>

              );

            }
          )
        }

      </div>

    </div>

  );

}


function GraficaBarrasVencimientos({
  datos
}) {

  const maximo =
    Math.max(
      1,
      ...datos.map(
        (item) =>
          Number(
            item.valor || 0
          )
      )
    );


  const total =
    datos.reduce(
      (
        acumulado,
        item
      ) =>
        acumulado +
        Number(
          item.valor || 0
        ),
      0
    );


  return (

    <div className="mt-6">

      <div
        className="
          flex
          h-64
          items-end
          gap-3
          rounded-2xl
          border
          border-slate-100
          bg-slate-50/70
          px-4
          pb-4
          pt-6
          sm:gap-5
          sm:px-6
        "
      >

        {
          datos.map(
            (item) => {

              const alto =
                Number(
                  item.valor || 0
                ) > 0
                  ? Math.max(
                      10,
                      (
                        Number(
                          item.valor || 0
                        ) /
                        maximo
                      ) * 100
                    )
                  : 4;


              return (

                <div
                  key={item.etiqueta}
                  className="
                    flex
                    min-w-0
                    flex-1
                    flex-col
                    items-center
                    justify-end
                  "
                >

                  <span
                    className="
                      mb-2
                      text-sm
                      font-bold
                      text-slate-800
                    "
                  >
                    {item.valor}
                  </span>


                  <div
                    className="
                      flex
                      h-40
                      w-full
                      max-w-16
                      items-end
                      overflow-hidden
                      rounded-t-xl
                      bg-slate-200
                    "
                  >

                    <div
                      className="
                        w-full
                        rounded-t-xl
                        transition-all
                        duration-500
                      "
                      style={{
                        height:
                          `${alto}%`,
                        backgroundColor:
                          item.color
                      }}
                    />

                  </div>


                  <span
                    className="
                      mt-3
                      min-h-8
                      text-center
                      text-[11px]
                      font-semibold
                      leading-4
                      text-slate-500
                    "
                  >
                    {item.etiqueta}
                  </span>

                </div>

              );

            }
          )
        }

      </div>


      <div
        className="
          mt-4
          flex
          items-center
          justify-between
          gap-4
          rounded-xl
          bg-indigo-50
          px-4
          py-3
          text-sm
        "
      >

        <span
          className="
            font-medium
            text-indigo-700
          "
        >
          Eventos analizados
        </span>

        <span
          className="
            font-bold
            text-indigo-900
          "
        >
          {total}
        </span>

      </div>

    </div>

  );

}


function BarraEstado({
  etiqueta,
  valor,
  total,
  barra
}) {

  const numero =
    Number(valor || 0);

  const porcentaje =
    total > 0
      ? Math.round(
          (
            numero /
            total
          ) * 100
        )
      : 0;


  return (

    <div>

      <div
        className="
          mb-2
          flex
          items-center
          justify-between
          gap-4
        "
      >

        <span
          className="
            text-sm
            font-semibold
            text-slate-700
          "
        >
          {etiqueta}
        </span>


        <span
          className="
            text-xs
            font-bold
            text-slate-500
          "
        >
          {numero} · {porcentaje}%
        </span>

      </div>


      <div
        className="
          h-2.5
          overflow-hidden
          rounded-full
          bg-slate-100
        "
      >

        <div
          className={`
            h-full
            rounded-full
            transition-all
            duration-500
            ${barra}
          `}
          style={{
            width:
              `${Math.min(
                100,
                Math.max(
                  0,
                  porcentaje
                )
              )}%`
          }}
        />

      </div>

    </div>

  );

}


function ResumenEjecutivo({
  titulo,
  valor,
  descripcion,
  tono
}) {

  const tonos = {

    emerald:
      'border-emerald-100 bg-emerald-50 text-emerald-700',

    red:
      'border-red-100 bg-red-50 text-red-700',

    amber:
      'border-amber-100 bg-amber-50 text-amber-700',

    blue:
      'border-blue-100 bg-blue-50 text-blue-700'

  };


  return (

    <div
      className={`
        rounded-2xl
        border
        p-4
        ${tonos[tono] || tonos.blue}
      `}
    >

      <div
        className="
          flex
          items-end
          justify-between
          gap-3
        "
      >

        <div>

          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-wide
              opacity-80
            "
          >
            {titulo}
          </p>

          <p
            className="
              mt-1
              text-xs
              leading-5
              opacity-80
            "
          >
            {descripcion}
          </p>

        </div>


        <span
          className="
            text-2xl
            font-bold
          "
        >
          {valor}
        </span>

      </div>

    </div>

  );

}


export default DashboardPage;
