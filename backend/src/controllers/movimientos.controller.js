import {sequelize,consultarSQL} from '../db.js';
import {Material,Ubicacion,Usuario,Movimiento,PoliticaStock} from '../models/index.js';
import {QueryTypes} from 'sequelize';

export async function registrarMovimiento(req,res) {
 const d=req.body;
 const origen=d.origen_id,destino=d.destino_id;
 const c=await sequelize.transaction();
 const ejecutar=async(sql,params=[])=>[await sequelize.query(sql,{replacements:params,transaction:c,type:QueryTypes.SELECT})];
 try {

  const reject=async(message,status=400,fields=[])=>{await c.rollback();return res.status(status).json({error:message,campos:Object.fromEntries(fields.map(f=>[f,message]))});};
  // Serializa todos los movimientos del mismo material, incluso si no tiene saldo previo.
  const material=await Material.findByPk(d.material_id,{attributes:['id'],transaction:c,lock:c.LOCK.UPDATE});const m=material?[material]:[];
  if(!m.length) return await reject('Material inexistente.');
  const user=await Usuario.findByPk(d.usuario_id,{attributes:['id'],transaction:c});const u=user?[user]:[];
  if(!u.length) return await reject('Usuario inexistente.');
  for(const ubicacion of [origen,destino].filter(v=>v!==null)) {
   const location=await Ubicacion.findByPk(ubicacion,{attributes:['id'],transaction:c});const rows=location?[location]:[];
   if(!rows.length) return await reject('Ubicación inexistente.');
  }
  if(d.tipo==='ENTRADA') {
   const [oc]=await ejecutar(`SELECT od.material_id,od.cantidad,o.estado,o.ubicacion_id FROM orden_detalles od JOIN ordenes o ON o.id=od.orden_id WHERE od.id=? FOR UPDATE`,[d.orden_detalle_id]);
   if(!oc.length||oc[0].material_id!==d.material_id||oc[0].ubicacion_id!==destino||oc[0].estado!=='APROBADA') return await reject('La línea de OC debe estar aprobada y coincidir con material y destino.',400,['orden_detalle_id']);
   const [prev]=await ejecutar('SELECT COALESCE(SUM(cantidad),0) AS total FROM movimientos WHERE orden_detalle_id=?',[d.orden_detalle_id]);
   if(Number(prev[0].total)+d.cantidad>Number(oc[0].cantidad)) return await reject('La recepción supera la cantidad de la OC.',409,['cantidad']);
  }
  const [lotes]=await ejecutar('SELECT tipo,orden_detalle_id FROM movimientos WHERE material_id=? AND lote=? AND origen_id IS NULL LIMIT 1',[d.material_id,d.lote.trim()]);
  if(origen===null&&lotes.length) {
   const previo=lotes[0];
   if(d.tipo==='ENTRADA'&&(previo.tipo!=='ENTRADA'||previo.orden_detalle_id!==d.orden_detalle_id)) return await reject('Ese lote pertenece a otro origen. Usa un lote nuevo.');
   if(d.tipo==='AJUSTE'&&previo.tipo==='ENTRADA') return await reject('Para aumentar mediante ajuste usa un lote nuevo y conserva el origen de compra.');
  }
  if(origen!==null) {
   const [saldo]=await ejecutar(`SELECT COALESCE(SUM(CASE WHEN destino_id=? THEN cantidad ELSE 0 END),0)-COALESCE(SUM(CASE WHEN origen_id=? THEN cantidad ELSE 0 END),0) AS stock FROM movimientos WHERE material_id=? AND lote=?`,[origen,origen,d.material_id,d.lote.trim()]);
   if(Number(saldo[0].stock)<d.cantidad) return await reject('Stock insuficiente para ese lote y ubicación.',409,['cantidad','lote']);
  }
  // Una ubicación que recibe este material queda incluida en las consultas de stock.
  if(destino!==null){
   const existe=await PoliticaStock.findOne({where:{material_id:d.material_id,ubicacion_id:destino},transaction:c});
   if(!existe){const base=await PoliticaStock.findOne({where:{material_id:d.material_id},order:[['ubicacion_id','ASC']],transaction:c});if(base)await PoliticaStock.create({material_id:d.material_id,ubicacion_id:destino,stock_minimo:base.stock_minimo,stock_maximo:base.stock_maximo},{transaction:c});}
  }
  const r=await Movimiento.create({tipo:d.tipo,material_id:d.material_id,origen_id:origen,destino_id:destino,cantidad:d.cantidad,usuario_id:d.usuario_id,documento:d.documento,motivo:d.motivo,orden_detalle_id:d.orden_detalle_id??null,lote:d.lote},{transaction:c});
  await c.commit();res.status(201).json({id:r.id,mensaje:'Movimiento registrado.'});
 } catch(error){if(!c.finished)await c.rollback();throw error;}

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
 const [rows]=await consultarSQL(`SELECT mv.*,m.nombre AS material,u.nombre AS usuario,ori.nombre AS origen,dest.nombre AS destino FROM movimientos mv JOIN materiales m ON m.id=mv.material_id JOIN usuarios u ON u.id=mv.usuario_id LEFT JOIN ubicaciones ori ON ori.id=mv.origen_id LEFT JOIN ubicaciones dest ON dest.id=mv.destino_id ${filtros.length?'WHERE '+filtros.join(' AND '):''} ORDER BY mv.fecha DESC,mv.id DESC LIMIT 200`,valores);
 res.json(rows);
}
export async function listarLotes(req,res){
 const [rows]=await consultarSQL(`SELECT material_id,ubicacion_id,lote,SUM(delta) AS saldo FROM (
 SELECT material_id,destino_id AS ubicacion_id,lote,cantidad AS delta FROM movimientos WHERE destino_id IS NOT NULL
 UNION ALL SELECT material_id,origen_id,lote,-cantidad FROM movimientos WHERE origen_id IS NOT NULL
 ) s GROUP BY material_id,ubicacion_id,lote HAVING SUM(delta)>0 ORDER BY material_id,ubicacion_id,lote`);
 res.json(rows);
}
