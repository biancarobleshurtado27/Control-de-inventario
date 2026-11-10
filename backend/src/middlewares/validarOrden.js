export function validarOrden(req,res,next) {
 const d=req.body;
 if(!d||typeof d!=='object'||Array.isArray(d))return res.status(400).json({error:'Envía un objeto JSON.'});
 const validId=v=>Number.isSafeInteger(v)&&v>0&&v<=2147483647;
 if(!d||typeof d.numero!=='string'||!d.numero.trim()||d.numero.trim().length>40||!validId(d.proveedor_id)||!validId(d.ubicacion_id)||!Array.isArray(d.detalles)||!d.detalles.length||d.detalles.length>100) return res.status(400).json({error:'Indica número, proveedor, ubicación y entre 1 y 100 líneas.'});
 if(typeof d.fecha!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(d.fecha)||Number(d.fecha.slice(0,4))<1000||Number.isNaN(Date.parse(d.fecha+'T00:00:00Z'))||new Date(d.fecha+'T00:00:00Z').toISOString().slice(0,10)!==d.fecha) return res.status(400).json({error:'Fecha inválida. Usa AAAA-MM-DD.'});
 const decimal=(v,max,scale)=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=max&&Math.abs(v*scale-Math.round(v*scale))<0.0001;
 if(d.detalles.some(l=>!l||!validId(l.material_id)||!decimal(l.cantidad,999999999.999,1000)||l.cantidad===0||!decimal(l.precio_unitario,999999999999.99,100))) return res.status(400).json({error:'Cada línea requiere material, cantidad positiva (3 decimales) y precio no negativo (2 decimales).'});
 if(new Set(d.detalles.map(l=>l.material_id)).size!==d.detalles.length) return res.status(400).json({error:'Agrupa cada material en una sola línea.'});
 req.body={...d,numero:d.numero.trim()};
 next();
}
