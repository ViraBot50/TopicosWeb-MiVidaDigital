import { z } from 'zod';

export const vacioANull = (v) => (typeof v === 'string' && v.trim() === '' ? null : v);
export const vacioAUndefined = (v) => (v === '' ? undefined : v);

export const fechaIso = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa el formato AAAA-MM-DD.')
  .refine((v) => {
    const fecha = new Date(`${v}T00:00:00Z`);
    return !Number.isNaN(fecha.getTime()) && fecha.toISOString().startsWith(v);
  }, 'La fecha no es válida.');

// Los formularios envían '' en campos vacíos: se tratan como null.
export const fechaOpcional = z.preprocess(vacioANull, fechaIso.nullish());

export const textoOpcional = (max) =>
  z.preprocess(vacioANull, z.string().trim().max(max, `Máximo ${max} caracteres.`).nullish());

// Para query params: '' equivale a "no enviado".
export const opcional = (esquema) => z.preprocess(vacioAUndefined, esquema.optional());

// Lista de ids: acepta arreglo JSON o texto '[1,2]' (multipart).
export const listaIds = z.preprocess(
  (v) => {
    if (v === undefined || v === '') return undefined;
    if (typeof v === 'string') {
      try {
        return JSON.parse(v);
      } catch {
        return v;
      }
    }
    return v;
  },
  z
    .array(z.coerce.number().int().positive(), { message: 'Las etiquetas deben ser una lista de ids.' })
    .max(20, 'Máximo 20 etiquetas.')
    .optional()
);