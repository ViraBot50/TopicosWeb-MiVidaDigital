// src/utils/validaciones.js
import { Errores } from '../errors/AppError.js';

// Los ids de las tablas son bigint: solo dígitos (evita errores de Postgres 22P02).
export function idNumerico(valor) {
  if (!/^[1-9]\d{0,17}$/.test(String(valor))) {
    throw Errores.validacion('El identificador no es válido.');
  }
  return String(valor);
}