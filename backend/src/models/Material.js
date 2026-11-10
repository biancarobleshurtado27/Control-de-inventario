import {sequelize} from '../db.js';
import {id,texto,entero,decimal} from './atributos.js';
export const Material=sequelize.define('Material',{
 id:id(),
 codigo:{...texto(40),unique:true},
 nombre:texto(150),
 categoria:texto(100),
 subcategoria:texto(100),
 unidad:texto(20),
 demanda_promedio:decimal(),
 demanda_maxima:decimal(),
 tiempo_entrega:entero()
},{tableName:'materiales'});
