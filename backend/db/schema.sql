CREATE DATABASE IF NOT EXISTS inventario_quiz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE inventario_quiz;
CREATE TABLE usuarios (id INT PRIMARY KEY AUTO_INCREMENT, nombre VARCHAR(120) NOT NULL);
CREATE TABLE ubicaciones (id INT PRIMARY KEY AUTO_INCREMENT, nombre VARCHAR(120) NOT NULL UNIQUE, tipo ENUM('BODEGA','OBRA') NOT NULL);
CREATE TABLE proveedores (id INT PRIMARY KEY AUTO_INCREMENT, nombre VARCHAR(120) NOT NULL UNIQUE);
CREATE TABLE materiales (
 id INT PRIMARY KEY AUTO_INCREMENT, codigo VARCHAR(40) NOT NULL UNIQUE, nombre VARCHAR(150) NOT NULL,
 categoria VARCHAR(100) NOT NULL, subcategoria VARCHAR(100) NOT NULL, unidad VARCHAR(20) NOT NULL,
 demanda_promedio DECIMAL(12,3) NOT NULL, demanda_maxima DECIMAL(12,3) NOT NULL, tiempo_entrega INT NOT NULL,
 CHECK(demanda_promedio >= 0 AND demanda_maxima >= demanda_promedio AND tiempo_entrega > 0)
);
CREATE TABLE politicas_stock (
 material_id INT NOT NULL, ubicacion_id INT NOT NULL, stock_minimo DECIMAL(12,3) NOT NULL, stock_maximo DECIMAL(12,3) NOT NULL,
 PRIMARY KEY(material_id,ubicacion_id), FOREIGN KEY(material_id) REFERENCES materiales(id), FOREIGN KEY(ubicacion_id) REFERENCES ubicaciones(id),
 CHECK(stock_minimo >= 0 AND stock_maximo >= stock_minimo)
);
CREATE TABLE ordenes (
 id INT PRIMARY KEY AUTO_INCREMENT, numero VARCHAR(40) NOT NULL UNIQUE, fecha DATE NOT NULL,
 proveedor_id INT NOT NULL, ubicacion_id INT NOT NULL, estado ENUM('PENDIENTE','APROBADA','RECIBIDA','CANCELADA') NOT NULL DEFAULT 'PENDIENTE',
 FOREIGN KEY(proveedor_id) REFERENCES proveedores(id), FOREIGN KEY(ubicacion_id) REFERENCES ubicaciones(id)
);
CREATE TABLE orden_detalles (
 id INT PRIMARY KEY AUTO_INCREMENT, orden_id INT NOT NULL, material_id INT NOT NULL,
 cantidad DECIMAL(12,3) NOT NULL, precio_unitario DECIMAL(14,2) NOT NULL,
 FOREIGN KEY(orden_id) REFERENCES ordenes(id), FOREIGN KEY(material_id) REFERENCES materiales(id), CHECK(cantidad > 0 AND precio_unitario >= 0)
);
CREATE TABLE movimientos (
 id INT PRIMARY KEY AUTO_INCREMENT, fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 tipo ENUM('ENTRADA','SALIDA','TRASLADO','AJUSTE') NOT NULL, material_id INT NOT NULL,
 origen_id INT NULL, destino_id INT NULL, cantidad DECIMAL(12,3) NOT NULL,
 usuario_id INT NOT NULL, documento VARCHAR(100) NOT NULL, motivo VARCHAR(255) NOT NULL,
 orden_detalle_id INT NULL, lote VARCHAR(80) NOT NULL,
 FOREIGN KEY(material_id) REFERENCES materiales(id), FOREIGN KEY(origen_id) REFERENCES ubicaciones(id),
 FOREIGN KEY(destino_id) REFERENCES ubicaciones(id), FOREIGN KEY(usuario_id) REFERENCES usuarios(id),
 FOREIGN KEY(orden_detalle_id) REFERENCES orden_detalles(id),
 CHECK(cantidad > 0),
 CHECK((tipo='ENTRADA' AND origen_id IS NULL AND destino_id IS NOT NULL)
 OR (tipo='SALIDA' AND origen_id IS NOT NULL AND destino_id IS NULL)
 OR (tipo='TRASLADO' AND origen_id IS NOT NULL AND destino_id IS NOT NULL AND origen_id <> destino_id)
 OR (tipo='AJUSTE' AND ((origen_id IS NULL AND destino_id IS NOT NULL) OR (origen_id IS NOT NULL AND destino_id IS NULL))))
);
CREATE INDEX idx_mov_material_fecha ON movimientos(material_id,fecha);
CREATE TABLE configuracion (clave VARCHAR(60) PRIMARY KEY, valor DECIMAL(12,3) NOT NULL);
INSERT INTO configuracion VALUES ('duplicados_dias',3),('duplicados_tolerancia_porcentaje',5);
CREATE VIEW stock_actual AS
SELECT material_id, ubicacion_id, SUM(delta) AS stock FROM (
 SELECT material_id,destino_id AS ubicacion_id,cantidad AS delta FROM movimientos WHERE destino_id IS NOT NULL
 UNION ALL
 SELECT material_id,origen_id AS ubicacion_id,-cantidad AS delta FROM movimientos WHERE origen_id IS NOT NULL
) s GROUP BY material_id,ubicacion_id;
CREATE VIEW alertas_reorden AS
SELECT m.id AS material_id,m.nombre,p.ubicacion_id,COALESCE(s.stock,0) AS stock,
 (m.demanda_maxima-m.demanda_promedio)*m.tiempo_entrega AS stock_seguridad,
 m.demanda_maxima*m.tiempo_entrega AS punto_reorden
FROM politicas_stock p JOIN materiales m ON m.id=p.material_id
LEFT JOIN stock_actual s ON s.material_id=p.material_id AND s.ubicacion_id=p.ubicacion_id
WHERE COALESCE(s.stock,0)<m.demanda_maxima*m.tiempo_entrega;
