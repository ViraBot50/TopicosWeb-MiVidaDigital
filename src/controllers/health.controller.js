// health.controller.js
import supabase from '../config/supabase.js';

export async function verificar(req, res) {
  const { error } = await supabase.from('archivos').select('id').limit(1);

  if (error) {
    console.error('Error de Supabase:', error.message);
    return res.status(503).json({ servidor: 'funcionando', supabase: 'error' });
  }

  return res.json({ servidor: 'funcionando', supabase: 'conectado' });
}