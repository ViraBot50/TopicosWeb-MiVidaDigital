import { env } from '../config/env.js';

// Las respuestas de la API nunca se guardan en caché (dependen de la sesión).
export function sinCache(req, res, next) {
  res.setHeader('Cache-Control', 'no-store');
  next();
}

// Protección CSRF para peticiones que modifican datos.
// Como la sesión viaja en cookies, un sitio ajeno podría intentar enviar un
// POST/DELETE con ellas. Los navegadores siempre envían la cabecera Origin en
// esas peticiones, así que solo aceptamos la del frontend.
const METODOS_SEGUROS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function validarOrigen(req, res, next) {
  if (METODOS_SEGUROS.has(req.method)) return next();

  const origen = req.headers.origin;

  // Sin Origin = no es un navegador (curl, pruebas). Solo se permite fuera de producción.
  if (!origen && !env.produccion) return next();

  if (origen !== new URL(env.CLIENT_URL).origin) {
    return res.status(403).json({
      codigo: 'ORIGEN_NO_PERMITIDO',
      mensaje: 'Origen no permitido.',
    });
  }

  next();
}
