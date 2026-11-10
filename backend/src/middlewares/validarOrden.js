export function validarOrden(req,res,next){
 const d=req.body;if(!d||typeof d!=='object'||Array.isArray(d))return res.status(400).json({error:'Envía un objeto JSON.'});
 const campos={},id=v=>Number.isSafeInteger(v)&&v>0&&v<=2147483647;
 const decimal=(v,max,scale)=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=max&&Math.abs(v*scale-Math.round(v*scale))<.0001;
 if(typeof d.numero!=='string'||!d.numero.trim()||d.numero.trim().length>40)campos.numero='Número obligatorio de hasta 40 caracteres.';
 for(const key of ['proveedor_id','ubicacion_id'])if(!id(d[key]))campos[key]='Selecciona una opción válida.';
 if(typeof d.fecha!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(d.fecha)||Number(d.fecha.slice(0,4))<1000||Number.isNaN(Date.parse(d.fecha+'T00:00:00Z'))||new Date(d.fecha+'T00:00:00Z').toISOString().slice(0,10)!==d.fecha)campos.fecha='Indica una fecha real en formato AAAA-MM-DD.';
 if(!Array.isArray(d.detalles)||!d.detalles.length||d.detalles.length>100)campos.detalles='Incluye entre 1 y 100 líneas.';
 else {
  d.detalles.forEach((l,i)=>{if(!id(l?.material_id))campos[`detalles.${i}.material_id`]='Selecciona un material válido.';if(!decimal(l?.cantidad,999999999.999,1000)||l.cantidad===0)campos[`detalles.${i}.cantidad`]='Cantidad positiva con hasta tres decimales.';if(!decimal(l?.precio_unitario,999999999999.99,100))campos[`detalles.${i}.precio_unitario`]='Precio no negativo con hasta dos decimales.';});
  if(new Set(d.detalles.map(l=>l?.material_id)).size!==d.detalles.length)campos.detalles='Agrupa cada material en una sola línea.';
 }
 if(Object.keys(campos).length)return res.status(400).json({error:'Revisa los campos señalados.',campos});req.body={...d,numero:d.numero.trim()};next();
}
