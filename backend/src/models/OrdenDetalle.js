import {sequelize} from '../db.js';
import {id,entero,decimal} from './atributos.js';
export const OrdenDetalle=sequelize.define('OrdenDetalle',{
 id:id(),
 orden_id:entero(),
 material_id:entero(),
 cantidad:decimal(),
 precio_unitario:decimal(14,2)
},{tableName:'orden_detalles'});
