import {sequelize} from '../db.js';
import {Orden,OrdenDetalle,Proveedor,Ubicacion,Material} from '../models/index.js';
export async function listarProveedores(req,res){res.json(await Proveedor.findAll({attributes:['id','nombre'],order:[['nombre','ASC']]}));}
export async function crearOrden(req,res){
 const d=req.body,t=await sequelize.transaction();
 try{
  if(!await Proveedor.findByPk(d.proveedor_id,{transaction:t})||!await Ubicacion.findByPk(d.ubicacion_id,{transaction:t})){await t.rollback();return res.status(400).json({error:'Proveedor o ubicación inexistente.'});}
  for(const l of d.detalles)if(!await Material.findByPk(l.material_id,{transaction:t})){await t.rollback();return res.status(400).json({error:'Material inexistente.'});}
  const orden=await Orden.create({numero:d.numero,fecha:d.fecha,proveedor_id:d.proveedor_id,ubicacion_id:d.ubicacion_id},{transaction:t});
  await OrdenDetalle.bulkCreate(d.detalles.map(l=>({orden_id:orden.id,material_id:l.material_id,cantidad:l.cantidad,precio_unitario:l.precio_unitario})),{transaction:t,validate:true});
  await t.commit();res.status(201).json({id:orden.id,numero:orden.numero,estado:orden.estado});
 }catch(e){if(!t.finished)await t.rollback();if(e.name==='SequelizeUniqueConstraintError')return res.status(409).json({error:'Ya existe ese número de OC.',campos:{numero:'Ya existe ese número de OC.'}});throw e;}
}
export async function aprobarOrden(req,res){
 const [affected]=await Orden.update({estado:'APROBADA'},{where:{id:req.idValidado,estado:'PENDIENTE'}});
 if(!affected)return res.status(409).json({error:'La orden no existe o ya no está pendiente.'});res.json({id:req.idValidado,estado:'APROBADA'});
}
