import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  Hash,
  History,
  Paperclip,
  RefreshCw,
  ShieldCheck,
  Store,
  User,
  X
} from 'lucide-react';


const formatearFecha = (
  valor
) => {

  if (!valor) {
    return 'Sin fecha';
  }

  const texto =
    String(valor).slice(
      0,
      10
    );

  const partes =
    texto.split('-');

  if (
    partes.length !== 3
  ) {
    return texto;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;

};


const formatearTamano = (
  bytes
) => {

  const valor =
    Number(bytes);

  if (
    !Number.isFinite(valor)
  ) {
    return '—';
  }

  if (valor < 1024) {
    return `${valor} B`;
  }

  if (
    valor <
    1024 * 1024
  ) {

    return `${(
      valor / 1024
    ).toFixed(1)} KB`;

  }

  return `${(
    valor /
    (1024 * 1024)
  ).toFixed(2)} MB`;

};


const claseEstado = (
  estado
) => {

  switch (estado) {

    case 'VIGENTE':
      return (
        'border-emerald-200 bg-emerald-50 text-emerald-700'
      );

    case 'POR_VENCER':
      return (
        'border-amber-200 bg-amber-50 text-amber-700'
      );

    case 'CRITICO':
      return (
        'border-orange-200 bg-orange-50 text-orange-700'
      );

    case 'VENCIDO':
      return (
        'border-red-200 bg-red-50 text-red-700'
      );

    case 'EN_RENOVACION':
      return (
        'border-blue-200 bg-blue-50 text-blue-700'
      );

    default:
      return (
        'border-slate-200 bg-slate-50 text-slate-700'
      );

  }

};


const puntoEstado = (
  estado
) => {

  switch (estado) {

    case 'VIGENTE':
      return 'bg-emerald-500';

    case 'POR_VENCER':
      return 'bg-amber-500';

    case 'CRITICO':
      return 'bg-orange-500';

    case 'VENCIDO':
      return 'bg-red-500';

    case 'EN_RENOVACION':
      return 'bg-blue-500';

    default:
      return 'bg-slate-400';

  }

};


const textoEstado = (
  estado
) => {

  switch (estado) {

    case 'VIGENTE':
      return 'Vigente';

    case 'POR_VENCER':
      return 'Por vencer';

    case 'CRITICO':
      return 'Crítico';

    case 'VENCIDO':
      return 'Vencido';

    case 'EN_RENOVACION':
      return 'En renovación';

    default:
      return estado || '—';

  }

};


const nombreResponsable = (
  responsable
) => {

  return `${responsable?.nombres || ''} ${
    responsable?.apellidos || ''
  }`.trim() || 'No registrado';

};


const DocumentoDetalleModal = ({
  abierto,
  documento,
  cargando,
  error,
  onCerrar
}) => {

  if (!abierto) {
    return null;
  }


  return (

    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        p-4
      "
    >

      {/* FONDO */}

      <button
        type="button"
        aria-label="Cerrar detalle"
        onClick={onCerrar}
        className="
          absolute
          inset-0
          bg-slate-950/65
          backdrop-blur-sm
        "
      />


      {/* CONTENEDOR */}

      <div
        className="
          relative
          z-10
          max-h-[94vh]
          w-full
          max-w-6xl
          overflow-hidden
          rounded-[28px]
          border
          border-white/10
          bg-white
          shadow-2xl
        "
      >

        {/* ================================================= */}
        {/* CABECERA */}
        {/* ================================================= */}

        <div
          className="
            relative
            overflow-hidden
            border-b
            border-white/10
            bg-gradient-to-br
            from-slate-950
            via-slate-900
            to-indigo-950
            px-6
            py-6
            text-white
            sm:px-7
          "
        >

          <div
            className="
              absolute
              -right-16
              -top-20
              h-56
              w-56
              rounded-full
              bg-indigo-500/20
              blur-3xl
            "
          />

          <div
            className="
              absolute
              -bottom-24
              left-1/3
              h-48
              w-48
              rounded-full
              bg-violet-500/10
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

            <div
              className="
                flex
                min-w-0
                items-start
                gap-4
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
                  border
                  border-white/10
                  bg-white/10
                  text-indigo-200
                "
              >
                <FileCheck2 size={24} />
              </div>

              <div className="min-w-0">

                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-indigo-300
                  "
                >
                  Trazabilidad documental
                </p>

                <h2
                  className="
                    mt-1
                    text-xl
                    font-bold
                    tracking-tight
                    text-white
                    sm:text-2xl
                  "
                >
                  Detalle del documento
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-400
                    sm:text-sm
                  "
                >
                  Información, vigencia, evidencia digital y relaciones registradas en CERTIIA.
                </p>

              </div>

            </div>


            <button
              type="button"
              onClick={onCerrar}
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-white/10
                bg-white/10
                text-slate-300
                transition
                hover:bg-white/20
                hover:text-white
              "
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

          </div>

        </div>


        {/* ================================================= */}
        {/* CONTENIDO */}
        {/* ================================================= */}

        <div
          className="
            max-h-[calc(94vh-116px)]
            overflow-y-auto
            bg-slate-50/70
            p-5
            sm:p-6
          "
        >

          {
            cargando
              ? (
                <EstadoCarga />
              )
              : error
                ? (
                  <EstadoError
                    error={error}
                  />
                )
                : !documento
                  ? (
                    <EstadoVacio />
                  )
                  : (
                    <div className="space-y-6">

                      {/* ===================================== */}
                      {/* RESUMEN */}
                      {/* ===================================== */}

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
                            gap-5
                            p-5
                            lg:grid-cols-[1fr_auto]
                            lg:items-center
                            sm:p-6
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
                                Código interno
                              </p>

                              <h3
                                className="
                                  mt-1
                                  break-words
                                  text-xl
                                  font-bold
                                  text-slate-900
                                "
                              >
                                {
                                  documento.codigoInterno ||
                                  'No disponible'
                                }
                              </h3>

                              <p
                                className="
                                  mt-1
                                  text-sm
                                  text-slate-500
                                "
                              >
                                Documento N.°{' '}
                                {
                                  documento.numeroDocumento ||
                                  'No registrado'
                                }
                              </p>

                            </div>

                          </div>


                          <span
                            className={`
                              inline-flex
                              w-fit
                              items-center
                              gap-2
                              rounded-full
                              border
                              px-4
                              py-2
                              text-sm
                              font-bold
                              ${claseEstado(
                                documento.estado
                              )}
                            `}
                          >
                            <span
                              className={`
                                h-2.5
                                w-2.5
                                rounded-full
                                ${puntoEstado(
                                  documento.estado
                                )}
                              `}
                            />

                            {
                              textoEstado(
                                documento.estado
                              )
                            }
                          </span>

                        </div>

                      </section>


                      {/* ===================================== */}
                      {/* KPIS */}
                      {/* ===================================== */}

                      <section
                        className="
                          grid
                          gap-4
                          sm:grid-cols-2
                          xl:grid-cols-4
                        "
                      >

                        <TarjetaResumen
                          icono={Store}
                          titulo="Tienda"
                          valor={
                            documento.tienda?.nombre ||
                            'No registrada'
                          }
                          tono="indigo"
                        />

                        <TarjetaResumen
                          icono={Building2}
                          titulo="Entidad emisora"
                          valor={
                            documento.entidadEmisora?.nombre ||
                            'No registrada'
                          }
                          tono="violet"
                        />

                        <TarjetaResumen
                          icono={CalendarDays}
                          titulo="Vencimiento"
                          valor={
                            documento.fechaVencimiento
                              ? formatearFecha(
                                  documento.fechaVencimiento
                                )
                              : 'Indeterminado'
                          }
                          tono="amber"
                        />

                        <TarjetaResumen
                          icono={Paperclip}
                          titulo="Archivos"
                          valor={
                            Array.isArray(
                              documento.archivos
                            )
                              ? documento.archivos.length
                              : 0
                          }
                          tono="emerald"
                        />

                      </section>


                      {/* ===================================== */}
                      {/* INFORMACIÓN GENERAL */}
                      {/* ===================================== */}

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
                          icono={FileText}
                          titulo="Información general"
                          descripcion="Datos principales del documento y responsables asociados."
                          tono="indigo"
                        />

                        <div
                          className="
                            grid
                            gap-4
                            p-5
                            md:grid-cols-2
                            sm:p-6
                          "
                        >

                          <DatoCard
                            icono={Store}
                            titulo="Tienda"
                            valor={
                              documento.tienda?.nombre ||
                              'No registrada'
                            }
                            detalle={
                              documento.tienda?.codigo
                                ? `Código ${documento.tienda.codigo}`
                                : ''
                            }
                          />

                          <DatoCard
                            icono={FileText}
                            titulo="Tipo documental"
                            valor={
                              documento.tipoDocumento?.nombre ||
                              'No registrado'
                            }
                            detalle={
                              documento.tipoDocumento?.categoria ||
                              'Sin categoría'
                            }
                          />

                          <DatoCard
                            icono={Building2}
                            titulo="Entidad emisora"
                            valor={
                              documento.entidadEmisora?.nombre ||
                              'No registrada'
                            }
                            detalle={
                              documento.entidadEmisora?.ruc
                                ? `RUC ${documento.entidadEmisora.ruc}`
                                : ''
                            }
                          />

                          <DatoCard
                            icono={User}
                            titulo="Responsable"
                            valor={
                              nombreResponsable(
                                documento.responsable
                              )
                            }
                            detalle={
                              documento.responsable?.email ||
                              ''
                            }
                          />

                        </div>

                      </section>


                      {/* ===================================== */}
                      {/* FECHAS Y VIGENCIA */}
                      {/* ===================================== */}

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
                          titulo="Fechas y vigencia"
                          descripcion="Datos temporales utilizados para el control documental."
                          tono="amber"
                        />

                        <div
                          className="
                            grid
                            gap-4
                            p-5
                            sm:grid-cols-2
                            lg:grid-cols-3
                            sm:p-6
                          "
                        >

                          <FechaCard
                            titulo="Fecha de emisión"
                            valor={
                              formatearFecha(
                                documento.fechaEmision
                              )
                            }
                            icono={CalendarDays}
                          />

                          <FechaCard
                            titulo="Fecha de vencimiento"
                            valor={
                              documento.fechaVencimiento
                                ? formatearFecha(
                                    documento.fechaVencimiento
                                  )
                                : 'Indeterminado'
                            }
                            icono={Clock3}
                          />

                          <FechaCard
                            titulo="Número de expediente"
                            valor={
                              documento.numeroExpediente ||
                              'No registrado'
                            }
                            icono={Hash}
                          />

                        </div>

                      </section>


                      {/* ===================================== */}
                      {/* OBSERVACIONES */}
                      {/* ===================================== */}

                      {
                        documento.observaciones && (

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
                              icono={History}
                              titulo="Observaciones"
                              descripcion="Notas registradas para este documento."
                              tono="slate"
                            />

                            <div className="p-5 sm:p-6">

                              <div
                                className="
                                  rounded-2xl
                                  border
                                  border-slate-200
                                  bg-slate-50
                                  p-4
                                  text-sm
                                  leading-6
                                  text-slate-700
                                "
                              >
                                {
                                  documento.observaciones
                                }
                              </div>

                            </div>

                          </section>

                        )
                      }


                      {/* ===================================== */}
                      {/* ARCHIVOS */}
                      {/* ===================================== */}

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
                          icono={Paperclip}
                          titulo="Archivos adjuntos"
                          descripcion="Evidencia digital registrada y sus metadatos de integridad."
                          tono="emerald"
                        />

                        <div className="p-5 sm:p-6">

                          {
                            Array.isArray(
                              documento.archivos
                            ) &&
                            documento.archivos.length > 0
                              ? (
                                <div
                                  className="
                                    grid
                                    gap-4
                                    xl:grid-cols-2
                                  "
                                >

                                  {
                                    documento.archivos.map(
                                      (archivo) => (

                                        <ArchivoCard
                                          key={
                                            archivo.id
                                          }
                                          archivo={
                                            archivo
                                          }
                                        />

                                      )
                                    )
                                  }

                                </div>
                              )
                              : (
                                <div
                                  className="
                                    flex
                                    min-h-40
                                    flex-col
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    border
                                    border-dashed
                                    border-slate-300
                                    bg-slate-50
                                    px-6
                                    py-8
                                    text-center
                                  "
                                >
                                  <Paperclip
                                    size={26}
                                    className="text-slate-300"
                                  />

                                  <p
                                    className="
                                      mt-3
                                      text-sm
                                      font-semibold
                                      text-slate-600
                                    "
                                  >
                                    Sin archivos adjuntos
                                  </p>

                                  <p
                                    className="
                                      mt-1
                                      text-xs
                                      text-slate-400
                                    "
                                  >
                                    Este documento todavía no tiene evidencia digital registrada.
                                  </p>
                                </div>
                              )
                          }

                        </div>

                      </section>


                      {/* ===================================== */}
                      {/* TRAZABILIDAD */}
                      {/* ===================================== */}

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
                          icono={History}
                          titulo="Trazabilidad"
                          descripcion="Procesos relacionados con el documento."
                          tono="violet"
                        />

                        <div
                          className="
                            grid
                            gap-4
                            p-5
                            md:grid-cols-2
                            sm:p-6
                          "
                        >

                          <RelacionCard
                            icono={RefreshCw}
                            titulo="Trámites"
                            valor={
                              documento.tramites?.length ||
                              0
                            }
                            descripcion="trámite(s) asociado(s)"
                            tono="sky"
                          />

                          <RelacionCard
                            icono={History}
                            titulo="Renovaciones"
                            valor={
                              documento.renovaciones?.length ||
                              0
                            }
                            descripcion="renovación(es) registrada(s)"
                            tono="violet"
                          />

                        </div>

                      </section>

                    </div>
                  )
          }

        </div>

      </div>

    </div>

  );

};


// ============================================================
// COMPONENTES VISUALES
// ============================================================

function EstadoCarga() {

  return (
    <div
      className="
        flex
        min-h-96
        flex-col
        items-center
        justify-center
        rounded-3xl
        border
        border-slate-200
        bg-white
        text-center
      "
    >

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
        <FileText size={27} />

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

      <p
        className="
          mt-4
          font-bold
          text-slate-800
        "
      >
        Cargando documento
      </p>

      <p
        className="
          mt-1
          text-sm
          text-slate-500
        "
      >
        Obteniendo información y trazabilidad...
      </p>

    </div>
  );

}


function EstadoError({
  error
}) {

  return (
    <div
      className="
        flex
        min-h-72
        flex-col
        items-center
        justify-center
        rounded-3xl
        border
        border-red-200
        bg-red-50
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
          text-red-600
          shadow-sm
        "
      >
        <ShieldCheck size={25} />
      </div>

      <p
        className="
          mt-4
          font-bold
          text-red-800
        "
      >
        No se pudo cargar el documento
      </p>

      <p
        className="
          mt-2
          max-w-lg
          text-sm
          leading-6
          text-red-700
        "
      >
        {error}
      </p>
    </div>
  );

}


function EstadoVacio() {

  return (
    <div
      className="
        flex
        min-h-72
        flex-col
        items-center
        justify-center
        rounded-3xl
        border
        border-slate-200
        bg-white
        px-6
        py-10
        text-center
      "
    >
      <FileText
        size={34}
        className="text-slate-300"
      />

      <p
        className="
          mt-4
          font-bold
          text-slate-700
        "
      >
        Información no disponible
      </p>

      <p
        className="
          mt-1
          text-sm
          text-slate-500
        "
      >
        No se pudo obtener la información del documento.
      </p>
    </div>
  );

}


function TarjetaResumen({
  icono: Icono,
  titulo,
  valor,
  tono
}) {

  const tonos = {
    indigo:
      'bg-indigo-50 text-indigo-600',
    violet:
      'bg-violet-50 text-violet-600',
    amber:
      'bg-amber-50 text-amber-600',
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

      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >

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
            ${tonos[tono] || tonos.indigo}
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

  const tonos = {
    indigo:
      'bg-indigo-50 text-indigo-600',
    amber:
      'bg-amber-50 text-amber-600',
    emerald:
      'bg-emerald-50 text-emerald-600',
    violet:
      'bg-violet-50 text-violet-600',
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
        px-5
        py-5
        sm:px-6
      "
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
          ${tonos[tono] || tonos.indigo}
        `}
      >
        <Icono size={19} />
      </div>

      <div>
        <h3
          className="
            font-bold
            text-slate-900
          "
        >
          {titulo}
        </h3>

        <p
          className="
            mt-0.5
            text-xs
            leading-5
            text-slate-500
          "
        >
          {descripcion}
        </p>
      </div>

    </div>
  );

}


function DatoCard({
  icono: Icono,
  titulo,
  valor,
  detalle
}) {

  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-slate-50/60
        p-4
      "
    >

      <div
        className="
          flex
          items-start
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
            bg-white
            text-slate-500
            shadow-sm
          "
        >
          <Icono size={16} />
        </div>

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
              mt-1
              break-words
              text-sm
              font-semibold
              text-slate-800
            "
          >
            {valor}
          </p>

          {
            detalle && (
              <p
                className="
                  mt-1
                  break-words
                  text-xs
                  text-slate-500
                "
              >
                {detalle}
              </p>
            )
          }

        </div>

      </div>

    </div>
  );

}


function FechaCard({
  titulo,
  valor,
  icono: Icono
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
          items-start
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
            bg-white
            text-indigo-600
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
              text-sm
              font-semibold
              text-slate-800
            "
          >
            {valor}
          </p>

        </div>

      </div>

    </div>
  );

}


function ArchivoCard({
  archivo
}) {

  return (
    <article
      className="
        rounded-2xl
        border
        border-slate-200
        bg-slate-50/60
        p-4
      "
    >

      <div
        className="
          flex
          items-start
          gap-3
        "
      >

        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-red-50
            text-red-600
          "
        >
          <FileText size={19} />
        </div>

        <div className="min-w-0 flex-1">

          <p
            className="
              break-all
              text-sm
              font-bold
              text-slate-900
            "
          >
            {
              archivo.nombreOriginal ||
              'Archivo sin nombre'
            }
          </p>

          <div
            className="
              mt-3
              grid
              gap-2
              text-xs
              text-slate-500
              sm:grid-cols-2
            "
          >
            <p>
              <span className="font-semibold text-slate-600">
                Tipo:
              </span>{' '}
              {archivo.mimeType || '—'}
            </p>

            <p>
              <span className="font-semibold text-slate-600">
                Tamaño:
              </span>{' '}
              {
                formatearTamano(
                  archivo.tamanoBytes
                )
              }
            </p>

            <p>
              <span className="font-semibold text-slate-600">
                Fecha:
              </span>{' '}
              {
                formatearFecha(
                  archivo.fechaCarga
                )
              }
            </p>

            <p>
              <span className="font-semibold text-slate-600">
                Cargado por:
              </span>{' '}
              {
                nombreResponsable(
                  archivo.cargadoPor
                )
              }
            </p>
          </div>


          <div
            className="
              mt-3
              rounded-xl
              border
              border-slate-200
              bg-white
              p-3
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <ShieldCheck
                size={14}
                className="text-emerald-600"
              />

              <p
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-500
                "
              >
                Integridad SHA-256
              </p>
            </div>

            <p
              className="
                mt-2
                break-all
                font-mono
                text-[11px]
                leading-5
                text-slate-500
              "
            >
              {
                archivo.hashSha256 ||
                'No disponible'
              }
            </p>
          </div>

        </div>

      </div>

    </article>
  );

}


function RelacionCard({
  icono: Icono,
  titulo,
  valor,
  descripcion,
  tono
}) {

  const tonos = {
    sky:
      'bg-sky-50 text-sky-600',
    violet:
      'bg-violet-50 text-violet-600'
  };

  return (
    <article
      className="
        rounded-2xl
        border
        border-slate-200
        bg-slate-50/60
        p-5
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
              text-sm
              font-bold
              text-slate-800
            "
          >
            {titulo}
          </p>

          <p
            className="
              mt-1
              text-xs
              text-slate-500
            "
          >
            {valor} {descripcion}
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
            ${tonos[tono]}
          `}
        >
          <Icono size={20} />
        </div>

      </div>

    </article>
  );

}


export default DocumentoDetalleModal;
