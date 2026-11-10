import { pool } from '../db.js';

export async function comprobarSalud(req, res) {
  await pool.query('SELECT 1');
  res.json({ estado: 'ok', baseDeDatos: 'conectada' });
}

export async function listarMateriales(req, res) {
  const [rows] = await pool.query(`SELECT *,
    (demanda_maxima-demanda_promedio)*tiempo_entrega AS stock_seguridad,
    demanda_maxima*tiempo_entrega AS punto_reorden
    FROM materiales ORDER BY id`);
  res.json(rows);
}

export async function listarUbicaciones(req, res) {
  const [rows] = await pool.query('SELECT * FROM ubicaciones ORDER BY id');
  res.json(rows);
}

export async function consultarStock(req, res) {
  const [rows] = await pool.query(`SELECT m.id AS material_id,m.codigo,m.nombre,m.unidad,
    u.id AS ubicacion_id,u.nombre AS ubicacion,COALESCE(s.stock,0) AS stock,
    p.stock_minimo,p.stock_maximo,m.demanda_maxima*m.tiempo_entrega AS punto_reorden
    FROM politicas_stock p JOIN materiales m ON m.id=p.material_id
    JOIN ubicaciones u ON u.id=p.ubicacion_id
    LEFT JOIN stock_actual s ON s.material_id=p.material_id AND s.ubicacion_id=p.ubicacion_id
    ORDER BY m.id,u.id`);
  res.json(rows);
}

export async function listarAlertas(req, res) {
  const [rows] = await pool.query(`SELECT a.*,u.nombre AS ubicacion
    FROM alertas_reorden a JOIN ubicaciones u ON u.id=a.ubicacion_id
    ORDER BY a.material_id,a.ubicacion_id`);
  res.json(rows);
}
