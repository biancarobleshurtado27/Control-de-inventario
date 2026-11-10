export async function api(path,options){const r=await fetch('/api'+path,options);const data=await r.json();if(!r.ok)throw Error(data.error||'No se pudo completar la operación.');return data;}
export async function cargarDatos(){
 const rutas=['/materiales','/ubicaciones','/stock','/alertas/reorden','/ordenes/posibles-duplicados','/movimientos','/usuarios','/ordenes','/proveedores'];
 const nombres=['materiales','ubicaciones','stock','alertas','duplicados','movimientos','usuarios','ordenes','proveedores'];
 const datos=await Promise.all(rutas.map(r=>api(r)));return Object.fromEntries(nombres.map((n,i)=>[n,datos[i]]));
}
