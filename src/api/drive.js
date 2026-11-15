import { API_URL } from '../config';
import { apiFetch } from './http';

// Redirección completa a Google para autorizar Drive.
export function urlConectarDrive() {
  return `${API_URL}/api/drive/conectar`;
}

export function desconectarDrive() {
  return apiFetch('/api/drive/conexion', { metodo: 'DELETE' });
}
