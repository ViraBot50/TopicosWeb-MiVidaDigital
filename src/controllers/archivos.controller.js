//archivos.controller.js
import { Errores } from '../errors/AppError.js';
import * as archivosService from '../services/archivos.service.js';
import { idNumerico } from '../utils/validaciones.js';

export async function listar(req, res) {
  const archivos = await archivosService.listarArchivos(req.user.id);
  res.json({ archivos });
}

export async function subir(req, res) {
  if (!req.file) throw Errores.validacion('Debes seleccionar un archivo.');

  const archivo = await archivosService.subirArchivo(req.user.id, req.file);
  res.status(201).json({ mensaje: 'Archivo subido correctamente.', archivo });
}

export async function descargar(req, res, next) {
  const { nombre, mimeType, stream } = await archivosService.abrirArchivo(
    req.user.id,
    idNumerico(req.params.id)
  );

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(nombre)}`);

  stream.on('error', (error) => {
    console.error('Error al descargar desde Drive:', error.message);
    next(error); // si ya se enviaron cabeceras, el manejador cierra la conexión
  });
  stream.pipe(res);
}

export async function eliminar(req, res) {
  const { yaNoExistiaEnDrive } = await archivosService.eliminarArchivo(
    req.user.id,
    idNumerico(req.params.id)
  );

  res.json({
    mensaje: yaNoExistiaEnDrive
      ? 'El archivo ya no estaba en Drive. Se eliminó su registro de la aplicación.'
      : 'Archivo eliminado correctamente.',
  });
}