// URL del backend (variable VITE_API_URL en client/.env).
export const API_URL = (
  import.meta.env.VITE_API_URL || ''
).replace(/\/$/, '');

// Cada cuánto se verifica con el backend que la sesión sigue activa.
export const INTERVALO_VERIFICAR_SESION_MS = 30_000;
