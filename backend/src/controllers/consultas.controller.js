import {sequelize,consultarSQL} from '../db.js';
import {Material,Usuario,Configuracion} from '../models/index.js';
import {Op} from 'sequelize';

export async function detectarDuplicados(req,res) {
 const reglas=await Configuracion.findAll({where:{clave:{[Op.in]:['duplicados_dias','duplicados_tolerancia_porcentaje']}},raw:true});
 const config=Object.fromEntries(reglas.map(r=>[r.clave,Number(r.valor)]));
 const dias=config.duplicados_dias,tolerancia=config.duplicados_tolerancia_porcentaje;
 if(!Number.isFinite(dias)||dias<0||!Number.isFinite(tolerancia)||tolerancia<0||tolerancia>100) return res.status(500).json({error:'Configuración de duplicados inválida.'});
 const [rows]=await consultarSQL(`WITH cantidades AS (
 SELECT o.id,o.numero,o.fecha,o.proveedor_id,d.material_id,SUM(d.cantidad) cantidad
 FROM ordenes o JOIN orden_detalles d ON d.orden_id=o.id WHERE o.estado<>'CANCELADA'
 GROUP BY o.id,o.numero,o.fecha,o.proveedor_id,d.material_id)
 SELECT a.numero AS orden_1,b.numero AS orden_2,p.nombre AS proveedor,m.nombre AS material,
 a.cantidad AS cantidad_1,b.cantidad AS cantidad_2,a.fecha AS fecha_1,b.fecha AS fecha_2,
 ABS(DATEDIFF(a.fecha,b.fecha)) AS diferencia_dias,
 ABS(a.cantidad-b.cantidad)/GREATEST(a.cantidad,b.cantidad)*100 AS diferencia_porcentaje
 FROM cantidades a JOIN cantidades b ON a.id<b.id AND a.proveedor_id=b.proveedor_id AND a.material_id=b.material_id
 JOIN proveedores p ON p.id=a.proveedor_id JOIN materiales m ON m.id=a.material_id
 WHERE ABS(DATEDIFF(a.fecha,b.fecha))<=? AND ABS(a.cantidad-b.cantidad)/GREATEST(a.cantidad,b.cantidad)*100<=?
 ORDER BY a.id,b.id`,[dias,tolerancia]);
 res.json({regla:{dias,tolerancia_porcentaje:tolerancia},posibles_duplicados:rows});

}

export async function consultarTrazabilidad(req,res) {
 const id=req.idValidado;
 const m=await Material.findByPk(id,{attributes:['id','codigo','nombre','unidad'],raw:true});const material=m?[m]:[];
 if(!material.length) return res.status(404).json({error:'Material inexistente.'});
 const [movimientos]=await consultarSQL(`SELECT mv.id,mv.fecha,mv.tipo,mv.cantidad,mv.lote,mv.documento,mv.motivo,
 u.nombre AS usuario,ori.nombre AS origen,dest.nombre AS destino,
 oc.numero AS orden_compra_directa,
 (SELECT GROUP_CONCAT(DISTINCT o.numero ORDER BY o.numero SEPARATOR ', ') FROM movimientos entrada
 JOIN orden_detalles od ON od.id=entrada.orden_detalle_id JOIN ordenes o ON o.id=od.orden_id
 WHERE entrada.material_id=mv.material_id AND entrada.lote=mv.lote AND entrada.tipo='ENTRADA') AS ordenes_origen_lote
 FROM movimientos mv JOIN usuarios u ON u.id=mv.usuario_id
 LEFT JOIN ubicaciones ori ON ori.id=mv.origen_id LEFT JOIN ubicaciones dest ON dest.id=mv.destino_id
 LEFT JOIN orden_detalles detalle ON detalle.id=mv.orden_detalle_id LEFT JOIN ordenes oc ON oc.id=detalle.orden_id
 WHERE mv.material_id=? ORDER BY mv.fecha,mv.id`,[id]);
 res.json({material:material[0],movimientos});

}

export async function listarUsuarios(req,res) {
 const rows=await Usuario.findAll({attributes:['id','nombre'],order:[['nombre','ASC']]});res.json(rows);

}

export async function listarOrdenes(req,res) {
 const [rows]=await consultarSQL(`SELECT d.id,o.id AS orden_id,o.numero,o.fecha,o.estado,p.nombre AS proveedor,d.material_id,m.nombre AS material,d.cantidad,d.precio_unitario,o.ubicacion_id,u.nombre AS ubicacion FROM ordenes o JOIN proveedores p ON p.id=o.proveedor_id JOIN orden_detalles d ON d.orden_id=o.id JOIN materiales m ON m.id=d.material_id JOIN ubicaciones u ON u.id=o.ubicacion_id ORDER BY o.fecha DESC,o.id DESC`);
 const [recibidos]=await consultarSQL('SELECT orden_detalle_id,SUM(cantidad) AS recibido FROM movimientos WHERE tipo="ENTRADA" AND orden_detalle_id IS NOT NULL GROUP BY orden_detalle_id');
 const sumas=new Map(recibidos.map(x=>[x.orden_detalle_id,Number(x.recibido)]));
 for(const row of rows){row.cantidad_recibida=sumas.get(row.id)||0;row.cantidad_pendiente=Math.max(0,Number(row.cantidad)-row.cantidad_recibida);}
 const estados=new Map();
 for(const row of rows){const total=estados.get(row.orden_id)||{recibido:0,pendiente:0};total.recibido+=row.cantidad_recibida;total.pendiente+=row.cantidad_pendiente;estados.set(row.orden_id,total);}
 for(const row of rows){const total=estados.get(row.orden_id);row.estado_recepcion=['PENDIENTE','CANCELADA'].includes(row.estado)?row.estado:total.pendiente===0?'RECIBIDA':total.recibido>0?'RECIBIDA PARCIALMENTE':row.estado;}
 res.json(rows);

}
