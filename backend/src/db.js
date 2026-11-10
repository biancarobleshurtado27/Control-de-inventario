import dotenv from 'dotenv';
import {fileURLToPath} from 'node:url';
dotenv.config({path:fileURLToPath(new URL('../.env',import.meta.url))});
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'inventario_quiz',
  waitForConnections: true,
  connectionLimit: 5,
  decimalNumbers: true
});

// El pool mysql2 se conserva para las pruebas SQL de preparación y limpieza.
// La aplicación consulta y escribe mediante Sequelize.
import {Sequelize,QueryTypes} from 'sequelize';
export const sequelize=new Sequelize(process.env.DB_NAME||'inventario_quiz',process.env.DB_USER,process.env.DB_PASSWORD,{
 dialect:'mysql',host:process.env.DB_HOST||'localhost',port:Number(process.env.DB_PORT||3306),
 logging:false,timezone:process.env.DB_TIMEZONE||'-06:00',
 dialectOptions:{decimalNumbers:true},pool:{max:5,min:0,idle:10000},
 define:{timestamps:false,freezeTableName:true}
});
// Consultas analíticas parametrizadas; no crean ni alteran el esquema.
export async function consultarSQL(sql,params=[]){return [await sequelize.query(sql,{replacements:params,type:QueryTypes.SELECT})];}
