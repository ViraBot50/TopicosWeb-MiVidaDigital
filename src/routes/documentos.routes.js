// src/routes/documentos.routes.js
import { Router } from 'express';
import * as controlador from '../controllers/documentos.controller.js';
import { requiereAutenticacion } from '../middleware/auth.js';
import { subirUnArchivo } from '../middleware/subida.js';
import { validar } from '../middleware/validar.js';
import {
  actualizarDocumentoSchema, crearDocumentoSchema, listarDocumentosSchema,
} from '../schemas/documentos.schema.js';

const router = Router();
router.use(requiereAutenticacion());

router.get('/', validar(listarDocumentosSchema, 'query'), controlador.listar);
// multer debe ir ANTES de validar: es quien llena req.body en multipart.
router.post('/', subirUnArchivo, validar(crearDocumentoSchema), controlador.crear);
router.get('/:id', controlador.detalle);
router.patch('/:id', validar(actualizarDocumentoSchema), controlador.actualizar);
router.get('/:id/descargar', controlador.descargar);
router.delete('/:id', controlador.eliminar);

export default router;