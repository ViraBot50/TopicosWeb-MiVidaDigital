import { env } from '../config/env.js';
import { crearClienteAuth, limpiarCookiesSesion, leerCookies } from '../config/supabaseAuth.js';

// Valida la sesión de las cookies httpOnly CONTRA Supabase (getUser consulta al
// servidor de Auth). Por eso detecta sesiones cerradas o revocadas desde otro
// dispositivo, y renueva el token automáticamente cuando hace falta.
//
// Devuelve { usuario, supabaseAuth } o { usuario: null, redDisponible } sin responder.
export async function obtenerSesion(req, res) {
  const hayCookies = leerCookies(req).some((c) => c.name.startsWith('sb-'));
  if (!hayCookies) return { usuario: null, redDisponible: true };

  const supabaseAuth = crearClienteAuth(req, res);
  const { data, error } = await supabaseAuth.auth.getUser();

  if (data?.user) return { usuario: data.user, supabaseAuth, redDisponible: true };

  // Fallo de red/servidor de Supabase: NO se cierra la sesión por un error temporal.
  const falloTemporal = error?.name === 'AuthRetryableFetchError' || error?.status >= 500;
  if (falloTemporal) return { usuario: null, redDisponible: false };

  // Sesión inválida, expirada o cerrada en otro lado: limpiar cookies.
  limpiarCookiesSesion(req, res);
  return { usuario: null, redDisponible: true };
}

// Middleware para rutas protegidas.
// { redirigir: true } es para rutas que abre el navegador directamente (no fetch).
export function requiereAutenticacion({ redirigir = false } = {}) {
  return async (req, res, next) => {
    const { usuario, redDisponible } = await obtenerSesion(req, res);

    if (!usuario) {
      if (!redDisponible) {
        return res.status(503).json({
          codigo: 'AUTH_NO_DISPONIBLE',
          mensaje: 'No se pudo validar la sesión. Intenta de nuevo.',
        });
      }

      if (redirigir) return res.redirect(`${env.CLIENT_URL}/?error=sesion`);

      return res.status(401).json({
        codigo: 'NO_AUTENTICADO',
        mensaje: 'Tu sesión no está activa. Inicia sesión.',
      });
    }

    req.user = usuario;
    next();
  };
}
