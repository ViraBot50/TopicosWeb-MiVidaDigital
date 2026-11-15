import { Router } from 'express';
import { obtenerSesion } from '../middleware/auth.js';
import { obtenerEstadoDrive } from '../services/driveService.js';

const router = Router();

// GET /api/session
// El frontend lo consulta al abrir, al volver a la pestaña y cada cierto tiempo
// para enterarse de si la sesión sigue activa. Siempre responde 200 con
// { autenticado: true|false } salvo que Supabase no esté disponible (503).
router.get('/', async (req, res) => {
  const { usuario, redDisponible } = await obtenerSesion(req, res);

  if (!usuario) {
    if (!redDisponible) {
      return res.status(503).json({
        codigo: 'AUTH_NO_DISPONIBLE',
        mensaje: 'No se pudo validar la sesión.',
      });
    }

    return res.json({ autenticado: false });
  }

  let drive = { conectado: false, correo: null };

  try {
    drive = await obtenerEstadoDrive(usuario.id);
  } catch (error) {
    console.error('No se pudo consultar el estado de Drive:', error.message);
  }

  const meta = usuario.user_metadata ?? {};

  return res.json({
    autenticado: true,
    usuario: {
      id: usuario.id,
      nombre: meta.full_name ?? meta.name ?? meta.user_name ?? usuario.email ?? 'Usuario',
      correo: usuario.email ?? null,
      foto: meta.avatar_url ?? meta.picture ?? null,
      proveedores: (usuario.identities ?? []).map((i) => i.provider),
    },
    drive,
  });
});

export default router;
