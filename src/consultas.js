import { Router } from 'express';
import { pool } from './db.js';
export const consultasRouter = Router();
consultasRouter.get('/ordenes/posibles-duplicados',async(req,res)=>{
 const [reglas]=await pool.query("SELECT clave,valor FROM configuracion WHERE clave IN ('duplicados_dias','duplicados_tolerancia_porcentaje')");
 const config=Object.fromEntries(reglas.map(r=>[r.clave,Number(r.valor)]));
 const dias=config.duplicados_dias,tolerancia=config.duplicados_tolerancia_porcentaje;
 if(!Number.isFinite(dias)||dias<0||!Number.isFinite(tolerancia)||tolerancia<0||tolerancia>100) return res.status(500).json({error:'Configuración de duplicados inválida.'});
 const [rows]=await pool.execute(`WITH cantidades AS (
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
});
consultasRouter.get('/materiales/:id/trazabilidad',async(req,res)=>{
 const id=Number(req.params.id);
 if(!Number.isSafeInteger(id)||id<1||id>2147483647) return res.status(400).json({error:'Identificador inválido.'});
 const [material]=await pool.execute('SELECT id,codigo,nombre,unidad FROM materiales WHERE id=?',[id]);
 if(!material.length) return res.status(404).json({error:'Material inexistente.'});
 const [movimientos]=await pool.execute(`SELECT mv.id,mv.fecha,mv.tipo,mv.cantidad,mv.lote,mv.documento,mv.motivo,
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
});

consultasRouter.get('/usuarios',async(req,res)=>{
 const [rows]=await pool.query('SELECT id,nombre FROM usuarios ORDER BY nombre');res.json(rows);
});
consultasRouter.get('/ordenes',async(req,res)=>{
 const [rows]=await pool.query(`SELECT d.id,o.id AS orden_id,o.numero,o.fecha,o.estado,p.nombre AS proveedor,d.material_id,m.nombre AS material,d.cantidad,d.precio_unitario,o.ubicacion_id,u.nombre AS ubicacion FROM ordenes o JOIN proveedores p ON p.id=o.proveedor_id JOIN orden_detalles d ON d.orden_id=o.id JOIN materiales m ON m.id=d.material_id JOIN ubicaciones u ON u.id=o.ubicacion_id ORDER BY o.fecha DESC,o.id DESC`);res.json(rows);
});

