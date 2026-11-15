import { google } from 'googleapis';
import { env } from './env.js';

export const GOOGLE_DRIVE_REDIRECT_URI = `${env.API_URL}/api/drive/callback`;

export const GOOGLE_DRIVE_SCOPES = [
  'openid',
  'email',
  'https://www.googleapis.com/auth/drive.file',
];

export function crearOAuthClient() {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    GOOGLE_DRIVE_REDIRECT_URI
  );
}
