import { apiFetch } from './http';

// Obtiene las categorías disponibles para clasificar documentos.
export async function listarCategorias() {
  const datos = await apiFetch('/api/categorias');
  return datos.categorias;
}
