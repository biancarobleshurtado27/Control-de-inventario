import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {pool} from '../src/db.js';
const child=spawn(process.execPath,['backend/src/index.js'],{env:{...process.env,PORT:'3097'},stdio:'ignore'});
const tag='TEST-OC-'+Date.now();let material,orden;
try{
 for(let i=0;i<50;i++){try{await fetch('http://127.0.0.1:3097/api/salud');break;}catch{await new Promise(r=>setTimeout(r,100));}}
 const [m]=await pool.execute(`INSERT INTO materiales(codigo,nombre,categoria,subcategoria,unidad,demanda_promedio,demanda_maxima,tiempo_entrega) VALUES (?,'Prueba OC','Prueba','Prueba','unidad',1,2,1)`,[tag]);material=m.insertId;
 await pool.execute('INSERT INTO politicas_stock VALUES (?,1,1,100)',[material]);
 const [o]=await pool.execute("INSERT INTO ordenes(numero,fecha,proveedor_id,ubicacion_id,estado) VALUES (?,CURDATE(),1,1,'APROBADA')",[tag]);orden=o.insertId;
 const [d]=await pool.execute('INSERT INTO orden_detalles(orden_id,material_id,cantidad,precio_unitario) VALUES (?,?,10,100)',[orden,material]);
 const base={tipo:'ENTRADA',material_id:material,usuario_id:1,cantidad:6,destino_id:1,orden_detalle_id:d.insertId,documento:tag,motivo:'Prueba de recepción',lote:tag};
 const post=body=>fetch('http://127.0.0.1:3097/api/movimientos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 assert.equal((await post(base)).status,201);
 assert.equal((await post({...base,cantidad:5})).status,409);
 assert.equal((await post({...base,cantidad:4})).status,201);
 assert.equal((await post({...base,cantidad:1})).status,409);
 assert.equal((await post({...base,tipo:'TRASLADO',orden_detalle_id:null,origen_id:1,destino_id:2,cantidad:3})).status,201);
 const tr=await (await fetch(`http://127.0.0.1:3097/api/materiales/${material}/trazabilidad`)).json();
 assert.equal(tr.movimientos.length,3);assert.ok(tr.movimientos.every(r=>r.ordenes_origen_lote===tag));
 const dup=await (await fetch('http://127.0.0.1:3097/api/ordenes/posibles-duplicados')).json();
 const pares=dup.posibles_duplicados.map(r=>[r.orden_1,r.orden_2].join('/'));
 assert.ok(pares.includes('OC-1041/OC-1042'));assert.ok(pares.includes('OC-1050/OC-1053'));
 assert.equal((await fetch('http://127.0.0.1:3097/api/materiales/abc/trazabilidad')).status,400);
 assert.equal((await fetch('http://127.0.0.1:3097/api/materiales/2147483647/trazabilidad')).status,404);
 console.log('Aprobado: recepción parcial y completa, rechazo de excesos, traslado con OC de origen, pares duplicados esperados e identificadores inválidos.');
}finally{
 if(material) await pool.execute('DELETE FROM movimientos WHERE material_id=?',[material]);
 if(orden){await pool.execute('DELETE FROM orden_detalles WHERE orden_id=?',[orden]);await pool.execute('DELETE FROM ordenes WHERE id=?',[orden]);}
 if(material){await pool.execute('DELETE FROM politicas_stock WHERE material_id=?',[material]);await pool.execute('DELETE FROM materiales WHERE id=?',[material]);}
 await pool.end();child.kill();
}
