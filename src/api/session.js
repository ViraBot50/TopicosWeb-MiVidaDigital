import { API_URL } from '../config';
import { apiFetch } from './http';

export const PROVEEDORES = ['google', 'github', 'discord'];

// Los logins son redirecciones completas (el navegador sale hacia el proveedor).
export function urlLogin(proveedor) {
  return `${API_URL}/auth/login/${proveedor}`;
}

// { autenticado: false }  o  { autenticado: true, usuario, drive }
export function consultarSesion() {
  return apiFetch('/api/session');
}

// scope: 'local' (este navegador) | 'global' (todos los dispositivos) | 'others'
export function cerrarSesion(scope = 'local') {
  return apiFetch('/auth/logout', { metodo: 'POST', json: { scope } });
}
