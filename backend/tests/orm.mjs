import assert from 'node:assert/strict';
import {sequelize,pool} from '../src/db.js';
import * as models from '../src/models/index.js';
const tag='TEST-ORM-'+Date.now();
try{
 await sequelize.authenticate();
 // Check mappings against the existing schema without calling sync or alter.
 const qi=sequelize.getQueryInterface();
 for(const model of Object.values(models)){
  const columns=await qi.describeTable(model.getTableName());
  assert.equal(model.options.timestamps,false);
  for(const attr of Object.keys(model.rawAttributes))assert.ok(attr in columns,`${model.name}.${attr}`);
 }
 assert.deepEqual(models.PoliticaStock.primaryKeyAttributes,['material_id','ubicacion_id']);
 const ubicacion=await models.Ubicacion.findOne();assert.ok(ubicacion);
 await assert.rejects(sequelize.transaction(async transaction=>{
  const material=await models.Material.create({codigo:tag,nombre:tag,categoria:'Prueba',subcategoria:'Prueba',unidad:'unidad',demanda_promedio:1,demanda_maxima:2,tiempo_entrega:1},{transaction});
  await models.PoliticaStock.create({material_id:material.id,ubicacion_id:ubicacion.id,stock_minimo:1,stock_maximo:10},{transaction});
  const loaded=await models.Material.findByPk(material.id,{include:[{model:models.PoliticaStock,as:'politicas',include:[{model:models.Ubicacion,as:'ubicacion'}]}],transaction});
  assert.equal(loaded.politicas[0].ubicacion.id,ubicacion.id);
  throw Error('ROLLBACK_ORM_VERIFICADO');
 }),/ROLLBACK_ORM_VERIFICADO/);
 assert.equal(await models.Material.count({where:{codigo:tag}}),0);
 const orden=await models.Orden.findOne({include:[{model:models.OrdenDetalle,as:'detalles',include:[{model:models.Material,as:'material'}]},{model:models.Proveedor,as:'proveedor'}]});assert.ok(orden?.proveedor);assert.ok(orden.detalles.length);
 console.log('ORM aprobado: nueve modelos compatibles con MySQL, clave compuesta, relaciones consultables y rollback sin registros persistentes.');
}finally{await Promise.all([sequelize.close(),pool.end()]);}
