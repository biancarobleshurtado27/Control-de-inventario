import {DataTypes,literal} from 'sequelize';
import {sequelize} from '../db.js';
import {id,texto,entero,decimal} from './atributos.js';
export const Movimiento=sequelize.define('Movimiento',{
 id:id(),
 fecha:{type:DataTypes.DATE,allowNull:false,defaultValue:literal('CURRENT_TIMESTAMP')},
 tipo:{type:DataTypes.ENUM('ENTRADA','SALIDA','TRASLADO','AJUSTE'),allowNull:false},
 material_id:entero(),
 origen_id:entero(true),
 destino_id:entero(true),
 cantidad:decimal(),
 usuario_id:entero(),
 documento:texto(100),
 motivo:texto(255),
 orden_detalle_id:entero(true),
 lote:texto(80)
},{tableName:'movimientos'});
