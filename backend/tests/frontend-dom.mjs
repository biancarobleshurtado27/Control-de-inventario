import {JSDOM} from 'jsdom';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const html=readFileSync('frontend/index.html','utf8');
const dom=new JSDOM(html,{url:'http://localhost/#resumen',pretendToBeVisual:true});
const {window}=dom;window.scrollTo=()=>{};
Object.assign(globalThis,{window,document:window.document,location:window.location,Option:window.Option,FormData:window.FormData,requestAnimationFrame:window.requestAnimationFrame.bind(window)});
const materiales=[{id:1,codigo:'CEM-GRI-50',nombre:'Cemento',categoria:'Construcción',unidad:'saco',demanda_promedio:40,tiempo_entrega:3,punto_reorden:165},{id:2,codigo:'BLO-12',nombre:'Block',categoria:'Construcción',unidad:'unidad',demanda_promedio:600,tiempo_entrega:4,punto_reorden:3600}];
const stock=[{material_id:1,codigo:'CEM-GRI-50',nombre:'Cemento',unidad:'saco',ubicacion_id:1,ubicacion:'Bodega Central',stock:190,punto_reorden:165},{material_id:2,codigo:'BLO-12',nombre:'Block',unidad:'unidad',ubicacion_id:1,ubicacion:'Bodega Central',stock:2800,punto_reorden:3600}];
const datos={'/materiales':materiales,'/ubicaciones':[{id:1,nombre:'Bodega Central'}],'/stock':stock,'/alertas/reorden':[{material_id:2,nombre:'Block',ubicacion_id:1,ubicacion:'Bodega Central',stock:2800,stock_seguridad:1200,punto_reorden:3600}],'/ordenes/posibles-duplicados':{regla:{dias:3,tolerancia_porcentaje:5},posibles_duplicados:[]},'/movimientos':[],'/usuarios':[{id:1,nombre:'Bianca'}],'/ordenes':[{id:1,orden_id:1,numero:'OC-1',estado:'PENDIENTE',material_id:1,material:'Cemento',cantidad:2,precio_unitario:6300,ubicacion_id:1,ubicacion:'Bodega Central',proveedor:'A'}],'/proveedores':[{id:1,nombre:'Proveedor A'}],'/salud':{baseDeDatos:'conectada'}};
const posts=[];
globalThis.fetch=async(path,options)=>{const route=path.replace('/api','');if(options?.method==='POST'){posts.push({route,data:JSON.parse(options.body)});return {ok:true,json:async()=>({id:20})};}assert.ok(route in datos,route);return{ok:true,json:async()=>datos[route]};};
const $=s=>document.querySelector(s),tick=()=>new Promise(r=>setTimeout(r,35));
try{
 await import('../../frontend/src/app.js');await tick();
 assert.equal($('#count-materiales').textContent,'2');assert.equal($('#count-alertas').textContent,'1');assert.equal($('#count-pendientes').textContent,'1');assert.equal(document.querySelectorAll('.alert-card').length,1);assert.equal($('#stock-table tbody').rows.length,2);assert.ok($('#connection-label').textContent.includes('conectado'));
 $('#search').value='cemento';$('#search').dispatchEvent(new window.Event('input'));assert.equal($('#stock-table tbody').rows.length,1);
 $('#search').value='';$('#search').dispatchEvent(new window.Event('input'));$('#stock-state').value='reponer';$('#stock-state').dispatchEvent(new window.Event('change'));assert.equal($('#stock-table tbody').rows.length,1);assert.ok($('#stock-table tbody').textContent.includes('Block'));
 $('.alert-card button').click();await tick();assert.equal(location.hash,'#ordenes');assert.equal($('#order-form').elements.material_id.value,'2');assert.equal($('#order-form').elements.cantidad.value,'800');assert.equal($('#ordenes').hidden,false);
 document.querySelector('[data-page="materiales"]').click();await tick();assert.equal($('#materiales').hidden,false);assert.equal($('#ordenes').hidden,true);
 const form=$('#material-form');for(const [k,v]of Object.entries({codigo:'MAT-TEST',nombre:'Material',categoria:'Prueba',subcategoria:'Prueba',unidad:'saco',ubicacion_id:'1',demanda_promedio:'40',demanda_maxima:'55',tiempo_entrega:'3',stock_minimo:'45',stock_maximo:'400'}))form.elements[k].value=v;
 form.dispatchEvent(new window.Event('input',{bubbles:true}));assert.ok($('#pr-preview').value.includes('165'));assert.ok($('#ss-preview').textContent.includes('45'));
 form.elements.demanda_maxima.value='20';form.dispatchEvent(new window.Event('input'));assert.equal(form.elements.demanda_maxima.validity.customError,true);assert.equal($('#pr-preview').value,'—');
 form.elements.demanda_maxima.value='55';form.dispatchEvent(new window.Event('input'));form.dispatchEvent(new window.Event('submit',{cancelable:true}));await tick();assert.equal(posts[0].route,'/materiales');assert.equal(posts[0].data.demanda_maxima,55);assert.ok($('#status').textContent.includes('correctamente'));
 $('#catalog-search').value='block';$('#catalog-search').dispatchEvent(new window.Event('input'));assert.equal($('#catalogo tbody').rows.length,1);
 document.querySelector('[data-page="movimientos"]').click();await tick();document.querySelector('[data-movement-type="TRASLADO"]').click();assert.equal($('#tipo').value,'TRASLADO');assert.equal($('#origen-label').hidden,false);assert.equal($('#destino-label').hidden,false);assert.equal($('#oc-label').hidden,true);assert.equal(document.querySelector('[data-movement-type="TRASLADO"]').getAttribute('aria-pressed'),'true');
 document.querySelector('[data-movement-type="ENTRADA"]').click();assert.equal($('#origen-label').hidden,true);assert.equal($('#oc-label').hidden,false);
 // Empty alerts remain a normal state without invented replenishment rows.
 const {renderResumen}=await import('../../frontend/src/pages/resumen.js');renderResumen({materiales,ubicaciones:datos['/ubicaciones'],stock,ordenes:[],alertas:[]});assert.equal($('#count-alertas').textContent,'0');assert.equal($('.alert-grid .empty')!==null,true);
 const css=readFileSync('frontend/styles/styles.css','utf8');assert.ok(css.includes('prefers-reduced-motion:reduce'));assert.ok(css.includes('@keyframes page-enter'));
 console.log('Frontend DOM aprobado: datos reales de API simulada, filtros, alertas, prellenado de OC, navegación, cálculo PR, validación de demanda, guardado, catálogo, tipos de movimiento y estado vacío. La prueba no modifica MySQL ni sustituye la revisión visual.');
}finally{window.close();}
