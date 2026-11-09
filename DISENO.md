# Diseño del sistema de inventario

Tecnologías acordadas: Node.js con Express, MySQL y frontend web.

## Modelo de datos
- Usuarios: responsable de cada movimiento.
- Ubicaciones: bodegas y obras.
- Proveedores: origen comercial de las compras.
- Materiales: catálogo normalizado y parámetros de demanda y entrega.
- Políticas de stock: mínimos y máximos por material y ubicación.
- Órdenes y detalles: proveedor, fecha, destino, material, cantidad y precio.
- Movimientos: entradas, salidas, traslados y ajustes con usuario, documento y lote.
- Configuración: ventana de días y tolerancia para detectar duplicados.

## Reglas de negocio
Stock = entradas recibidas - salidas enviadas, incluyendo traslados y ajustes.
SS = (demanda máxima - demanda promedio) × tiempo de entrega.
PR = demanda promedio × tiempo de entrega + SS.
El PR se calcula; no se almacena ni se introduce manualmente.
Las alertas muestran stock estrictamente inferior al PR.
La demanda y el tiempo de entrega son parámetros globales del material en este prototipo; mínimo y máximo son por ubicación.
Duplicados: mismo proveedor y material, fechas separadas por hasta 3 días y diferencia de cantidad de hasta 5 % de la cantidad mayor. Se excluyen órdenes canceladas y se comparan pares distintos una sola vez. Es una sospecha para revisión.
Un traslado es una sola operación con origen y destino, evitando registrar solo una mitad.
El backend debe usar transacciones y bloquear las existencias correspondientes antes de descontar stock para evitar saldos negativos por operaciones simultáneas.
Los registros históricos no se eliminan: se corrigen mediante movimientos compensatorios.
Las salidas y traslados conservarán el lote de entrada. Si requieren varios lotes, se registrará un movimiento por lote dentro de la misma transacción.
Las entradas por compra deben vincular una línea de OC del mismo material; las existencias iniciales se documentan como ajustes.

## Pantallas previstas
Dashboard, materiales, ubicaciones, movimientos, órdenes de compra, posibles duplicados y trazabilidad por material.

## API prevista
GET /api/materiales
POST /api/materiales
GET /api/ubicaciones
GET /api/stock
POST /api/movimientos
GET /api/materiales/:id/trazabilidad
GET /api/alertas/reorden
GET /api/ordenes
POST /api/ordenes
GET /api/ordenes/posibles-duplicados

## Estado
Completado: diseño inicial y script SQL de creación.
Pendiente: ejecutar SQL en MySQL, datos semilla, backend, frontend, pruebas, informe y demo.
El script requiere MySQL 8.0.16 o superior para aplicar las restricciones CHECK.
