import { z } from 'zod';

export const etiquetaSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.').max(40, 'Máximo 40 caracteres.'),
});