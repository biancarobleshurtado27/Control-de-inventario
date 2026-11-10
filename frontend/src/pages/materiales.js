import {table} from '../components/ui.js';
import {submit} from '../components/forms.js';
export function initMateriales(refresh){submit('#material-form','/materiales',['ubicacion_id','demanda_promedio','demanda_maxima','tiempo_entrega','stock_minimo','stock_maximo'],refresh);}
export function renderMateriales(d){table('#catalogo',[['Código','codigo'],['Nombre','nombre'],['Unidad','unidad'],['Demanda promedio','demanda_promedio'],['Entrega (días)','tiempo_entrega'],['PR','punto_reorden']],d.materiales);}
