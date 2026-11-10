import {sequelize} from '../db.js';
import {texto,decimal} from './atributos.js';
export const Configuracion=sequelize.define('Configuracion',{
 clave:{...texto(60),primaryKey:true},
 valor:decimal()
},{tableName:'configuracion'});
