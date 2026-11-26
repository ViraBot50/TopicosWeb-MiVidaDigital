// src/controllers/perfil.controller.js
import * as perfilService from '../services/perfil.service.js';

export async function obtener(req, res) {
  res.json({ perfil: await perfilService.obtenerPerfil(req.user.id) });
}

export async function actualizar(req, res) {
  const perfil = await perfilService.actualizarPerfil(req.user.id, req.datos.body);
  res.json({ mensaje: 'Perfil actualizado correctamente.', perfil });
}