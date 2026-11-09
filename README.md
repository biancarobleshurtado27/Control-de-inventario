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

## Movimientos
GET /api/movimientos lista los últimos 200 registros. POST /api/movimientos recibe tipo, material_id, usuario_id, cantidad, documento, motivo, lote, origen_id y destino_id. ENTRADA requiere orden_detalle_id aprobado y destino coincidente; SALIDA requiere origen; TRASLADO requiere origen y destino distintos; AJUSTE requiere solo uno de ellos. El lote se conserva al salir o trasladar. No se permiten saldos negativos por lote ni recepciones por encima de la cantidad de la OC. Los movimientos se serializan por material dentro de transacciones. Al recibir un traslado, la ubicación hereda inicialmente los límites de stock del material, editables en futuras mejoras.

## Duplicados y trazabilidad
- GET /api/ordenes/posibles-duplicados: compara órdenes no canceladas del mismo proveedor y material. Acumula las líneas del mismo material por OC, compara pares una sola vez y aplica los parámetros de configuracion: hasta 3 días y diferencia de hasta 5 % respecto de la cantidad mayor. Los resultados son sospechas para revisión, no duplicados confirmados.
- GET /api/materiales/:id/trazabilidad: historial con usuario, origen, destino, documento, lote y OC de procedencia. Los saldos iniciales no tienen OC: se identifican por su documento de ajuste.
- Los lotes conservan su vínculo con la OC al trasladarse o salir.

## Pruebas funcionales
Con .env configurado y la base inicial cargada:
- node tests/movimientos.mjs
- node tests/recepcion-consultas.mjs
Estas pruebas crean datos temporales y los eliminan al terminar. La segunda verifica los pares OC-1041/OC-1042 y OC-1050/OC-1053 de los datos semilla, recepción parcial y completa, rechazo de exceso y trazabilidad después de un traslado.

## Interfaz web
Al iniciar el servidor, abrir http://localhost:3000/. Incluye resumen de existencias, alertas, búsqueda, catálogo y registro de materiales, registro de movimientos, posibles duplicados y trazabilidad. La interfaz usa la misma API y no requiere instalación adicional. Para ENTRADA se selecciona una línea de OC existente aprobada; la creación de nuevas OC sigue pendiente. La selección de usuario identifica al responsable, pero todavía no constituye autenticación.
Prueba de entrega de archivos y consultas: node tests/frontend-smoke.mjs. La revisión visual manual en navegador está pendiente.

## Revisión de interfaz en navegador
Revisado en Chrome, ventana de aproximadamente 860 px de ancho: dashboard, catálogo, formulario de materiales, formulario de movimientos, trazabilidad y posibles duplicados. Las tablas anchas disponen de desplazamiento horizontal.
Se creó un material temporal desde el formulario y se comprobó el mensaje de guardado y su aparición en el catálogo. Se comprobó el rechazo de un ajuste sin ubicación y luego el guardado de un ajuste de cinco unidades con destino válido. Se consultó el historial de cemento y se visualizaron los dos pares esperados de compras sospechosas. Los datos temporales se eliminaron al finalizar.
Pendiente ampliar las pruebas manuales a todos los tipos de movimiento y a pantalla móvil.
