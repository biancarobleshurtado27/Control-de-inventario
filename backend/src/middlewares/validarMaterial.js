export function validarMaterial(req,res,next){
 const d=req.body;if(!d||typeof d!=='object'||Array.isArray(d))return res.status(400).json({error:'Envía un objeto JSON.'});
 const campos={},limites={codigo:40,nombre:150,categoria:100,subcategoria:100,unidad:20},limpio={...d};
 for(const [campo,max]of Object.entries(limites)){if(typeof d[campo]!=='string'||!d[campo].trim()||d[campo].trim().length>max)campos[campo]=`Obligatorio, hasta ${max} caracteres.`;else limpio[campo]=d[campo].trim();}
 const decimal=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=999999999.999&&Math.abs(v*1000-Math.round(v*1000))<.0001;
 for(const campo of ['demanda_promedio','demanda_maxima','stock_minimo','stock_maximo'])if(!decimal(d[campo]))campos[campo]='Usa un número no negativo de hasta tres decimales.';
 if(d.demanda_maxima<d.demanda_promedio)campos.demanda_maxima='Debe ser mayor o igual a la demanda promedio.';
 if(d.stock_maximo<d.stock_minimo)campos.stock_maximo='Debe ser mayor o igual al stock mínimo.';
 if(!Number.isInteger(d.tiempo_entrega)||d.tiempo_entrega<1||d.tiempo_entrega>3650)campos.tiempo_entrega='Usa un entero entre 1 y 3650 días.';
 if(!Number.isSafeInteger(d.ubicacion_id)||d.ubicacion_id<1||d.ubicacion_id>2147483647)campos.ubicacion_id='Selecciona una ubicación válida.';
 if(Object.keys(campos).length)return res.status(400).json({error:'Revisa los campos señalados.',campos});req.body=limpio;next();
}
