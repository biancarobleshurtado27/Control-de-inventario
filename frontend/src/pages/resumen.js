import {$,table} from '../components/ui.js';
let saldos=[];
function pintarStock(){const q=$('#search').value.toLowerCase();table('#stock-table',[['Material','nombre'],['Código','codigo'],['Ubicación','ubicacion'],['Stock','stock'],['Unidad','unidad'],['Punto de reorden','punto_reorden'],['Estado',r=>r.stock<r.punto_reorden?'Reponer':'Disponible']],saldos.filter(r=>(r.nombre+' '+r.codigo).toLowerCase().includes(q)));}
export function initResumen(){$('#search').addEventListener('input',pintarStock);}
export function renderResumen(d){saldos=d.stock;$('#count-materiales').textContent=d.materiales.length;$('#count-ubicaciones').textContent=d.ubicaciones.length;$('#count-alertas').textContent=d.alertas.length;pintarStock();table('#alerts',[['Material','nombre'],['Ubicación','ubicacion'],['Stock','stock'],['Stock de seguridad','stock_seguridad'],['Punto de reorden','punto_reorden']],d.alertas);}
