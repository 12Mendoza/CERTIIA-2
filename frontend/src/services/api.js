const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000/api';


// =====================================================
// OBTENER TOKEN
// =====================================================
function obtenerToken() {
  return localStorage.getItem(
    'certiia_token'
  );
}


// =====================================================
// GUARDAR TOKEN
// =====================================================
function guardarToken(token) {
  localStorage.setItem(
    'certiia_token',
    token
  );
}


// =====================================================
// ELIMINAR TOKEN
// =====================================================
function eliminarToken() {
  localStorage.removeItem(
    'certiia_token'
  );
}


// =====================================================
// PREPARAR BODY
// =====================================================
function prepararBody(body) {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (body instanceof FormData) {
    return body;
  }

  return JSON.stringify(body);
}


// =====================================================
// PETICIÓN GENÉRICA
// =====================================================
async function request(
  endpoint,
  options = {}
) {
  const token =
    obtenerToken();

  const esFormData =
    options.body instanceof FormData;

  const headers = {
    ...(options.headers || {})
  };


  /*
   * Para FormData NO se debe colocar
   * Content-Type manualmente.
   *
   * El navegador agrega:
   *
   * multipart/form-data;
   * boundary=...
   */
  if (
    options.body !== undefined &&
    !esFormData
  ) {
    headers['Content-Type'] =
      'application/json';
  }


  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }


  const response =
    await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        headers
      }
    );


  let data = null;

  try {
    data =
      await response.json();
  } catch {
    data = {
      ok: false,
      mensaje:
        'Respuesta inválida del servidor'
    };
  }


  if (!response.ok) {
    const error =
      new Error(
        data?.mensaje ||
        data?.error ||
        'Error en la solicitud'
      );

    error.status =
      response.status;

    error.data =
      data;

    error.response = {
      status:
        response.status,

      data
    };

    throw error;
  }


  return data;
}


// =====================================================
// API
// =====================================================
const api = {

  get(endpoint) {
    return request(
      endpoint,
      {
        method: 'GET'
      }
    );
  },


  post(endpoint, body) {
    return request(
      endpoint,
      {
        method: 'POST',
        body:
          prepararBody(body)
      }
    );
  },


  put(endpoint, body) {
    return request(
      endpoint,
      {
        method: 'PUT',
        body:
          prepararBody(body)
      }
    );
  },


  patch(endpoint, body) {
    return request(
      endpoint,
      {
        method: 'PATCH',
        body:
          prepararBody(body)
      }
    );
  },


  delete(endpoint) {
    return request(
      endpoint,
      {
        method: 'DELETE'
      }
    );
  }

};


export {
  API_URL,
  api,
  obtenerToken,
  guardarToken,
  eliminarToken
};