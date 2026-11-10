import {DataTypes} from 'sequelize';
import {sequelize} from '../db.js';
import {id,texto,entero} from './atributos.js';
export const Orden=sequelize.define('Orden',{
 id:id(),
 numero:{...texto(40),unique:true},
 fecha:{type:DataTypes.DATEONLY,allowNull:false},
 proveedor_id:entero(),
 ubicacion_id:entero(),
 estado:{type:DataTypes.ENUM('PENDIENTE','APROBADA','RECIBIDA','CANCELADA'),allowNull:false,defaultValue:'PENDIENTE'}
},{tableName:'ordenes'});
