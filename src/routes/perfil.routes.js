// src/routes/perfil.routes.js
import { Router } from 'express';
import * as controlador from '../controllers/perfil.controller.js';
import { requiereAutenticacion } from '../middleware/auth.js';
import { validar } from '../middleware/validar.js';
import { actualizarPerfilSchema } from '../schemas/perfil.schema.js';

const router = Router();
router.use(requiereAutenticacion());

router.get('/', controlador.obtener);
router.patch('/', validar(actualizarPerfilSchema), controlador.actualizar);

export default router;