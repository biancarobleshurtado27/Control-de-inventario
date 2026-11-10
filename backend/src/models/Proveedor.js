import {sequelize} from '../db.js';
import {id,texto} from './atributos.js';
export const Proveedor=sequelize.define('Proveedor',{
 id:id(),
 nombre:{...texto(120),unique:true}
},{tableName:'proveedores'});
