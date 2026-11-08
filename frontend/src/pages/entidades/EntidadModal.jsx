import {
  useEffect,
  useState
} from 'react';

import {
  Building2,
  Landmark,
  MapPin,
  Save,
  UserRound,
  UsersRound,
  X
} from 'lucide-react';


function EntidadModal({
  abierto,
  modo = 'crear',
  entidad = null,
  cargando = false,
  error = '',
  onCerrar,
  onGuardar
}) {

  const [
    tipo,
    setTipo
  ] = useState(
    'MUNICIPALIDAD'
  );

  const [
    nombre,
    setNombre
  ] = useState('');

  const [
    ruc,
    setRuc
  ] = useState('');

  const [
    ubicacion,
    setUbicacion
  ] = useState('');

  const [
    datosContacto,
    setDatosContacto
  ] = useState('');

  const esEdicion =
    modo === 'editar';


  useEffect(() => {

    if (!abierto) {
      return;
    }

    if (
      esEdicion &&
      entidad
    ) {

      setTipo(
        entidad.tipo ||
        'MUNICIPALIDAD'
      );

      setNombre(
        entidad.nombre ||
        ''
      );

      setRuc(
        entidad.ruc ||
        ''
      );

      setUbicacion(
        entidad.ubicacion ||
        ''
      );

      setDatosContacto(
        entidad.datosContacto ||
        ''
      );

    } else {

      setTipo(
        'MUNICIPALIDAD'
      );

      setNombre('');
      setRuc('');
      setUbicacion('');
      setDatosContacto('');

    }

  }, [
    abierto,
    esEdicion,
    entidad
  ]);


  function handleRucChange(
    event
  ) {

    const valor =
      event.target.value
        .replace(/\D/g, '')
        .slice(0, 11);

    setRuc(valor);

  }


  function handleSubmit(
    event
  ) {

    event.preventDefault();

    onGuardar({
      tipo,
      nombre:
        nombre.trim(),
      ruc:
        ruc.trim(),
      ubicacion:
        ubicacion.trim(),
      datosContacto:
        datosContacto.trim()
    });

  }


  function iconoTipo() {

    switch (tipo) {
      case 'MUNICIPALIDAD':
        return <Landmark size={22} />;
      case 'ENTIDAD_PUBLICA':
        return <Building2 size={22} />;
      case 'EMPRESA_PRIVADA':
        return <UsersRound size={22} />;
      case 'PROFESIONAL':
        return <UserRound size={22} />;
      default:
        return <Building2 size={22} />;
    }

  }


  function etiquetaTipo() {

    switch (tipo) {
      case 'MUNICIPALIDAD':
        return 'Municipalidad';
      case 'ENTIDAD_PUBLICA':
        return 'Entidad pública';
      case 'EMPRESA_PRIVADA':
        return 'Empresa privada';
      case 'PROFESIONAL':
        return 'Profesional';
      default:
        return tipo;
    }

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
        aria-label="Cerrar"
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

        {/* HERO DEL MODAL */}

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
                {iconoTipo()}
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
                  Entidades emisoras
                </p>

                <h2
                  className="
                    mt-1
                    text-xl
                    font-bold
                  "
                >
                  {
                    esEdicion
                      ? 'Editar entidad'
                      : 'Nueva entidad'
                  }
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  {
                    esEdicion
                      ? 'Actualiza los datos de la entidad emisora.'
                      : 'Registra una nueva entidad en CERTIIA.'
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

          {/* TIPO */}

          <div>

            <label
              htmlFor="entidad-tipo"
              className="
                mb-2
                block
                text-sm
                font-bold
                text-slate-700
              "
            >
              Tipo de entidad
            </label>

            <select
              id="entidad-tipo"
              value={tipo}
              onChange={(event) =>
                setTipo(
                  event.target.value
                )
              }
              className="
                h-12
                w-full
                rounded-xl
                border
                border-slate-300
                bg-white
                px-4
                text-sm
                font-medium
                text-slate-700
                outline-none
                transition
                focus:border-indigo-500
                focus:ring-4
                focus:ring-indigo-50
              "
            >
              <option value="MUNICIPALIDAD">
                Municipalidad
              </option>

              <option value="ENTIDAD_PUBLICA">
                Entidad pública
              </option>

              <option value="EMPRESA_PRIVADA">
                Empresa privada
              </option>

              <option value="PROFESIONAL">
                Profesional
              </option>
            </select>

            <div
              className="
                mt-3
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-indigo-100
                bg-indigo-50/70
                p-3
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-white
                  text-indigo-600
                  shadow-sm
                "
              >
                {iconoTipo()}
              </div>

              <div>
                <p className="text-xs font-bold text-indigo-700">
                  {etiquetaTipo()}
                </p>

                <p className="mt-0.5 text-[11px] text-indigo-500">
                  Clasificación seleccionada para esta entidad.
                </p>
              </div>
            </div>

          </div>


          {/* NOMBRE */}

          <div className="mt-5">

            <label
              htmlFor="entidad-nombre"
              className="
                mb-2
                block
                text-sm
                font-bold
                text-slate-700
              "
            >
              Nombre
            </label>

            <input
              id="entidad-nombre"
              type="text"
              value={nombre}
              onChange={(event) =>
                setNombre(
                  event.target.value
                )
              }
              placeholder="Ej. Municipalidad Provincial de Huancayo"
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
              "
            />

          </div>


          {/* RUC */}

          <div className="mt-5">

            <label
              htmlFor="entidad-ruc"
              className="
                mb-2
                block
                text-sm
                font-bold
                text-slate-700
              "
            >
              RUC
            </label>

            <input
              id="entidad-ruc"
              type="text"
              inputMode="numeric"
              value={ruc}
              onChange={handleRucChange}
              placeholder="Opcional - 11 dígitos"
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
              <p className="text-xs text-slate-400">
                Opcional. Si se registra, debe tener exactamente 11 dígitos.
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
                {ruc.length}/11
              </span>
            </div>

          </div>


          {/* UBICACIÓN */}

          <div className="mt-5">

            <label
              htmlFor="entidad-ubicacion"
              className="
                mb-2
                block
                text-sm
                font-bold
                text-slate-700
              "
            >
              Ubicación
            </label>

            <div className="relative">

              <MapPin
                size={18}
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                id="entidad-ubicacion"
                type="text"
                value={ubicacion}
                onChange={(event) =>
                  setUbicacion(
                    event.target.value
                  )
                }
                placeholder="Ej. Huancayo, Junín"
                autoComplete="off"
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  pl-11
                  pr-4
                  text-sm
                  text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-indigo-500
                  focus:ring-4
                  focus:ring-indigo-50
                "
              />

            </div>

          </div>


          {/* CONTACTO */}

          <div className="mt-5">

            <label
              htmlFor="entidad-contacto"
              className="
                mb-2
                block
                text-sm
                font-bold
                text-slate-700
              "
            >
              Datos de contacto
            </label>

            <div className="relative">

              <UserRound
                size={18}
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-4
                  text-slate-400
                "
              />

              <textarea
                id="entidad-contacto"
                value={datosContacto}
                onChange={(event) =>
                  setDatosContacto(
                    event.target.value
                  )
                }
                rows="4"
                placeholder="Ej. Teléfono, correo electrónico, responsable u otro dato de contacto"
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  py-3
                  pl-11
                  pr-4
                  text-sm
                  text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-indigo-500
                  focus:ring-4
                  focus:ring-indigo-50
                "
              />

            </div>

          </div>


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
                          ? 'Guardar cambios'
                          : 'Registrar entidad'
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


export default EntidadModal;
