import crypto from 'node:crypto';
import { env } from '../config/env.js';

const clave = Buffer.from(env.TOKEN_ENCRYPTION_KEY, 'base64');

// AES-256-GCM. Formato guardado: iv.etiqueta.cifrado (base64).
export function cifrar(texto) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', clave, iv);
  const cifrado = Buffer.concat([cipher.update(texto, 'utf8'), cipher.final()]);
  const etiqueta = cipher.getAuthTag();

  return [iv, etiqueta, cifrado].map((b) => b.toString('base64')).join('.');
}

export function descifrar(valor) {
  const [iv, etiqueta, cifrado] = valor.split('.').map((p) => Buffer.from(p, 'base64'));
  const decipher = crypto.createDecipheriv('aes-256-gcm', clave, iv);
  decipher.setAuthTag(etiqueta);

  return Buffer.concat([decipher.update(cifrado), decipher.final()]).toString('utf8');
}
