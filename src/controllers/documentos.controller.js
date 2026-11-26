// src/controllers/documentos.controller.js
import { AppError, Errores } from '../errors/AppError.js';
import * as documentosService from '../services/documentos.service.js';
import { TIPOS_DOCUMENTO_PERMITIDOS } from '../utils/constantes.js';
import { idNumerico } from '../utils/validaciones.js';

export async function listar(req, res) {
  res.json(await documentosService.listarDocumentos(req.user.id, req.datos.query));
}

export async function detalle(req, res) {
  const documento = await documentosService.obtenerDocumento(req.user.id, idNumerico(req.params.id));
  res.json({ documento });
}

export async function crear(req, res) {
  if (!req.file) throw Errores.validacion('Debes adjuntar un archivo.');

  // Validación mínima por tipo declarado (la verificación real por firma queda pendiente).
  if (!TIPOS_DOCUMENTO_PERMITIDOS.includes(req.file.mimetype)) {
    throw new AppError(415, 'TIPO_NO_PERMITIDO', 'Solo se permiten archivos PDF, JPG o PNG.');
  }

  const documento = await documentosService.crearDocumento(req.user.id, req.datos.body, req.file);
  res.status(201).json({ mensaje: 'Documento creado correctamente.', documento });
}

export async function actualizar(req, res) {
  const documento = await documentosService.actualizarDocumento(
    req.user.id, idNumerico(req.params.id), req.datos.body
  );
  res.json({ mensaje: 'Documento actualizado correctamente.', documento });
}

export async function descargar(req, res, next) {
  const { nombre, mimeType, stream } = await documentosService.abrirDocumento(
    req.user.id, idNumerico(req.params.id)
  );

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(nombre)}`);

  stream.on('error', (error) => {
    console.error('Error al descargar desde Drive:', error.message);
    next(error);
  });
  stream.pipe(res);
}

export async function eliminar(req, res) {
  const { driveEliminado } = await documentosService.eliminarDocumento(
    req.user.id, idNumerico(req.params.id)
  );

  res.json({
    mensaje: driveEliminado
      ? 'Documento eliminado correctamente.'
      : 'Documento eliminado. No se pudo borrar el archivo de tu Drive; puedes quitarlo manualmente.',
    driveEliminado,
  });
}