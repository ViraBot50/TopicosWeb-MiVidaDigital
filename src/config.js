// URL del backend (variable VITE_API_URL en client/.env).
export const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
).replace(/\/$/, '');

// Cada cuánto se verifica con el backend que la sesión sigue activa.
export const INTERVALO_VERIFICAR_SESION_MS = 30_000;
