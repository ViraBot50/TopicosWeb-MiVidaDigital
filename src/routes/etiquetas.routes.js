// src/routes/etiquetas.routes.js
import { Router } from 'express';
import * as controlador from '../controllers/etiquetas.controller.js';
import { requiereAutenticacion } from '../middleware/auth.js';
import { validar } from '../middleware/validar.js';
import { etiquetaSchema } from '../schemas/etiquetas.schema.js';

const router = Router();
router.use(requiereAutenticacion());

router.get('/', controlador.listar);
router.post('/', validar(etiquetaSchema), controlador.crear);
router.patch('/:id', validar(etiquetaSchema), controlador.actualizar);
router.delete('/:id', controlador.eliminar);

export default router;