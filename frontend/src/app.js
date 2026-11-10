import {$,options,status} from './components/ui.js';
import {cargarDatos} from './services/api.js';
import {initRouter} from './routes/router.js';
import {initResumen,renderResumen} from './pages/resumen.js';
import {initMateriales,renderMateriales} from './pages/materiales.js';
import {initMovimientos,renderMovimientos} from './pages/movimientos.js';
import {initOrdenes,renderOrdenes} from './pages/ordenes.js';
import {renderDuplicados} from './pages/duplicados.js';
import {initTrazabilidad} from './pages/trazabilidad.js';
async function refresh(){try{status('Actualizando datos…');const d=await cargarDatos();options('.ubicaciones',d.ubicaciones,r=>r.nombre);options('.material-options',d.materiales,r=>r.nombre);renderResumen(d);renderMateriales(d);renderMovimientos(d);renderOrdenes(d);renderDuplicados(d);status('Datos actualizados · '+new Date().toLocaleTimeString('es-CR'));}catch(e){status(e.message,true);}}
initRouter();initResumen();initMateriales(refresh);initMovimientos(refresh);initOrdenes(refresh);initTrazabilidad();$('#refresh').addEventListener('click',refresh);refresh();
