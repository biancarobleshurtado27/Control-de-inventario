import {spawnSync} from 'node:child_process';
for(const file of ['middlewares.mjs','frontend-smoke.mjs','movimientos.mjs','recepcion-consultas.mjs','ordenes.mjs','seguridad.mjs']){
 console.log(`\nEjecutando ${file}`);
 const result=spawnSync(process.execPath,[`backend/tests/${file}`],{stdio:'inherit'});
 if(result.status!==0)process.exit(result.status||1);
}
console.log('\nTodas las suites finalizaron correctamente.');

