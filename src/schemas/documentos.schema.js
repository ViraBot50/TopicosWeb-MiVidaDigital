import { z } from 'zod';
import { SLUGS_CATEGORIAS } from '../utils/constantes.js';
import {
  fechaIso, fechaOpcional, listaIds, opcional, textoOpcional, vacioAUndefined,
} from './comunes.js';

const categoria = z.enum(SLUGS_CATEGORIAS, { message: 'Categoría no válida.' });
const nombre = z.string().trim().min(1, 'El nombre es obligatorio.').max(150, 'Máximo 150 caracteres.');

const fechasCoherentes = (o) =>
  !o.fecha_emision || !o.fecha_vencimiento || o.fecha_vencimiento >= o.fecha_emision;
const errorFechas = {
  message: 'La fecha de vencimiento no puede ser anterior a la de emisión.',
  path: ['fecha_vencimiento'],
};

const camposDocumento = {
  descripcion: textoOpcional(1000),
  fecha_emision: fechaOpcional,
  fecha_vencimiento: fechaOpcional,
  institucion_emisora: textoOpcional(150),
  etiquetas: listaIds,
};

export const crearDocumentoSchema = z
  .object({ nombre, categoria, ...camposDocumento })
  .refine(fechasCoherentes, errorFechas);

export const actualizarDocumentoSchema = z
  .object({ nombre: nombre.optional(), categoria: categoria.optional(), ...camposDocumento })
  .refine(fechasCoherentes, errorFechas)
  .refine((o) => Object.keys(o).length > 0, { message: 'No hay cambios que guardar.' });

export const listarDocumentosSchema = z.object({
  q: opcional(z.string().trim().max(100)),
  categoria: opcional(categoria),
  etiqueta: opcional(z.coerce.number().int().positive()),
  estado: opcional(z.enum(['vigente', 'por_vencer', 'vencido', 'sin_vencimiento'])),
  vence_antes: opcional(fechaIso),
  vence_despues: opcional(fechaIso),
  orden: z.preprocess(vacioAUndefined, z.enum(['recientes', 'vencimiento', 'nombre']).default('recientes')),
  limit: z.preprocess(vacioAUndefined, z.coerce.number().int().min(1).max(100).default(20)),
  offset: z.preprocess(vacioAUndefined, z.coerce.number().int().min(0).default(0)),
});