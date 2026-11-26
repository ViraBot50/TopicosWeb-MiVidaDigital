import { z } from 'zod';
import { vacioANull, textoOpcional } from './comunes.js';

const zonaValida = (zona) => {
  try {
    new Intl.DateTimeFormat('en', { timeZone: zona });
    return true;
  } catch {
    return false;
  }
};

export const actualizarPerfilSchema = z
  .object({
    nombre: textoOpcional(80),
    apellidos: textoOpcional(120),
    telefono: z.preprocess(
      vacioANull,
      z.string().trim().regex(/^[+\d][\d\s()-]{6,19}$/, 'El teléfono no es válido.').nullish()
    ),
    zona_horaria: z.string().refine(zonaValida, 'La zona horaria no es válida.').optional(),
    moneda: z.enum(['MXN'], { message: 'Moneda no soportada.' }).optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'No hay cambios que guardar.' });