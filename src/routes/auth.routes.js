import { Router } from 'express';
import { env } from '../config/env.js';
import {
  crearClienteAuth,
  limpiarCookiesSesion,
  leerCookies,
  opcionesCookie,
} from '../config/supabaseAuth.js';
import { guardarConexionDrive } from '../services/driveService.js';

const router = Router();

// Para agregar otro proveedor: activarlo en Supabase y añadirlo aquí.
const PROVEEDORES = {
  google: {
    // Google además pide permiso para Drive.
    scopes: 'openid email profile https://www.googleapis.com/auth/drive.file',
    queryParams: { access_type: 'offline', prompt: 'consent' },
  },
  github: { scopes: 'read:user user:email' },
  discord: { scopes: 'identify email' },
};

const COOKIE_PROVEEDOR = 'auth_provider';

// GET /auth/login/google | github | discord  → redirige al proveedor.
router.get('/login/:proveedor', async (req, res) => {
  const proveedor = req.params.proveedor;
  const config = PROVEEDORES[proveedor];

  if (!config) {
    return res.status(400).json({ mensaje: 'Proveedor de inicio de sesión no válido.' });
  }

  const supabaseAuth = crearClienteAuth(req, res);

  const { data, error } = await supabaseAuth.auth.signInWithOAuth({
    provider: proveedor,
    options: {
      redirectTo: `${env.API_URL}/auth/callback`,
      scopes: config.scopes,
      queryParams: config.queryParams,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data?.url) {
    console.error('No se pudo iniciar el login:', error?.message);
    return res.redirect(`${env.CLIENT_URL}/?error=login`);
  }

  // Recordamos con qué proveedor entró (para saber si guardar el token de Drive).
  res.cookie(COOKIE_PROVEEDOR, proveedor, opcionesCookie({ maxAge: 10 * 60 * 1000 }));

  return res.redirect(data.url);
});

// GET /auth/callback  ← Supabase regresa aquí con ?code=...
router.get('/callback', async (req, res) => {
  const proveedor = leerCookies(req).find((c) => c.name === COOKIE_PROVEEDOR)?.value;
  res.clearCookie(COOKIE_PROVEEDOR, opcionesCookie());

  const code = typeof req.query.code === 'string' ? req.query.code : null;

  if (!code || req.query.error) {
    return res.redirect(`${env.CLIENT_URL}/?error=login`);
  }

  const supabaseAuth = crearClienteAuth(req, res);
  const { data, error } = await supabaseAuth.auth.exchangeCodeForSession(code);

  if (error || !data?.session) {
    console.error('Error al crear la sesión:', error?.message);
    return res.redirect(`${env.CLIENT_URL}/?error=login`);
  }

  // Al entrar con Google, Supabase entrega una sola vez el refresh token de
  // Google. Lo guardamos (cifrado) para usar Drive sin pedir permiso otra vez.
  const { provider_refresh_token: refreshToken } = data.session;

  if (proveedor === 'google' && refreshToken) {
    try {
      const identidad = data.user.identities?.find((i) => i.provider === 'google');

      await guardarConexionDrive({
        userId: data.user.id,
        refreshToken,
        googleEmail: identidad?.identity_data?.email ?? data.user.email,
        scope: PROVEEDORES.google.scopes,
      });
    } catch (errorDrive) {
      // La sesión ya existe; el usuario podrá conectar Drive manualmente.
      console.error('No se pudo guardar la conexión de Drive:', errorDrive.message);
    }
  }

  // Las cookies de sesión (httpOnly) ya van en esta respuesta.
  return res.redirect(env.CLIENT_URL);
});

// POST /auth/logout   body opcional: { "scope": "local" | "global" | "others" }
//  - local:  cierra solo este navegador/dispositivo (por defecto)
//  - global: cierra la sesión en TODOS los dispositivos
//  - others: cierra las demás y conserva esta
router.post('/logout', async (req, res) => {
  const scope = ['local', 'global', 'others'].includes(req.body?.scope)
    ? req.body.scope
    : 'local';

  const supabaseAuth = crearClienteAuth(req, res);
  const { error } = await supabaseAuth.auth.signOut({ scope });

  if (error) {
    // Aunque falle la revocación remota, no dejamos la cookie en el navegador.
    console.error('Error al cerrar sesión en Supabase:', error.message);
  }

  if (scope !== 'others') limpiarCookiesSesion(req, res);

  return res.json({ mensaje: 'Sesión cerrada correctamente.', scope });
});

export default router;
