import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const child=spawn(process.execPath,['backend/src/index.js'],{env:{...process.env,PORT:'3096'},stdio:'ignore'});
try{
 for(let i=0;i<50;i++){try{await fetch('http://127.0.0.1:3096/api/salud');break;}catch{await new Promise(r=>setTimeout(r,100));}}
 for(const path of ['/','/styles/styles.css','/src/app.js','/src/routes/router.js','/src/components/ui.js','/src/components/forms.js','/src/services/api.js','/src/pages/resumen.js','/src/pages/materiales.js','/src/pages/movimientos.js','/src/pages/ordenes.js','/src/pages/duplicados.js','/src/pages/trazabilidad.js','/api/usuarios','/api/ordenes','/api/stock','/api/alertas/reorden','/api/ordenes/posibles-duplicados']){const r=await fetch('http://127.0.0.1:3096'+path);assert.equal(r.status,200,path);if(path==='/')assert.ok((await r.text()).includes('Resumen del inventario'));}
 assert.equal((await fetch('http://127.0.0.1:3096/.env')).status,404);
 console.log('Página, estilos, JavaScript y cinco consultas disponibles. .env no es accesible por HTTP.');
}finally{child.kill();}
