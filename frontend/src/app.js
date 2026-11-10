import {$,options,status} from './components/ui.js';
import {cargarDatos} from './services/api.js';
import {initRouter} from './routes/router.js';
import {initResumen,renderResumen} from './pages/resumen.js';
import {initMateriales,renderMateriales} from './pages/materiales.js';
import {initMovimientos,renderMovimientos} from './pages/movimientos.js';
import {initOrdenes,renderOrdenes} from './pages/ordenes.js';
import {renderDuplicados} from './pages/duplicados.js';
import {initTrazabilidad} from './pages/trazabilidad.js';
let pendingRefresh=null;async function refresh(){if(pendingRefresh)return pendingRefresh;pendingRefresh=actualizar();try{return await pendingRefresh;}finally{pendingRefresh=null;}}async function actualizar(){document.querySelector('main').setAttribute('aria-busy','true');$('#refresh').disabled=true;try{status('Actualizando datos…');const d=await cargarDatos();options('.ubicaciones',d.ubicaciones,r=>r.nombre);options('.material-options',d.materiales,r=>r.nombre);renderResumen(d);renderMateriales(d);renderMovimientos(d);renderOrdenes(d);renderDuplicados(d);$('#connection-label').textContent=d.salud.baseDeDatos==='conectada'?'Inventario conectado · Datos actualizados':'Revisar conexión';document.querySelector('.connection').classList.remove('offline');status('Datos actualizados · '+new Date().toLocaleTimeString('es-CR'));}catch(e){status(e.message,true);$('#connection-label').textContent='No se pudo actualizar el inventario';document.querySelector('.connection').classList.add('offline');}finally{document.querySelector('main').setAttribute('aria-busy','false');$('#refresh').disabled=false;}}
initRouter();initResumen();initMateriales(refresh);initMovimientos(refresh);initOrdenes(refresh);initTrazabilidad();$('#refresh').addEventListener('click',refresh);refresh();

