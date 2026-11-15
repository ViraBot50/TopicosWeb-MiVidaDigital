import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import { env } from './env.js';

// Opciones de TODAS las cookies que escribe el backend.
// httpOnly siempre: el JavaScript del navegador nunca puede leer la sesión.
export function opcionesCookie(extra = {}) {
  return {
    path: '/',
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE,
    domain: env.COOKIE_DOMAIN,
    ...extra,
  };
}

export function leerCookies(req) {
  return parseCookieHeader(req.headers.cookie ?? '');
}

// Un cliente de Supabase POR PETICIÓN: lee la sesión de las cookies de req
// y escribe las cookies nuevas (login, refresh, logout) en res.
export function crearClienteAuth(req, res) {
  return createServerClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return leerCookies(req);
      },
      setAll(cookies, headers) {
        for (const [clave, valor] of Object.entries(headers ?? {})) {
          res.setHeader(clave, valor);
        }

        for (const { name, value, options } of cookies) {
          res.cookie(
            name,
            value,
            opcionesCookie({
              // @supabase/ssr entrega maxAge en SEGUNDOS; Express usa milisegundos.
              maxAge: options?.maxAge != null ? options.maxAge * 1000 : undefined,
            })
          );
        }
      },
    },
  });
}

// Borra las cookies de sesión de Supabase (sb-*-auth-token y sus fragmentos).
export function limpiarCookiesSesion(req, res) {
  for (const { name } of leerCookies(req)) {
    if (name.startsWith('sb-')) {
      res.clearCookie(name, opcionesCookie());
    }
  }
}
