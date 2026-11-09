# Control de inventario — Quiz 2

## Preparación
1. Instalar Node.js LTS y MySQL 8.0.16 o superior.
2. Ejecutar db/schema.sql y luego db/seed.sql una sola vez sobre una base nueva.
3. Ejecutar npm install.
4. Copiar .env.example a .env y completar el usuario y contraseña de MySQL localmente.
5. Ejecutar npm start.
6. Abrir http://localhost:3000/api/salud. Debe responder estado ok y baseDeDatos conectada.

## Consultas disponibles
- GET /api/materiales: catálogo y cálculos de seguridad y reorden.
- GET /api/ubicaciones: bodegas y obras.
- GET /api/stock: saldos por material y ubicación con política configurada.
- GET /api/alertas/reorden: materiales por debajo del PR.

Con los datos iniciales, stock devuelve 190, 850, 2800 y 14. Alertas devuelve block y arena.
La API se escucha únicamente en la computadora local. Todavía no incluye autenticación, escritura de movimientos ni frontend.
No publicar .env ni credenciales. Los datos son ficticios, tomados del enunciado del quiz; mínimos y máximos son supuestos documentados en seed.sql.

## Registrar material
POST /api/materiales recibe codigo, nombre, categoria, subcategoria, unidad, demanda_promedio, demanda_maxima, tiempo_entrega, ubicacion_id, stock_minimo y stock_maximo. Devuelve 201; datos inválidos 400; código repetido 409. El stock inicial es cero y solo cambia mediante movimientos. El material y su política se crean juntos mediante una transacción.
