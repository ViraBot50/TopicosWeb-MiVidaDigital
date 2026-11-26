import { Readable } from 'node:stream';
import supabase from '../config/supabase.js';
import { AppError, Errores } from '../errors/AppError.js';
import { obtenerOCrearCarpeta } from '../utils/driveFolder.js';
import { obtenerClienteDrive, traducirErrorDrive } from './driveService.js';

const COLUMNAS = 'id,nombre_archivo,drive_file_id,fecha_carga';

export async function listarArchivos(userId) {
  const { data, error } = await supabase
    .from('archivos')
    .select(COLUMNAS)
    .eq('user_id', userId)
    .order('fecha_carga', { ascending: false });

  if (error) throw Errores.baseDatos(error);
  return data;
}

// Busca un archivo SOLO si pertenece al usuario; si no, 404 (no revela si existe).
async function buscarArchivoDelUsuario(id, userId) {
  const { data, error } = await supabase
    .from('archivos')
    .select('id,nombre_archivo,drive_file_id')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw Errores.baseDatos(error);
  if (!data) {
    throw Errores.noEncontrado('Archivo no encontrado o no tienes permiso para acceder a él.');
  }
  return data;
}

// documentos.archivo_id es ON DELETE RESTRICT: un archivo ligado a un documento
// solo se elimina eliminando el documento. Se comprueba ANTES de tocar Drive.
async function asegurarArchivoSinDocumento(archivoId, userId) {
  const { data, error } = await supabase
    .from('documentos')
    .select('id')
    .eq('archivo_id', archivoId)
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (error) throw Errores.baseDatos(error);
  if (data) {
    throw Errores.conflicto('Este archivo pertenece a un documento. Elimina el documento para borrarlo.');
  }
}

export async function subirArchivo(userId, archivo) {
  let drive;
  let driveFileId;

  try {
    drive = await obtenerClienteDrive(userId);
    const carpetaId = await obtenerOCrearCarpeta(drive);

    const resultado = await drive.files.create({
      requestBody: { name: archivo.originalname, mimeType: archivo.mimetype, parents: [carpetaId] },
      media: { mimeType: archivo.mimetype, body: Readable.from(archivo.buffer) },
      fields: 'id,name,mimeType',
    });
    driveFileId = resultado.data.id;

    const { data, error } = await supabase
      .from('archivos')
      .insert({ user_id: userId, nombre_archivo: resultado.data.name, drive_file_id: driveFileId })
      .select(COLUMNAS)
      .single();

    if (error) throw Errores.baseDatos(error);
    return data;
  } catch (error) {
    // Evitar un archivo en Drive sin registro en Supabase.
    if (drive && driveFileId) {
      try {
        await drive.files.delete({ fileId: driveFileId });
      } catch (errorLimpieza) {
        console.error('No se pudo limpiar el archivo de Drive:', errorLimpieza.message);
      }
    }
    throw await traducirErrorDrive(error, userId);
  }
}

// Devuelve el stream del archivo para que el controlador lo envíe.
export async function abrirArchivo(userId, id) {
  const archivo = await buscarArchivoDelUsuario(id, userId);

  try {
    const drive = await obtenerClienteDrive(userId);
    const metadatos = await drive.files.get({ fileId: archivo.drive_file_id, fields: 'id,name,mimeType' });
    const resultado = await drive.files.get(
      { fileId: archivo.drive_file_id, alt: 'media' },
      { responseType: 'stream' }
    );

    return {
      nombre: archivo.nombre_archivo,
      mimeType: metadatos.data.mimeType || 'application/octet-stream',
      stream: resultado.data,
    };
  } catch (error) {
    throw await traducirErrorDrive(error, userId);
  }
}

// Borra de Drive y de Supabase. Devuelve { yaNoExistiaEnDrive }.
export async function eliminarArchivo(userId, id) {
  const archivo = await buscarArchivoDelUsuario(id, userId);
  await asegurarArchivoSinDocumento(archivo.id, userId);
  let yaNoExistiaEnDrive = false;

  try {
    const drive = await obtenerClienteDrive(userId);
    try {
      await drive.files.delete({ fileId: archivo.drive_file_id });
    } catch (errorDrive) {
      if (Number(errorDrive.code) === 404) yaNoExistiaEnDrive = true;
      else throw errorDrive;
    }
  } catch (error) {
    throw await traducirErrorDrive(error, userId);
  }

  const { error } = await supabase.from('archivos').delete().eq('id', archivo.id).eq('user_id', userId);

  if (error) {
    throw new AppError(
      500,
      'REGISTRO_NO_ELIMINADO',
      'El archivo se eliminó de Drive, pero no se pudo eliminar su registro.',
      { cause: error }
    );
  }

  return { yaNoExistiaEnDrive };
}