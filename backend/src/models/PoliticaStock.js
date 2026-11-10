import {sequelize} from '../db.js';
import {entero,decimal} from './atributos.js';
export const PoliticaStock=sequelize.define('PoliticaStock',{
 material_id:{...entero(),primaryKey:true},
 ubicacion_id:{...entero(),primaryKey:true},
 stock_minimo:decimal(),
 stock_maximo:decimal()
},{tableName:'politicas_stock'});
