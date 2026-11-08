import {
  useEffect,
  useState
} from 'react';

import {
  Building2,
  MapPin,
  Save,
  ShieldAlert,
  X
} from 'lucide-react';


function TiendaModal({
  abierto,
  modo = 'crear',
  tienda = null,
  cargando = false,
  error = '',
  onCerrar,
  onGuardar
}) {
  const [codigo, setCodigo] =
    useState('');

  const [nombre, setNombre] =
    useState('');

  const [ruc, setRuc] =
    useState('');

  const [direccion, setDireccion] =
    useState('');

  const [
    departamento,
    setDepartamento
  ] = useState('');

  const [
    provincia,
    setProvincia
  ] = useState('');

  const [distrito, setDistrito] =
    useState('');

  const [
    nivelRiesgo,
    setNivelRiesgo
  ] = useState('BAJO');


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
      tienda
    ) {
      setCodigo(
        tienda.codigo || ''
      );

      setNombre(
        tienda.nombre || ''
      );

      setRuc(
        tienda.ruc || ''
      );

      setDireccion(
        tienda.direccion || ''
      );

      setDepartamento(
        tienda.departamento || ''
      );

      setProvincia(
        tienda.provincia || ''
      );

      setDistrito(
        tienda.distrito || ''
      );

      setNivelRiesgo(
        tienda.nivelRiesgo ||
        'BAJO'
      );

    } else {
      setCodigo('');
      setNombre('');
      setRuc('');
      setDireccion('');
      setDepartamento('');
      setProvincia('');
      setDistrito('');
      setNivelRiesgo('BAJO');
    }

  }, [
    abierto,
    esEdicion,
    tienda
  ]);


  // ===================================================
  // RUC SOLO NÚMEROS Y 11 DÍGITOS
  // ===================================================
  function handleRucChange(
    event
  ) {
    const valor =
      event.target.value
        .replace(/\D/g, '')
        .slice(0, 11);

    setRuc(valor);
  }


  // ===================================================
  // GUARDAR
  // ===================================================
  function handleSubmit(event) {
    event.preventDefault();


    onGuardar({
      codigo:
        codigo.trim(),

      nombre:
        nombre.trim(),

      ruc:
        ruc.trim(),

      direccion:
        direccion.trim(),

      departamento:
        departamento.trim(),

      provincia:
        provincia.trim(),

      distrito:
        distrito.trim(),

      nivelRiesgo
    });
  }


  if (!abierto) {
    return null;
  }


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

      {/* ============================================= */}
      {/* FONDO */}
      {/* ============================================= */}
      <button
        type="button"
        aria-label="Cerrar"
        onClick={
          cargando
            ? undefined
            : onCerrar
        }
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
      />


      {/* ============================================= */}
      {/* MODAL */}
      {/* ============================================= */}
      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

        {/* =========================================== */}
        {/* CABECERA */}
        {/* =========================================== */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 sm:px-7">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Building2 size={23} />
            </div>


            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
                Gestión de tiendas
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {
                  esEdicion
                    ? 'Editar tienda'
                    : 'Nueva tienda'
                }
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {
                  esEdicion
                    ? 'Actualiza la información operativa de la tienda.'
                    : 'Registra una nueva tienda retail en CERTIIA.'
                }
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={onCerrar}
            disabled={cargando}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>

        </div>


        {/* =========================================== */}
        {/* FORMULARIO */}
        {/* =========================================== */}
        <form
          onSubmit={handleSubmit}
          className="max-h-[78vh] overflow-y-auto px-6 py-6 sm:px-7"
        >

          {/* ========================================= */}
          {/* DATOS PRINCIPALES */}
          {/* ========================================= */}
          <div className="grid gap-5 sm:grid-cols-2">

            {/* Código */}
            <div>

              <label
                htmlFor="tienda-codigo"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Código de tienda
              </label>

              <input
                id="tienda-codigo"
                type="text"
                value={codigo}
                onChange={(event) =>
                  setCodigo(
                    event.target.value
                      .toUpperCase()
                  )
                }
                placeholder="Ej. TDA-001"
                autoComplete="off"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Debe ser único dentro de CERTIIA.
              </p>

            </div>


            {/* RUC */}
            <div>

              <label
                htmlFor="tienda-ruc"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                RUC
              </label>

              <input
                id="tienda-ruc"
                type="text"
                inputMode="numeric"
                value={ruc}
                onChange={
                  handleRucChange
                }
                placeholder="11 dígitos"
                autoComplete="off"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                {ruc.length}/11 dígitos
              </p>

            </div>

          </div>


          {/* Nombre */}
          <div className="mt-5">

            <label
              htmlFor="tienda-nombre"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Nombre de la tienda
            </label>

            <input
              id="tienda-nombre"
              type="text"
              value={nombre}
              onChange={(event) =>
                setNombre(
                  event.target.value
                )
              }
              placeholder="Ej. Tienda Centro Huancayo"
              autoComplete="off"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />

          </div>


          {/* Dirección */}
          <div className="mt-5">

            <label
              htmlFor="tienda-direccion"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Dirección
            </label>


            <div className="relative">

              <MapPin
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="tienda-direccion"
                type="text"
                value={direccion}
                onChange={(event) =>
                  setDireccion(
                    event.target.value
                  )
                }
                placeholder="Ej. Av. Real 1234"
                autoComplete="off"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />

            </div>

          </div>


          {/* ========================================= */}
          {/* UBICACIÓN */}
          {/* ========================================= */}
          <div className="mt-7">

            <div className="mb-4">

              <h3 className="text-sm font-bold text-slate-800">
                Ubicación
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Indica la ubicación administrativa de la tienda.
              </p>

            </div>


            <div className="grid gap-5 md:grid-cols-3">

              {/* Departamento */}
              <div>

                <label
                  htmlFor="tienda-departamento"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Departamento
                </label>

                <input
                  id="tienda-departamento"
                  type="text"
                  value={departamento}
                  onChange={(event) =>
                    setDepartamento(
                      event.target.value
                    )
                  }
                  placeholder="Ej. Junín"
                  autoComplete="off"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />

              </div>


              {/* Provincia */}
              <div>

                <label
                  htmlFor="tienda-provincia"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Provincia
                </label>

                <input
                  id="tienda-provincia"
                  type="text"
                  value={provincia}
                  onChange={(event) =>
                    setProvincia(
                      event.target.value
                    )
                  }
                  placeholder="Ej. Huancayo"
                  autoComplete="off"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />

              </div>


              {/* Distrito */}
              <div>

                <label
                  htmlFor="tienda-distrito"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Distrito
                </label>

                <input
                  id="tienda-distrito"
                  type="text"
                  value={distrito}
                  onChange={(event) =>
                    setDistrito(
                      event.target.value
                    )
                  }
                  placeholder="Ej. Huancayo"
                  autoComplete="off"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />

              </div>

            </div>

          </div>


          {/* ========================================= */}
          {/* NIVEL DE RIESGO */}
          {/* ========================================= */}
          <div className="mt-7">

            <label
              htmlFor="tienda-riesgo"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Nivel de riesgo
            </label>


            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">

              <select
                id="tienda-riesgo"
                value={nivelRiesgo}
                onChange={(event) =>
                  setNivelRiesgo(
                    event.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              >

                <option value="BAJO">
                  Bajo
                </option>

                <option value="MEDIO">
                  Medio
                </option>

                <option value="ALTO">
                  Alto
                </option>

              </select>


              <div
                className={
                  `
                  flex h-11 items-center gap-2 rounded-xl
                  border px-4 text-sm font-semibold

                  ${
                    nivelRiesgo === 'ALTO'
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : nivelRiesgo === 'MEDIO'
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }
                  `
                }
              >

                <ShieldAlert size={17} />

                {nivelRiesgo}

              </div>

            </div>

          </div>


          {/* ========================================= */}
          {/* ERROR */}
          {/* ========================================= */}
          {
            error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )
          }


          {/* ========================================= */}
          {/* ACCIONES */}
          {/* ========================================= */}
          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onCerrar}
              disabled={cargando}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>


            <button
              type="submit"
              disabled={cargando}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {
                cargando
                  ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Guardando...
                    </>
                  )
                  : (
                    <>
                      <Save size={18} />

                      {
                        esEdicion
                          ? 'Guardar cambios'
                          : 'Registrar tienda'
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


export default TiendaModal;