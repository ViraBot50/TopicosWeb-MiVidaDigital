// Error controlado de la aplicación. El manejador central lo convierte en
// una respuesta JSON { codigo, mensaje, detalles? } sin filtrar datos internos.
export class AppError extends Error {
  constructor(status, codigo, mensaje, { detalles, cause } = {}) {
    super(mensaje, { cause });
    this.name = 'AppError';
    this.status = status;
    this.codigo = codigo;
    this.detalles = detalles;
  }
}

// Fábrica de los errores más comunes (los códigos son parte del contrato de la API).
export const Errores = {
  validacion: (mensaje = 'Datos inválidos.', detalles) =>
    new AppError(400, 'VALIDACION', mensaje, { detalles }),
  noAutenticado: (mensaje = 'Tu sesión no está activa. Inicia sesión.') =>
    new AppError(401, 'NO_AUTENTICADO', mensaje),
  prohibido: (mensaje = 'No tienes permiso para esta acción.') =>
    new AppError(403, 'PROHIBIDO', mensaje),
  noEncontrado: (mensaje = 'Recurso no encontrado.') =>
    new AppError(404, 'NO_ENCONTRADO', mensaje),
  conflicto: (mensaje = 'El recurso ya existe.') =>
    new AppError(409, 'CONFLICTO', mensaje),
  // Traduce errores de Postgres (SQLSTATE) a respuestas útiles; lo demás es un 500 genérico.
  baseDatos: (cause) => {
    switch (cause?.code) {
      case '23505': // unique_violation
        return new AppError(409, 'CONFLICTO', 'Ya existe un registro con esos datos.', { cause });
      case '23503': // foreign_key_violation
        return new AppError(
          409,
          'CONFLICTO',
          'El registro referenciado no existe o está en uso por otros datos.',
          { cause }
        );
      case '23514': // check_violation
      case '23502': // not_null_violation
      case '22P02': // texto con formato inválido (p. ej. id no numérico)
      case '22007': // fecha inválida
      case 'P0001': // RAISE EXCEPTION del trigger de archivos
        return new AppError(400, 'VALIDACION', 'Los datos enviados no son válidos.', { cause });
      default: // incluye 42501 (permission denied): se registra en el log del servidor
        return new AppError(500, 'ERROR_BD', 'No se pudo completar la operación.', { cause });
    }
  },
};