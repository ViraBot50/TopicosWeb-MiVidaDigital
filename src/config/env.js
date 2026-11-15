import 'dotenv/config';

function requerida(nombre) {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(`Falta la variable ${nombre} en server/.env`);
  }
  return valor;
}

const produccion = process.env.NODE_ENV === 'production';

export const env = {
  produccion,
  PORT: Number(process.env.PORT) || 3000,

  // URL pública del frontend y del backend (sin "/" final).
  CLIENT_URL: (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, ''),
  API_URL: (process.env.API_URL || `http://localhost:${Number(process.env.PORT) || 3000}`).replace(/\/$/, ''),

  // Supabase.
  SUPABASE_URL: requerida('SUPABASE_URL'),
  // Clave pública: solo para validar/renovar la sesión del usuario.
  SUPABASE_PUBLISHABLE_KEY: requerida('SUPABASE_PUBLISHABLE_KEY'),
  // Clave secreta: solo backend, para leer/escribir tablas.
  SUPABASE_SECRET_KEY: requerida('SUPABASE_SECRET_KEY'),

  // Google (se usa únicamente para conectar Drive).
  GOOGLE_CLIENT_ID: requerida('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: requerida('GOOGLE_CLIENT_SECRET'),

  // Clave de 32 bytes en base64 para cifrar los refresh tokens de Drive.
  TOKEN_ENCRYPTION_KEY: requerida('TOKEN_ENCRYPTION_KEY'),

  // Cookies de sesión.
  // - Mismo sitio (app.midominio.com + api.midominio.com): 'lax' + COOKIE_DOMAIN=.midominio.com
  // - Dominios distintos: 'none' (exige HTTPS).
  COOKIE_SAMESITE: (process.env.COOKIE_SAMESITE || (produccion ? 'none' : 'lax')).toLowerCase(),
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined,
  COOKIE_SECURE: produccion || process.env.COOKIE_SECURE === 'true',
};

if (Buffer.from(env.TOKEN_ENCRYPTION_KEY, 'base64').length !== 32) {
  throw new Error(
    'TOKEN_ENCRYPTION_KEY debe ser de 32 bytes en base64. Genera una con: ' +
      "node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
  );
}

if (env.COOKIE_SAMESITE === 'none' && !env.COOKIE_SECURE) {
  throw new Error('COOKIE_SAMESITE=none requiere HTTPS (COOKIE_SECURE=true o NODE_ENV=production).');
}
