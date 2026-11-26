// src/controllers/etiquetas.controller.js
import * as etiquetasService from '../services/etiquetas.service.js';
import { idNumerico } from '../utils/validaciones.js';

export async function listar(req, res) {
  res.json({ etiquetas: await etiquetasService.listarEtiquetas(req.user.id) });
}

export async function crear(req, res) {
  const etiqueta = await etiquetasService.crearEtiqueta(req.user.id, req.datos.body);
  res.status(201).json({ mensaje: 'Etiqueta creada correctamente.', etiqueta });
}

export async function actualizar(req, res) {
  const etiqueta = await etiquetasService.actualizarEtiqueta(
    req.user.id, idNumerico(req.params.id), req.datos.body
  );
  res.json({ mensaje: 'Etiqueta actualizada correctamente.', etiqueta });
}

export async function eliminar(req, res) {
  await etiquetasService.eliminarEtiqueta(req.user.id, idNumerico(req.params.id));
  res.json({ mensaje: 'Etiqueta eliminada correctamente.' });
}