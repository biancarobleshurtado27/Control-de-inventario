export function exportarCsv(nombre,encabezados,filas){
 const celda=v=>{let t=String(v??'');if(/^[=+@-]/.test(t))t="'"+t;return '"'+t.replaceAll('"','""')+'"';};
 const contenido='\uFEFF'+[encabezados,...filas].map(f=>f.map(celda).join(';')).join('\r\n');
 const url=URL.createObjectURL(new Blob([contenido],{type:'text/csv;charset=utf-8;'}));
 const a=document.createElement('a');a.href=url;a.download=nombre;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
