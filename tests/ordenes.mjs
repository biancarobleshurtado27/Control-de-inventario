import {spawn} from 'node:child_process';import assert from 'node:assert/strict';import {pool} from '../src/db.js';
const child=spawn(process.execPath,['src/index.js'],{env:{...process.env,PORT:'3095'},stdio:'ignore'});let orden;const tag='TEST-ORDEN-'+Date.now();
const post=(path,data)=>fetch('http://127.0.0.1:3095/api'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
try{for(let i=0;i<50;i++){try{await fetch('http://127.0.0.1:3095/api/salud');break;}catch{await new Promise(r=>setTimeout(r,100));}}
const data={numero:tag,fecha:'2026-11-09',proveedor_id:1,ubicacion_id:1,detalles:[{material_id:1,cantidad:2,precio_unitario:6300}]};
assert.equal((await post('/ordenes',{...data,fecha:'2026-02-30'})).status,400);
assert.equal((await post('/ordenes',{...data,detalles:[{material_id:1,cantidad:-1,precio_unitario:1}]})).status,400);
const r=await post('/ordenes',data);assert.equal(r.status,201);const created=await r.json();orden=created.id;assert.equal(created.estado,'PENDIENTE');
assert.equal((await post('/ordenes',data)).status,409);
const [lineas]=await pool.execute('SELECT id FROM orden_detalles WHERE orden_id=?',[orden]);
const mov={tipo:'ENTRADA',material_id:1,usuario_id:1,cantidad:2,destino_id:1,orden_detalle_id:lineas[0].id,documento:tag,motivo:'Prueba flujo OC',lote:tag};
assert.equal((await post('/movimientos',mov)).status,400);
assert.equal((await post(`/ordenes/${orden}/aprobar`,{})).status,200);
assert.equal((await post(`/ordenes/${orden}/aprobar`,{})).status,409);
assert.equal((await post('/movimientos',mov)).status,201);
const listado=await(await fetch('http://127.0.0.1:3095/api/ordenes')).json();assert.ok(listado.some(r=>r.orden_id===orden&&r.estado==='APROBADA'));
console.log('Flujo OC aprobado: validación, creación pendiente, duplicado, bloqueo de recepción, aprobación y recepción válida.');
}finally{if(orden){await pool.execute('DELETE FROM movimientos WHERE orden_detalle_id IN (SELECT id FROM orden_detalles WHERE orden_id=?)',[orden]);await pool.execute('DELETE FROM orden_detalles WHERE orden_id=?',[orden]);await pool.execute('DELETE FROM ordenes WHERE id=?',[orden]);}await pool.end();child.kill();}
