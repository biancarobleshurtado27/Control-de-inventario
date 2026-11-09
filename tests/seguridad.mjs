import {spawn} from 'node:child_process';import assert from 'node:assert/strict';
const child=spawn(process.execPath,['src/index.js'],{env:{...process.env,PORT:'3094'},stdio:'ignore'});
try{
 for(let i=0;i<50;i++){try{await fetch('http://127.0.0.1:3094/api/salud');break;}catch{await new Promise(r=>setTimeout(r,100));}}
 const base='http://127.0.0.1:3094';
 for(const path of ['/.env','/.env.example','/.git/config','/package.json','/db/schema.sql']) assert.equal((await fetch(base+path)).status,404,path);
 const page=await fetch(base+'/');assert.equal(page.headers.get('x-content-type-options'),'nosniff');assert.ok(page.headers.get('content-security-policy').includes("frame-ancestors 'none'"));assert.equal(page.headers.get('x-powered-by'),null);
 const post=body=>fetch(base+'/api/materiales',{method:'POST',headers:{'Content-Type':'application/json'},body});
 assert.equal((await post('{')).status,400);
 const grande=await post(JSON.stringify({nombre:'x'.repeat(110000)})); assert.equal(grande.status,413);
 console.log('Seguridad básica aprobada: archivos privados inaccesibles, cabeceras y errores JSON 400/413.');
}finally{child.kill();}

