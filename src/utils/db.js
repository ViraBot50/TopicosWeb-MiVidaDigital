// El esquema v5 no tiene triggers de updated_at: hay que enviarlo en cada UPDATE.
// Aplica a: documentos, movimientos_financieros, reglas_impuestos,
// recordatorios, tareas y fichas_informacion.
export const conFechaActualizacion = (campos) => ({
  ...campos,
  updated_at: new Date().toISOString(),
});

// Uso: supabase.from('tareas').update(conFechaActualizacion({ estado })).eq('id', id).eq('user_id', userId)

// Escapa % _ \ para usar texto del usuario dentro de ILIKE.
export const escaparLike = (texto) => texto.replace(/[\\%_]/g, '\\$&');

// Quita las claves con valor undefined (campos que no vinieron en la petición).
export const sinUndefined = (objeto) =>
  Object.fromEntries(Object.entries(objeto).filter(([, valor]) => valor !== undefined));