import { Router } from 'express';
import { pool } from './db.js';
export const materialesRouter = Router();
materialesRouter.post('/', async (req, res) => {
  const data = req.body;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return res.status(400).json({ error: 'Envía un objeto JSON.' });
  const limites = { codigo:40, nombre:150, categoria:100, subcategoria:100, unidad:20 };
  const limpio = {};
  for (const [campo,max] of Object.entries(limites)) {
    if (typeof data[campo] !== 'string' || !data[campo].trim() || data[campo].trim().length > max)
      return res.status(400).json({ error: `${campo} es obligatorio y admite hasta ${max} caracteres.` });
    limpio[campo] = data[campo].trim();
  }
  const decimal = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 999999999.999 && Math.abs(value*1000-Math.round(value*1000)) < 0.0001;
  if (!decimal(data.demanda_promedio) || !decimal(data.demanda_maxima) || data.demanda_maxima < data.demanda_promedio)
    return res.status(400).json({ error: 'Las demandas deben ser números no negativos con hasta tres decimales; la máxima debe ser mayor o igual a la promedio.' });
  if (!Number.isInteger(data.tiempo_entrega) || data.tiempo_entrega < 1 || data.tiempo_entrega > 3650)
    return res.status(400).json({ error: 'tiempo_entrega debe ser un entero entre 1 y 3650 días.' });
  if (!Number.isSafeInteger(data.ubicacion_id) || data.ubicacion_id < 1 || !decimal(data.stock_minimo) || !decimal(data.stock_maximo) || data.stock_maximo < data.stock_minimo)
    return res.status(400).json({ error: 'Indica una ubicación válida y límites de stock no negativos, con máximo mayor o igual al mínimo.' });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [ubicaciones] = await connection.execute('SELECT id FROM ubicaciones WHERE id=?',[data.ubicacion_id]);
    if (!ubicaciones.length) { await connection.rollback(); return res.status(400).json({ error: 'La ubicación no existe.' }); }
    const [result] = await connection.execute(`INSERT INTO materiales
      (codigo,nombre,categoria,subcategoria,unidad,demanda_promedio,demanda_maxima,tiempo_entrega)
      VALUES (?,?,?,?,?,?,?,?)`,[limpio.codigo,limpio.nombre,limpio.categoria,limpio.subcategoria,limpio.unidad,data.demanda_promedio,data.demanda_maxima,data.tiempo_entrega]);
    await connection.execute('INSERT INTO politicas_stock (material_id,ubicacion_id,stock_minimo,stock_maximo) VALUES (?,?,?,?)',[result.insertId,data.ubicacion_id,data.stock_minimo,data.stock_maximo]);
    await connection.commit();
    res.status(201).json({ id:result.insertId,...limpio,demanda_promedio:data.demanda_promedio,demanda_maxima:data.demanda_maxima,tiempo_entrega:data.tiempo_entrega,stock:0,stock_seguridad:(data.demanda_maxima-data.demanda_promedio)*data.tiempo_entrega,punto_reorden:data.demanda_maxima*data.tiempo_entrega });
  } catch(error) {
    await connection.rollback();
    if(error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ya existe un material con ese código.' });
    throw error;
  } finally { connection.release(); }
});
