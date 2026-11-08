import {
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';


function claveFecha(
  valor
) {
  if (!valor) {
    return '';
  }

  return String(valor).slice(
    0,
    10
  );
}


function claseNivel(
  nivel
) {
  switch (nivel) {
    case 'VENCIDO':
      return 'border-red-200 bg-red-50 text-red-700';
    case 'CRITICO':
      return 'border-orange-200 bg-orange-50 text-orange-700';
    case 'POR_VENCER':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    default:
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }
}


function construirDiasMes(
  mes
) {
  const [
    anio,
    numeroMes
  ] = mes
    .split('-')
    .map(Number);

  const primerDia =
    new Date(
      anio,
      numeroMes - 1,
      1
    );

  const ultimoDia =
    new Date(
      anio,
      numeroMes,
      0
    );

  const inicioSemana =
    primerDia.getDay();

  const dias = [];

  for (
    let indice = 0;
    indice < inicioSemana;
    indice += 1
  ) {
    dias.push(null);
  }

  for (
    let dia = 1;
    dia <= ultimoDia.getDate();
    dia += 1
  ) {
    dias.push(dia);
  }

  return {
    anio,
    numeroMes,
    dias
  };
}


function CalendarioVencimientos({
  mes,
  eventos = [],
  tiendas = [],
  tiposDocumento = [],
  tiendaId = '',
  tipoDocumentoId = '',
  cargando = false,
  onCambiarMes,
  onCambiarTienda,
  onCambiarTipoDocumento,
  onAbrirDocumento
}) {

  const {
    anio,
    numeroMes,
    dias
  } = construirDiasMes(
    mes
  );


  const nombreMes =
    new Intl.DateTimeFormat(
      'es-PE',
      {
        month: 'long',
        year: 'numeric'
      }
    )
      .format(
        new Date(
          anio,
          numeroMes - 1,
          1
        )
      );


  function desplazarMes(
    desplazamiento
  ) {
    const fecha =
      new Date(
        anio,
        numeroMes - 1 + desplazamiento,
        1
      );

    const valor =
      `${fecha.getFullYear()}-${String(
        fecha.getMonth() + 1
      ).padStart(2, '0')}`;

    onCambiarMes(
      valor
    );
  }


  const diasSemana = [
    'Dom',
    'Lun',
    'Mar',
    'Mié',
    'Jue',
    'Vie',
    'Sáb'
  ];


  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]">
        <select
          value={tiendaId}
          onChange={(evento) =>
            onCambiarTienda(
              evento.target.value
            )
          }
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">
            Todas las tiendas
          </option>
          {tiendas.map((tienda) => (
            <option
              key={tienda.id}
              value={tienda.id}
            >
              {tienda.nombre}
            </option>
          ))}
        </select>

        <select
          value={tipoDocumentoId}
          onChange={(evento) =>
            onCambiarTipoDocumento(
              evento.target.value
            )
          }
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">
            Todos los tipos documentales
          </option>
          {tiposDocumento.map((tipo) => (
            <option
              key={tipo.id}
              value={tipo.id}
            >
              {tipo.nombre}
            </option>
          ))}
        </select>

        <div className="text-sm text-slate-500 xl:self-center">
          {eventos.length} vencimiento(s)
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={() =>
              desplazarMes(-1)
            }
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <ChevronLeft size={20} />
          </button>

          <h3 className="text-lg font-bold capitalize text-slate-900">
            {nombreMes}
          </h3>

          <button
            type="button"
            onClick={() =>
              desplazarMes(1)
            }
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {diasSemana.map((dia) => (
            <div
              key={dia}
              className="px-2 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500"
            >
              {dia}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {dias.map((dia, indice) => {
            if (!dia) {
              return (
                <div
                  key={`vacio-${indice}`}
                  className="min-h-32 border-b border-r border-slate-100 bg-slate-50/50"
                />
              );
            }

            const fecha =
              `${anio}-${String(numeroMes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

            const eventosDia =
              eventos.filter(
                (evento) =>
                  claveFecha(
                    evento.fecha
                  ) === fecha
              );

            return (
              <div
                key={fecha}
                className="min-h-32 border-b border-r border-slate-100 p-2"
              >
                <div className="mb-2 text-xs font-semibold text-slate-500">
                  {dia}
                </div>

                <div className="space-y-1.5">
                  {eventosDia.map((evento) => (
                    <button
                      key={evento.id}
                      type="button"
                      onClick={() =>
                        onAbrirDocumento(
                          evento
                        )
                      }
                      className={`w-full rounded-lg border px-2 py-2 text-left text-xs transition hover:shadow-sm ${claseNivel(
                        evento.nivelAtencion
                      )}`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <FileText size={13} />
                        {evento.documento.codigoInterno}
                      </div>
                      <div className="mt-1 truncate">
                        {evento.tienda.nombre}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {cargando && (
          <div className="border-t border-slate-200 px-5 py-3 text-sm text-slate-500">
            Actualizando calendario...
          </div>
        )}
      </div>
    </div>
  );
}


export default CalendarioVencimientos;
