import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {pool} from '../src/db.js';
const child=spawn(process.execPath,['backend/src/index.js'],{env:{...process.env,PORT:'3098'},stdio:'ignore'});
let material;
const tag='PRUEBA-'+Date.now();
try{
 for(let i=0;i<50;i++){try{await fetch('http://127.0.0.1:3098/api/salud');break;}catch{await new Promise(r=>setTimeout(r,100));}}
 const [r]=await pool.execute(`INSERT INTO materiales(codigo,nombre,categoria,subcategoria,unidad,demanda_promedio,demanda_maxima,tiempo_entrega) VALUES (?,'Prueba temporal','Prueba','Prueba','unidad',1,2,1)`,[tag]);material=r.insertId;
 await pool.execute('INSERT INTO politicas_stock VALUES (?,1,1,20)',[material]);
 const base={tipo:'AJUSTE',material_id:material,usuario_id:1,cantidad:10,destino_id:1,documento:tag,motivo:'Prueba automatizada',lote:tag};
 const post=d=>fetch('http://127.0.0.1:3098/api/movimientos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});
 assert.equal((await post({...base,cantidad:-1})).status,400);
 assert.equal((await post(base)).status,201);
 assert.equal((await post({...base,tipo:'SALIDA',destino_id:null,origen_id:1,cantidad:11})).status,409);
 assert.equal((await post({...base,tipo:'TRASLADO',origen_id:1,destino_id:2,cantidad:3})).status,201);
 assert.equal((await post({...base,tipo:'SALIDA',origen_id:2,destino_id:null,cantidad:2})).status,201);
 const responses=await Promise.all([post({...base,tipo:'SALIDA',origen_id:1,destino_id:null,cantidad:5}),post({...base,tipo:'SALIDA',origen_id:1,destino_id:null,cantidad:5})]);
 assert.deepEqual(responses.map(r=>r.status).sort(),[201,409]);
 const [stocks]=await pool.execute('SELECT ubicacion_id,stock FROM stock_actual WHERE material_id=? ORDER BY ubicacion_id',[material]);
 assert.deepEqual(stocks.map(r=>Number(r.stock)),[2,1]);
 assert.equal((await post({...base,tipo:'ENTRADA'})).status,400);
 console.log('Pruebas aprobadas: ajuste, cantidad inválida, saldo insuficiente, traslado, salida, concurrencia, saldos finales y entrada sin OC.');
}finally{
 if(material){await pool.execute('DELETE FROM movimientos WHERE material_id=?',[material]);await pool.execute('DELETE FROM politicas_stock WHERE material_id=?',[material]);await pool.execute('DELETE FROM materiales WHERE id=?',[material]);}
 await pool.end();child.kill();
}
