export function validarMovimiento(req,res,next) {
 const d=req.body;
 const fail=message=>res.status(400).json({error:message});
 if(!d || typeof d!=='object' || Array.isArray(d)) return fail('Envía un objeto JSON.');
 const id=v=>Number.isSafeInteger(v)&&v>0&&v<=2147483647;
 const origen=d.origen_id??null,destino=d.destino_id??null;
 if(!['ENTRADA','SALIDA','TRASLADO','AJUSTE'].includes(d.tipo)) return fail('Tipo de movimiento inválido.');
 if(!id(d.material_id)||!id(d.usuario_id)) return fail('Material y usuario son obligatorios.');
 if((origen!==null&&!id(origen))||(destino!==null&&!id(destino))) return fail('Ubicación inválida.');
 const forma=d.tipo==='ENTRADA'?origen===null&&destino!==null:d.tipo==='SALIDA'?origen!==null&&destino===null:d.tipo==='TRASLADO'?origen!==null&&destino!==null&&origen!==destino:(origen===null)!==(destino===null);
 if(!forma) return fail('Origen y destino no corresponden al tipo de movimiento.');
 if(typeof d.cantidad!=='number'||!Number.isFinite(d.cantidad)||d.cantidad<=0||d.cantidad>999999999.999||Math.abs(d.cantidad*1000-Math.round(d.cantidad*1000))>0.0001) return fail('Cantidad positiva, con hasta tres decimales.');
 for(const [campo,max] of [['documento',100],['motivo',255],['lote',80]]) if(typeof d[campo]!=='string'||!d[campo].trim()||d[campo].trim().length>max) return fail(`${campo} es obligatorio (máximo ${max} caracteres).`);
 if(d.orden_detalle_id!=null&&!id(d.orden_detalle_id)) return fail('Referencia de OC inválida.');
 if(d.tipo==='ENTRADA'&&!id(d.orden_detalle_id)) return fail('Una entrada de compra requiere una línea de OC. Para saldos iniciales usa AJUSTE.');
 if(d.tipo!=='ENTRADA'&&d.orden_detalle_id!=null) return fail('La OC se vincula en la entrada original; para salidas y traslados conserva el lote.');
 req.body={...d,origen_id:origen,destino_id:destino,documento:d.documento.trim(),motivo:d.motivo.trim(),lote:d.lote.trim()};
 next();
}
