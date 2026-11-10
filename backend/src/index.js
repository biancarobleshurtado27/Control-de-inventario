import { fileURLToPath } from 'node:url';
import express from 'express';
import { pool } from './db.js';

import { materialesRouter } from './routes/materiales.routes.js';
import { movimientosRouter } from './routes/movimientos.routes.js';
import { consultasRouter } from './routes/consultas.routes.js';
import { ordenesRouter } from './routes/ordenes.routes.js';
import { sistemaRouter } from './routes/sistema.routes.js';
const app = express();
app.disable('x-powered-by');
app.use((req,res,next)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'");
  next();
});
app.use(express.json({ limit: '100kb' }));

app.use('/api/materiales', materialesRouter);
app.use('/api/movimientos', movimientosRouter);
app.use('/api', consultasRouter);
app.use('/api', ordenesRouter);
app.use('/api', sistemaRouter);





app.use(express.static(fileURLToPath(new URL('../../frontend', import.meta.url))));
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use((error, req, res, next) => {
  if (error.type === 'entity.too.large') return res.status(413).json({ error: 'La solicitud supera el máximo de 100 KB.' });
  if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'El JSON enviado no es válido.' });
  console.error('Error de solicitud:', error.code || error.name);
  res.status(500).json({ error: 'No se pudo completar la consulta. Revisa la conexión y la configuración de MySQL.' });
});

const port = Number(process.env.PORT || 3000);
const server = app.listen(port, '127.0.0.1', () => console.log(`API disponible en http://localhost:${port}`));
async function shutdown() {
  server.close(async () => { await pool.end(); process.exit(0); });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
