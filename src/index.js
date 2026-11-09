import { fileURLToPath } from 'node:url';
import express from 'express';
import { pool } from './db.js';

import { materialesRouter } from './materiales.js';
import { movimientosRouter } from './movimientos.js';
import { consultasRouter } from './consultas.js';
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

app.use('/api/materiales', materialesRouter);
app.use('/api/movimientos', movimientosRouter);
app.use('/api', consultasRouter);
app.get('/api/salud', async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ estado: 'ok', baseDeDatos: 'conectada' });
});
app.get('/api/materiales', async (req, res) => {
  const [rows] = await pool.query(`SELECT *,
    (demanda_maxima-demanda_promedio)*tiempo_entrega AS stock_seguridad,
    demanda_maxima*tiempo_entrega AS punto_reorden
    FROM materiales ORDER BY id`);
  res.json(rows);
});
app.get('/api/ubicaciones', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM ubicaciones ORDER BY id');
  res.json(rows);
});
app.get('/api/stock', async (req, res) => {
  const [rows] = await pool.query(`SELECT m.id AS material_id,m.codigo,m.nombre,m.unidad,
    u.id AS ubicacion_id,u.nombre AS ubicacion,COALESCE(s.stock,0) AS stock,
    p.stock_minimo,p.stock_maximo,m.demanda_maxima*m.tiempo_entrega AS punto_reorden
    FROM politicas_stock p JOIN materiales m ON m.id=p.material_id
    JOIN ubicaciones u ON u.id=p.ubicacion_id
    LEFT JOIN stock_actual s ON s.material_id=p.material_id AND s.ubicacion_id=p.ubicacion_id
    ORDER BY m.id,u.id`);
  res.json(rows);
});
app.get('/api/alertas/reorden', async (req, res) => {
  const [rows] = await pool.query(`SELECT a.*,u.nombre AS ubicacion
    FROM alertas_reorden a JOIN ubicaciones u ON u.id=a.ubicacion_id
    ORDER BY a.material_id,a.ubicacion_id`);
  res.json(rows);
});
app.use(express.static(fileURLToPath(new URL('../public', import.meta.url))));
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use((error, req, res, next) => {
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




