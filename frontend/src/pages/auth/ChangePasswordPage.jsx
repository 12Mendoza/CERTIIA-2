import {
  useMemo,
  useState
} from 'react';

import {
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Save,
  ShieldCheck
} from 'lucide-react';

import {
  api
} from '../../services/api';

import {
  useAuth
} from '../../context/AuthContext.jsx';


function ChangePasswordPage() {

  const {
    actualizarPerfil
  } = useAuth();

  const [
    passwordActual,
    setPasswordActual
  ] = useState('');

  const [
    passwordNueva,
    setPasswordNueva
  ] = useState('');

  const [
    confirmarPassword,
    setConfirmarPassword
  ] = useState('');

  const [
    mostrarActual,
    setMostrarActual
  ] = useState(false);

  const [
    mostrarNueva,
    setMostrarNueva
  ] = useState(false);

  const [
    mostrarConfirmacion,
    setMostrarConfirmacion
  ] = useState(false);

  const [
    guardando,
    setGuardando
  ] = useState(false);

  const [
    error,
    setError
  ] = useState('');

  const [
    mensaje,
    setMensaje
  ] = useState('');


  const criterios =
    useMemo(
      () => ({
        longitud:
          passwordNueva.length >= 8,
        diferente:
          passwordNueva.length > 0 &&
          passwordActual.length > 0 &&
          passwordNueva !==
            passwordActual,
        coincide:
          passwordNueva.length > 0 &&
          passwordNueva ===
            confirmarPassword
      }),
      [
        passwordActual,
        passwordNueva,
        confirmarPassword
      ]
    );


  async function handleSubmit(
    event
  ) {

    event.preventDefault();

    setError('');
    setMensaje('');

    if (
      !passwordActual ||
      !passwordNueva ||
      !confirmarPassword
    ) {

      setError(
        'Completa todos los campos.'
      );

      return;

    }

    if (
      passwordNueva.length < 8
    ) {

      setError(
        'La nueva contraseña debe tener al menos 8 caracteres.'
      );

      return;

    }

    if (
      passwordNueva !==
      confirmarPassword
    ) {

      setError(
        'Las nuevas contraseñas no coinciden.'
      );

      return;

    }

    if (
      passwordActual ===
      passwordNueva
    ) {

      setError(
        'La nueva contraseña debe ser diferente de la contraseña actual.'
      );

      return;

    }

    try {

      setGuardando(true);

      const respuesta =
        await api.patch(
          '/auth/password',
          {
            passwordActual,
            passwordNueva
          }
        );

      await actualizarPerfil();

      setMensaje(
        respuesta.mensaje ||
        'Contraseña actualizada correctamente.'
      );

      setPasswordActual('');
      setPasswordNueva('');
      setConfirmarPassword('');

    } catch (errorCambio) {

      setError(
        errorCambio.message ||
        'No se pudo cambiar la contraseña.'
      );

    } finally {

      setGuardando(false);

    }

  }


  return (

    <div
      className="
        mx-auto
        max-w-6xl
        space-y-6
      "
    >

      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <section
        className="
          relative
          overflow-hidden
          rounded-[28px]
          border
          border-slate-800
          bg-gradient-to-br
          from-slate-950
          via-slate-900
          to-indigo-950
          shadow-xl
          shadow-slate-900/10
        "
      >

        <div
          className="
            absolute
            -right-24
            -top-24
            h-80
            w-80
            rounded-full
            bg-indigo-500/20
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -bottom-32
            left-1/3
            h-72
            w-72
            rounded-full
            bg-violet-500/10
            blur-3xl
          "
        />

        <div
          className="
            relative
            grid
            gap-6
            px-6
            py-7
            lg:grid-cols-[1fr_320px]
            lg:px-8
            lg:py-8
          "
        >

          <div
            className="
              flex
              flex-col
              justify-center
            "
          >

            <div
              className="
                mb-4
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/10
                  text-indigo-300
                "
              >
                <KeyRound size={22} />
              </div>

              <div>
                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.22em]
                    text-indigo-300
                  "
                >
                  Seguridad de la cuenta
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  Credenciales de acceso
                </p>
              </div>

            </div>

            <h1
              className="
                text-3xl
                font-bold
                tracking-tight
                text-white
                sm:text-4xl
              "
            >
              Cambiar contraseña
            </h1>

            <p
              className="
                mt-3
                max-w-2xl
                text-sm
                leading-6
                text-slate-300
              "
            >
              Actualiza tu contraseña de acceso a CERTIIA
              y mantén protegida tu cuenta.
            </p>

          </div>


          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/[0.07]
              p-5
              backdrop-blur-md
            "
          >

            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wide
                text-slate-400
              "
            >
              Reglas básicas
            </p>

            <div className="mt-4 space-y-3">

              <ReglaHero
                cumplida={
                  criterios.longitud
                }
              >
                Mínimo 8 caracteres
              </ReglaHero>

              <ReglaHero
                cumplida={
                  criterios.diferente
                }
              >
                Diferente a la contraseña actual
              </ReglaHero>

              <ReglaHero
                cumplida={
                  criterios.coincide
                }
              >
                Confirmación coincidente
              </ReglaHero>

            </div>

          </div>

        </div>

      </section>


      {/* MENSAJES */}

      {
        mensaje && (
          <div
            className="
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-emerald-200
              bg-emerald-50
              px-5
              py-4
              text-sm
              text-emerald-700
              shadow-sm
            "
          >
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-bold">
                Contraseña actualizada
              </p>

              <p className="mt-1">
                {mensaje}
              </p>
            </div>
          </div>
        )
      }

      {
        error && (
          <div
            className="
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-red-200
              bg-red-50
              px-5
              py-4
              text-sm
              text-red-700
              shadow-sm
            "
          >
            <LockKeyhole
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-bold">
                No se pudo cambiar la contraseña
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          </div>
        )
      }


      <section
        className="
          grid
          gap-6
          xl:grid-cols-[1fr_340px]
        "
      >

        {/* FORMULARIO */}

        <article
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
              gap-4
              border-b
              border-slate-100
              bg-gradient-to-r
              from-white
              to-slate-50
              px-6
              py-5
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                bg-indigo-50
                text-indigo-600
              "
            >
              <KeyRound size={21} />
            </div>

            <div>
              <h2
                className="
                  font-bold
                  text-slate-900
                "
              >
                Actualizar credenciales
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                Confirma tu contraseña actual antes de guardar.
              </p>
            </div>
          </div>


          <form
            onSubmit={handleSubmit}
            className="
              p-6
              sm:p-7
            "
          >

            <PasswordField
              id="password-actual"
              label="Contraseña actual"
              value={passwordActual}
              onChange={
                setPasswordActual
              }
              mostrar={mostrarActual}
              onToggle={() =>
                setMostrarActual(
                  !mostrarActual
                )
              }
              autoComplete="current-password"
              placeholder="Ingresa tu contraseña actual"
              disabled={guardando}
            />


            <div
              className="
                my-6
                h-px
                bg-slate-100
              "
            />


            <div
              className="
                grid
                gap-5
                md:grid-cols-2
              "
            >

              <PasswordField
                id="password-nueva"
                label="Nueva contraseña"
                value={passwordNueva}
                onChange={
                  setPasswordNueva
                }
                mostrar={mostrarNueva}
                onToggle={() =>
                  setMostrarNueva(
                    !mostrarNueva
                  )
                }
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                disabled={guardando}
              />

              <PasswordField
                id="password-confirmar"
                label="Confirmar nueva contraseña"
                value={confirmarPassword}
                onChange={
                  setConfirmarPassword
                }
                mostrar={
                  mostrarConfirmacion
                }
                onToggle={() =>
                  setMostrarConfirmacion(
                    !mostrarConfirmacion
                  )
                }
                autoComplete="new-password"
                placeholder="Repite la nueva contraseña"
                disabled={guardando}
              />

            </div>


            <div
              className="
                mt-7
                flex
                justify-end
                border-t
                border-slate-100
                pt-6
              "
            >

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
                        <Save size={18} />
                        Cambiar contraseña
                      </>
                    )
                }
              </button>

            </div>

          </form>

        </article>


        {/* SEGURIDAD */}

        <aside
          className="
            space-y-4
          "
        >

          <div
            className="
              rounded-3xl
              border
              border-indigo-100
              bg-indigo-50
              p-5
            "
          >

            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                bg-white
                text-indigo-600
                shadow-sm
              "
            >
              <ShieldCheck size={21} />
            </div>

            <h3
              className="
                mt-4
                font-bold
                text-indigo-950
              "
            >
              Recomendación de seguridad
            </h3>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-indigo-800/80
              "
            >
              Evita usar nombres, fechas fáciles de adivinar
              o la misma contraseña utilizada en otros servicios.
            </p>

          </div>


          <div
            className="
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
            "
          >

            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-wide
                text-slate-400
              "
            >
              Estado de validación
            </p>

            <div className="mt-4 space-y-3">

              <ReglaLateral
                cumplida={
                  criterios.longitud
                }
                texto="Longitud mínima"
              />

              <ReglaLateral
                cumplida={
                  criterios.diferente
                }
                texto="Contraseña diferente"
              />

              <ReglaLateral
                cumplida={
                  criterios.coincide
                }
                texto="Confirmación correcta"
              />

            </div>

          </div>

        </aside>

      </section>

    </div>

  );

}


function PasswordField({
  id,
  label,
  value,
  onChange,
  mostrar,
  onToggle,
  autoComplete,
  placeholder,
  disabled
}) {

  return (
    <div>

      <label
        htmlFor={id}
        className="
          mb-2
          block
          text-sm
          font-semibold
          text-slate-700
        "
      >
        {label}
      </label>

      <div className="relative">

        <LockKeyhole
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
          id={id}
          type={
            mostrar
              ? 'text'
              : 'password'
          }
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          className="
            h-12
            w-full
            rounded-xl
            border
            border-slate-300
            bg-white
            pl-11
            pr-12
            text-sm
            text-slate-800
            outline-none
            transition
            placeholder:text-slate-400
            focus:border-indigo-500
            focus:ring-4
            focus:ring-indigo-500/10
            disabled:bg-slate-50
            disabled:opacity-70
          "
        />

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={
            mostrar
              ? 'Ocultar contraseña'
              : 'Mostrar contraseña'
          }
          className="
            absolute
            right-3
            top-1/2
            flex
            h-8
            w-8
            -translate-y-1/2
            items-center
            justify-center
            rounded-lg
            text-slate-400
            transition
            hover:bg-slate-100
            hover:text-slate-600
            disabled:opacity-50
          "
        >
          {
            mostrar
              ? <EyeOff size={18} />
              : <Eye size={18} />
          }
        </button>

      </div>

    </div>
  );

}


function ReglaHero({
  cumplida,
  children
}) {

  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-xl
        border
        border-white/10
        bg-black/10
        px-3
        py-2.5
      "
    >
      <span
        className={`
          flex
          h-6
          w-6
          shrink-0
          items-center
          justify-center
          rounded-full
          ${
            cumplida
              ? 'bg-emerald-400 text-emerald-950'
              : 'bg-white/10 text-slate-400'
          }
        `}
      >
        <Check size={14} />
      </span>

      <span
        className="
          text-xs
          font-medium
          text-slate-300
        "
      >
        {children}
      </span>
    </div>
  );

}


function ReglaLateral({
  cumplida,
  texto
}) {

  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-3
        rounded-xl
        bg-slate-50
        px-3
        py-3
      "
    >
      <span
        className="
          text-xs
          font-semibold
          text-slate-600
        "
      >
        {texto}
      </span>

      <span
        className={`
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-full
          ${
            cumplida
              ? 'bg-emerald-100 text-emerald-600'
              : 'bg-slate-200 text-slate-400'
          }
        `}
      >
        <Check size={15} />
      </span>
    </div>
  );

}


export default ChangePasswordPage;
