import supabase from '../config/supabase.js';
import { Errores } from '../errors/AppError.js';
import { escaparLike, conFechaActualizacion, sinUndefined } from '../utils/db.js';
import { estadoVencimiento, hoyEnZona, sumarDias } from '../utils/fechas.js';
import { abrirArchivo, subirArchivo } from './archivos.service.js';
import { obtenerClienteDrive } from './driveService.js';
import { obtenerZonaHoraria } from './perfil.service.js';

const COLUMNAS =
  'id,nombre,descripcion,categoria,fecha_emision,fecha_vencimiento,institucion_emisora,created_at,updated_at';
const SELECT = `${COLUMNAS},archivo:archivos(id,nombre_archivo,fecha_carga)`;

// ---------- Auxiliares ----------

async function cargarEtiquetas(userId, documentoIds) {
  const mapa = new Map(documentoIds.map((id) => [id, []]));
  if (!documentoIds.length) return mapa;

  const [relaciones, etiquetas] = await Promise.all([
    supabase.from('documento_etiquetas').select('documento_id,etiqueta_id')
      .eq('user_id', userId).in('documento_id', documentoIds),
    supabase.from('etiquetas').select('id,nombre').eq('user_id', userId),
  ]);
  if (relaciones.error || etiquetas.error) {
    throw Errores.baseDatos(relaciones.error ?? etiquetas.error);
  }

  const porId = new Map(etiquetas.data.map((e) => [e.id, e]));
  for (const rel of relaciones.data) {
    const etiqueta = porId.get(rel.etiqueta_id);
    if (etiqueta) mapa.get(rel.documento_id)?.push(etiqueta);
  }
  return mapa;
}

function presentar(documento, etiquetas, hoy) {
  return { ...documento, estado: estadoVencimiento(documento.fecha_vencimiento, hoy), etiquetas };
}

async function validarEtiquetas(userId, ids) {
  if (!ids.length) return;
  const { data, error } = await supabase
    .from('etiquetas').select('id').eq('user_id', userId).in('id', ids);

  if (error) throw Errores.baseDatos(error);
  if (data.length !== ids.length) throw Errores.validacion('Una o más etiquetas no existen.');
}

async function reemplazarEtiquetas(userId, documentoId, ids) {
  const { error: errorBorrado } = await supabase
    .from('documento_etiquetas').delete().eq('documento_id', documentoId).eq('user_id', userId);
  if (errorBorrado) throw Errores.baseDatos(errorBorrado);
  if (!ids.length) return;

  const { error } = await supabase.from('documento_etiquetas').insert(
    ids.map((etiqueta_id) => ({ documento_id: documentoId, etiqueta_id, user_id: userId }))
  );
  if (error) throw Errores.baseDatos(error);
}

// Borra el registro de archivos y el archivo de Drive. Nunca lanza: devuelve si Drive quedó limpio.
async function borrarArchivoYDrive(userId, archivo) {
  const { error } = await supabase.from('archivos').delete().eq('id', archivo.id).eq('user_id', userId);
  if (error) console.error('No se pudo borrar el registro del archivo:', error.message);

  try {
    const drive = await obtenerClienteDrive(userId);
    await drive.files.delete({ fileId: archivo.drive_file_id });
    return true;
  } catch (e) {
    if (Number(e?.code) === 404) return true;
    console.error('No se pudo borrar el archivo de Drive:', e.message);
    return false;
  }
}

// ---------- Consultas ----------

export async function obtenerDocumento(userId, id) {
  const { data, error } = await supabase
    .from('documentos').select(SELECT).eq('id', id).eq('user_id', userId).maybeSingle();

  if (error) throw Errores.baseDatos(error);
  if (!data) throw Errores.noEncontrado('Documento no encontrado.');

  const [etiquetas, zona] = await Promise.all([
    cargarEtiquetas(userId, [data.id]),
    obtenerZonaHoraria(userId),
  ]);
  return presentar(data, etiquetas.get(data.id), hoyEnZona(zona));
}

export async function listarDocumentos(userId, filtros) {
  const { q, categoria, etiqueta, estado, vence_antes, vence_despues, orden, limit, offset } = filtros;
  const paginacion = (total) => ({ total, limit, offset });

  const hoy = hoyEnZona(await obtenerZonaHoraria(userId));

  let ids = null;
  if (etiqueta) {
    const { data, error } = await supabase
      .from('documento_etiquetas').select('documento_id')
      .eq('user_id', userId).eq('etiqueta_id', etiqueta);
    if (error) throw Errores.baseDatos(error);
    ids = data.map((r) => r.documento_id);
    if (!ids.length) return { documentos: [], paginacion: paginacion(0) };
  }

  let consulta = supabase.from('documentos').select(SELECT, { count: 'exact' }).eq('user_id', userId);

  if (ids) consulta = consulta.in('id', ids);
  if (q) consulta = consulta.ilike('nombre', `%${escaparLike(q)}%`);
  if (categoria) consulta = consulta.eq('categoria', categoria);

  switch (estado) {
    case 'sin_vencimiento': consulta = consulta.is('fecha_vencimiento', null); break;
    case 'vencido': consulta = consulta.lt('fecha_vencimiento', hoy); break;
    case 'por_vencer':
      consulta = consulta.gte('fecha_vencimiento', hoy).lte('fecha_vencimiento', sumarDias(hoy, 30));
      break;
    case 'vigente': consulta = consulta.gt('fecha_vencimiento', sumarDias(hoy, 30)); break;
    default: break;
  }
  if (vence_antes) consulta = consulta.lte('fecha_vencimiento', vence_antes);
  if (vence_despues) consulta = consulta.gte('fecha_vencimiento', vence_despues);

  if (orden === 'vencimiento') consulta = consulta.order('fecha_vencimiento', { ascending: true, nullsFirst: false });
  else if (orden === 'nombre') consulta = consulta.order('nombre', { ascending: true });
  else consulta = consulta.order('created_at', { ascending: false });
  consulta = consulta.order('id', { ascending: false });

  const { data, count, error } = await consulta.range(offset, offset + limit - 1);

  if (error?.code === 'PGRST103') return { documentos: [], paginacion: paginacion(null) }; // página fuera de rango
  if (error) throw Errores.baseDatos(error);

  const etiquetas = await cargarEtiquetas(userId, data.map((d) => d.id));
  return {
    documentos: data.map((d) => presentar(d, etiquetas.get(d.id), hoy)),
    paginacion: paginacion(count),
  };
}

// ---------- Escritura ----------

export async function crearDocumento(userId, datos, archivoSubido) {
  const { etiquetas = [], ...campos } = datos;
  const idsEtiquetas = [...new Set(etiquetas)];
  await validarEtiquetas(userId, idsEtiquetas);

  // 1) Sube a Drive y registra en `archivos` (ya limpia Drive si algo falla ahí).
  const archivo = await subirArchivo(userId, archivoSubido);
  let documentoId;

  try {
    // 2) Crea el documento y asigna etiquetas.
    const { data, error } = await supabase
      .from('documentos')
      .insert({ user_id: userId, archivo_id: archivo.id, ...sinUndefined(campos) })
      .select('id')
      .single();
    if (error) throw Errores.baseDatos(error);
    documentoId = data.id;

    await reemplazarEtiquetas(userId, documentoId, idsEtiquetas);
    return await obtenerDocumento(userId, documentoId);
  } catch (error) {
    // Compensación: no dejar documento ni archivo a medias.
    if (documentoId) {
      await supabase.from('documentos').delete().eq('id', documentoId).eq('user_id', userId);
    }
    await borrarArchivoYDrive(userId, archivo);
    throw error;
  }
}

export async function actualizarDocumento(userId, id, cambios) {
  const { etiquetas, ...campos } = cambios;
  const idsEtiquetas = etiquetas ? [...new Set(etiquetas)] : null;
  const camposLimpios = sinUndefined(campos);

  if (idsEtiquetas) await validarEtiquetas(userId, idsEtiquetas);

  if (Object.keys(camposLimpios).length) {
    const { data, error } = await supabase
      .from('documentos')
      .update(conFechaActualizacion(camposLimpios))
      .eq('id', id).eq('user_id', userId)
      .select('id').maybeSingle();

    if (error) throw Errores.baseDatos(error);
    if (!data) throw Errores.noEncontrado('Documento no encontrado.');
  } else {
    await obtenerDocumento(userId, id); // 404 si no existe
  }

  if (idsEtiquetas) await reemplazarEtiquetas(userId, id, idsEtiquetas);
  return obtenerDocumento(userId, id);
}

// Orden: documento -> registro de archivo -> Drive (el usuario puede borrar aunque Drive falle).
export async function eliminarDocumento(userId, id) {
  const { data: documento, error } = await supabase
    .from('documentos')
    .select('id,archivo:archivos(id,drive_file_id)')
    .eq('id', id).eq('user_id', userId)
    .maybeSingle();

  if (error) throw Errores.baseDatos(error);
  if (!documento) throw Errores.noEncontrado('Documento no encontrado.');

  const { error: errorBorrado } = await supabase
    .from('documentos').delete().eq('id', id).eq('user_id', userId);
  if (errorBorrado) throw Errores.baseDatos(errorBorrado);

  const driveEliminado = documento.archivo
    ? await borrarArchivoYDrive(userId, documento.archivo)
    : true;

  return { driveEliminado };
}

export async function abrirDocumento(userId, id) {
  const { data, error } = await supabase
    .from('documentos').select('archivo_id').eq('id', id).eq('user_id', userId).maybeSingle();

  if (error) throw Errores.baseDatos(error);
  if (!data) throw Errores.noEncontrado('Documento no encontrado.');

  return abrirArchivo(userId, String(data.archivo_id));
}