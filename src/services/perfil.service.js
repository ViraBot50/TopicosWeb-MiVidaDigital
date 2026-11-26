import supabase from '../config/supabase.js';
import { Errores } from '../errors/AppError.js';
import { ZONA_HORARIA_DEFECTO } from '../utils/constantes.js';
import { conFechaActualizacion, sinUndefined } from '../utils/db.js';

const COLUMNAS = 'nombre,apellidos,telefono,avatar_url,zona_horaria,moneda,created_at,updated_at';

export async function obtenerPerfil(userId) {
  const consultar = () =>
    supabase.from('perfiles').select(COLUMNAS).eq('user_id', userId).maybeSingle();

  let { data, error } = await consultar();
  if (error) throw Errores.baseDatos(error);

  if (!data) {
    // Usuario anterior al trigger de perfiles: se crea el perfil vacío.
    const { error: errorCreacion } = await supabase
      .from('perfiles')
      .upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true });
    if (errorCreacion) throw Errores.baseDatos(errorCreacion);

    ({ data, error } = await consultar());
    if (error || !data) throw Errores.baseDatos(error);
  }

  return data;
}

export async function actualizarPerfil(userId, cambios) {
  await obtenerPerfil(userId); // garantiza que exista

  const { data, error } = await supabase
    .from('perfiles')
    .update(conFechaActualizacion(sinUndefined(cambios)))
    .eq('user_id', userId)
    .select(COLUMNAS)
    .single();

  if (error) throw Errores.baseDatos(error);
  return data;
}

// Si falla la consulta se usa la zona por defecto: no debe romper el listado.
export async function obtenerZonaHoraria(userId) {
  const { data } = await supabase
    .from('perfiles')
    .select('zona_horaria')
    .eq('user_id', userId)
    .maybeSingle();

  return data?.zona_horaria ?? ZONA_HORARIA_DEFECTO;
}