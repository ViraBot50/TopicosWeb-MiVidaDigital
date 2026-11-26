// src/routes/categorias.routes.js
import { Router } from 'express';
import { requiereAutenticacion } from '../middleware/auth.js';
import { CATEGORIAS_DOCUMENTO } from '../utils/constantes.js';

const router = Router();
router.use(requiereAutenticacion());

router.get('/', (req, res) => res.json({ categorias: CATEGORIAS_DOCUMENTO }));

export default router;