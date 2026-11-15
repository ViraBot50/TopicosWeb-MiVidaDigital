import { apiBlob, apiFetch } from './http';

export async function listarArchivos() {
  const datos = await apiFetch('/api/archivos');
  return datos.archivos;
}

export function subirArchivo(archivo) {
  const formulario = new FormData();
  formulario.append('archivo', archivo);

  return apiFetch('/api/archivos/upload', { metodo: 'POST', body: formulario });
}

export function eliminarArchivo(id) {
  return apiFetch(`/api/archivos/${id}`, { metodo: 'DELETE' });
}

// Descarga el archivo y lo guarda en el equipo del usuario.
export async function descargarArchivo(id, nombreArchivo) {
  const blob = await apiBlob(`/api/archivos/${id}/descargar`);
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');

  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
