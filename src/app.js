import express from 'express';
import cors from 'cors';

import { env } from './config/env.js';
import supabase from './config/supabase.js';
import { sinCache, validarOrigen } from './middleware/seguridad.js';
import { manejarErrores, noEncontrado } from './middleware/errores.js';

import authRoutes from './routes/auth.routes.js';
import sessionRoutes from './routes/session.routes.js';
import driveRoutes from './routes/drive.routes.js';
import archivosRoutes from './routes/archivos.routes.js';

const app = express();

app.set('trust proxy', 1);

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(sinCache);
app.use(validarOrigen);

app.get('/', (req, res) => {
  res.json({ mensaje: 'API del prototipo Drive funcionando' });
});

app.get('/api/health', async (req, res) => {
  const { error } = await supabase.from('archivos').select('id').limit(1);

  if (error) {
    console.error('Error de Supabase:', error.message);
    return res.status(500).json({ servidor: 'funcionando', supabase: 'error' });
  }

  return res.json({ servidor: 'funcionando', supabase: 'conectado' });
});

app.use('/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/drive', driveRoutes);
app.use('/api/archivos', archivosRoutes);

app.use(noEncontrado);
app.use(manejarErrores);

export default app;
