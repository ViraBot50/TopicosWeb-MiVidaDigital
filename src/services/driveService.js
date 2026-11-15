import { google } from 'googleapis';
import supabase from '../config/supabase.js';
import { crearOAuthClient } from '../config/googleOAuth.js';
import { cifrar, descifrar } from '../utils/crypto.js';

export class DriveNoConectadoError extends Error {
  constructor(mensaje = 'Debes conectar tu Google Drive.') {
    super(mensaje);
    this.name = 'DriveNoConectadoError';
  }
}

export async function guardarConexionDrive({ userId, refreshToken, googleEmail, scope }) {
  const { error } = await supabase.from('drive_connections').upsert(
    {
      user_id: userId,
      google_email: googleEmail ?? null,
      refresh_token_enc: cifrar(refreshToken),
      scope: scope ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) throw new Error(`No se pudo guardar la conexión de Drive: ${error.message}`);
}

export async function obtenerEstadoDrive(userId) {
  const { data, error } = await supabase
    .from('drive_connections')
    .select('google_email')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return { conectado: Boolean(data), correo: data?.google_email ?? null };
}

export async function eliminarConexionDrive(userId) {
  const { data } = await supabase
    .from('drive_connections')
    .select('refresh_token_enc')
    .eq('user_id', userId)
    .maybeSingle();

  if (data) {
    // Revocar en Google es "mejor esfuerzo": si falla igual borramos el registro.
    try {
      await crearOAuthClient().revokeToken(descifrar(data.refresh_token_enc));
    } catch {
      // El token ya estaba revocado o expirado.
    }
  }

  const { error } = await supabase.from('drive_connections').delete().eq('user_id', userId);
  if (error) throw new Error(error.message);
}

// Devuelve un cliente de Drive del usuario. googleapis renueva el access token
// automáticamente con el refresh token guardado (cifrado) en Supabase.
export async function obtenerClienteDrive(userId) {
  const { data, error } = await supabase
    .from('drive_connections')
    .select('refresh_token_enc')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new DriveNoConectadoError();

  const auth = crearOAuthClient();
  auth.setCredentials({ refresh_token: descifrar(data.refresh_token_enc) });

  return google.drive({ version: 'v3', auth });
}

// ¿El error significa que el usuario debe volver a conectar Drive?
function requiereReconectar(error) {
  const texto = String(error?.message ?? '');
  const motivo = error?.errors?.[0]?.reason;

  return (
    error instanceof DriveNoConectadoError ||
    texto.includes('invalid_grant') ||
    motivo === 'insufficientPermissions' ||
    motivo === 'authError'
  );
}

// Si Drive pide reconectar responde 409 con un código que el frontend entiende.
// Devuelve true cuando ya respondió.
export async function responderSiDriveDesconectado(error, userId, res) {
  if (!requiereReconectar(error)) return false;

  if (!(error instanceof DriveNoConectadoError)) {
    try {
      await eliminarConexionDrive(userId);
    } catch {
      // Si no se puede borrar, el siguiente intento lo volverá a detectar.
    }
  }

  res.status(409).json({
    codigo: 'DRIVE_NO_CONECTADO',
    mensaje: 'Tu conexión con Google Drive no está activa. Conéctala de nuevo.',
  });

  return true;
}
