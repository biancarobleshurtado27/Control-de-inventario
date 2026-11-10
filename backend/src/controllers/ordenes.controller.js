import { pool } from '../db.js';

export async function listarProveedores(req,res) {const [rows]=await pool.query('SELECT id,nombre FROM proveedores ORDER BY nombre');res.json(rows);
}

export async function crearOrden(req,res) {
 const d=req.body;const validId=v=>Number.isSafeInteger(v)&&v>0&&v<=2147483647;
 if(!d||typeof d.numero!=='string'||!d.numero.trim()||d.numero.trim().length>40||!validId(d.proveedor_id)||!validId(d.ubicacion_id)||!Array.isArray(d.detalles)||!d.detalles.length||d.detalles.length>100) return res.status(400).json({error:'Indica número, proveedor, ubicación y entre 1 y 100 líneas.'});
 if(typeof d.fecha!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(d.fecha)||Number(d.fecha.slice(0,4))<1000||Number.isNaN(Date.parse(d.fecha+'T00:00:00Z'))||new Date(d.fecha+'T00:00:00Z').toISOString().slice(0,10)!==d.fecha) return res.status(400).json({error:'Fecha inválida. Usa AAAA-MM-DD.'});
 const decimal=(v,max,scale)=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=max&&Math.abs(v*scale-Math.round(v*scale))<0.0001;
 if(d.detalles.some(l=>!l||!validId(l.material_id)||!decimal(l.cantidad,999999999.999,1000)||l.cantidad===0||!decimal(l.precio_unitario,999999999999.99,100))) return res.status(400).json({error:'Cada línea requiere material, cantidad positiva (3 decimales) y precio no negativo (2 decimales).'});
 if(new Set(d.detalles.map(l=>l.material_id)).size!==d.detalles.length) return res.status(400).json({error:'Agrupa cada material en una sola línea.'});
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
 const id=Number(req.params.id);if(!Number.isSafeInteger(id)||id<1||id>2147483647)return res.status(400).json({error:'Identificador inválido.'});
 const [r]=await pool.execute("UPDATE ordenes SET estado='APROBADA' WHERE id=? AND estado='PENDIENTE'",[id]);
 if(!r.affectedRows)return res.status(409).json({error:'La orden no existe o ya no está pendiente.'});
 res.json({id,estado:'APROBADA'});

}

