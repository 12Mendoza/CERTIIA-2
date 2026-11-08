import {
  X,
  ShieldCheck,
  Monitor,
  Database,
  UserRound,
  Clock3
} from 'lucide-react';


function JsonPanel({ titulo, datos }) {
  const contenido =
    datos === null || datos === undefined
      ? null
      : JSON.stringify(datos, null, 2);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">
        {titulo}
      </h3>

      {
        contenido
          ? (
            <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-slate-950 p-4 text-xs leading-5 text-slate-100">
              {contenido}
            </pre>
          )
          : (
            <p className="mt-3 text-sm text-slate-400">
              No se registraron datos para esta sección.
            </p>
          )
      }
    </section>
  );
}


function AuditoriaDetalleModal({
  abierto,
  cargando,
  error,
  evento,
  onCerrar
}) {
  if (!abierto) {
    return null;
  }

  function formatearFecha(fecha) {
    if (!fecha) {
      return 'Sin fecha';
    }

    return new Date(fecha).toLocaleString(
      'es-PE',
      {
        dateStyle: 'medium',
        timeStyle: 'medium'
      }
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-slate-50 shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              Trazabilidad
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Detalle del evento de auditoría
            </h2>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </header>

        <div className="space-y-5 p-6">
          {
            cargando && (
              <div className="flex min-h-48 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
              </div>
            )
          }

          {
            error && !cargando && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )
          }

          {
            evento && !cargando && !error && (
              <>
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <article className="rounded-2xl border border-slate-200 bg-white p-4">
                    <Clock3 size={18} className="text-indigo-600" />
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Fecha
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatearFecha(evento.fecha_evento)}
                    </p>
                  </article>

                  <article className="rounded-2xl border border-slate-200 bg-white p-4">
                    <UserRound size={18} className="text-indigo-600" />
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Usuario
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {
                        evento.usuario_id
                          ? `${evento.nombres || ''} ${evento.apellidos || ''}`.trim()
                          : 'Sistema / desconocido'
                      }
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {evento.email || 'Sin correo'}
                    </p>
                  </article>

                  <article className="rounded-2xl border border-slate-200 bg-white p-4">
                    <Database size={18} className="text-indigo-600" />
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Registro afectado
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {evento.entidad || 'Sin entidad'}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      ID: {evento.registro_id || 'N/D'}
                    </p>
                  </article>

                  <article className="rounded-2xl border border-slate-200 bg-white p-4">
                    <ShieldCheck size={18} className="text-indigo-600" />
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Evento
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                      {evento.evento}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {evento.modulo || 'Sin módulo'}
                    </p>
                  </article>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="font-semibold text-slate-900">
                    Descripción
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {evento.descripcion || 'Sin descripción'}
                  </p>
                </section>

                <div className="grid gap-5 xl:grid-cols-2">
                  <JsonPanel
                    titulo="Datos anteriores"
                    datos={evento.datos_anteriores}
                  />
                  <JsonPanel
                    titulo="Datos nuevos"
                    datos={evento.datos_nuevos}
                  />
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2">
                    <Monitor size={18} className="text-indigo-600" />
                    <h3 className="font-semibold text-slate-900">
                      Contexto técnico
                    </h3>
                  </div>

                  <dl className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Dirección IP
                      </dt>
                      <dd className="mt-1 break-words text-sm text-slate-700">
                        {evento.ip || 'N/D'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        User-Agent
                      </dt>
                      <dd className="mt-1 break-words text-sm text-slate-700">
                        {evento.user_agent || 'N/D'}
                      </dd>
                    </div>
                  </dl>
                </section>
              </>
            )
          }
        </div>
      </div>
    </div>
  );
}


export default AuditoriaDetalleModal;
