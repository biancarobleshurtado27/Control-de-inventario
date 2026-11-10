import { pool } from '../db.js';

export async function registrarMovimiento(req,res) {
 const d=req.body;
 const origen=d.origen_id,destino=d.destino_id;
 const c=await pool.getConnection();
 try {
  await c.beginTransaction();
  const reject=async(message,status=400,fields=[])=>{await c.rollback();return res.status(status).json({error:message,campos:Object.fromEntries(fields.map(f=>[f,message]))});};
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
   if(!oc.length||oc[0].material_id!==d.material_id||oc[0].ubicacion_id!==destino||oc[0].estado!=='APROBADA') return await reject('La línea de OC debe estar aprobada y coincidir con material y destino.',400,['orden_detalle_id']);
   const [prev]=await c.execute('SELECT COALESCE(SUM(cantidad),0) AS total FROM movimientos WHERE orden_detalle_id=?',[d.orden_detalle_id]);
   if(Number(prev[0].total)+d.cantidad>Number(oc[0].cantidad)) return await reject('La recepción supera la cantidad de la OC.',409,['cantidad']);
  }
  const [lotes]=await c.execute('SELECT tipo,orden_detalle_id FROM movimientos WHERE material_id=? AND lote=? AND origen_id IS NULL LIMIT 1',[d.material_id,d.lote.trim()]);
  if(origen===null&&lotes.length) {
   const previo=lotes[0];
   if(d.tipo==='ENTRADA'&&(previo.tipo!=='ENTRADA'||previo.orden_detalle_id!==d.orden_detalle_id)) return await reject('Ese lote pertenece a otro origen. Usa un lote nuevo.');
   if(d.tipo==='AJUSTE'&&previo.tipo==='ENTRADA') return await reject('Para aumentar mediante ajuste usa un lote nuevo y conserva el origen de compra.');
  }
  if(origen!==null) {
   const [saldo]=await c.execute(`SELECT COALESCE(SUM(CASE WHEN destino_id=? THEN cantidad ELSE 0 END),0)-COALESCE(SUM(CASE WHEN origen_id=? THEN cantidad ELSE 0 END),0) AS stock FROM movimientos WHERE material_id=? AND lote=?`,[origen,origen,d.material_id,d.lote.trim()]);
   if(Number(saldo[0].stock)<d.cantidad) return await reject('Stock insuficiente para ese lote y ubicación.',409,['cantidad','lote']);
  }
  // Una ubicación que recibe este material queda incluida en las consultas de stock.
  if(destino!==null) await c.execute(`INSERT IGNORE INTO politicas_stock(material_id,ubicacion_id,stock_minimo,stock_maximo) SELECT material_id,?,stock_minimo,stock_maximo FROM politicas_stock WHERE material_id=? ORDER BY ubicacion_id LIMIT 1`,[destino,d.material_id]);
  const [r]=await c.execute(`INSERT INTO movimientos(tipo,material_id,origen_id,destino_id,cantidad,usuario_id,documento,motivo,orden_detalle_id,lote) VALUES (?,?,?,?,?,?,?,?,?,?)`,[d.tipo,d.material_id,origen,destino,d.cantidad,d.usuario_id,d.documento.trim(),d.motivo.trim(),d.orden_detalle_id??null,d.lote.trim()]);
  await c.commit();res.status(201).json({id:r.insertId,mensaje:'Movimiento registrado.'});
 } catch(error){await c.rollback();throw error;} finally{c.release();}

}


export async function listarMovimientos(req,res) {
 const filtros=[],valores=[];
 const add=(sql,value)=>{filtros.push(sql);valores.push(value);};
 for(const key of ['material_id','ubicacion_id'])if(req.query[key]){
  if(typeof req.query[key]!=='string'||!/^\d+$/.test(req.query[key])||Number(req.query[key])<1||Number(req.query[key])>2147483647)return res.status(400).json({error:'Filtro de ubicación o material inválido.'});
  if(key==='material_id')add('mv.material_id=?',Number(req.query[key]));else{filtros.push('(mv.origen_id=? OR mv.destino_id=?)');valores.push(Number(req.query[key]),Number(req.query[key]));}
 }
 for(const key of ['desde','hasta'])if(req.query[key]){
  const value=req.query[key];
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||Number.isNaN(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)return res.status(400).json({error:'Fecha de filtro inválida.'});
  add(key==='desde'?'mv.fecha>=?':'mv.fecha<DATE_ADD(?,INTERVAL 1 DAY)',value);
 }
 if(req.query.desde&&req.query.hasta&&req.query.desde>req.query.hasta)return res.status(400).json({error:'La fecha inicial debe preceder a la final.'});
 if(req.query.tipo){if(!['ENTRADA','SALIDA','TRASLADO','AJUSTE'].includes(req.query.tipo))return res.status(400).json({error:'Tipo de filtro inválido.'});add('mv.tipo=?',req.query.tipo);}
 if(req.query.documento){if(typeof req.query.documento!=='string'||req.query.documento.length>100)return res.status(400).json({error:'Documento inválido.'});add('LOCATE(?,mv.documento)>0',req.query.documento);}
 const [rows]=await pool.execute(`SELECT mv.*,m.nombre AS material,u.nombre AS usuario,ori.nombre AS origen,dest.nombre AS destino FROM movimientos mv JOIN materiales m ON m.id=mv.material_id JOIN usuarios u ON u.id=mv.usuario_id LEFT JOIN ubicaciones ori ON ori.id=mv.origen_id LEFT JOIN ubicaciones dest ON dest.id=mv.destino_id ${filtros.length?'WHERE '+filtros.join(' AND '):''} ORDER BY mv.fecha DESC,mv.id DESC LIMIT 200`,valores);
 res.json(rows);
}
export async function listarLotes(req,res){
 const [rows]=await pool.query(`SELECT material_id,ubicacion_id,lote,SUM(delta) AS saldo FROM (
 SELECT material_id,destino_id AS ubicacion_id,lote,cantidad AS delta FROM movimientos WHERE destino_id IS NOT NULL
 UNION ALL SELECT material_id,origen_id,lote,-cantidad FROM movimientos WHERE origen_id IS NOT NULL
 ) s GROUP BY material_id,ubicacion_id,lote HAVING SUM(delta)>0 ORDER BY material_id,ubicacion_id,lote`);
 res.json(rows);
}
