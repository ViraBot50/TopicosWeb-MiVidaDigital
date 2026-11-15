import { API_URL } from '../config';

// Evento global: cualquier petición que reciba 401 lo dispara y el
// AuthProvider se entera de que la sesión ya no es válida.
export const EVENTO_SESION_INVALIDA = 'auth:sesion-invalida';

export class ApiError extends Error {
  constructor(mensaje, { status, codigo } = {}) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.codigo = codigo;
  }
}

async function leerError(respuesta, mensajePorDefecto) {
  let datos = {};
  try {
    datos = await respuesta.json();
  } catch {
    // La respuesta no traía JSON.
  }

  return new ApiError(datos.mensaje || mensajePorDefecto, {
    status: respuesta.status,
    codigo: datos.codigo,
  });
}

// Petición al backend. Siempre envía las cookies httpOnly de la sesión.
// Devuelve el JSON, o lanza ApiError.
export async function apiFetch(ruta, { metodo = 'GET', json, body } = {}) {
  const opciones = { method: metodo, credentials: 'include', headers: {} };

  if (json !== undefined) {
    opciones.headers['Content-Type'] = 'application/json';
    opciones.body = JSON.stringify(json);
  } else if (body !== undefined) {
    opciones.body = body; // FormData
  }

  const respuesta = await fetch(`${API_URL}${ruta}`, opciones);

  if (respuesta.status === 401) {
    window.dispatchEvent(new Event(EVENTO_SESION_INVALIDA));
  }

  if (!respuesta.ok) {
    throw await leerError(respuesta, 'Ocurrió un error al comunicarse con el servidor.');
  }

  return respuesta.json();
}

// Para descargas (devuelve un Blob).
export async function apiBlob(ruta) {
  const respuesta = await fetch(`${API_URL}${ruta}`, { credentials: 'include' });

  if (respuesta.status === 401) {
    window.dispatchEvent(new Event(EVENTO_SESION_INVALIDA));
  }

  if (!respuesta.ok) {
    throw await leerError(respuesta, 'No se pudo descargar el archivo.');
  }

  return respuesta.blob();
}
