import supabase from '../config/supabase.js';
import { Errores } from '../errors/AppError.js';
import { escaparLike } from '../utils/db.js';

const COLUMNAS = 'id,nombre,created_at';

// La restricción única distingue mayúsculas; aquí se evita "Seguro" y "seguro".
async function asegurarNombreLibre(userId, nombre, exceptoId) {
  let consulta = supabase
    .from('etiquetas')
    .select('id')
    .eq('user_id', userId)
    .ilike('nombre', escaparLike(nombre))
    .limit(1);
  if (exceptoId) consulta = consulta.neq('id', exceptoId);

  const { data, error } = await consulta;
  if (error) throw Errores.baseDatos(error);
  if (data.length) throw Errores.conflicto('Ya tienes una etiqueta con ese nombre.');
}

export async function listarEtiquetas(userId) {
  const { data, error } = await supabase
    .from('etiquetas')
    .select(COLUMNAS)
    .eq('user_id', userId)
    .order('nombre');

  if (error) throw Errores.baseDatos(error);
  return data;
}

export async function crearEtiqueta(userId, { nombre }) {
  await asegurarNombreLibre(userId, nombre);

  const { data, error } = await supabase
    .from('etiquetas')
    .insert({ user_id: userId, nombre })
    .select(COLUMNAS)
    .single();

  if (error) throw Errores.baseDatos(error);
  return data;
}

export async function actualizarEtiqueta(userId, id, { nombre }) {
  await asegurarNombreLibre(userId, nombre, id);

  const { data, error } = await supabase
    .from('etiquetas')
    .update({ nombre })
    .eq('id', id)
    .eq('user_id', userId)
    .select(COLUMNAS)
    .maybeSingle();

  if (error) throw Errores.baseDatos(error);
  if (!data) throw Errores.noEncontrado('Etiqueta no encontrada.');
  return data;
}

export async function eliminarEtiqueta(userId, id) {
  const { data, error } = await supabase
    .from('etiquetas')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select('id');

  if (error) throw Errores.baseDatos(error);
  if (!data.length) throw Errores.noEncontrado('Etiqueta no encontrada.');
}