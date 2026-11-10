import {$,table,status} from '../components/ui.js';
import {api} from '../services/api.js';
export function initTrazabilidad(){
$('#trace-button').addEventListener('click',async()=>{try{const id=$('#trace-material').value;if(!id)throw Error('Selecciona un material.');const r=await api(`/materiales/${id}/trazabilidad`);table('#trace-table',[['Fecha',r=>new Date(r.fecha).toLocaleString('es-CR')],['Tipo','tipo'],['Cantidad','cantidad'],['Origen','origen'],['Destino','destino'],['Lote','lote'],['Documento','documento'],['OC de origen','ordenes_origen_lote'],['Usuario','usuario']],r.movimientos);}catch(e){status(e.message,true);}});
}
