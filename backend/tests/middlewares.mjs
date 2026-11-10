import express from 'express';
import assert from 'node:assert/strict';
import {exigirJson} from '../src/middlewares/exigirJson.js';
import {validarId} from '../src/middlewares/validarId.js';
import {validarMaterial} from '../src/middlewares/validarMaterial.js';
import {validarMovimiento} from '../src/middlewares/validarMovimiento.js';
import {validarOrden} from '../src/middlewares/validarOrden.js';
// Pruebas HTTP aisladas: no requieren ni modifican la base de datos.
const app=express();app.use(express.json());let llamadas=0;
const controller=(req,res)=>{llamadas++;res.json({body:req.body,id:req.idValidado});};
app.post('/materiales',exigirJson,validarMaterial,controller);
app.post('/movimientos',exigirJson,validarMovimiento,controller);
app.post('/ordenes',exigirJson,validarOrden,controller);
app.get('/recurso/:id',validarId,controller);
const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
const base=`http://127.0.0.1:${server.address().port}`;let casos=0;
async function verificar(path,body,status,headers={'Content-Type':'application/json'}){
 const antes=llamadas;const r=await fetch(base+path,{method:'POST',headers,body:JSON.stringify(body)});assert.equal(r.status,status,path);if(status!==200)assert.equal(llamadas,antes,'Los datos inválidos no deben llegar al controlador');casos++;return r.json();
}
try{
 const material={codigo:'  TEST-01  ',nombre:' Material ',categoria:'Construcción',subcategoria:'Prueba',unidad:'unidad',demanda_promedio:2,demanda_maxima:3,tiempo_entrega:4,ubicacion_id:1,stock_minimo:1,stock_maximo:20};
 await verificar('/materiales',material,415,{'Content-Type':'text/plain'});
 await verificar('/materiales',[],400);await verificar('/materiales',{},400);
 await verificar('/materiales',{...material,nombre:'   '},400);
 await verificar('/materiales',{...material,demanda_maxima:1},400);
 await verificar('/materiales',{...material,tiempo_entrega:0},400);
 await verificar('/materiales',{...material,stock_maximo:0},400);
 const limpio=await verificar('/materiales',material,200);assert.equal(limpio.body.codigo,'TEST-01');assert.equal(limpio.body.nombre,'Material');
 const movimiento={tipo:'TRASLADO',material_id:1,usuario_id:1,cantidad:2,origen_id:1,destino_id:2,documento:' VALE-1 ',motivo:' Prueba ',lote:' LOTE-1 '};
 await verificar('/movimientos',{...movimiento,tipo:'OTRO'},400);
 await verificar('/movimientos',{...movimiento,destino_id:1},400);
 await verificar('/movimientos',{...movimiento,cantidad:-1},400);
 await verificar('/movimientos',{...movimiento,cantidad:0.0001},400);
 await verificar('/movimientos',{...movimiento,tipo:'ENTRADA',origen_id:null},400);
 assert.equal((await verificar('/movimientos',movimiento,200)).body.lote,'LOTE-1');
 const orden={numero:' OC-TEST ',fecha:'2026-11-10',proveedor_id:1,ubicacion_id:1,detalles:[{material_id:1,cantidad:10,precio_unitario:100}]};
 await verificar('/ordenes',{...orden,fecha:'2026-02-30'},400);
 await verificar('/ordenes',{...orden,detalles:[]},400);
 await verificar('/ordenes',{...orden,detalles:[orden.detalles[0],orden.detalles[0]]},400);
 await verificar('/ordenes',{...orden,detalles:[{material_id:1,cantidad:1,precio_unitario:1.111}]},400);
 assert.equal((await verificar('/ordenes',orden,200)).body.numero,'OC-TEST');
 for(const id of ['abc','0','-1','1.5','1e2','2147483648']){const antes=llamadas;assert.equal((await fetch(base+'/recurso/'+id)).status,400);assert.equal(llamadas,antes);casos++;}
 const valido=await fetch(base+'/recurso/12');assert.equal(valido.status,200);assert.equal((await valido.json()).id,12);casos++;
 console.log(`${casos} casos HTTP aprobados para los cinco middlewares. Entradas inválidas bloqueadas antes del controlador.`);
}finally{await new Promise(resolve=>server.close(resolve));}
