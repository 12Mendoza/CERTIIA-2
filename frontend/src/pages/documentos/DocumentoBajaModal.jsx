import {
  useEffect,
  useState
} from 'react';

import {
  AlertTriangle,
  Archive,
  Ban,
  CheckCircle2,
  FileText,
  LoaderCircle,
  ShieldCheck,
  X
} from 'lucide-react';


// ============================================================
// COMPONENTE
// ============================================================

const DocumentoBajaModal = ({
  abierto,
  documento,
  cargando,
  error,
  onCerrar,
  onConfirmar
}) => {

  const [
    accion,
    setAccion
  ] = useState(
    'ARCHIVAR'
  );

  const [
    motivo,
    setMotivo
  ] = useState(
    ''
  );


  // ==========================================================
  // REINICIAR FORMULARIO
  // ==========================================================

  useEffect(
    () => {

      if (abierto) {

        setAccion(
          'ARCHIVAR'
        );

        setMotivo(
          ''
        );

      }

    },
    [
      abierto,
      documento?.id
    ]
  );


  if (!abierto) {
    return null;
  }


  const codigo =
    documento?.codigoInterno ||
    documento?.codigo_interno ||
    '—';


  const numero =
    documento?.numeroDocumento ||
    documento?.numero_documento ||
    '—';


  const motivoValido =
    motivo.trim().length >= 5;


  const confirmar = () => {

    if (
      cargando ||
      !motivoValido
    ) {
      return;
    }


    onConfirmar?.({
      accion,
      motivo:
        motivo.trim()
    });

  };


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
              bg-red-500/10
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
                  text-amber-200
                "
              >
                <Archive size={23} />
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
                  Control documental
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
                  Archivar o anular documento
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
                  El registro permanecerá conservado en CERTIIA.
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
                <FileText size={19} />
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
                  {codigo}
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  Documento N.° {numero}
                </p>

              </div>

            </div>

          </section>


          {/* ================================================= */}
          {/* ADVERTENCIA */}
          {/* ================================================= */}

          <section
            className="
              rounded-2xl
              border
              border-amber-200
              bg-amber-50
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

              <AlertTriangle
                size={20}
                className="
                  mt-0.5
                  shrink-0
                  text-amber-600
                "
              />

              <div>

                <p
                  className="
                    font-bold
                    text-amber-800
                  "
                >
                  Esta operación no elimina el documento.
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-amber-700
                  "
                >
                  Se conservarán el registro, los archivos adjuntos
                  y toda su trazabilidad histórica.
                </p>

              </div>

            </div>

          </section>


          {/* ================================================= */}
          {/* ACCIÓN */}
          {/* ================================================= */}

          <section>

            <div
              className="
                mb-3
                flex
                items-center
                justify-between
                gap-3
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
                  Selecciona una acción
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  Define cómo debe quedar clasificado el documento.
                </p>
              </div>

            </div>


            <div
              className="
                grid
                gap-3
                sm:grid-cols-2
              "
            >

              {/* ARCHIVAR */}

              <button
                type="button"
                onClick={() =>
                  setAccion(
                    'ARCHIVAR'
                  )
                }
                disabled={cargando}
                className={`
                  relative
                  overflow-hidden
                  rounded-2xl
                  border
                  p-5
                  text-left
                  transition
                  ${
                    accion ===
                    'ARCHIVAR'
                      ? 'border-indigo-500 bg-indigo-50 ring-4 ring-indigo-500/10'
                      : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30'
                  }
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                `}
              >

                {
                  accion ===
                    'ARCHIVAR' && (

                    <div
                      className="
                        absolute
                        right-3
                        top-3
                      "
                    >
                      <CheckCircle2
                        size={18}
                        className="text-indigo-600"
                      />
                    </div>

                  )
                }


                <div
                  className={`
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    ${
                      accion ===
                      'ARCHIVAR'
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'bg-slate-100 text-slate-500'
                    }
                  `}
                >
                  <Archive size={19} />
                </div>

                <p
                  className="
                    mt-4
                    font-bold
                    text-slate-900
                  "
                >
                  Archivar
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  El documento deja de considerarse activo,
                  pero conserva toda su información histórica.
                </p>

              </button>


              {/* ANULAR */}

              <button
                type="button"
                onClick={() =>
                  setAccion(
                    'ANULAR'
                  )
                }
                disabled={cargando}
                className={`
                  relative
                  overflow-hidden
                  rounded-2xl
                  border
                  p-5
                  text-left
                  transition
                  ${
                    accion ===
                    'ANULAR'
                      ? 'border-red-500 bg-red-50 ring-4 ring-red-500/10'
                      : 'border-slate-200 bg-white hover:border-red-200 hover:bg-red-50/30'
                  }
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                `}
              >

                {
                  accion ===
                    'ANULAR' && (

                    <div
                      className="
                        absolute
                        right-3
                        top-3
                      "
                    >
                      <CheckCircle2
                        size={18}
                        className="text-red-600"
                      />
                    </div>

                  )
                }


                <div
                  className={`
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    ${
                      accion ===
                      'ANULAR'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-slate-100 text-slate-500'
                    }
                  `}
                >
                  <Ban size={19} />
                </div>

                <p
                  className="
                    mt-4
                    font-bold
                    text-slate-900
                  "
                >
                  Anular
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  Utilice esta opción cuando el documento
                  ya no deba considerarse válido.
                </p>

              </button>

            </div>

          </section>


          {/* ================================================= */}
          {/* MOTIVO */}
          {/* ================================================= */}

          <section
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
            "
          >

            <div
              className="
                mb-3
                flex
                items-start
                justify-between
                gap-3
              "
            >

              <div>
                <label
                  htmlFor="motivo-baja-documento"
                  className="
                    block
                    text-sm
                    font-bold
                    text-slate-800
                  "
                >
                  Motivo *
                </label>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  El motivo quedará asociado a la trazabilidad de la operación.
                </p>
              </div>


              <span
                className={`
                  rounded-full
                  px-2.5
                  py-1
                  text-[10px]
                  font-bold
                  ${
                    motivoValido
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }
                `}
              >
                {
                  motivoValido
                    ? 'Válido'
                    : 'Mín. 5 caracteres'
                }
              </span>

            </div>


            <textarea
              id="motivo-baja-documento"
              value={motivo}
              onChange={
                (
                  evento
                ) => {

                  setMotivo(
                    evento.target.value.slice(
                      0,
                      1000
                    )
                  );

                }
              }
              disabled={cargando}
              rows={5}
              placeholder={
                accion ===
                'ARCHIVAR'
                  ? 'Indique por qué se archiva el documento...'
                  : 'Indique por qué se anula el documento...'
              }
              className={`
                w-full
                resize-none
                rounded-xl
                border
                bg-white
                px-4
                py-3
                text-sm
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                disabled:bg-slate-100
                ${
                  motivo.length > 0 &&
                  !motivoValido
                    ? 'border-amber-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                }
              `}
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
                  text-slate-500
                "
              >
                Mínimo 5 caracteres.
              </p>

              <p
                className="
                  text-xs
                  font-semibold
                  text-slate-400
                "
              >
                {motivo.length}/1000
              </p>

            </div>

          </section>


          {/* ================================================= */}
          {/* RESUMEN DE ACCIÓN */}
          {/* ================================================= */}

          <section
            className={`
              rounded-2xl
              border
              p-4
              ${
                accion ===
                'ANULAR'
                  ? 'border-red-100 bg-red-50/70'
                  : 'border-indigo-100 bg-indigo-50/70'
              }
            `}
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
                className={`
                  mt-0.5
                  shrink-0
                  ${
                    accion ===
                    'ANULAR'
                      ? 'text-red-600'
                      : 'text-indigo-600'
                  }
                `}
              />

              <div>

                <p
                  className={`
                    text-xs
                    font-bold
                    uppercase
                    tracking-wide
                    ${
                      accion ===
                      'ANULAR'
                        ? 'text-red-700'
                        : 'text-indigo-700'
                    }
                  `}
                >
                  Acción seleccionada
                </p>

                <p
                  className={`
                    mt-1
                    text-sm
                    leading-6
                    ${
                      accion ===
                      'ANULAR'
                        ? 'text-red-800'
                        : 'text-indigo-800'
                    }
                  `}
                >
                  {
                    accion ===
                    'ANULAR'
                      ? 'El documento quedará anulado, conservando íntegramente su historial y evidencia.'
                      : 'El documento quedará archivado y dejará de considerarse activo, manteniendo su información histórica.'
                  }
                </p>

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
        {/* BOTONES */}
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
            onClick={confirmar}
            disabled={
              cargando ||
              !motivoValido
            }
            className={`
              inline-flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              px-5
              text-sm
              font-bold
              text-white
              shadow-lg
              transition
              focus:outline-none
              focus:ring-4
              disabled:cursor-not-allowed
              disabled:opacity-50
              ${
                accion ===
                'ANULAR'
                  ? 'bg-red-600 shadow-red-600/20 hover:bg-red-700 focus:ring-red-500/20'
                  : 'bg-indigo-600 shadow-indigo-600/20 hover:bg-indigo-700 focus:ring-indigo-500/20'
              }
            `}
          >

            {
              cargando
                ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                    Procesando...
                  </>
                )
                : accion ===
                    'ANULAR'
                  ? (
                    <>
                      <Ban size={17} />
                      Confirmar anulación
                    </>
                  )
                  : (
                    <>
                      <Archive size={17} />
                      Confirmar archivado
                    </>
                  )
            }

          </button>

        </div>

      </div>

    </div>

  );

};


export default DocumentoBajaModal;
