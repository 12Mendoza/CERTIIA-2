import {
  useState
} from 'react';

import {
  CheckCircle2,
  Eye,
  EyeOff,
  FileCheck2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

import {
  useNavigate
} from 'react-router-dom';

import {
  useAuth
} from '../../context/AuthContext.jsx';


function LoginPage() {

  const navigate =
    useNavigate();

  const {
    login
  } = useAuth();

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [
    mostrarPassword,
    setMostrarPassword
  ] = useState(false);

  const [cargando, setCargando] =
    useState(false);

  const [error, setError] =
    useState('');


  async function handleSubmit(
    event
  ) {

    event.preventDefault();

    setError('');

    if (
      !email ||
      !password
    ) {

      setError(
        'Completa tu correo y contraseña.'
      );

      return;

    }

    try {

      setCargando(true);

      await login(
        email.trim(),
        password
      );

      navigate(
        '/dashboard',
        {
          replace: true
        }
      );

    } catch (errorLogin) {

      setError(
        errorLogin.message ||
        'No se pudo iniciar sesión.'
      );

    } finally {

      setCargando(false);

    }

  }


  return (

    <main
      className="
        min-h-screen
        bg-slate-950
      "
    >

      <div
        className="
          grid
          min-h-screen
          lg:grid-cols-[1.08fr_0.92fr]
        "
      >

        {/* ================================================= */}
        {/* PANEL INSTITUCIONAL */}
        {/* ================================================= */}

        <section
          className="
            relative
            hidden
            overflow-hidden
            border-r
            border-white/10
            p-10
            lg:flex
            lg:flex-col
            lg:justify-between
            xl:p-14
          "
        >

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-br
              from-indigo-700
              via-indigo-900
              to-slate-950
            "
          />

          <div
            className="
              absolute
              -left-24
              top-20
              h-80
              w-80
              rounded-full
              bg-white/10
              blur-3xl
            "
          />

          <div
            className="
              absolute
              -bottom-20
              right-0
              h-96
              w-96
              rounded-full
              bg-cyan-400/10
              blur-3xl
            "
          />

          <div
            className="
              absolute
              inset-0
              opacity-[0.06]
            "
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize:
                '30px 30px'
            }}
          />

          <div
            className="
              relative
              z-10
            "
          >

            <div
              className="
                inline-flex
                items-center
                gap-3
                rounded-2xl
                border
                border-white/15
                bg-white/10
                px-4
                py-3
                backdrop-blur
              "
            >

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-white
                  text-indigo-700
                  shadow-lg
                "
              >
                <ShieldCheck size={24} />
              </div>

              <div>
                <p
                  className="
                    text-lg
                    font-bold
                    text-white
                  "
                >
                  CERTIIA
                </p>

                <p
                  className="
                    text-xs
                    text-indigo-100
                  "
                >
                  Control, seguimiento y predicción documental
                </p>
              </div>

            </div>

          </div>


          <div
            className="
              relative
              z-10
              max-w-2xl
            "
          >

            <span
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-white/15
                bg-white/10
                px-4
                py-2
                text-xs
                font-semibold
                text-indigo-100
                backdrop-blur
              "
            >
              <Sparkles size={14} />
              Plataforma de cumplimiento documental
            </span>

            <h1
              className="
                mt-6
                max-w-xl
                text-5xl
                font-bold
                leading-[1.08]
                tracking-tight
                text-white
                xl:text-6xl
              "
            >
              Controla tu operación con seguridad y claridad.
            </h1>

            <p
              className="
                mt-6
                max-w-xl
                text-base
                leading-8
                text-indigo-100/90
                xl:text-lg
              "
            >
              Centraliza documentos, renovaciones, alertas,
              auditoría y predicciones en una plataforma
              diseñada para reducir riesgos operativos.
            </p>


            <div
              className="
                mt-10
                grid
                gap-3
                xl:grid-cols-3
              "
            >

              <Beneficio
                icono={ShieldCheck}
                titulo="Acceso seguro"
                descripcion="Roles y permisos"
              />

              <Beneficio
                icono={FileCheck2}
                titulo="Trazabilidad"
                descripcion="Historial auditable"
              />

              <Beneficio
                icono={CheckCircle2}
                titulo="Control"
                descripcion="Seguimiento continuo"
              />

            </div>

          </div>


          <div
            className="
              relative
              z-10
              flex
              items-center
              justify-between
              gap-4
              text-xs
              text-indigo-200
            "
          >
            <span>
              CERTIIA · Sistema de gestión documental
            </span>

            <span>
              Acceso protegido
            </span>
          </div>

        </section>


        {/* ================================================= */}
        {/* LOGIN */}
        {/* ================================================= */}

        <section
          className="
            relative
            flex
            min-h-screen
            items-center
            justify-center
            overflow-hidden
            bg-slate-50
            px-6
            py-12
            sm:px-10
          "
        >

          <div
            className="
              absolute
              -right-24
              top-0
              h-72
              w-72
              rounded-full
              bg-indigo-100/60
              blur-3xl
            "
          />

          <div
            className="
              absolute
              -bottom-20
              -left-24
              h-72
              w-72
              rounded-full
              bg-violet-100/50
              blur-3xl
            "
          />


          <div
            className="
              relative
              w-full
              max-w-md
            "
          >

            {/* LOGO MÓVIL */}

            <div
              className="
                mb-9
                flex
                items-center
                gap-3
                lg:hidden
              "
            >
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-indigo-600
                  text-white
                  shadow-lg
                  shadow-indigo-600/20
                "
              >
                <ShieldCheck size={25} />
              </div>

              <div>
                <p
                  className="
                    text-xl
                    font-bold
                    text-slate-900
                  "
                >
                  CERTIIA
                </p>

                <p
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  Gestión inteligente y segura
                </p>
              </div>
            </div>


            <div
              className="
                overflow-hidden
                rounded-[28px]
                border
                border-slate-200
                bg-white
                shadow-xl
                shadow-slate-200/60
              "
            >

              <div
                className="
                  border-b
                  border-slate-100
                  bg-gradient-to-r
                  from-white
                  to-indigo-50/50
                  px-6
                  py-6
                  sm:px-7
                "
              >
                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-indigo-600
                  "
                >
                  Acceso seguro
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
                  Inicia sesión
                </h2>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  Ingresa tus credenciales para acceder
                  a las funciones autorizadas de CERTIIA.
                </p>
              </div>


              <form
                onSubmit={handleSubmit}
                className="
                  space-y-5
                  px-6
                  py-6
                  sm:px-7
                "
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
                      autoComplete="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      placeholder="correo@certiia.com"
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


                <div>

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
                      htmlFor="password"
                      className="
                        text-sm
                        font-semibold
                        text-slate-700
                      "
                    >
                      Contraseña
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          '/recuperar-password'
                        )
                      }
                      disabled={cargando}
                      className="
                        text-xs
                        font-bold
                        text-indigo-600
                        transition
                        hover:text-indigo-700
                        disabled:opacity-60
                      "
                    >
                      ¿Olvidaste tu contraseña?
                    </button>

                  </div>


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
                      id="password"
                      type={
                        mostrarPassword
                          ? 'text'
                          : 'password'
                      }
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="Ingresa tu contraseña"
                      disabled={cargando}
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
                      onClick={() =>
                        setMostrarPassword(
                          !mostrarPassword
                        )
                      }
                      disabled={cargando}
                      aria-label={
                        mostrarPassword
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
                        mostrarPassword
                          ? <EyeOff size={18} />
                          : <Eye size={18} />
                      }
                    </button>

                  </div>

                </div>


                {
                  error && (
                    <div
                      className="
                        flex
                        items-start
                        gap-3
                        rounded-xl
                        border
                        border-red-200
                        bg-red-50
                        px-4
                        py-3
                        text-sm
                        text-red-700
                      "
                    >
                      <LockKeyhole
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <span>
                        {error}
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
                          Ingresando...
                        </>
                      )
                      : (
                        <>
                          <ShieldCheck size={18} />
                          Ingresar a CERTIIA
                        </>
                      )
                  }
                </button>


                <div
                  className="
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
                    El acceso está protegido por autenticación,
                    control de permisos y auditoría de eventos.
                  </p>
                </div>

              </form>

            </div>


            <p
              className="
                mt-6
                text-center
                text-xs
                text-slate-400
              "
            >
              CERTIIA · Acceso protegido y auditado
            </p>

          </div>

        </section>

      </div>

    </main>

  );

}


function Beneficio({
  icono: Icono,
  titulo,
  descripcion
}) {

  return (
    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-white/10
        p-4
        backdrop-blur
      "
    >
      <Icono
        size={19}
        className="text-indigo-100"
      />

      <p
        className="
          mt-3
          text-sm
          font-bold
          text-white
        "
      >
        {titulo}
      </p>

      <p
        className="
          mt-1
          text-xs
          text-indigo-100/80
        "
      >
        {descripcion}
      </p>
    </div>
  );

}


export default LoginPage;
