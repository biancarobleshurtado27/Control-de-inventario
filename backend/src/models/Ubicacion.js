import {DataTypes} from 'sequelize';
import {sequelize} from '../db.js';
import {id,texto} from './atributos.js';
export const Ubicacion=sequelize.define('Ubicacion',{
 id:id(),
 nombre:{...texto(120),unique:true},
 tipo:{type:DataTypes.ENUM('BODEGA','OBRA'),allowNull:false}
},{tableName:'ubicaciones'});
