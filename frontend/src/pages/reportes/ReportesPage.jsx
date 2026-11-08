import {

  useEffect,

  useMemo,

  useState

} from 'react';



import {

  BarChart3,

  Building2,

  CalendarDays,

  Download,

  FileSpreadsheet,

  FileText,

  LoaderCircle,

  RefreshCw,

  Search,

  Store

} from 'lucide-react';



import {

  API_URL,

  api,

  obtenerToken

} from '../../services/api.js';



import {

  useAuth

} from '../../context/AuthContext.jsx';





const estadoDocumentoClase = (estado) => {

  switch (estado) {

    case 'VIGENTE':

      return 'bg-emerald-100 text-emerald-700';

    case 'POR_VENCER':

      return 'bg-amber-100 text-amber-700';

    case 'CRITICO':

      return 'bg-orange-100 text-orange-700';

    case 'VENCIDO':

      return 'bg-red-100 text-red-700';

    case 'EN_RENOVACION':

      return 'bg-blue-100 text-blue-700';

    default:

      return 'bg-slate-100 text-slate-700';

  }

};





const claseProceso = (estado) => {

  if (['APROBADO', 'EMITIDO', 'COMPLETADA'].includes(estado)) {

    return 'bg-emerald-100 text-emerald-700';

  }



  if (estado === 'RECHAZADO') {

    return 'bg-red-100 text-red-700';

  }



  if (['OBSERVADO', 'INICIADA'].includes(estado)) {

    return 'bg-amber-100 text-amber-700';

  }



  return 'bg-blue-100 text-blue-700';

};





const formatearFecha = (valor) => {

  if (!valor) {

    return '—';

  }



  const partes = String(valor).slice(0, 10).split('-');



  if (partes.length !== 3) {

    return String(valor);

  }



  return `${partes[2]}/${partes[1]}/${partes[0]}`;

};





const queryString = (filtros) => {

  const params = new URLSearchParams();



  Object.entries(filtros).forEach(([clave, valor]) => {

    if (valor !== '' && valor !== null && valor !== undefined) {

      params.set(clave, valor);

    }

  });



  return params.toString();

};





const obtenerMensajeError = (error, predeterminado) => (

  error?.response?.data?.mensaje ||

  error?.data?.mensaje ||

  error?.message ||

  predeterminado

);





function ReportesPage() {

  const { usuario } = useAuth();



  const puedeExportar = Boolean(

    usuario?.permisos?.includes('reportes.exportar')

  );



  const [pestana, setPestana] = useState('documentos');

  const [catalogos, setCatalogos] = useState({

    tiendas: [],

    entidades: [],

    tiposDocumento: [],

    estadosTramite: [],

    estadosDocumento: [],

    estadosRenovacion: []

  });



  const [filtrosDocumentos, setFiltrosDocumentos] = useState({

    tiendaId: '',

    entidadId: '',

    tipoId: '',

    estado: '',

    condicion: 'ACTIVO',

    fechaCampo: 'EMISION',

    fechaDesde: '',

    fechaHasta: ''

  });



  const [filtrosProcesos, setFiltrosProcesos] = useState({

    tiendaId: '',

    entidadId: '',

    tipoId: '',

    tramiteEstado: '',

    renovacionEstado: '',

    fechaDesde: '',

    fechaHasta: ''

  });



  const [reporteDocumentos, setReporteDocumentos] = useState(null);

  const [reporteProcesos, setReporteProcesos] = useState(null);

  const [cargando, setCargando] = useState(false);

  const [exportando, setExportando] = useState(false);

  const [error, setError] = useState('');





  useEffect(() => {

    async function cargarCatalogos() {

      try {

        const respuesta = await api.get('/reportes/catalogos');



        setCatalogos({

          tiendas: respuesta.tiendas || [],

          entidades: respuesta.entidades || [],

          tiposDocumento: respuesta.tiposDocumento || [],

          estadosTramite: respuesta.estadosTramite || [],

          estadosDocumento: respuesta.estadosDocumento || [],

          estadosRenovacion: respuesta.estadosRenovacion || []

        });

      } catch (errorPeticion) {

        setError(

          obtenerMensajeError(

            errorPeticion,

            'No se pudieron cargar los catálogos.'

          )

        );

      }

    }



    cargarCatalogos();

  }, []);





  const filtrosActuales = useMemo(

    () => pestana === 'documentos'

      ? filtrosDocumentos

      : filtrosProcesos,

    [pestana, filtrosDocumentos, filtrosProcesos]

  );





  async function generarReporte() {

    setCargando(true);

    setError('');



    try {

      if (pestana === 'documentos') {

        const qs = queryString(filtrosDocumentos);

        const respuesta = await api.get(

          `/reportes/documentos${qs ? `?${qs}` : ''}`

        );



        setReporteDocumentos(respuesta);

      } else {

        const qs = queryString(filtrosProcesos);

        const respuesta = await api.get(

          `/reportes/tramites-renovaciones${qs ? `?${qs}` : ''}`

        );



        setReporteProcesos(respuesta);

      }

    } catch (errorPeticion) {

      setError(

        obtenerMensajeError(

          errorPeticion,

          'No se pudo generar el reporte.'

        )

      );

    } finally {

      setCargando(false);

    }

  }





  async function exportarXlsx() {

    setExportando(true);

    setError('');



    try {

      const tipo = pestana === 'documentos'

        ? 'DOCUMENTOS'

        : 'PROCESOS';



      const params = new URLSearchParams(

        queryString(filtrosActuales)

      );



      params.set('tipo', tipo);

      params.set('formato', 'XLSX');



      const token = obtenerToken();



      const respuesta = await fetch(

        `${API_URL}/reportes/exportar?${params.toString()}`,

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );



      if (!respuesta.ok) {

        let mensaje = 'No se pudo exportar el reporte.';



        try {

          const datos = await respuesta.json();

          mensaje = datos?.mensaje || mensaje;

        } catch {

          // La respuesta puede no ser JSON.

        }



        throw new Error(mensaje);

      }



      const blob = await respuesta.blob();

      const url = window.URL.createObjectURL(blob);

      const enlace = document.createElement('a');



      enlace.href = url;

      enlace.download = pestana === 'documentos'

        ? 'certiia_reporte_documentos.xlsx'

        : 'certiia_reporte_tramites_renovaciones.xlsx';



      document.body.appendChild(enlace);

      enlace.click();

      enlace.remove();

      window.URL.revokeObjectURL(url);

    } catch (errorPeticion) {

      setError(

        obtenerMensajeError(

          errorPeticion,

          'No se pudo exportar el reporte.'

        )

      );

    } finally {

      setExportando(false);

    }

  }





  function limpiarFiltros() {

    setError('');



    if (pestana === 'documentos') {

      setFiltrosDocumentos({

        tiendaId: '',

        entidadId: '',

        tipoId: '',

        estado: '',

        condicion: 'ACTIVO',

        fechaCampo: 'EMISION',

        fechaDesde: '',

        fechaHasta: ''

      });

      setReporteDocumentos(null);

    } else {

      setFiltrosProcesos({

        tiendaId: '',

        entidadId: '',

        tipoId: '',

        tramiteEstado: '',

        renovacionEstado: '',

        fechaDesde: '',

        fechaHasta: ''

      });

      setReporteProcesos(null);

    }

  }





  const reporteActual = pestana === 'documentos'

    ? reporteDocumentos

    : reporteProcesos;





  const resultadosActuales = pestana === 'documentos'
    ? Number(reporteDocumentos?.resumen?.total || 0)
    : Number(reporteProcesos?.resumen?.tramites || 0) +
      Number(reporteProcesos?.resumen?.renovaciones || 0);


  return (

    <div className="space-y-6">

      {/* ================================================= */}
      {/* HERO PRINCIPAL */}
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

        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '26px 26px'
          }}
        />

        <div className="relative grid gap-6 px-6 py-7 lg:grid-cols-[1fr_340px] lg:px-8 lg:py-8">

          <div className="flex flex-col justify-center">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-indigo-200 backdrop-blur">
                <BarChart3 size={24} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-300">
                  Análisis operativo
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Reportes y exportación CERTIIA
                </p>
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Reportes
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Analiza documentos, trámites y renovaciones con filtros operativos y exporta los resultados autorizados en formato Excel.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <EtiquetaHeroReportes>
                <FileText size={14} />
                {pestana === 'documentos' ? 'Reporte de documentos' : 'Trámites y renovaciones'}
              </EtiquetaHeroReportes>
              <EtiquetaHeroReportes>
                <Store size={14} />
                {catalogos.tiendas.length} tienda(s)
              </EtiquetaHeroReportes>
              <EtiquetaHeroReportes>
                <FileSpreadsheet size={14} />
                {resultadosActuales} resultado(s)
              </EtiquetaHeroReportes>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Reporte actual</p>
                <p className="mt-1 text-lg font-bold text-white">
                  {pestana === 'documentos' ? 'Documentos' : 'Procesos'}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                <FileSpreadsheet size={22} />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <FilaHeroReportes etiqueta="Resultados generados" valor={resultadosActuales} />
              <FilaHeroReportes etiqueta="Filtros disponibles" valor={pestana === 'documentos' ? 8 : 7} />
              <FilaHeroReportes etiqueta="Exportación Excel" valor={puedeExportar ? 'Habilitada' : 'Sin permiso'} />
            </div>

            <div className="mt-5 grid gap-2">
              <button
                type="button"
                disabled={cargando}
                onClick={generarReporte}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cargando ? <LoaderCircle className="animate-spin" size={17} /> : <FileSpreadsheet size={17} />}
                {cargando ? 'Generando...' : 'Generar reporte'}
              </button>

              {puedeExportar && (
                <button
                  type="button"
                  disabled={!reporteActual || exportando}
                  onClick={exportarXlsx}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-xs font-bold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {exportando ? <LoaderCircle className="animate-spin" size={15} /> : <Download size={15} />}
                  {exportando ? 'Exportando...' : 'Exportar Excel'}
                </button>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ================================================= */}
      {/* KPIs */}
      {/* ================================================= */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaKpiReportes titulo="Tiendas disponibles" valor={catalogos.tiendas.length} descripcion="Locales disponibles para filtrar" icono={Store} tono="indigo" etiqueta="Operación" />
        <TarjetaKpiReportes titulo="Entidades emisoras" valor={catalogos.entidades.length} descripcion="Organismos disponibles" icono={Building2} tono="amber" etiqueta="Emisores" />
        <TarjetaKpiReportes titulo="Tipos documentales" valor={catalogos.tiposDocumento.length} descripcion="Tipos disponibles para análisis" icono={FileText} tono="violet" etiqueta="Catálogo" />
        <TarjetaKpiReportes titulo="Resultados actuales" valor={resultadosActuales} descripcion={reporteActual ? 'Reporte generado' : 'Genera un reporte para consultar'} icono={BarChart3} tono="emerald" etiqueta="Análisis" />
      </section>

      <div className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">

        <button

          type="button"

          onClick={() => {

            setPestana('documentos');

            setError('');

          }}

          className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${

            pestana === 'documentos'

              ? 'bg-indigo-600 text-white'

              : 'text-slate-600 hover:bg-slate-50'

          }`}

        >

          <span className="inline-flex items-center gap-2">

            <FileText size={18} />

            Documentos

          </span>

        </button>



        <button

          type="button"

          onClick={() => {

            setPestana('procesos');

            setError('');

          }}

          className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${

            pestana === 'procesos'

              ? 'bg-indigo-600 text-white'

              : 'text-slate-600 hover:bg-slate-50'

          }`}

        >

          <span className="inline-flex items-center gap-2">

            <BarChart3 size={18} />

            Trámites y renovaciones

          </span>

        </button>

      </div>



      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

        <div className="mb-5 flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

            <Search size={19} />

          </div>

          <div>

            <h2 className="font-bold text-slate-900">Filtros del reporte</h2>

            <p className="text-xs text-slate-500">Los filtros aplicados también se incluyen en la exportación.</p>

          </div>

        </div>



        {pestana === 'documentos' ? (

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

            <FiltroSelect

              etiqueta="Tienda"

              valor={filtrosDocumentos.tiendaId}

              onChange={(valor) => setFiltrosDocumentos((actual) => ({ ...actual, tiendaId: valor }))}

              opciones={catalogos.tiendas.map((item) => ({ valor: item.id, texto: `${item.codigo} - ${item.nombre}` }))}

            />

            <FiltroSelect

              etiqueta="Entidad"

              valor={filtrosDocumentos.entidadId}

              onChange={(valor) => setFiltrosDocumentos((actual) => ({ ...actual, entidadId: valor }))}

              opciones={catalogos.entidades.map((item) => ({ valor: item.id, texto: item.nombre }))}

            />

            <FiltroSelect

              etiqueta="Tipo documental"

              valor={filtrosDocumentos.tipoId}

              onChange={(valor) => setFiltrosDocumentos((actual) => ({ ...actual, tipoId: valor }))}

              opciones={catalogos.tiposDocumento.map((item) => ({ valor: item.id, texto: item.nombre }))}

            />

            <FiltroSelect

              etiqueta="Estado"

              valor={filtrosDocumentos.estado}

              onChange={(valor) => setFiltrosDocumentos((actual) => ({ ...actual, estado: valor }))}

              opciones={catalogos.estadosDocumento.map((item) => ({ valor: item, texto: item.replaceAll('_', ' ') }))}

            />

            <FiltroSelect

              etiqueta="Condición"

              valor={filtrosDocumentos.condicion}

              onChange={(valor) => setFiltrosDocumentos((actual) => ({ ...actual, condicion: valor }))}

              opciones={[

                { valor: 'ACTIVO', texto: 'Activo' },

                { valor: 'ARCHIVADO', texto: 'Archivado' },

                { valor: 'ANULADO', texto: 'Anulado' },

                { valor: 'TODOS', texto: 'Todos' }

              ]}

              permitirTodos={false}

            />

            <FiltroSelect

              etiqueta="Fecha aplicada a"

              valor={filtrosDocumentos.fechaCampo}

              onChange={(valor) => setFiltrosDocumentos((actual) => ({ ...actual, fechaCampo: valor }))}

              opciones={[

                { valor: 'EMISION', texto: 'Fecha de emisión' },

                { valor: 'VENCIMIENTO', texto: 'Fecha de vencimiento' }

              ]}

              permitirTodos={false}

            />

            <FiltroFecha

              etiqueta="Desde"

              valor={filtrosDocumentos.fechaDesde}

              onChange={(valor) => setFiltrosDocumentos((actual) => ({ ...actual, fechaDesde: valor }))}

            />

            <FiltroFecha

              etiqueta="Hasta"

              valor={filtrosDocumentos.fechaHasta}

              onChange={(valor) => setFiltrosDocumentos((actual) => ({ ...actual, fechaHasta: valor }))}

            />

          </div>

        ) : (

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

            <FiltroSelect

              etiqueta="Tienda"

              valor={filtrosProcesos.tiendaId}

              onChange={(valor) => setFiltrosProcesos((actual) => ({ ...actual, tiendaId: valor }))}

              opciones={catalogos.tiendas.map((item) => ({ valor: item.id, texto: `${item.codigo} - ${item.nombre}` }))}

            />

            <FiltroSelect

              etiqueta="Entidad"

              valor={filtrosProcesos.entidadId}

              onChange={(valor) => setFiltrosProcesos((actual) => ({ ...actual, entidadId: valor }))}

              opciones={catalogos.entidades.map((item) => ({ valor: item.id, texto: item.nombre }))}

            />

            <FiltroSelect

              etiqueta="Tipo documental"

              valor={filtrosProcesos.tipoId}

              onChange={(valor) => setFiltrosProcesos((actual) => ({ ...actual, tipoId: valor }))}

              opciones={catalogos.tiposDocumento.map((item) => ({ valor: item.id, texto: item.nombre }))}

            />

            <FiltroSelect

              etiqueta="Estado de trámite"

              valor={filtrosProcesos.tramiteEstado}

              onChange={(valor) => setFiltrosProcesos((actual) => ({ ...actual, tramiteEstado: valor }))}

              opciones={catalogos.estadosTramite.map((item) => ({ valor: item.codigo, texto: item.nombre }))}

            />

            <FiltroSelect

              etiqueta="Estado de renovación"

              valor={filtrosProcesos.renovacionEstado}

              onChange={(valor) => setFiltrosProcesos((actual) => ({ ...actual, renovacionEstado: valor }))}

              opciones={catalogos.estadosRenovacion.map((item) => ({ valor: item, texto: item }))}

            />

            <FiltroFecha

              etiqueta="Inicio desde"

              valor={filtrosProcesos.fechaDesde}

              onChange={(valor) => setFiltrosProcesos((actual) => ({ ...actual, fechaDesde: valor }))}

            />

            <FiltroFecha

              etiqueta="Inicio hasta"

              valor={filtrosProcesos.fechaHasta}

              onChange={(valor) => setFiltrosProcesos((actual) => ({ ...actual, fechaHasta: valor }))}

            />

          </div>

        )}



        <div className="mt-5 flex flex-wrap justify-end gap-3">

          <button
            type="button"
            onClick={limpiarFiltros}
            disabled={cargando}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={17} />
            Limpiar filtros
          </button>

          <button

            type="button"

            disabled={cargando}

            onClick={generarReporte}

            className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 disabled:opacity-60"

          >

            {cargando

              ? <LoaderCircle className="animate-spin" size={18} />

              : <FileSpreadsheet size={18} />}

            Generar reporte

          </button>

        </div>

      </section>



      {error && (

        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

          {error}

        </div>

      )}



      {pestana === 'documentos' && reporteDocumentos && (

        <ReporteDocumentos reporte={reporteDocumentos} />

      )}



      {pestana === 'procesos' && reporteProcesos && (

        <ReporteProcesos reporte={reporteProcesos} />

      )}



      {!reporteActual && !cargando && (

        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">

          <CalendarDays className="mx-auto text-slate-400" size={34} />

          <p className="mt-3 font-semibold text-slate-700">Configura los filtros y genera el reporte.</p>

        </div>

      )}

    </div>

  );

}





// ============================================================
// COMPONENTES VISUALES DEL HERO
// ============================================================

function EtiquetaHeroReportes({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur">
      {children}
    </span>
  );
}

function FilaHeroReportes({ etiqueta, valor }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/10 px-3 py-2.5">
      <span className="text-xs font-medium text-slate-300">{etiqueta}</span>
      <span className="text-sm font-bold text-white">{valor}</span>
    </div>
  );
}

function TarjetaKpiReportes({ titulo, valor, descripcion, icono: Icono, tono, etiqueta }) {
  const estilos = {
    indigo: { icono: 'bg-indigo-50 text-indigo-600', barra: 'from-indigo-500 to-violet-500', etiqueta: 'bg-indigo-50 text-indigo-600' },
    amber: { icono: 'bg-amber-50 text-amber-600', barra: 'from-amber-500 to-orange-500', etiqueta: 'bg-amber-50 text-amber-600' },
    violet: { icono: 'bg-violet-50 text-violet-600', barra: 'from-violet-500 to-fuchsia-500', etiqueta: 'bg-violet-50 text-violet-600' },
    emerald: { icono: 'bg-emerald-50 text-emerald-600', barra: 'from-emerald-500 to-teal-500', etiqueta: 'bg-emerald-50 text-emerald-600' }
  };
  const estilo = estilos[tono] || estilos.indigo;
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-100 opacity-60 transition group-hover:scale-125" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${estilo.etiqueta}`}>{etiqueta}</span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">{titulo}</p>
          <p className="mt-1 text-3xl font-bold text-slate-950">{valor}</p>
          <p className="mt-1 text-xs text-slate-500">{descripcion}</p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${estilo.icono}`}>
          <Icono size={22} />
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${estilo.barra}`} />
    </article>
  );
}


function FiltroSelect({

  etiqueta,

  valor,

  onChange,

  opciones,

  permitirTodos = true

}) {

  return (

    <label className="block">

      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">

        {etiqueta}

      </span>

      <select

        value={valor}

        onChange={(evento) => onChange(evento.target.value)}

        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-400"

      >

        {permitirTodos && <option value="">Todos</option>}

        {opciones.map((opcion) => (

          <option key={String(opcion.valor)} value={opcion.valor}>

            {opcion.texto}

          </option>

        ))}

      </select>

    </label>

  );

}





function FiltroFecha({ etiqueta, valor, onChange }) {

  return (

    <label className="block">

      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">

        {etiqueta}

      </span>

      <input

        type="date"

        value={valor}

        onChange={(evento) => onChange(evento.target.value)}

        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-400"

      />

    </label>

  );

}





function ResumenCard({ titulo, valor }) {

  return (

    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{titulo}</p>

      <p className="mt-1 text-2xl font-bold text-slate-900">{valor ?? 0}</p>

    </div>

  );

}





function ReporteDocumentos({ reporte }) {

  return (

    <section className="space-y-5">

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">

        <ResumenCard titulo="Total" valor={reporte.resumen?.total} />

        <ResumenCard titulo="Vigentes" valor={reporte.resumen?.VIGENTE} />

        <ResumenCard titulo="Por vencer" valor={reporte.resumen?.POR_VENCER} />

        <ResumenCard titulo="Críticos" valor={reporte.resumen?.CRITICO} />

        <ResumenCard titulo="Vencidos" valor={reporte.resumen?.VENCIDO} />

        <ResumenCard titulo="En renovación" valor={reporte.resumen?.EN_RENOVACION} />

      </div>



      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="min-w-full divide-y divide-slate-200 text-sm">

            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">

              <tr>

                <th className="px-4 py-3">Documento</th>

                <th className="px-4 py-3">Tienda</th>

                <th className="px-4 py-3">Tipo</th>

                <th className="px-4 py-3">Entidad</th>

                <th className="px-4 py-3">Emisión</th>

                <th className="px-4 py-3">Vencimiento</th>

                <th className="px-4 py-3">Estado</th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {(reporte.registros || []).map((item) => (

                <tr key={item.id} className="hover:bg-slate-50">

                  <td className="px-4 py-3">

                    <p className="font-semibold text-slate-800">{item.numeroDocumento}</p>

                    <p className="text-xs text-slate-400">{item.codigoInterno}</p>

                  </td>

                  <td className="px-4 py-3 text-slate-700">{item.tienda?.nombre}</td>

                  <td className="px-4 py-3 text-slate-700">{item.tipoDocumento?.nombre}</td>

                  <td className="px-4 py-3 text-slate-700">{item.entidad?.nombre}</td>

                  <td className="px-4 py-3 text-slate-600">{formatearFecha(item.fechaEmision)}</td>

                  <td className="px-4 py-3 text-slate-600">{formatearFecha(item.fechaVencimiento)}</td>

                  <td className="px-4 py-3">

                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${estadoDocumentoClase(item.estado)}`}>

                      {item.estado?.replaceAll('_', ' ')}

                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>



        {(reporte.registros || []).length === 0 && (

          <div className="p-8 text-center text-sm text-slate-500">

            No existen documentos que cumplan los filtros seleccionados.

          </div>

        )}

      </div>

    </section>

  );

}





function ReporteProcesos({ reporte }) {

  return (

    <section className="space-y-6">

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">

        <ResumenCard titulo="Trámites" valor={reporte.resumen?.tramites} />

        <ResumenCard titulo="Trámites concluidos" valor={reporte.resumen?.tramitesConcluidos} />

        <ResumenCard titulo="Trámites pendientes" valor={reporte.resumen?.tramitesPendientes} />

        <ResumenCard titulo="Renovaciones" valor={reporte.resumen?.renovaciones} />

        <ResumenCard titulo="Renov. concluidas" valor={reporte.resumen?.renovacionesConcluidas} />

        <ResumenCard titulo="Renov. pendientes" valor={reporte.resumen?.renovacionesPendientes} />

      </div>



      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-5 py-4">

          <h2 className="font-bold text-slate-900">Trámites</h2>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full divide-y divide-slate-200 text-sm">

            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">

              <tr>

                <th className="px-4 py-3">Expediente</th>

                <th className="px-4 py-3">Tienda</th>

                <th className="px-4 py-3">Tipo</th>

                <th className="px-4 py-3">Estado</th>

                <th className="px-4 py-3">Resultado</th>

                <th className="px-4 py-3">Duración</th>

                <th className="px-4 py-3">Observaciones</th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {(reporte.tramites || []).map((item) => (

                <tr key={item.id} className="hover:bg-slate-50">

                  <td className="px-4 py-3 font-semibold text-slate-800">{item.expediente}</td>

                  <td className="px-4 py-3 text-slate-700">{item.tienda?.nombre}</td>

                  <td className="px-4 py-3 text-slate-700">{item.tipoDocumento?.nombre}</td>

                  <td className="px-4 py-3">

                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${claseProceso(item.estado)}`}>

                      {item.estadoNombre || item.estado}

                    </span>

                  </td>

                  <td className="px-4 py-3 text-slate-700">{item.resultado}</td>

                  <td className="px-4 py-3 text-slate-700">{item.duracionDias === null ? 'En curso' : `${item.duracionDias} días`}</td>

                  <td className="px-4 py-3 text-slate-700">{item.numeroObservaciones}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>



      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-5 py-4">

          <h2 className="font-bold text-slate-900">Renovaciones</h2>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full divide-y divide-slate-200 text-sm">

            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">

              <tr>

                <th className="px-4 py-3">Documento anterior</th>

                <th className="px-4 py-3">Tienda</th>

                <th className="px-4 py-3">Tipo</th>

                <th className="px-4 py-3">Estado</th>

                <th className="px-4 py-3">Situación</th>

                <th className="px-4 py-3">Inicio</th>

                <th className="px-4 py-3">Duración</th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {(reporte.renovaciones || []).map((item) => (

                <tr key={item.id} className="hover:bg-slate-50">

                  <td className="px-4 py-3 font-semibold text-slate-800">{item.documentoAnterior?.numero}</td>

                  <td className="px-4 py-3 text-slate-700">{item.tienda?.nombre}</td>

                  <td className="px-4 py-3 text-slate-700">{item.tipoDocumento?.nombre}</td>

                  <td className="px-4 py-3">

                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${claseProceso(item.estado)}`}>

                      {item.estado}

                    </span>

                  </td>

                  <td className="px-4 py-3 text-slate-700">{item.situacion}</td>

                  <td className="px-4 py-3 text-slate-600">{formatearFecha(item.fechaInicio)}</td>

                  <td className="px-4 py-3 text-slate-700">{item.duracionDias === null ? 'En curso' : `${item.duracionDias} días`}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </section>

  );

}





export default ReportesPage;