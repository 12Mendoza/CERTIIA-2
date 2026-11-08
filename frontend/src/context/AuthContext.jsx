import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import {
  api,
  eliminarToken,
  guardarToken,
  obtenerToken
} from '../services/api';


// =====================================================
// CONTEXTO
// =====================================================
const AuthContext =
  createContext(null);


// =====================================================
// PROVIDER
// =====================================================
export function AuthProvider({
  children
}) {
  const [usuario, setUsuario] =
    useState(null);

  const [cargando, setCargando] =
    useState(true);


  // ===================================================
  // RECUPERAR SESIÓN AL RECARGAR
  // ===================================================
  useEffect(() => {
    async function recuperarSesion() {
      const token =
        obtenerToken();

      if (!token) {
        setUsuario(null);
        setCargando(false);

        return;
      }


      try {
        const respuesta =
          await api.get(
            '/auth/perfil'
          );

        setUsuario(
          respuesta.usuario
        );

      } catch (error) {
        console.error(
          'No se pudo recuperar la sesión:',
          error.message
        );

        eliminarToken();

        setUsuario(null);

      } finally {
        setCargando(false);
      }
    }


    recuperarSesion();
  }, []);


  // ===================================================
  // LOGIN
  // ===================================================
  async function login(
    email,
    password
  ) {
    const respuesta =
      await api.post(
        '/auth/login',
        {
          email,
          password
        }
      );


    if (!respuesta.token) {
      throw new Error(
        'El servidor no devolvió un token de acceso.'
      );
    }


    guardarToken(
      respuesta.token
    );


    // =================================================
    // OBTENER PERFIL COMPLETO
    // =================================================
    try {
      const perfil =
        await api.get(
          '/auth/perfil'
        );

      setUsuario(
        perfil.usuario
      );

    } catch (errorPerfil) {
      eliminarToken();

      setUsuario(null);

      throw new Error(
        errorPerfil.message ||
        'No se pudo obtener el perfil del usuario.'
      );
    }


    return respuesta;
  }


  // ===================================================
  // CERRAR SESIÓN
  // ===================================================
  async function logout() {
    try {
      const token =
        obtenerToken();

      if (token) {
        await api.post(
          '/auth/logout',
          {}
        );
      }

    } catch (error) {
      console.error(
        'Error al cerrar sesión:',
        error.message
      );

    } finally {
      eliminarToken();

      setUsuario(null);
    }
  }


  // ===================================================
  // ACTUALIZAR PERFIL
  // ===================================================
  async function actualizarPerfil() {
    const respuesta =
      await api.get(
        '/auth/perfil'
      );

    setUsuario(
      respuesta.usuario
    );

    return respuesta.usuario;
  }


  // ===================================================
  // VALORES DEL CONTEXTO
  // ===================================================
  const value = {
    usuario,

    cargando,

    autenticado:
      Boolean(usuario),

    login,

    logout,

    actualizarPerfil
  };


  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}


// =====================================================
// HOOK
// =====================================================
export function useAuth() {
  const contexto =
    useContext(AuthContext);


  if (!contexto) {
    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider.'
    );
  }


  return contexto;
}