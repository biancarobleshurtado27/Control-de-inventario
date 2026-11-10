import {sequelize} from '../db.js';
import {Material,PoliticaStock,Ubicacion,Movimiento} from '../models/index.js';
const camposMaterial=['codigo','nombre','categoria','subcategoria','unidad','demanda_promedio','demanda_maxima','tiempo_entrega'];
const datosMaterial=d=>Object.fromEntries(camposMaterial.map(k=>[k,d[k]]));
export async function crearMaterial(req,res){
 const d=req.body,t=await sequelize.transaction();
 try{
  if(!await Ubicacion.findByPk(d.ubicacion_id,{transaction:t})){await t.rollback();return res.status(400).json({error:'La ubicación no existe.',campos:{ubicacion_id:'Selecciona una ubicación existente.'}});}
  const material=await Material.create(datosMaterial(d),{transaction:t});
  await PoliticaStock.create({material_id:material.id,ubicacion_id:d.ubicacion_id,stock_minimo:d.stock_minimo,stock_maximo:d.stock_maximo},{transaction:t});
  await t.commit();res.status(201).json({...material.toJSON(),stock:0,stock_seguridad:(d.demanda_maxima-d.demanda_promedio)*d.tiempo_entrega,punto_reorden:d.demanda_maxima*d.tiempo_entrega});
 }catch(e){if(!t.finished)await t.rollback();if(e.name==='SequelizeUniqueConstraintError')return res.status(409).json({error:'Ya existe un material con ese código.',campos:{codigo:'Ya existe un material con ese código.'}});throw e;}
}
export async function consultarMaterial(req,res){
 const material=await Material.findByPk(req.idValidado);if(!material)return res.status(404).json({error:'Material inexistente.'});
 const politicas=await PoliticaStock.findAll({where:{material_id:material.id},order:[['ubicacion_id','ASC']]});res.json({material,politicas});
}
export async function actualizarMaterial(req,res){
 const d=req.body,t=await sequelize.transaction();
 try{
  const material=await Material.findByPk(req.idValidado,{transaction:t,lock:t.LOCK.UPDATE});
  if(!material){await t.rollback();return res.status(404).json({error:'Material inexistente.'});}
  if(!await Ubicacion.findByPk(d.ubicacion_id,{transaction:t})){await t.rollback();return res.status(400).json({error:'Ubicación inexistente.',campos:{ubicacion_id:'Selecciona una ubicación existente.'}});}
  if(material.unidad!==d.unidad&&await Movimiento.findOne({where:{material_id:material.id},transaction:t})){await t.rollback();return res.status(409).json({error:'La unidad tiene movimientos registrados.',campos:{unidad:'Conserva la unidad para mantener la coherencia del historial.'}});}
  await material.update(datosMaterial(d),{transaction:t});
  await PoliticaStock.upsert({material_id:material.id,ubicacion_id:d.ubicacion_id,stock_minimo:d.stock_minimo,stock_maximo:d.stock_maximo},{transaction:t});
  await t.commit();res.json({id:material.id,mensaje:'Material y política actualizados.'});
 }catch(e){if(!t.finished)await t.rollback();if(e.name==='SequelizeUniqueConstraintError')return res.status(409).json({error:'Código de material repetido.',campos:{codigo:'Ya existe un material con ese código.'}});throw e;}
}
