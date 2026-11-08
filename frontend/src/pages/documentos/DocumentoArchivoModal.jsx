import {
  useEffect,
  useRef,
  useState
} from 'react';

import {
  CheckCircle2,
  FileCheck2,
  FileText,
  Info,
  Paperclip,
  ShieldCheck,
  Upload,
  X
} from 'lucide-react';


const TAMANO_MAXIMO =
  10 * 1024 * 1024;


const formatearTamano = (
  bytes
) => {

  if (!bytes) {
    return '0 KB';
  }

  if (
    bytes <
    1024 * 1024
  ) {

    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;

  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`;

};


const DocumentoArchivoModal = ({
  abierto,
  documento,
  cargando = false,
  error = '',
  onCerrar,
  onGuardar
}) => {

  const inputRef =
    useRef(null);

  const [
    archivo,
    setArchivo
  ] = useState(null);

  const [
    errorLocal,
    setErrorLocal
  ] = useState('');


  useEffect(() => {

    if (abierto) {

      setArchivo(null);
      setErrorLocal('');

      if (inputRef.current) {
        inputRef.current.value = '';
      }

    }

  }, [
    abierto
  ]);


  if (!abierto) {
    return null;
  }


  const seleccionarArchivo = (
    evento
  ) => {

    const seleccionado =
      evento.target.files?.[0];

    setErrorLocal('');
    setArchivo(null);


    if (!seleccionado) {
      return;
    }


    if (
      seleccionado.type !==
      'application/pdf'
    ) {

      setErrorLocal(
        'Solo se permiten archivos PDF.'
      );

      evento.target.value = '';

      return;

    }


    if (
      seleccionado.size >
      TAMANO_MAXIMO
    ) {

      setErrorLocal(
        'El archivo supera el tamaño máximo permitido de 10 MB.'
      );

      evento.target.value = '';

      return;

    }


    if (
      seleccionado.size <= 0
    ) {

      setErrorLocal(
        'El archivo seleccionado está vacío.'
      );

      evento.target.value = '';

      return;

    }


    setArchivo(
      seleccionado
    );

  };


  const quitarArchivo = () => {

    if (cargando) {
      return;
    }

    setArchivo(null);
    setErrorLocal('');

    if (inputRef.current) {
      inputRef.current.value = '';
    }

  };


  const abrirSelector = () => {

    if (cargando) {
      return;
    }

    inputRef.current?.click();

  };


  const guardarArchivo =
    async () => {

      setErrorLocal('');


      if (!archivo) {

        setErrorLocal(
          'Debe seleccionar un archivo PDF.'
        );

        return;

      }


      if (!documento?.id) {

        setErrorLocal(
          'No se ha identificado el documento.'
        );

        return;

      }


      await onGuardar?.(
        archivo
      );

    };


  const codigoDocumento =
    documento?.codigoInterno ||
    documento?.codigo_interno ||
    'Documento registrado';

  const numeroDocumento =
    documento?.numeroDocumento ||
    documento?.numero_documento ||
    'No registrado';

  const porcentajeTamano =
    archivo
      ? Math.min(
          100,
          Math.round(
            (
              archivo.size /
              TAMANO_MAXIMO
            ) * 100
          )
        )
      : 0;


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
        aria-label="Cerrar modal"
        onClick={
          cargando
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
          w-full
          max-w-2xl
          overflow-hidden
          rounded-[28px]
          border
          border-white/10
          bg-white
          shadow-2xl
        "
      >

        {/* ================================================= */}
        {/* CABECERA PREMIUM */}
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
              -top-16
              h-52
              w-52
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
              h-44
              w-44
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
                  backdrop-blur
                "
              >
                <Paperclip size={23} />
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
                  Evidencia digital
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
                  Adjuntar documento digital
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
                  Carga la evidencia documental en formato PDF.
                </p>

              </div>

            </div>


            <button
              type="button"
              onClick={onCerrar}
              disabled={cargando}
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
        {/* CONTENIDO */}
        {/* ================================================= */}

        <div
          className="
            max-h-[72vh]
            space-y-5
            overflow-y-auto
            bg-slate-50/70
            px-6
            py-6
            sm:px-7
          "
        >

          {/* ================================================= */}
          {/* DOCUMENTO */}
          {/* ================================================= */}

          <section
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-4
              shadow-sm
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
                  bg-indigo-50
                  text-indigo-600
                "
              >
                <FileCheck2 size={19} />
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
                  Documento seleccionado
                </p>

                <p
                  className="
                    mt-1
                    break-words
                    font-bold
                    text-slate-900
                  "
                >
                  {codigoDocumento}
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  N.° {numeroDocumento}
                </p>

              </div>

            </div>

          </section>


          {/* ================================================= */}
          {/* REGLAS DE SEGURIDAD */}
          {/* ================================================= */}

          <section
            className="
              grid
              gap-3
              sm:grid-cols-3
            "
          >

            <ReglaArchivo
              icono={FileText}
              titulo="Formato"
              valor="Solo PDF"
            />

            <ReglaArchivo
              icono={ShieldCheck}
              titulo="Tamaño"
              valor="Máximo 10 MB"
            />

            <ReglaArchivo
              icono={CheckCircle2}
              titulo="Validación"
              valor="Archivo no vacío"
            />

          </section>


          {/* ================================================= */}
          {/* SELECTOR */}
          {/* ================================================= */}

          <section>

            <div
              className="
                mb-2
                flex
                items-center
                justify-between
                gap-3
              "
            >

              <label
                className="
                  text-sm
                  font-bold
                  text-slate-700
                "
              >
                Archivo PDF
              </label>

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
                Requerido
              </span>

            </div>


            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={
                seleccionarArchivo
              }
              className="hidden"
              disabled={cargando}
            />


            {
              !archivo
                ? (
                  <button
                    type="button"
                    onClick={abrirSelector}
                    disabled={cargando}
                    className="
                      group
                      flex
                      w-full
                      flex-col
                      items-center
                      justify-center
                      rounded-2xl
                      border-2
                      border-dashed
                      border-slate-300
                      bg-white
                      px-6
                      py-9
                      text-center
                      transition
                      hover:border-indigo-400
                      hover:bg-indigo-50/40
                      focus:outline-none
                      focus:ring-4
                      focus:ring-indigo-500/10
                      disabled:cursor-not-allowed
                      disabled:opacity-60
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
                        bg-indigo-50
                        text-indigo-600
                        transition
                        group-hover:scale-105
                        group-hover:bg-indigo-100
                      "
                    >
                      <Upload size={25} />
                    </div>

                    <span
                      className="
                        mt-4
                        font-bold
                        text-slate-800
                      "
                    >
                      Seleccionar archivo PDF
                    </span>

                    <span
                      className="
                        mt-1
                        max-w-sm
                        text-sm
                        leading-6
                        text-slate-500
                      "
                    >
                      Selecciona la evidencia digital correspondiente
                      al documento registrado.
                    </span>

                    <span
                      className="
                        mt-3
                        text-xs
                        font-semibold
                        text-indigo-600
                      "
                    >
                      PDF · máximo 10 MB
                    </span>

                  </button>
                )
                : (
                  <div
                    className="
                      overflow-hidden
                      rounded-2xl
                      border
                      border-emerald-200
                      bg-white
                      shadow-sm
                    "
                  >

                    <div
                      className="
                        flex
                        items-start
                        gap-4
                        p-4
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
                          bg-red-50
                          text-red-600
                        "
                      >
                        <FileText size={22} />
                      </div>

                      <div className="min-w-0 flex-1">

                        <div
                          className="
                            flex
                            flex-col
                            gap-2
                            sm:flex-row
                            sm:items-start
                            sm:justify-between
                          "
                        >

                          <div className="min-w-0">

                            <p
                              className="
                                truncate
                                font-bold
                                text-slate-900
                              "
                              title={archivo.name}
                            >
                              {archivo.name}
                            </p>

                            <p
                              className="
                                mt-1
                                text-sm
                                text-slate-500
                              "
                            >
                              {
                                formatearTamano(
                                  archivo.size
                                )
                              }
                              {' · '}
                              PDF
                            </p>

                          </div>


                          <span
                            className="
                              inline-flex
                              w-fit
                              items-center
                              gap-2
                              rounded-full
                              border
                              border-emerald-200
                              bg-emerald-50
                              px-3
                              py-1
                              text-xs
                              font-bold
                              text-emerald-700
                            "
                          >
                            <CheckCircle2 size={13} />
                            Validado
                          </span>

                        </div>


                        <div className="mt-4">

                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              gap-3
                              text-xs
                            "
                          >
                            <span className="font-semibold text-slate-500">
                              Uso del límite permitido
                            </span>

                            <span className="font-bold text-slate-600">
                              {porcentajeTamano}%
                            </span>
                          </div>

                          <div
                            className="
                              mt-2
                              h-2
                              overflow-hidden
                              rounded-full
                              bg-slate-100
                            "
                          >
                            <div
                              className="
                                h-full
                                rounded-full
                                bg-emerald-500
                                transition-all
                              "
                              style={{
                                width:
                                  `${porcentajeTamano}%`
                              }}
                            />
                          </div>

                        </div>

                      </div>

                    </div>


                    <div
                      className="
                        flex
                        flex-wrap
                        items-center
                        justify-between
                        gap-3
                        border-t
                        border-slate-100
                        bg-slate-50
                        px-4
                        py-3
                      "
                    >

                      <p
                        className="
                          text-xs
                          text-slate-500
                        "
                      >
                        El archivo cumple las validaciones locales.
                      </p>

                      <div
                        className="
                          flex
                          flex-wrap
                          gap-2
                        "
                      >

                        <button
                          type="button"
                          onClick={abrirSelector}
                          disabled={cargando}
                          className="
                            inline-flex
                            h-9
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-3
                            text-xs
                            font-bold
                            text-slate-600
                            transition
                            hover:bg-slate-100
                            disabled:opacity-50
                          "
                        >
                          Cambiar
                        </button>

                        <button
                          type="button"
                          onClick={quitarArchivo}
                          disabled={cargando}
                          className="
                            inline-flex
                            h-9
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-red-200
                            bg-red-50
                            px-3
                            text-xs
                            font-bold
                            text-red-600
                            transition
                            hover:bg-red-100
                            disabled:opacity-50
                          "
                        >
                          Quitar
                        </button>

                      </div>

                    </div>

                  </div>
                )
            }

          </section>


          {/* ================================================= */}
          {/* AVISO */}
          {/* ================================================= */}

          <div
            className="
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-indigo-100
              bg-indigo-50/70
              p-4
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

            <p
              className="
                text-xs
                leading-5
                text-indigo-700
              "
            >
              CERTIIA realizará las validaciones del servidor
              antes de registrar definitivamente la evidencia digital.
            </p>
          </div>


          {/* ================================================= */}
          {/* ERROR */}
          {/* ================================================= */}

          {
            (errorLocal || error) && (

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
                {
                  errorLocal ||
                  error
                }
              </div>

            )
          }

        </div>


        {/* ================================================= */}
        {/* ACCIONES */}
        {/* ================================================= */}

        <div
          className="
            flex
            flex-col-reverse
            gap-3
            border-t
            border-slate-200
            bg-white
            px-6
            py-4
            sm:flex-row
            sm:justify-end
            sm:px-7
          "
        >

          <button
            type="button"
            onClick={onCerrar}
            disabled={cargando}
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
            type="button"
            onClick={
              guardarArchivo
            }
            disabled={
              cargando ||
              !archivo
            }
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
              disabled:opacity-50
            "
          >

            {
              cargando
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

                    Adjuntando...
                  </>
                )
                : (
                  <>
                    <Upload size={17} />
                    Adjuntar PDF
                  </>
                )
            }

          </button>

        </div>

      </div>

    </div>

  );

};


function ReglaArchivo({
  icono: Icono,
  titulo,
  valor
}) {

  return (

    <article
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
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
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-slate-100
            text-slate-600
          "
        >
          <Icono size={16} />
        </div>

        <div>

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
              mt-0.5
              text-xs
              font-bold
              text-slate-700
            "
          >
            {valor}
          </p>

        </div>

      </div>

    </article>

  );

}


export default DocumentoArchivoModal;
