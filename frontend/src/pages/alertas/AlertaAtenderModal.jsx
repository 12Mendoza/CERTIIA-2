import {
  useState
} from 'react';

import {
  CheckCircle2,
  X
} from 'lucide-react';


function AlertaAtenderModal({
  abierto,
  alerta,
  cargando = false,
  error = '',
  onCerrar,
  onGuardar
}) {

  const [
    comentario,
    setComentario
  ] = useState('');



  if (!abierto) {
    return null;
  }


  function cerrar() {
    if (cargando) {
      return;
    }

    setComentario('');
    onCerrar();
  }


  async function enviar(
    evento
  ) {
    evento.preventDefault();

    await onGuardar({
      comentario:
        comentario.trim() || null
    });
  }


  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Atender alerta
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              HU-035 · Registrar atención
            </p>
          </div>

          <button
            type="button"
            onClick={cerrar}
            disabled={cargando}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={enviar}>
          <div className="space-y-5 px-6 py-6">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">
                {alerta?.documento?.codigoInterno || 'Documento'}
              </p>
              <p className="mt-1 text-sm text-amber-800">
                {alerta?.mensaje || 'Alerta de vencimiento'}
              </p>
            </div>

            <div>
              <label
                htmlFor="comentarioAlerta"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Comentario de atención
              </label>

              <textarea
                id="comentarioAlerta"
                rows={5}
                maxLength={1000}
                value={comentario}
                onChange={(evento) =>
                  setComentario(
                    evento.target.value
                  )
                }
                disabled={cargando}
                placeholder="Ej. Se coordinó la renovación con el responsable de la tienda."
                className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {comentario.length}/1000
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={cerrar}
              disabled={cargando}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={cargando}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <CheckCircle2 size={17} />
              {cargando ? 'Guardando...' : 'Marcar atendida'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


export default AlertaAtenderModal;
