import { apiFetch } from './http';

// Obtiene todas las etiquetas del usuario.
export async function listarEtiquetas() {
  const datos = await apiFetch('/api/etiquetas');
  return datos.etiquetas;
}

// Crea una etiqueta nueva.
export function crearEtiqueta(nombre) {
  return apiFetch('/api/etiquetas', {
    metodo: 'POST',
    json: { nombre },
  });
}

// Modifica una etiqueta existente.
export function actualizarEtiqueta(id, nombre) {
  return apiFetch(`/api/etiquetas/${id}`, {
    metodo: 'PATCH',
    json: { nombre },
  });
}

// Elimina una etiqueta.
export function eliminarEtiqueta(id) {
  return apiFetch(`/api/etiquetas/${id}`, {
    metodo: 'DELETE',
  });
}
