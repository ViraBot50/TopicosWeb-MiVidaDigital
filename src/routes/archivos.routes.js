import { Router } from 'express';
import multer from 'multer';
import { Readable } from 'node:stream';

import supabase from '../config/supabase.js';
import { requiereAutenticacion } from '../middleware/auth.js';
import {
  obtenerClienteDrive,
  responderSiDriveDesconectado,
} from '../services/driveService.js';
import { obtenerOCrearCarpeta } from '../utils/driveFolder.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.use(requiereAutenticacion());

// GET /api/archivos → solo los archivos del usuario autenticado.
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('archivos')
    .select('id,nombre_archivo,drive_file_id,fecha_carga')
    .eq('user_id', req.user.id)
    .order('fecha_carga', { ascending: false });

  if (error) {
    console.error('Error al consultar archivos:', error.message);
    return res.status(500).json({ mensaje: 'No se pudieron consultar los archivos.' });
  }

  return res.json({ archivos: data });
});

// POST /api/archivos/upload  (multipart, campo "archivo")
router.post('/upload', upload.single('archivo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ mensaje: 'Debes seleccionar un archivo.' });
  }

  let drive;
  let archivoDriveId;

  try {
    drive = await obtenerClienteDrive(req.user.id);

    const carpetaId = await obtenerOCrearCarpeta(drive);

    const resultado = await drive.files.create({
      requestBody: {
        name: req.file.originalname,
        mimeType: req.file.mimetype,
        parents: [carpetaId],
      },
      media: {
        mimeType: req.file.mimetype,
        body: Readable.from(req.file.buffer),
      },
      fields: 'id,name,mimeType',
    });

    archivoDriveId = resultado.data.id;

    const { data, error } = await supabase
      .from('archivos')
      .insert({
        user_id: req.user.id,
        nombre_archivo: resultado.data.name,
        drive_file_id: archivoDriveId,
      })
      .select('id,nombre_archivo,drive_file_id,fecha_carga')
      .single();

    if (error) throw new Error(`Supabase: ${error.message}`);

    return res.status(201).json({ mensaje: 'Archivo subido correctamente.', archivo: data });
  } catch (error) {
    if (await responderSiDriveDesconectado(error, req.user.id, res)) return;

    console.error('Error al subir el archivo:', error.message);

    // Evitar un archivo en Drive sin registro en Supabase.
    if (drive && archivoDriveId) {
      try {
        await drive.files.delete({ fileId: archivoDriveId });
      } catch (errorDrive) {
        console.error('No se pudo limpiar el archivo de Drive:', errorDrive.message);
      }
    }

    return res.status(500).json({ mensaje: 'No se pudo subir el archivo.' });
  }
});

// Busca un archivo SOLO si pertenece al usuario autenticado.
async function buscarArchivoDelUsuario(id, userId) {
  const { data } = await supabase
    .from('archivos')
    .select('id,nombre_archivo,drive_file_id')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  return data;
}

// GET /api/archivos/:id/descargar
router.get('/:id/descargar', async (req, res) => {
  try {
    const archivo = await buscarArchivoDelUsuario(req.params.id, req.user.id);

    if (!archivo) {
      return res.status(404).json({
        mensaje: 'Archivo no encontrado o no tienes permiso para descargarlo.',
      });
    }

    const drive = await obtenerClienteDrive(req.user.id);

    const metadatos = await drive.files.get({
      fileId: archivo.drive_file_id,
      fields: 'id,name,mimeType',
    });

    const resultado = await drive.files.get(
      { fileId: archivo.drive_file_id, alt: 'media' },
      { responseType: 'stream' }
    );

    res.setHeader('Content-Type', metadatos.data.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(archivo.nombre_archivo)}`
    );

    resultado.data.on('error', (error) => {
      console.error('Error al descargar desde Drive:', error.message);
      res.destroy(error);
    });

    resultado.data.pipe(res);
  } catch (error) {
    if (res.headersSent) return res.destroy(error);
    if (await responderSiDriveDesconectado(error, req.user.id, res)) return;

    if (Number(error.code) === 404) {
      return res.status(404).json({
        mensaje:
          'El archivo ya no existe en Google Drive o no está disponible. Puedes actualizar la lista de archivos.',
      });
    }

    console.error('Error al descargar el archivo:', error.message);
    return res.status(500).json({ mensaje: 'No se pudo descargar el archivo. Inténtalo de nuevo.' });
  }
});

// DELETE /api/archivos/:id → borra de Drive y de Supabase.
router.delete('/:id', async (req, res) => {
  try {
    const archivo = await buscarArchivoDelUsuario(req.params.id, req.user.id);

    if (!archivo) {
      return res.status(404).json({
        mensaje: 'Archivo no encontrado o no tienes permiso para eliminarlo.',
      });
    }

    const drive = await obtenerClienteDrive(req.user.id);
    let yaNoExisteEnDrive = false;

    try {
      await drive.files.delete({ fileId: archivo.drive_file_id });
    } catch (errorDrive) {
      // Si ya no está en Drive, igual limpiamos su registro.
      if (Number(errorDrive.code) === 404) yaNoExisteEnDrive = true;
      else throw errorDrive;
    }

    const { error } = await supabase
      .from('archivos')
      .delete()
      .eq('id', archivo.id)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Se eliminó de Drive, pero falló Supabase:', error.message);
      return res.status(500).json({
        mensaje: 'El archivo se eliminó de Drive, pero no se pudo eliminar su registro.',
      });
    }

    return res.json({
      mensaje: yaNoExisteEnDrive
        ? 'El archivo ya no estaba en Drive. Se eliminó su registro de la aplicación.'
        : 'Archivo eliminado correctamente.',
    });
  } catch (error) {
    if (await responderSiDriveDesconectado(error, req.user.id, res)) return;

    console.error('Error al eliminar el archivo:', error.message);
    return res.status(500).json({ mensaje: 'No se pudo eliminar el archivo de Google Drive.' });
  }
});

export default router;
