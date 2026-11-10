import { pool } from '../db.js';

export async function registrarMovimiento(req,res) {
 const d=req.body;
 const origen=d.origen_id,destino=d.destino_id;
 const c=await pool.getConnection();
 try {
  await c.beginTransaction();
  const reject=async(message,status=400)=>{await c.rollback();return res.status(status).json({error:message});};
  // Serializa todos los movimientos del mismo material, incluso si no tiene saldo previo.
  const [m]=await c.execute('SELECT id FROM materiales WHERE id=? FOR UPDATE',[d.material_id]);
  if(!m.length) return await reject('Material inexistente.');
  const [u]=await c.execute('SELECT id FROM usuarios WHERE id=?',[d.usuario_id]);
  if(!u.length) return await reject('Usuario inexistente.');
  for(const ubicacion of [origen,destino].filter(v=>v!==null)) {
   const [rows]=await c.execute('SELECT id FROM ubicaciones WHERE id=?',[ubicacion]);
   if(!rows.length) return await reject('Ubicación inexistente.');
  }
  if(d.tipo==='ENTRADA') {
   const [oc]=await c.execute(`SELECT od.material_id,od.cantidad,o.estado,o.ubicacion_id FROM orden_detalles od JOIN ordenes o ON o.id=od.orden_id WHERE od.id=? FOR UPDATE`,[d.orden_detalle_id]);
   if(!oc.length||oc[0].material_id!==d.material_id||oc[0].ubicacion_id!==destino||oc[0].estado!=='APROBADA') return await reject('La línea de OC debe estar aprobada y coincidir con material y destino.');
   const [prev]=await c.execute('SELECT COALESCE(SUM(cantidad),0) AS total FROM movimientos WHERE orden_detalle_id=?',[d.orden_detalle_id]);
   if(Number(prev[0].total)+d.cantidad>Number(oc[0].cantidad)) return await reject('La recepción supera la cantidad de la OC.',409);
  }
  const [lotes]=await c.execute('SELECT tipo,orden_detalle_id FROM movimientos WHERE material_id=? AND lote=? AND origen_id IS NULL LIMIT 1',[d.material_id,d.lote.trim()]);
  if(origen===null&&lotes.length) {
   const previo=lotes[0];
   if(d.tipo==='ENTRADA'&&(previo.tipo!=='ENTRADA'||previo.orden_detalle_id!==d.orden_detalle_id)) return await reject('Ese lote pertenece a otro origen. Usa un lote nuevo.');
   if(d.tipo==='AJUSTE'&&previo.tipo==='ENTRADA') return await reject('Para aumentar mediante ajuste usa un lote nuevo y conserva el origen de compra.');
  }
  if(origen!==null) {
   const [saldo]=await c.execute(`SELECT COALESCE(SUM(CASE WHEN destino_id=? THEN cantidad ELSE 0 END),0)-COALESCE(SUM(CASE WHEN origen_id=? THEN cantidad ELSE 0 END),0) AS stock FROM movimientos WHERE material_id=? AND lote=?`,[origen,origen,d.material_id,d.lote.trim()]);
   if(Number(saldo[0].stock)<d.cantidad) return await reject('Stock insuficiente para ese lote y ubicación.',409);
  }
  // Una ubicación que recibe este material queda incluida en las consultas de stock.
  if(destino!==null) await c.execute(`INSERT IGNORE INTO politicas_stock(material_id,ubicacion_id,stock_minimo,stock_maximo) SELECT material_id,?,stock_minimo,stock_maximo FROM politicas_stock WHERE material_id=? ORDER BY ubicacion_id LIMIT 1`,[destino,d.material_id]);
  const [r]=await c.execute(`INSERT INTO movimientos(tipo,material_id,origen_id,destino_id,cantidad,usuario_id,documento,motivo,orden_detalle_id,lote) VALUES (?,?,?,?,?,?,?,?,?,?)`,[d.tipo,d.material_id,origen,destino,d.cantidad,d.usuario_id,d.documento.trim(),d.motivo.trim(),d.orden_detalle_id??null,d.lote.trim()]);
  await c.commit();res.status(201).json({id:r.insertId,mensaje:'Movimiento registrado.'});
 } catch(error){await c.rollback();throw error;} finally{c.release();}

}

export async function listarMovimientos(req,res) {
 const [rows]=await pool.query(`SELECT mv.*,m.nombre AS material,u.nombre AS usuario FROM movimientos mv JOIN materiales m ON m.id=mv.material_id JOIN usuarios u ON u.id=mv.usuario_id ORDER BY mv.fecha DESC,mv.id DESC LIMIT 200`);
 res.json(rows);

}
