import { google } from 'googleapis';
import supabase from '../config/supabase.js';
import { crearOAuthClient } from '../config/googleOAuth.js';
import { cifrar, descifrar } from '../utils/crypto.js';

import { AppError, Errores } from '../errors/AppError.js';

//ahora usa un codigo 409 para indicar que el usuario debe reconectar su cuenta de Google Drive.
export class DriveNoConectadoError extends AppError {
  constructor(mensaje = 'Debes conectar tu Google Drive.') {
    super(409, 'DRIVE_NO_CONECTADO', mensaje);
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

// Convierte un error de Google Drive en un AppError que el manejador central
// sabe responder. Si Drive exige reconectar, además borra la conexión guardada.
export async function traducirErrorDrive(error, userId) {
  if (error instanceof AppError) return error;

  if (requiereReconectar(error)) {
    try {
      await eliminarConexionDrive(userId);
    } catch {
      // Si no se puede borrar, el siguiente intento lo volverá a detectar.
    }
    return new DriveNoConectadoError(
      'Tu conexión con Google Drive no está activa. Conéctala de nuevo.'
    );
  }

  const estado = Number(error?.response?.status ?? error?.code);

  if (estado === 404) {
    return Errores.noEncontrado(
      'El archivo ya no existe en Google Drive o no está disponible. Puedes actualizar la lista de archivos.'
    );
  }

  if (estado >= 400 && estado < 600) {
    return new AppError(502, 'ERROR_DRIVE', 'Google Drive no respondió correctamente. Inténtalo de nuevo.', {
      cause: error,
    });
  }

  return error; // inesperado: el manejador central lo responderá como 500
}
