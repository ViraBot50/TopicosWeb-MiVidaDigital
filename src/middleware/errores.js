export function noEncontrado(req, res) {
  res.status(404).json({ mensaje: 'Ruta no encontrada.' });
}

export function manejarErrores(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ mensaje: 'El archivo supera el tamaño máximo de 10 MB.' });
  }

  console.error('Error no controlado:', error?.message);
  return res.status(500).json({ mensaje: 'Ocurrió un error inesperado.' });
}
