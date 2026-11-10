import {sequelize} from '../db.js';
import {id,texto} from './atributos.js';
export const Usuario=sequelize.define('Usuario',{
 id:id(),
 nombre:texto(120)
},{tableName:'usuarios'});
