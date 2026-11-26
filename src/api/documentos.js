import { apiBlob, apiFetch } from './http';

// Lista documentos con filtros y paginación.
export function listarDocumentos(filtros = {}) {
  const parametros = new URLSearchParams();

  const campos = [
    'q',
    'categoria',
    'etiqueta',
    'estado',
    'vence_antes',
    'vence_despues',
    'orden',
    'limit',
    'offset',
  ];

  campos.forEach((campo) => {
    const valor = filtros[campo];

    if (valor !== undefined && valor !== null && valor !== '') {
      parametros.append(campo, valor);
    }
  });

  const consulta = parametros.toString();
  const ruta = `/api/documentos${consulta ? `?${consulta}` : ''}`;

  return apiFetch(ruta);
}

// Registra un documento y sube su archivo a Google Drive.
export function crearDocumento({
  archivo,
  nombre,
  categoria,
  descripcion,
  fecha_emision,
  fecha_vencimiento,
  institucion_emisora,
  etiquetas,
}) {
  const formulario = new FormData();

  formulario.append('archivo', archivo);
  formulario.append('nombre', nombre);
  formulario.append('categoria', categoria);

  if (descripcion) {
    formulario.append('descripcion', descripcion);
  }

  if (fecha_emision) {
    formulario.append('fecha_emision', fecha_emision);
  }

  if (fecha_vencimiento) {
    formulario.append('fecha_vencimiento', fecha_vencimiento);
  }

  if (institucion_emisora) {
    formulario.append('institucion_emisora', institucion_emisora);
  }

  if (etiquetas !== undefined) {
    formulario.append('etiquetas', JSON.stringify(etiquetas));
  }

  return apiFetch('/api/documentos', {
    metodo: 'POST',
    body: formulario,
  });
}

// Obtiene los detalles de un documento.
export function obtenerDocumento(id) {
  return apiFetch(`/api/documentos/${id}`);
}

// Actualiza los metadatos de un documento.
export function actualizarDocumento(id, datos) {
  return apiFetch(`/api/documentos/${id}`, {
    metodo: 'PATCH',
    json: datos,
  });
}

// Elimina un documento y su archivo asociado.
export function eliminarDocumento(id) {
  return apiFetch(`/api/documentos/${id}`, {
    metodo: 'DELETE',
  });
}

// Descarga el archivo y lo guarda en el equipo del usuario.
export async function descargarDocumento(id, nombreArchivo) {
  const blob = await apiBlob(`/api/documentos/${id}/descargar`);
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');

  enlace.href = url;
  enlace.download = nombreArchivo || `documento-${id}`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
