import crypto from 'node:crypto';
import { Router } from 'express';
import { env } from '../config/env.js';
import { leerCookies, opcionesCookie } from '../config/supabaseAuth.js';
import {
  crearOAuthClient,
  GOOGLE_DRIVE_SCOPES,
} from '../config/googleOAuth.js';
import { requiereAutenticacion } from '../middleware/auth.js';
import {
  eliminarConexionDrive,
  guardarConexionDrive,
  obtenerEstadoDrive,
} from '../services/driveService.js';

const router = Router();
const COOKIE_STATE = 'drive_oauth_state';

// GET /api/drive/estado → { conectado, correo }
router.get('/estado', requiereAutenticacion(), async (req, res) => {
  try {
    return res.json(await obtenerEstadoDrive(req.user.id));
  } catch (error) {
    console.error('Error al consultar Drive:', error.message);
    return res.status(500).json({ mensaje: 'No se pudo consultar el estado de Drive.' });
  }
});

// GET /api/drive/conectar → redirige a Google para autorizar Drive.
// Sirve para usuarios que entraron con GitHub o Discord (o para reconectar).
router.get('/conectar', requiereAutenticacion({ redirigir: true }), (req, res) => {
  const state = crypto.randomBytes(24).toString('hex');

  res.cookie(COOKIE_STATE, state, opcionesCookie({ maxAge: 10 * 60 * 1000 }));

  const url = crearOAuthClient().generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: GOOGLE_DRIVE_SCOPES,
    include_granted_scopes: true,
    state,
  });

  return res.redirect(url);
});

// GET /api/drive/callback ← Google regresa aquí.
router.get('/callback', requiereAutenticacion({ redirigir: true }), async (req, res) => {
  const stateGuardado = leerCookies(req).find((c) => c.name === COOKIE_STATE)?.value;
  res.clearCookie(COOKIE_STATE, opcionesCookie());

  const { code, state, error } = req.query;

  const stateValido =
    typeof state === 'string' &&
    typeof stateGuardado === 'string' &&
    state.length === stateGuardado.length &&
    crypto.timingSafeEqual(Buffer.from(state), Buffer.from(stateGuardado));

  if (error || typeof code !== 'string' || !stateValido) {
    return res.redirect(`${env.CLIENT_URL}/?drive=error`);
  }

  try {
    const cliente = crearOAuthClient();
    const { tokens } = await cliente.getToken(code);

    if (!tokens.refresh_token) {
      return res.redirect(`${env.CLIENT_URL}/?drive=error`);
    }

    let googleEmail = null;
    if (tokens.id_token) {
      const ticket = await cliente.verifyIdToken({
        idToken: tokens.id_token,
        audience: env.GOOGLE_CLIENT_ID,
      });
      googleEmail = ticket.getPayload()?.email ?? null;
    }

    await guardarConexionDrive({
      userId: req.user.id,
      refreshToken: tokens.refresh_token,
      googleEmail,
      scope: tokens.scope,
    });

    return res.redirect(`${env.CLIENT_URL}/?drive=conectado`);
  } catch (errorGoogle) {
    console.error('Error al conectar Drive:', errorGoogle.message);
    return res.redirect(`${env.CLIENT_URL}/?drive=error`);
  }
});

// DELETE /api/drive/conexion → desconecta Drive (revoca el permiso en Google).
router.delete('/conexion', requiereAutenticacion(), async (req, res) => {
  try {
    await eliminarConexionDrive(req.user.id);
    return res.json({ mensaje: 'Google Drive desconectado.' });
  } catch (error) {
    console.error('Error al desconectar Drive:', error.message);
    return res.status(500).json({ mensaje: 'No se pudo desconectar Google Drive.' });
  }
});

export default router;
