import {
  Building2,
  CalendarDays,
  FilePenLine,
  FileText,
  Hash,
  Info,
  LockKeyhole,
  Save,
  ShieldCheck,
  Store,
  UserRound,
  X
} from 'lucide-react';


// ============================================================
// UTILIDADES
// ============================================================

const obtenerDocumento = (
  detalle
) => {

  return (
    detalle?.documento ||
    detalle ||
    {}
  );

};


const fechaInput = (
  valor
) => {

  if (!valor) {
    return '';
  }

  return String(valor)
    .slice(0, 10);

};


const valorId = (
  valor
) => {

  if (
    valor === null ||
    valor === undefined
  ) {
    return '';
  }

  return String(valor);

};


const nombreUsuario = (
  usuario
) => {

  return [
    usuario?.nombres,
    usuario?.apellidos
  ]
    .filter(Boolean)
    .join(' ') ||
    usuario?.email ||
    `Usuario ${usuario?.id ?? ''}`;

};


// ============================================================
// COMPONENTE
// ============================================================

const DocumentoEditarModal = ({
  abierto,
  detalle,
  catalogos,
  formulario,
  setFormulario,
  guardando,
  error,
  onCerrar,
  onGuardar
}) => {

  if (!abierto) {
    return null;
  }


  const documento =
    obtenerDocumento(
      detalle
    );


  const regla =
    documento.reglaVigencia ||
    detalle?.reglaVigencia ||
    {};


  const tipoVigencia =
    regla.tipoVigencia ||
    regla.tipo_vigencia ||
    documento.tipoVigencia ||
    documento.tipo_vigencia ||
    '';


  const manejarCambio = (
    evento
  ) => {

    const {
      name,
      value
    } = evento.target;

    setFormulario(
      (actual) => ({
        ...actual,
        [name]:
          value
      })
    );

  };


  const enviarFormulario = (
    evento
  ) => {

    evento.preventDefault();

    onGuardar();

  };


  const codigoInterno =
    documento.codigoInterno ||
    documento.codigo_interno ||
    '—';

  const tiendaNombre =
    documento.tienda?.nombre ||
    documento.tiendaNombre ||
    documento.tienda_nombre ||
    '—';

  const tipoDocumentoNombre =
    documento.tipoDocumento?.nombre ||
    documento.tipoDocumentoNombre ||
    documento.tipo_documento_nombre ||
    '—';


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

      {/* ================================================= */}
      {/* FONDO */}
      {/* ================================================= */}

      <button
        type="button"
        aria-label="Cerrar edición"
        onClick={
          guardando
            ? undefined
            : onCerrar
        }
        className="
          absolute
          inset-0
          bg-slate-950/65
          backdrop-blur-sm
        "
      />


      {/* ================================================= */}
      {/* MODAL */}
      {/* ================================================= */}

      <div
        className="
          relative
          z-10
          max-h-[94vh]
          w-full
          max-w-5xl
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
              -bottom-20
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
                <FilePenLine size={24} />
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
                  Gestión documental
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
                  Editar documento
                </h2>

                <p
                  className="
                    mt-1
                    break-words
                    text-xs
                    text-slate-400
                    sm:text-sm
                  "
                >
                  {codigoInterno}
                </p>

              </div>

            </div>


            <button
              type="button"
              onClick={onCerrar}
              disabled={guardando}
              aria-label="Cerrar"
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
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <X size={20} />
            </button>

          </div>

        </div>


        {/* ================================================= */}
        {/* FORMULARIO */}
        {/* ================================================= */}

        <form
          onSubmit={enviarFormulario}
          className="
            max-h-[calc(94vh-116px)]
            overflow-y-auto
            bg-slate-50/70
          "
        >

          <div
            className="
              space-y-6
              p-5
              sm:p-6
            "
          >

            {/* ================================================= */}
            {/* INFORMACIÓN PROTEGIDA */}
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
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-slate-100
                    text-slate-600
                  "
                >
                  <LockKeyhole size={19} />
                </div>

                <div>
                  <h3
                    className="
                      font-bold
                      text-slate-900
                    "
                  >
                    Información protegida
                  </h3>

                  <p
                    className="
                      mt-0.5
                      text-xs
                      leading-5
                      text-slate-500
                    "
                  >
                    Estos datos permanecen vinculados al historial original del documento.
                  </p>
                </div>

              </div>


              <div
                className="
                  grid
                  gap-4
                  p-5
                  md:grid-cols-3
                  sm:p-6
                "
              >

                <DatoProtegido
                  icono={Hash}
                  titulo="Código interno"
                  valor={codigoInterno}
                />

                <DatoProtegido
                  icono={Store}
                  titulo="Tienda"
                  valor={tiendaNombre}
                />

                <DatoProtegido
                  icono={FileText}
                  titulo="Tipo documental"
                  valor={tipoDocumentoNombre}
                />

              </div>


              <div
                className="
                  border-t
                  border-indigo-100
                  bg-indigo-50/60
                  px-5
                  py-4
                  sm:px-6
                "
              >

                <div
                  className="
                    flex
                    items-start
                    gap-3
                  "
                >
                  <ShieldCheck
                    size={18}
                    className="
                      mt-0.5
                      shrink-0
                      text-indigo-600
                    "
                  />

                  <p
                    className="
                      text-xs
                      leading-5
                      text-indigo-700
                    "
                  >
                    El código interno, la tienda, el tipo documental y la regla histórica de vigencia no se modifican desde esta operación.
                  </p>
                </div>

              </div>

            </section>


            {/* ================================================= */}
            {/* DATOS DEL DOCUMENTO */}
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
                icono={FilePenLine}
                titulo="Datos del documento"
                descripcion="Actualiza los datos operativos que pueden modificarse."
                tono="indigo"
              />


              <div
                className="
                  grid
                  gap-5
                  p-5
                  md:grid-cols-2
                  sm:p-6
                "
              >

                <CampoTexto
                  label="Número de documento"
                  requerido
                >
                  <input
                    type="text"
                    name="numeroDocumento"
                    value={
                      formulario.numeroDocumento
                    }
                    onChange={manejarCambio}
                    required
                    maxLength={150}
                    disabled={guardando}
                    placeholder="Ingrese el número del documento"
                    className={claseCampo()}
                  />
                </CampoTexto>


                <CampoTexto
                  label="Número de expediente"
                >
                  <input
                    type="text"
                    name="numeroExpediente"
                    value={
                      formulario.numeroExpediente
                    }
                    onChange={manejarCambio}
                    maxLength={150}
                    disabled={guardando}
                    placeholder="Opcional"
                    className={claseCampo()}
                  />
                </CampoTexto>


                <CampoTexto
                  label="Entidad emisora"
                  requerido
                  icono={Building2}
                >
                  <select
                    name="entidadEmisoraId"
                    value={
                      valorId(
                        formulario.entidadEmisoraId
                      )
                    }
                    onChange={manejarCambio}
                    required
                    disabled={guardando}
                    className={claseCampo()}
                  >
                    <option value="">
                      Seleccione una entidad
                    </option>

                    {
                      (
                        catalogos?.entidades ||
                        []
                      ).map(
                        (entidad) => (

                          <option
                            key={entidad.id}
                            value={entidad.id}
                          >
                            {entidad.nombre}
                          </option>

                        )
                      )
                    }
                  </select>
                </CampoTexto>


                <CampoTexto
                  label="Responsable"
                  requerido
                  icono={UserRound}
                >
                  <select
                    name="responsableUsuarioId"
                    value={
                      valorId(
                        formulario.responsableUsuarioId
                      )
                    }
                    onChange={manejarCambio}
                    required
                    disabled={guardando}
                    className={claseCampo()}
                  >
                    <option value="">
                      Seleccione responsable
                    </option>

                    {
                      (
                        catalogos?.usuarios ||
                        []
                      ).map(
                        (usuario) => (

                          <option
                            key={usuario.id}
                            value={usuario.id}
                          >
                            {
                              nombreUsuario(
                                usuario
                              )
                            }
                          </option>

                        )
                      )
                    }
                  </select>
                </CampoTexto>

              </div>

            </section>


            {/* ================================================= */}
            {/* VIGENCIA */}
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
                titulo="Vigencia"
                descripcion="Actualiza las fechas respetando la regla histórica asociada."
                tono="amber"
              />


              <div className="p-5 sm:p-6">

                <div
                  className="
                    grid
                    gap-5
                    md:grid-cols-2
                  "
                >

                  <CampoTexto
                    label="Fecha de emisión"
                    requerido
                    icono={CalendarDays}
                  >
                    <input
                      type="date"
                      name="fechaEmision"
                      value={
                        fechaInput(
                          formulario.fechaEmision
                        )
                      }
                      onChange={manejarCambio}
                      required
                      disabled={guardando}
                      className={claseCampo()}
                    />
                  </CampoTexto>


                  <CampoTexto
                    label="Fecha de vencimiento"
                    requerido={
                      tipoVigencia ===
                      'TEMPORAL'
                    }
                    icono={CalendarDays}
                  >
                    <input
                      type="date"
                      name="fechaVencimiento"
                      value={
                        fechaInput(
                          formulario.fechaVencimiento
                        )
                      }
                      onChange={manejarCambio}
                      required={
                        tipoVigencia ===
                        'TEMPORAL'
                      }
                      disabled={
                        guardando ||
                        tipoVigencia !==
                          'TEMPORAL'
                      }
                      className={claseCampo()}
                    />
                  </CampoTexto>

                </div>


                <div
                  className="
                    mt-5
                    rounded-2xl
                    border
                    border-indigo-100
                    bg-indigo-50/70
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
                    <Info
                      size={18}
                      className="
                        mt-0.5
                        shrink-0
                        text-indigo-600
                      "
                    />

                    <div>

                      <p
                        className="
                          text-xs
                          font-bold
                          uppercase
                          tracking-wide
                          text-indigo-700
                        "
                      >
                        Regla de vigencia
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          leading-6
                          text-indigo-800
                        "
                      >

                        {
                          tipoVigencia ===
                            'DETERMINADA' && (
                            <>
                              Vigencia determinada: al modificar la fecha de emisión, CERTIIA calculará nuevamente la fecha de vencimiento usando la regla histórica del documento.
                            </>
                          )
                        }

                        {
                          tipoVigencia ===
                            'TEMPORAL' && (
                            <>
                              Vigencia temporal: puedes actualizar la fecha de vencimiento.
                            </>
                          )
                        }

                        {
                          tipoVigencia ===
                            'INDETERMINADA' && (
                            <>
                              Vigencia indeterminada: este documento no utiliza fecha de vencimiento.
                            </>
                          )
                        }

                        {
                          !tipoVigencia && (
                            <>
                              El backend validará y recalculará la vigencia cuando corresponda.
                            </>
                          )
                        }

                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </section>


            {/* ================================================= */}
            {/* OBSERVACIONES */}
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
                icono={FileText}
                titulo="Observaciones"
                descripcion="Registra información adicional relevante para el documento."
                tono="slate"
              />


              <div className="p-5 sm:p-6">

                <textarea
                  name="observaciones"
                  value={
                    formulario.observaciones
                  }
                  onChange={manejarCambio}
                  rows={5}
                  maxLength={1500}
                  disabled={guardando}
                  placeholder="Ingrese observaciones..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-slate-800
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-indigo-500
                    focus:ring-4
                    focus:ring-indigo-500/10
                    disabled:bg-slate-100
                    disabled:text-slate-500
                  "
                />

                <div
                  className="
                    mt-2
                    flex
                    items-center
                    justify-between
                    gap-3
                  "
                >
                  <p
                    className="
                      text-xs
                      text-slate-400
                    "
                  >
                    Máximo 1500 caracteres.
                  </p>

                  <span
                    className="
                      rounded-full
                      bg-slate-100
                      px-2.5
                      py-1
                      text-[10px]
                      font-bold
                      text-slate-500
                    "
                  >
                    {
                      formulario.observaciones
                        ?.length || 0
                    }
                    /1500
                  </span>
                </div>

              </div>

            </section>


            {/* ================================================= */}
            {/* ERROR */}
            {/* ================================================= */}

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

          </div>


          {/* ================================================= */}
          {/* ACCIONES */}
          {/* ================================================= */}

          <div
            className="
              sticky
              bottom-0
              flex
              flex-col-reverse
              gap-3
              border-t
              border-slate-200
              bg-white/95
              px-5
              py-4
              backdrop-blur
              sm:flex-row
              sm:justify-end
              sm:px-6
            "
          >

            <button
              type="button"
              onClick={onCerrar}
              disabled={guardando}
              className="
                inline-flex
                h-11
                items-center
                justify-center
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
              Cancelar
            </button>


            <button
              type="submit"
              disabled={guardando}
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
                shadow-indigo-600/20
                transition
                hover:bg-indigo-700
                focus:outline-none
                focus:ring-4
                focus:ring-indigo-500/20
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >

              {
                guardando
                  ? (
                    <>
                      <span
                        className="
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-white/30
                          border-t-white
                        "
                      />
                      Guardando...
                    </>
                  )
                  : (
                    <>
                      <Save size={17} />
                      Guardar cambios
                    </>
                  )
              }

            </button>

          </div>

        </form>

      </div>

    </div>

  );

};


// ============================================================
// COMPONENTES VISUALES
// ============================================================

function claseCampo() {

  return `
    h-12
    w-full
    rounded-xl
    border
    border-slate-300
    bg-white
    px-4
    text-sm
    text-slate-800
    outline-none
    transition
    placeholder:text-slate-400
    focus:border-indigo-500
    focus:ring-4
    focus:ring-indigo-500/10
    disabled:cursor-not-allowed
    disabled:bg-slate-100
    disabled:text-slate-500
  `;

}


function CampoTexto({
  label,
  requerido = false,
  icono: Icono,
  children
}) {

  return (
    <div>

      <label
        className="
          mb-2
          flex
          items-center
          gap-2
          text-sm
          font-semibold
          text-slate-700
        "
      >
        {
          Icono && (
            <Icono
              size={15}
              className="text-slate-400"
            />
          )
        }

        <span>
          {label}
          {
            requerido
              ? ' *'
              : ''
          }
        </span>
      </label>

      {children}

    </div>
  );

}


function DatoProtegido({
  icono: Icono,
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
              text-[10px]
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
              font-bold
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


export default DocumentoEditarModal;
