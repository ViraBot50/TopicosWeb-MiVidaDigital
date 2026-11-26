import { Router } from 'express';
import { verificar } from '../controllers/health.controller.js';
import archivosRoutes from './archivos.routes.js';
import categoriasRoutes from './categorias.routes.js';
import documentosRoutes from './documentos.routes.js';
import driveRoutes from './drive.routes.js';
import etiquetasRoutes from './etiquetas.routes.js';
import perfilRoutes from './perfil.routes.js';
import sessionRoutes from './session.routes.js';

const api = Router();

api.get('/health', verificar);
api.use('/session', sessionRoutes);
api.use('/drive', driveRoutes);
api.use('/perfil', perfilRoutes);
api.use('/categorias', categoriasRoutes);
api.use('/etiquetas', etiquetasRoutes);
api.use('/documentos', documentosRoutes);
api.use('/archivos', archivosRoutes);

export default api;