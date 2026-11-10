import {DataTypes} from 'sequelize';
export const id=()=>({type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true,allowNull:false});
export const texto=n=>({type:DataTypes.STRING(n),allowNull:false});
export const entero=(allowNull=false)=>({type:DataTypes.INTEGER,allowNull});
export const decimal=(precision=12,scale=3)=>({type:DataTypes.DECIMAL(precision,scale),allowNull:false});
