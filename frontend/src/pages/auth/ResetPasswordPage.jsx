import {
  useMemo,
  useState
} from 'react';

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck
} from 'lucide-react';

import {
  useLocation,
  useNavigate
} from 'react-router-dom';

import {
  api
} from '../../services/api';


function ResetPasswordPage() {

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const tokenInicial =
    location.state?.token || '';

  const [token, setToken] =
    useState(tokenInicial);

  const [
    passwordNueva,
    setPasswordNueva
  ] = useState('');

  const [
    confirmarPassword,
    setConfirmarPassword
  ] = useState('');

  const [
    mostrarPassword,
    setMostrarPassword
  ] = useState(false);

  const [
    mostrarConfirmacion,
    setMostrarConfirmacion
  ] = useState(false);

  const [cargando, setCargando] =
    useState(false);

  const [error, setError] =
    useState('');

  const [exito, setExito] =
    useState(false);


  const criterios =
    useMemo(
      () => ({
        longitud:
          passwordNueva.length >= 8,
        coincide:
          passwordNueva.length > 0 &&
          passwordNueva ===
            confirmarPassword
      }),
      [
        passwordNueva,
        confirmarPassword
      ]
    );


  async function handleSubmit(
    event
  ) {

    event.preventDefault();

    setError('');

    if (!token.trim()) {

      setError(
        'El token de recuperación es obligatorio.'
      );

      return;

    }

    if (
      !passwordNueva ||
      !confirmarPassword
    ) {

      setError(
        'Completa ambos campos de contraseña.'
      );

      return;

    }

    if (
      passwordNueva.length < 8
    ) {

      setError(
        'La contraseña debe tener al menos 8 caracteres.'
      );

      return;

    }

    if (
      passwordNueva !==
      confirmarPassword
    ) {

      setError(
        'Las contraseñas no coinciden.'
      );

      return;

    }

    try {

      setCargando(true);

      await api.post(
        '/auth/password/reset/confirm',
        {
          token:
            token.trim(),
          passwordNueva
        }
      );

      setExito(true);

    } catch (errorReset) {

      setError(
        errorReset.message ||
        'No se pudo restablecer la contraseña.'
      );

    } finally {

      setCargando(false);

    }

  }


  if (exito) {

    return (

      <main
        className="
          relative
          min-h-screen
          overflow-hidden
          bg-slate-950
        "
      >

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-br
            from-slate-950
            via-indigo-950
            to-slate-900
          "
        />

        <div
          className="
            absolute
            left-1/2
            top-1/3
            h-96
            w-96
            -translate-x-1/2
            rounded-full
            bg-emerald-500/10
            blur-3xl
          "
        />

        <div
          className="
            relative
            flex
            min-h-screen
            items-center
            justify-center
            px-6
            py-12
          "
        >

          <div
            className="
              w-full
              max-w-md
              overflow-hidden
              rounded-[30px]
              border
              border-white/10
              bg-white
              p-8
              text-center
              shadow-2xl
              sm:p-10
            "
          >

            <div
              className="
                mx-auto
                flex
                h-18
                w-18
                items-center
                justify-center
                rounded-3xl
                bg-emerald-100
                text-emerald-600
              "
            >
              <CheckCircle2 size={34} />
            </div>

            <p
              className="
                mt-6
                text-xs
                font-bold
                uppercase
                tracking-[0.2em]
                text-emerald-600
              "
            >
              Operación completada
            </p>

            <h1
              className="
                mt-2
                text-3xl
                font-bold
                tracking-tight
                text-slate-900
              "
            >
              Contraseña actualizada
            </h1>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-slate-500
              "
            >
              Tu contraseña fue restablecida correctamente.
              Ya puedes iniciar sesión con tus nuevas
              credenciales.
            </p>

            <div
              className="
                mt-6
                flex
                items-start
                gap-3
                rounded-xl
                border
                border-emerald-100
                bg-emerald-50
                p-4
                text-left
              "
            >
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <p
                className="
                  text-xs
                  leading-5
                  text-emerald-700
                "
              >
                Utiliza la nueva contraseña únicamente
                en CERTIIA y no la compartas con terceros.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/login',
                  {
                    replace: true
                  }
                )
              }
              className="
                mt-7
                flex
                h-12
                w-full
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
              "
            >
              <ShieldCheck size={18} />
              Ir al inicio de sesión
            </button>

          </div>

        </div>

      </main>

    );

  }


  return (

    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-slate-950
      "
    >

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-br
          from-slate-950
          via-indigo-950
          to-slate-900
        "
      />

      <div
        className="
          absolute
          -right-24
          top-0
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
          -bottom-24
          -left-24
          h-96
          w-96
          rounded-full
          bg-violet-500/10
          blur-3xl
        "
      />


      <div
        className="
          relative
          flex
          min-h-screen
          items-center
          justify-center
          px-5
          py-10
        "
      >

        <div
          className="
            w-full
            max-w-5xl
          "
        >

          <button
            type="button"
            onClick={() =>
              navigate(
                '/recuperar-password'
              )
            }
            className="
              mb-6
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-slate-300
              transition
              hover:text-white
            "
          >
            <ArrowLeft size={18} />
            Volver a recuperación
          </button>


          <div
            className="
              grid
              overflow-hidden
              rounded-[30px]
              border
              border-white/10
              bg-white
              shadow-2xl
              lg:grid-cols-[0.85fr_1.15fr]
            "
          >

            {/* INFO */}

            <section
              className="
                relative
                overflow-hidden
                bg-gradient-to-br
                from-indigo-700
                via-indigo-800
                to-slate-950
                p-7
                text-white
                sm:p-9
              "
            >

              <div
                className="
                  absolute
                  -right-16
                  -top-16
                  h-56
                  w-56
                  rounded-full
                  bg-white/10
                  blur-3xl
                "
              />

              <div className="relative">

                <div
                  className="
                    flex
                    h-13
                    w-13
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/10
                    text-white
                  "
                >
                  <KeyRound size={25} />
                </div>

                <p
                  className="
                    mt-7
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-indigo-200
                  "
                >
                  Nueva contraseña
                </p>

                <h1
                  className="
                    mt-3
                    text-3xl
                    font-bold
                    tracking-tight
                  "
                >
                  Restablece tu acceso.
                </h1>

                <p
                  className="
                    mt-4
                    text-sm
                    leading-7
                    text-indigo-100/90
                  "
                >
                  Define una nueva contraseña para recuperar
                  el acceso a tu cuenta CERTIIA.
                </p>


                <div
                  className="
                    mt-8
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.08]
                    p-5
                  "
                >
                  <p
                    className="
                      text-xs
                      font-bold
                      uppercase
                      tracking-wide
                      text-indigo-200
                    "
                  >
                    Requisitos visibles
                  </p>

                  <div className="mt-4 space-y-3">

                    <Criterio
                      cumplido={
                        criterios.longitud
                      }
                    >
                      Mínimo 8 caracteres
                    </Criterio>

                    <Criterio
                      cumplido={
                        criterios.coincide
                      }
                    >
                      Ambas contraseñas coinciden
                    </Criterio>

                  </div>
                </div>

              </div>

            </section>


            {/* FORMULARIO */}

            <section
              className="
                bg-white
                p-7
                sm:p-9
                lg:p-10
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-indigo-600
                  "
                >
                  CERTIIA
                </p>

                <h2
                  className="
                    mt-2
                    text-3xl
                    font-bold
                    tracking-tight
                    text-slate-900
                  "
                >
                  Restablece tu contraseña
                </h2>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  Introduce una nueva contraseña y confírmala
                  antes de guardar.
                </p>

              </div>


              <form
                onSubmit={handleSubmit}
                className="mt-7 space-y-5"
              >

                {
                  !tokenInicial && (

                    <div>

                      <label
                        htmlFor="token"
                        className="
                          mb-2
                          block
                          text-sm
                          font-semibold
                          text-slate-700
                        "
                      >
                        Token de recuperación
                      </label>

                      <textarea
                        id="token"
                        value={token}
                        onChange={(event) =>
                          setToken(
                            event.target.value
                          )
                        }
                        placeholder="Ingresa el token de recuperación"
                        rows={3}
                        disabled={cargando}
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
                          text-slate-900
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

                    </div>

                  )
                }


                <PasswordField
                  id="passwordNueva"
                  label="Nueva contraseña"
                  value={passwordNueva}
                  onChange={
                    setPasswordNueva
                  }
                  mostrar={mostrarPassword}
                  onToggle={() =>
                    setMostrarPassword(
                      !mostrarPassword
                    )
                  }
                  placeholder="Mínimo 8 caracteres"
                  disabled={cargando}
                />


                <PasswordField
                  id="confirmarPassword"
                  label="Confirmar contraseña"
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
                  placeholder="Repite tu nueva contraseña"
                  disabled={cargando}
                />


                {
                  error && (
                    <div
                      className="
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


                <button
                  type="submit"
                  disabled={cargando}
                  className="
                    flex
                    h-12
                    w-full
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
                    cargando
                      ? (
                        <>
                          <span
                            className="
                              h-5
                              w-5
                              animate-spin
                              rounded-full
                              border-2
                              border-white/30
                              border-t-white
                            "
                          />
                          Restableciendo...
                        </>
                      )
                      : (
                        <>
                          <KeyRound size={18} />
                          Guardar nueva contraseña
                        </>
                      )
                  }
                </button>

              </form>


              <div
                className="
                  mt-7
                  flex
                  items-start
                  gap-3
                  rounded-xl
                  border
                  border-indigo-100
                  bg-indigo-50/60
                  p-4
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
                  Evita reutilizar contraseñas de otros servicios
                  o compartir tus credenciales.
                </p>
              </div>


              <p
                className="
                  mt-7
                  text-center
                  text-xs
                  text-slate-400
                "
              >
                CERTIIA · Recuperación segura de acceso
              </p>

            </section>

          </div>

        </div>

      </div>

    </main>

  );

}


function PasswordField({
  id,
  label,
  value,
  onChange,
  mostrar,
  onToggle,
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
          size={19}
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
          placeholder={placeholder}
          autoComplete="new-password"
          disabled={disabled}
          className="
            h-12
            w-full
            rounded-xl
            border
            border-slate-300
            bg-white
            pl-12
            pr-12
            text-sm
            text-slate-900
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


function Criterio({
  cumplido,
  children
}) {

  return (
    <div
      className="
        flex
        items-center
        gap-3
        text-xs
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
            cumplido
              ? 'bg-emerald-400 text-emerald-950'
              : 'bg-white/10 text-indigo-200'
          }
        `}
      >
        <Check size={14} />
      </span>

      <span
        className={
          cumplido
            ? 'font-semibold text-white'
            : 'text-indigo-100'
        }
      >
        {children}
      </span>
    </div>
  );

}


export default ResetPasswordPage;
