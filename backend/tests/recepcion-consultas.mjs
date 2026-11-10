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
 const get=async path=>(await fetch('http://127.0.0.1:3097/api'+path)).json();
 let line=(await get('/ordenes')).find(x=>x.id===d.insertId);assert.equal(line.estado_recepcion,'RECIBIDA PARCIALMENTE');assert.equal(Number(line.cantidad_pendiente),4);
 const update={codigo:tag,nombre:'Material editado',categoria:'Prueba',subcategoria:'Prueba',unidad:'unidad',demanda_promedio:1,demanda_maxima:3,tiempo_entrega:2,ubicacion_id:2,stock_minimo:4,stock_maximo:40};
 const put=body=>fetch(`http://127.0.0.1:3097/api/materiales/${material}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 assert.equal((await put(update)).status,200);let detail=await get(`/materiales/${material}`);assert.equal(detail.material.nombre,'Material editado');assert.equal(detail.politicas.length,2);assert.equal(Number(detail.politicas.find(p=>p.ubicacion_id===1).stock_minimo),1);
 const blocked=await put({...update,unidad:'saco'});assert.equal(blocked.status,409);assert.ok((await blocked.json()).campos.unidad);
 const invalid=await put({...update,stock_maximo:1});assert.equal(invalid.status,400);assert.ok((await invalid.json()).campos.stock_maximo);

 assert.equal((await post({...base,cantidad:5})).status,409);
 assert.equal((await post({...base,cantidad:4})).status,201);
 line=(await get('/ordenes')).find(x=>x.id===d.insertId);assert.equal(line.estado_recepcion,'RECIBIDA');assert.equal(Number(line.cantidad_pendiente),0);
 assert.equal((await post({...base,cantidad:1})).status,409);
 assert.equal((await post({...base,tipo:'TRASLADO',orden_detalle_id:null,origen_id:1,destino_id:2,cantidad:3})).status,201);
 const lots=await get('/movimientos/lotes');assert.equal(Number(lots.find(x=>x.material_id===material&&x.ubicacion_id===1).saldo),7);assert.equal(Number(lots.find(x=>x.material_id===material&&x.ubicacion_id===2).saldo),3);
 const filter=await get(`/movimientos?material_id=${material}&tipo=TRASLADO&ubicacion_id=2&documento=${tag}`);assert.equal(filter.length,1);assert.equal(filter[0].origen,'Bodega Central');assert.equal((await get(`/movimientos?material_id=${material}&desde=2000-01-01&hasta=2000-01-02`)).length,0);
 assert.equal((await fetch('http://127.0.0.1:3097/api/movimientos?desde=2026-02-30')).status,400);
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
