import {readdirSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
function revisar(dir){for(const item of readdirSync(dir,{withFileTypes:true})){const path=join(dir,item.name);if(item.isDirectory())revisar(path);else if(/\.(m?js)$/.test(path)){const r=spawnSync(process.execPath,['--check',path],{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);}}}
revisar('src');revisar('public');revisar('tests');console.log('Sintaxis correcta en backend, frontend y pruebas.');
