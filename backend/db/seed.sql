USE inventario_quiz;
-- Ejecutar una sola vez sobre las tablas vacías creadas con schema.sql.
START TRANSACTION;
INSERT INTO usuarios (id,nombre) VALUES (1,'Bianca');
INSERT INTO ubicaciones (id,nombre,tipo) VALUES (1,'Bodega Central','BODEGA'),(2,'Obra Principal','OBRA');
INSERT INTO proveedores (id,nombre) VALUES (1,'Proveedor A'),(2,'Proveedor B'),(3,'Proveedor C'),(4,'Proveedor D');
INSERT INTO materiales (id,codigo,nombre,categoria,subcategoria,unidad,demanda_promedio,demanda_maxima,tiempo_entrega) VALUES
(1,'CEM-GRI-50','Cemento gris 50 kg','Materiales de construcción','Cementos','saco',40,55,3),
(2,'VAR-03-G40-6M','Varilla #3','Materiales de construcción','Acero de refuerzo','unidad',120,160,5),
(3,'BLO-12-20-40','Block 12 x 20 x 40','Materiales de construcción','Mampostería','unidad',600,900,4),
(4,'ARE-M3','Arena','Materiales de construcción','Agregados','m3',6,10,2);
-- Mínimos y máximos propuestos para el prototipo; no son datos del enunciado.
INSERT INTO politicas_stock VALUES (1,1,45,400),(2,1,200,1600),(3,1,1200,7200),(4,1,8,40);
INSERT INTO ordenes (id,numero,fecha,proveedor_id,ubicacion_id,estado) VALUES
(1,'OC-1041','2026-10-02',1,2,'APROBADA'),(2,'OC-1042','2026-10-02',1,2,'APROBADA'),
(3,'OC-1047','2026-10-06',2,2,'APROBADA'),(4,'OC-1050','2026-10-08',3,2,'APROBADA'),
(5,'OC-1053','2026-10-09',3,2,'APROBADA'),(6,'OC-1058','2026-10-13',4,2,'APROBADA'),
(7,'OC-1061','2026-10-15',1,1,'APROBADA');
INSERT INTO orden_detalles (orden_id,material_id,cantidad,precio_unitario) VALUES
(1,1,200,6450),(2,1,200,6450),(3,1,40,7100),(4,2,500,2150),(5,2,480,2150),(6,2,60,2600),(7,1,300,6300);
-- Saldos iniciales de A5. Las OC de A3 son ejemplos para detección;
-- no se registran como recibidas ni se suman a los saldos de A5.
INSERT INTO movimientos (tipo,material_id,destino_id,cantidad,usuario_id,documento,motivo,lote) VALUES
('AJUSTE',1,1,190,1,'SALDO-INICIAL-A5','Saldo inicial del ejercicio A5','INICIAL-CEMENTO'),
('AJUSTE',2,1,850,1,'SALDO-INICIAL-A5','Saldo inicial del ejercicio A5','INICIAL-VARILLA'),
('AJUSTE',3,1,2800,1,'SALDO-INICIAL-A5','Saldo inicial del ejercicio A5','INICIAL-BLOCK'),
('AJUSTE',4,1,14,1,'SALDO-INICIAL-A5','Saldo inicial del ejercicio A5','INICIAL-ARENA');
COMMIT;
SELECT m.nombre,s.stock,m.unidad FROM stock_actual s JOIN materiales m ON m.id=s.material_id ORDER BY m.id;
SELECT * FROM alertas_reorden ORDER BY material_id;
