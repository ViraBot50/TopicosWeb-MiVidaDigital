import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Cliente con clave secreta: SOLO para tablas desde el backend.
// Nunca se usa para identificar al usuario de una petición.
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export default supabase;
