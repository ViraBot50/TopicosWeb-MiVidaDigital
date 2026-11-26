import multer from 'multer';
import { AppError } from '../errors/AppError.js';

export function noEncontrado(req, res) {
  res.status(404).json({ codigo: 'RUTA_NO_ENCONTRADA', mensaje: 'Ruta no encontrada.' });
}

// Convierte cualquier error (propio, de multer, de body-parser o inesperado)
// en un AppError. Lo inesperado se responde como 500 genérico.
function normalizar(error) {
  if (error instanceof AppError) return error;

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return new AppError(413, 'ARCHIVO_MUY_GRANDE', 'El archivo supera el tamaño máximo de 10 MB.');
    }
    return new AppError(400, 'ARCHIVO_INVALIDO', 'El archivo enviado no es válido.');
  }

  if (error?.type === 'entity.parse.failed') {
    return new AppError(400, 'JSON_INVALIDO', 'El cuerpo de la petición no es un JSON válido.');
  }
  if (error?.type === 'entity.too.large') {
    return new AppError(413, 'CUERPO_MUY_GRANDE', 'La petición es demasiado grande.');
  }

  return new AppError(500, 'ERROR_INTERNO', 'Ocurrió un error inesperado.', { cause: error });
}

// Debe ser el ÚLTIMO middleware (Express 5 reenvía aquí los errores de handlers async).
export function manejarErrores(error, req, res, next) {
  if (res.headersSent) return next(error);

  const e = normalizar(error);

  if (e.status >= 500) {
    console.error(`[${req.method} ${req.originalUrl}] ${e.codigo}:`, (e.cause ?? e).message);
  }

  return res.status(e.status).json({
    codigo: e.codigo,
    mensaje: e.message,
    ...(e.detalles ? { detalles: e.detalles } : {}),
  });
}