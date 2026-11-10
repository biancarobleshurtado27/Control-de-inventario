import {sequelize,consultarSQL} from '../db.js';
import {Material,Ubicacion} from '../models/index.js';

export async function comprobarSalud(req, res) {
  await sequelize.authenticate();
  res.json({ estado: 'ok', baseDeDatos: 'conectada' });
}

export async function listarMateriales(req, res) {
  const rows=await Material.findAll({order:[['id','ASC']],raw:true});
  res.json(rows.map(m=>({...m,stock_seguridad:(m.demanda_maxima-m.demanda_promedio)*m.tiempo_entrega,punto_reorden:m.demanda_maxima*m.tiempo_entrega})));
}

export async function listarUbicaciones(req, res) {
  const rows=await Ubicacion.findAll({order:[['id','ASC']]});
  res.json(rows);
}

export async function consultarStock(req, res) {
  const [rows] = await consultarSQL(`SELECT m.id AS material_id,m.codigo,m.nombre,m.unidad,
    u.id AS ubicacion_id,u.nombre AS ubicacion,COALESCE(s.stock,0) AS stock,
    p.stock_minimo,p.stock_maximo,m.demanda_maxima*m.tiempo_entrega AS punto_reorden
    FROM politicas_stock p JOIN materiales m ON m.id=p.material_id
    JOIN ubicaciones u ON u.id=p.ubicacion_id
    LEFT JOIN stock_actual s ON s.material_id=p.material_id AND s.ubicacion_id=p.ubicacion_id
    ORDER BY m.id,u.id`);
  res.json(rows);
}

export async function listarAlertas(req, res) {
  const [rows] = await consultarSQL(`SELECT a.*,u.nombre AS ubicacion
    FROM alertas_reorden a JOIN ubicaciones u ON u.id=a.ubicacion_id
    ORDER BY a.material_id,a.ubicacion_id`);
  res.json(rows);
}
