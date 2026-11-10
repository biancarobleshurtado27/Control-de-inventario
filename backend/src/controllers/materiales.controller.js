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
    if(error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ya existe un material con ese código.', campos:{codigo:'Ya existe un material con ese código.'} });
    throw error;
  } finally { connection.release(); }

}

// La política pertenece a una ubicación; el catálogo y la unidad son globales.
export async function consultarMaterial(req,res) {
 const [rows]=await pool.execute('SELECT * FROM materiales WHERE id=?',[req.idValidado]);
 if(!rows.length)return res.status(404).json({error:'Material inexistente.'});
 const [politicas]=await pool.execute('SELECT * FROM politicas_stock WHERE material_id=?',[req.idValidado]);
 res.json({material:rows[0],politicas});
}
export async function actualizarMaterial(req,res) {
 const d=req.body,c=await pool.getConnection();
 try {
  await c.beginTransaction();
  const [rows]=await c.execute('SELECT unidad FROM materiales WHERE id=? FOR UPDATE',[req.idValidado]);
  if(!rows.length){await c.rollback();return res.status(404).json({error:'Material inexistente.'});}
  const [u]=await c.execute('SELECT id FROM ubicaciones WHERE id=?',[d.ubicacion_id]);
  if(!u.length){await c.rollback();return res.status(400).json({error:'Ubicación inexistente.',campos:{ubicacion_id:'Selecciona una ubicación existente.'}});}
  if(rows[0].unidad!==d.unidad){
   const [mov]=await c.execute('SELECT id FROM movimientos WHERE material_id=? LIMIT 1',[req.idValidado]);
   if(mov.length){await c.rollback();return res.status(409).json({error:'La unidad tiene movimientos registrados.',campos:{unidad:'Conserva la unidad para mantener la coherencia del historial.'}});}
  }
  await c.execute('UPDATE materiales SET codigo=?,nombre=?,categoria=?,subcategoria=?,unidad=?,demanda_promedio=?,demanda_maxima=?,tiempo_entrega=? WHERE id=?',[d.codigo,d.nombre,d.categoria,d.subcategoria,d.unidad,d.demanda_promedio,d.demanda_maxima,d.tiempo_entrega,req.idValidado]);
  await c.execute('INSERT INTO politicas_stock(material_id,ubicacion_id,stock_minimo,stock_maximo) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE stock_minimo=?,stock_maximo=?',[req.idValidado,d.ubicacion_id,d.stock_minimo,d.stock_maximo,d.stock_minimo,d.stock_maximo]);
  await c.commit();res.json({id:req.idValidado,mensaje:'Material y política actualizados.'});
 }catch(error){await c.rollback();if(error.code==='ER_DUP_ENTRY')return res.status(409).json({error:'Código de material repetido.',campos:{codigo:'Ya existe un material con ese código.'}});throw error;}finally{c.release();}
}
