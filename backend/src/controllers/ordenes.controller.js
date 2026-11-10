import { pool } from '../db.js';

export async function listarProveedores(req,res) {const [rows]=await pool.query('SELECT id,nombre FROM proveedores ORDER BY nombre');res.json(rows);
}

export async function crearOrden(req,res) {
 const d=req.body;
 const c=await pool.getConnection();try{
 await c.beginTransaction();
 const [p]=await c.execute('SELECT id FROM proveedores WHERE id=?',[d.proveedor_id]);const [u]=await c.execute('SELECT id FROM ubicaciones WHERE id=?',[d.ubicacion_id]);
 if(!p.length||!u.length){await c.rollback();return res.status(400).json({error:'Proveedor o ubicación inexistente.'});}
 for(const l of d.detalles){const [m]=await c.execute('SELECT id FROM materiales WHERE id=?',[l.material_id]);if(!m.length){await c.rollback();return res.status(400).json({error:'Material inexistente.'});}}
 const [r]=await c.execute('INSERT INTO ordenes(numero,fecha,proveedor_id,ubicacion_id) VALUES (?,?,?,?)',[d.numero.trim(),d.fecha,d.proveedor_id,d.ubicacion_id]);
 for(const l of d.detalles) await c.execute('INSERT INTO orden_detalles(orden_id,material_id,cantidad,precio_unitario) VALUES (?,?,?,?)',[r.insertId,l.material_id,l.cantidad,l.precio_unitario]);
 await c.commit();res.status(201).json({id:r.insertId,numero:d.numero.trim(),estado:'PENDIENTE'});
 }catch(e){await c.rollback();if(e.code==='ER_DUP_ENTRY')return res.status(409).json({error:'Ya existe ese número de OC.'});throw e;}finally{c.release();}

}

export async function aprobarOrden(req,res) {
 const id=req.idValidado;
 const [r]=await pool.execute("UPDATE ordenes SET estado='APROBADA' WHERE id=? AND estado='PENDIENTE'",[id]);
 if(!r.affectedRows)return res.status(409).json({error:'La orden no existe o ya no está pendiente.'});
 res.json({id,estado:'APROBADA'});

}

