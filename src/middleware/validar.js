import { Errores } from '../errors/AppError.js';

// Valida req[origen] con un esquema de zod. El resultado queda en req.datos[origen]
// (req.query es de solo lectura en Express 5, por eso no se sobrescribe).
export const validar = (esquema, origen = 'body') => (req, res, next) => {
  const resultado = esquema.safeParse({ ...(req[origen] ?? {}) });

  if (!resultado.success) {
    throw Errores.validacion(
      'Los datos enviados no son válidos.',
      resultado.error.issues.map((i) => ({ campo: i.path.join('.'), mensaje: i.message }))
    );
  }

  req.datos = { ...req.datos, [origen]: resultado.data };
  next();
};