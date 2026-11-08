import {
  useState
} from 'react';

import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

import {
  useNavigate
} from 'react-router-dom';

import {
  api
} from '../../services/api';


function ForgotPasswordPage() {

  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState('');

  const [cargando, setCargando] =
    useState(false);

  const [error, setError] =
    useState('');

  const [mensaje, setMensaje] =
    useState('');

  const [
    tokenPrueba,
    setTokenPrueba
  ] = useState('');


  async function handleSubmit(
    event
  ) {

    event.preventDefault();

    setError('');
    setMensaje('');
    setTokenPrueba('');

    if (!email.trim()) {

      setError(
        'Ingresa tu correo electrónico.'
      );

      return;

    }

    try {

      setCargando(true);

      const respuesta =
        await api.post(
          '/auth/password/reset/request',
          {
            email:
              email.trim()
          }
        );

      setMensaje(
        respuesta.mensaje ||
        'Si el correo está registrado, recibirás instrucciones para continuar.'
      );

      /*
        SOLO PARA DESARROLLO LOCAL.

        En producción el token debe llegar por un
        canal seguro y nunca mostrarse en pantalla.
      */
      if (
        import.meta.env.DEV &&
        respuesta.tokenPrueba
      ) {

        setTokenPrueba(
          respuesta.tokenPrueba
        );

      }

    } catch (errorRequest) {

      setError(
        errorRequest.message ||
        'No se pudo procesar la solicitud.'
      );

    } finally {

      setCargando(false);

    }

  }


  function irAResetPassword() {

    navigate(
      '/restablecer-password',
      {
        state: {
          token:
            tokenPrueba,
          email:
            email.trim()
        }
      }
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
          -left-20
          top-10
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
          right-0
          h-96
          w-96
          rounded-full
          bg-violet-500/10
          blur-3xl
        "
      />

      <div
        className="
          absolute
          inset-0
          opacity-[0.05]
        "
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize:
            '28px 28px'
        }}
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
              navigate('/login')
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
            Volver al inicio de sesión
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
              lg:grid-cols-[0.9fr_1.1fr]
            "
          >

            {/* PANEL INFORMATIVO */}

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
                  <ShieldCheck size={26} />
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
                  Recuperación de acceso
                </p>

                <h1
                  className="
                    mt-3
                    text-3xl
                    font-bold
                    tracking-tight
                  "
                >
                  Recupera tu cuenta de forma segura.
                </h1>

                <p
                  className="
                    mt-4
                    text-sm
                    leading-7
                    text-indigo-100/90
                  "
                >
                  Solicita el restablecimiento usando el
                  correo asociado a tu cuenta. CERTIIA
                  protege el proceso y evita exponer
                  información sensible sobre los usuarios.
                </p>


                <div
                  className="
                    mt-8
                    space-y-3
                  "
                >

                  <Paso
                    numero="01"
                    texto="Ingresa tu correo registrado."
                  />

                  <Paso
                    numero="02"
                    texto="Recibe o utiliza el mecanismo de recuperación habilitado."
                  />

                  <Paso
                    numero="03"
                    texto="Define una nueva contraseña segura."
                  />

                </div>


                <div
                  className="
                    mt-8
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/10
                    p-4
                  "
                >
                  <div className="flex items-start gap-3">

                    <Sparkles
                      size={18}
                      className="mt-0.5 shrink-0 text-indigo-200"
                    />

                    <p
                      className="
                        text-xs
                        leading-5
                        text-indigo-100
                      "
                    >
                      Por seguridad, la respuesta del sistema
                      no debe revelar si una cuenta específica
                      existe o no.
                    </p>

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
                  Recupera tu contraseña
                </h2>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  Ingresa tu correo electrónico para iniciar
                  el proceso de recuperación.
                </p>

              </div>


              <form
                onSubmit={handleSubmit}
                className="mt-7 space-y-5"
              >

                <div>

                  <label
                    htmlFor="email"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    Correo electrónico
                  </label>

                  <div className="relative">

                    <Mail
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
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      placeholder="correo@certiia.com"
                      autoComplete="email"
                      disabled={cargando}
                      className="
                        h-12
                        w-full
                        rounded-xl
                        border
                        border-slate-300
                        bg-white
                        pl-12
                        pr-4
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

                </div>


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


                {
                  mensaje && (
                    <div
                      className="
                        flex
                        items-start
                        gap-3
                        rounded-xl
                        border
                        border-emerald-200
                        bg-emerald-50
                        px-4
                        py-3
                        text-sm
                        text-emerald-700
                      "
                    >
                      <CheckCircle2
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <span>
                        {mensaje}
                      </span>
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
                          Procesando...
                        </>
                      )
                      : (
                        <>
                          <Mail size={18} />
                          Solicitar recuperación
                        </>
                      )
                  }
                </button>

              </form>


              {
                import.meta.env.DEV &&
                tokenPrueba && (

                  <div
                    className="
                      mt-7
                      border-t
                      border-slate-100
                      pt-6
                    "
                  >

                    <div
                      className="
                        rounded-2xl
                        border
                        border-amber-200
                        bg-amber-50
                        p-4
                      "
                    >

                      <p
                        className="
                          text-sm
                          font-bold
                          text-amber-800
                        "
                      >
                        Modo desarrollo local
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          leading-5
                          text-amber-700
                        "
                      >
                        Este acceso rápido solo se muestra
                        cuando Vite está ejecutándose en modo
                        desarrollo.
                      </p>

                      <button
                        type="button"
                        onClick={irAResetPassword}
                        className="
                          mt-4
                          inline-flex
                          h-10
                          items-center
                          justify-center
                          rounded-xl
                          bg-amber-700
                          px-4
                          text-sm
                          font-bold
                          text-white
                          transition
                          hover:bg-amber-800
                        "
                      >
                        Continuar con el restablecimiento
                      </button>

                    </div>

                  </div>

                )
              }


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


function Paso({
  numero,
  texto
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
        bg-white/[0.07]
        px-4
        py-3
      "
    >
      <span
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-white
          text-[11px]
          font-bold
          text-indigo-700
        "
      >
        {numero}
      </span>

      <span
        className="
          text-xs
          leading-5
          text-indigo-100
        "
      >
        {texto}
      </span>
    </div>
  );

}


export default ForgotPasswordPage;
