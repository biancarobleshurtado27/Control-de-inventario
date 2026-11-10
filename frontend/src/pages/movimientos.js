import {$,table,options,status} from '../components/ui.js';
import {submit} from '../components/forms.js';
import {api} from '../services/api.js';
let lotes=[],ordenes=[],ticket=0;
function selecciones(){
 const f=$('#movement-form'),e=f.elements,tipo=e.tipo.value;
 const usaLote=tipo==='SALIDA'||tipo==='TRASLADO'||(tipo==='AJUSTE'&&!!e.origen_id.value);
 $('#new-lot-label').hidden=usaLote;$('#new-lot').disabled=usaLote;$('#available-lot-label').hidden=!usaLote;$('#available-lots').disabled=!usaLote;
 options('#available-lots',lotes.filter(l=>Number(l.material_id)===Number(e.material_id.value)&&Number(l.ubicacion_id)===Number(e.origen_id.value)).map(l=>({...l,id:l.lote})),l=>`${l.lote} · saldo: ${l.saldo}`,true);
 options('#oc-options',ordenes.filter(o=>o.estado==='APROBADA'&&Number(o.cantidad_pendiente??o.cantidad)>0&&Number(o.material_id)===Number(e.material_id.value)&&Number(o.ubicacion_id)===Number(e.destino_id.value)),o=>`${o.numero} · pendiente: ${o.cantidad_pendiente??o.cantidad} · ${o.ubicacion}`,true);
 const lote=lotes.find(l=>l.lote===$('#available-lots').value&&Number(l.material_id)===Number(e.material_id.value)&&Number(l.ubicacion_id)===Number(e.origen_id.value));
 const oc=ordenes.find(o=>o.id===Number(e.orden_detalle_id.value));const max=usaLote?lote?.saldo:tipo==='ENTRADA'?oc?.cantidad_pendiente:undefined;
 if(max!==undefined)e.cantidad.max=max;else e.cantidad.removeAttribute('max');
 $('#movement-balance').textContent=max!==undefined?`Cantidad máxima disponible para este registro: ${max}.`:(usaLote?'Selecciona material, origen y un lote con saldo.':tipo==='ENTRADA'?'Selecciona material y destino para ver las OC con saldo pendiente.':'Usa un lote nuevo para incorporar un ajuste positivo.');
}
function movementFields(){const tipo=$('#tipo').value;document.querySelectorAll('[data-movement-type]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.movementType===tipo)));for(const [name,enabled]of [['origen_id',tipo!=='ENTRADA'],['destino_id',tipo!=='SALIDA'],['orden_detalle_id',tipo==='ENTRADA']]){const input=$(`#movement-form [name="${name}"]`);input.disabled=!enabled;input.required=enabled&&tipo!=='AJUSTE';input.closest('label').hidden=!enabled;if(!enabled)input.value='';}selecciones();}
function pintar(rows){table('#movement-table',[['Fecha',r=>new Date(r.fecha).toLocaleString('es-CR')],['Tipo','tipo'],['Material','material'],['Cantidad','cantidad'],['Origen','origen'],['Destino','destino'],['Lote','lote'],['Documento','documento'],['Usuario','usuario']],rows);$('#movement-count').textContent=`${rows.length} registros · Se muestran hasta 200 coincidencias, las más recientes primero.`;}
async function filtrar(){const current=++ticket;try{const q=new URLSearchParams([...new FormData($('#movement-filters'))].filter(([,v])=>v));const rows=await api('/movimientos?'+q);if(current===ticket)pintar(rows);}catch(e){status(e.message,true);}}
export function initMovimientos(refresh){document.querySelectorAll('[data-movement-type]').forEach(b=>b.addEventListener('click',()=>{$('#tipo').value=b.dataset.movementType;movementFields();}));$('#tipo').addEventListener('change',movementFields);$('#movement-form').addEventListener('change',selecciones);movementFields();submit('#movement-form','/movimientos',['material_id','usuario_id','cantidad','origen_id','destino_id','orden_detalle_id'],refresh,movementFields);$('#movement-filters').onsubmit=e=>{e.preventDefault();filtrar();};$('#movement-filters').onreset=()=>requestAnimationFrame(filtrar);}
export function renderMovimientos(d){lotes=d.lotes||[];ordenes=d.ordenes;options('#usuarios',d.usuarios,r=>r.nombre);movementFields();if([...new FormData($('#movement-filters')).values()].some(Boolean))filtrar();else{++ticket;pintar(d.movimientos);}}
