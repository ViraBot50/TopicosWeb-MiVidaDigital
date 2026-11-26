// src/middlewares/subida.js
import multer from 'multer';

export const TAMANO_MAXIMO_BYTES = 10 * 1024 * 1024;

// Un solo archivo en el campo "archivo", en memoria, máximo 10 MB.
export const subirUnArchivo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANO_MAXIMO_BYTES, files: 1 },
}).single('archivo');