import {

  useEffect,

  useState

} from 'react';



import {

  CalendarClock,

  FileText,

  RefreshCw,

  Save,

  X

} from 'lucide-react';





function TipoDocumentoModal({

  abierto,

  modo = 'crear',

  tipoDocumento = null,

  cargando = false,

  error = '',

  onCerrar,

  onGuardar

}) {

  const [

    nombre,

    setNombre

  ] = useState('');





  const [

    categoria,

    setCategoria

  ] = useState('');





  const [

    descripcion,

    setDescripcion

  ] = useState('');





  const [

    requiereRenovacion,

    setRequiereRenovacion

  ] = useState(false);





  const esEdicion =

    modo === 'editar';





  // ===================================================
  // CARGAR DATOS
  // ===================================================
  useEffect(() => {

    if (!abierto) {

      return;

    }





    if (

      esEdicion &&

      tipoDocumento

    ) {

      setNombre(

        tipoDocumento.nombre ||

        ''

      );





      setCategoria(

        tipoDocumento.categoria ||

        ''

      );





      setDescripcion(

        tipoDocumento.descripcion ||

        ''

      );





      setRequiereRenovacion(

        Boolean(

          tipoDocumento.requiereRenovacion

        )

      );



      return;

    }





    setNombre('');

    setCategoria('');

    setDescripcion('');

    setRequiereRenovacion(false);



  }, [

    abierto,

    esEdicion,

    tipoDocumento

  ]);





  // ===================================================
  // GUARDAR
  // ===================================================
  function handleSubmit(

    event

  ) {

    event.preventDefault();





    // =================================================
    // EDICIÓN
    //
    // Se conserva requiereRenovacion con su valor
    // actual para mantener compatibilidad temporal
    // con el endpoint existente.
    //
    // El usuario ya NO puede modificarlo desde aquí.
    // =================================================
    if (esEdicion) {

      onGuardar({

        descripcion:

          descripcion.trim(),



        requiereRenovacion

      });



      return;

    }





    // =================================================
    // CREACIÓN
    // =================================================
    onGuardar({

      nombre:

        nombre.trim(),



      categoria:

        categoria.trim(),



      descripcion:

        descripcion.trim(),



      requiereRenovacion

    });

  }





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
      <button
        type="button"
        aria-label="Cerrar formulario"
        onClick={
          cargando
            ? undefined
            : onCerrar
        }
        className="
          absolute
          inset-0
          bg-slate-950/60
          backdrop-blur-sm
        "
      />


      <div
        className="
          relative
          z-10
          w-full
          max-w-2xl
          overflow-hidden
          rounded-[28px]
          border
          border-slate-200
          bg-white
          shadow-2xl
        "
      >

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
              h-40
              w-40
              rounded-full
              bg-indigo-500/20
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
            <div className="flex items-center gap-4">
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
                <FileText size={23} />
              </div>

              <div>
                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-indigo-300
                  "
                >
                  Tipos de documento
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  {
                    esEdicion
                      ? 'Editar tipo documental'
                      : 'Nuevo tipo documental'
                  }
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {
                    esEdicion
                      ? 'Actualiza la descripción sin alterar la identidad histórica.'
                      : 'Define un nuevo tipo documental para CERTIIA.'
                  }
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onCerrar}
              disabled={cargando}
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-white/10
                text-slate-300
                transition
                hover:bg-white/20
                hover:text-white
                disabled:opacity-50
              "
            >
              <X size={20} />
            </button>
          </div>
        </div>


        <form
          onSubmit={handleSubmit}
          className="
            max-h-[78vh]
            overflow-y-auto
            px-6
            py-6
            sm:px-7
          "
        >

          <div
            className="
              grid
              gap-5
              sm:grid-cols-2
            "
          >
            <div>
              <label
                htmlFor="tipo-documento-nombre"
                className="
                  mb-2
                  block
                  text-sm
                  font-bold
                  text-slate-700
                "
              >
                Nombre del tipo
              </label>

              <input
                id="tipo-documento-nombre"
                type="text"
                value={nombre}
                onChange={(event) =>
                  setNombre(
                    event.target.value
                  )
                }
                disabled={
                  esEdicion ||
                  cargando
                }
                placeholder="Ej. Licencia de funcionamiento"
                autoComplete="off"
                className="
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
                  focus:ring-indigo-50
                  disabled:cursor-not-allowed
                  disabled:bg-slate-100
                  disabled:text-slate-500
                "
              />

              {
                esEdicion && (
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    El nombre se conserva para evitar inconsistencias con registros históricos.
                  </p>
                )
              }
            </div>


            <div>
              <label
                htmlFor="tipo-documento-categoria"
                className="
                  mb-2
                  block
                  text-sm
                  font-bold
                  text-slate-700
                "
              >
                Categoría
              </label>

              <input
                id="tipo-documento-categoria"
                type="text"
                value={categoria}
                onChange={(event) =>
                  setCategoria(
                    event.target.value
                  )
                }
                disabled={
                  esEdicion ||
                  cargando
                }
                placeholder="Ej. Municipal"
                autoComplete="off"
                className="
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
                  focus:ring-indigo-50
                  disabled:cursor-not-allowed
                  disabled:bg-slate-100
                  disabled:text-slate-500
                "
              />

              {
                esEdicion && (
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    La categoría se mantiene sin cambios para preservar la clasificación histórica.
                  </p>
                )
              }
            </div>
          </div>


          <div className="mt-5">
            <label
              htmlFor="tipo-documento-descripcion"
              className="
                mb-2
                block
                text-sm
                font-bold
                text-slate-700
              "
            >
              Descripción
            </label>

            <textarea
              id="tipo-documento-descripcion"
              value={descripcion}
              onChange={(event) =>
                setDescripcion(
                  event.target.value
                )
              }
              disabled={cargando}
              rows="5"
              placeholder="Describe el propósito y uso de este tipo documental."
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
                leading-6
                text-slate-800
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-indigo-500
                focus:ring-4
                focus:ring-indigo-50
                disabled:bg-slate-100
              "
            />
          </div>


          {
            !esEdicion
              ? (
                <div
                  className="
                    mt-5
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50
                    p-5
                  "
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-white
                          text-indigo-600
                          shadow-sm
                        "
                      >
                        <RefreshCw size={19} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          Requiere renovación
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Define el valor inicial. Luego la renovación será parte
                          de la regla versionada de vigencia y alertas.
                        </p>
                      </div>
                    </div>

                    <button
                      id="requiere-renovacion"
                      type="button"
                      role="switch"
                      aria-checked={requiereRenovacion}
                      disabled={cargando}
                      onClick={() =>
                        setRequiereRenovacion(
                          !requiereRenovacion
                        )
                      }
                      className={`
                        relative
                        mt-1
                        h-7
                        w-12
                        shrink-0
                        rounded-full
                        transition
                        disabled:opacity-60
                        ${
                          requiereRenovacion
                            ? 'bg-indigo-600'
                            : 'bg-slate-300'
                        }
                      `}
                    >
                      <span
                        className={`
                          absolute
                          top-1
                          h-5
                          w-5
                          rounded-full
                          bg-white
                          shadow-sm
                          transition-all
                          ${
                            requiereRenovacion
                              ? 'left-6'
                              : 'left-1'
                          }
                        `}
                      />
                    </button>
                  </div>
                </div>
              )
              : (
                <div
                  className="
                    mt-5
                    rounded-2xl
                    border
                    border-violet-200
                    bg-violet-50
                    p-5
                  "
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-white
                        text-violet-600
                        shadow-sm
                      "
                    >
                      <CalendarClock size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-violet-900">
                        Renovación administrada por Vigencia y Alertas
                      </p>

                      <p className="mt-1 text-xs leading-5 text-violet-700">
                        La renovación no se modifica desde este formulario porque
                        forma parte de la configuración versionada.
                      </p>

                      <span
                        className={`
                          mt-3
                          inline-flex
                          rounded-full
                          px-3
                          py-1
                          text-xs
                          font-bold
                          ${
                            requiereRenovacion
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-200 text-slate-600'
                          }
                        `}
                      >
                        {
                          requiereRenovacion
                            ? 'Sí requiere renovación'
                            : 'No requiere renovación'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )
          }


          {
            !esEdicion && (
              <div
                className="
                  mt-4
                  rounded-xl
                  border
                  border-indigo-100
                  bg-indigo-50
                  px-4
                  py-3
                "
              >
                <p className="text-xs leading-5 text-indigo-700">
                  Después de registrar el tipo documental, configura su duración,
                  renovación y umbrales mediante la opción
                  {' '}
                  <strong>
                    Vigencia y Alertas
                  </strong>
                  .
                </p>
              </div>
            )
          }


          {
            error && (
              <div
                className="
                  mt-6
                  rounded-xl
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


          <div
            className="
              mt-7
              flex
              flex-col-reverse
              gap-3
              border-t
              border-slate-100
              pt-6
              sm:flex-row
              sm:justify-end
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
                border-slate-200
                bg-white
                px-5
                text-sm
                font-semibold
                text-slate-600
                transition
                hover:bg-slate-50
                disabled:opacity-60
              "
            >
              Cancelar
            </button>

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
                font-semibold
                text-white
                shadow-lg
                shadow-indigo-600/20
                transition
                hover:bg-indigo-700
                disabled:opacity-60
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
                      Guardando...
                    </>
                  )
                  : (
                    <>
                      <Save size={18} />
                      {
                        esEdicion
                          ? 'Guardar descripción'
                          : 'Registrar tipo'
                      }
                    </>
                  )
              }
            </button>
          </div>

        </form>

      </div>

    </div>

  );

}


export default TipoDocumentoModal;
