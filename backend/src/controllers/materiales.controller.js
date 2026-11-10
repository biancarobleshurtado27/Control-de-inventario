import { pool } from '../db.js';

export async function crearMaterial(req, res) {
  const data=req.body;
  const limpio=Object.fromEntries(['codigo','nombre','categoria','subcategoria','unidad'].map(campo=>[campo,data[campo]]));
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

}
