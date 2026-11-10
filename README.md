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
La API y la interfaz se escuchan únicamente en la computadora local. Incluye escritura de materiales, movimientos y órdenes; no incluye autenticación.
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
Al iniciar el servidor, abrir http://localhost:3000/. Incluye resumen de existencias, alertas, búsqueda, catálogo y registro de materiales, registro de movimientos, posibles duplicados y trazabilidad. La interfaz usa la misma API y no requiere instalación adicional. Para ENTRADA se selecciona una línea de OC existente aprobada; las nuevas OC se crean desde Órdenes de compra. La selección de usuario identifica al responsable, pero todavía no constituye autenticación.
Prueba de entrega de archivos y consultas: node tests/frontend-smoke.mjs. La revisión inicial en Chrome está documentada al final de este archivo; queda pendiente la vista móvil.

## Revisión de interfaz en navegador
Revisado en Chrome, ventana de aproximadamente 860 px de ancho: dashboard, catálogo, formulario de materiales, formulario de movimientos, trazabilidad y posibles duplicados. Las tablas anchas disponen de desplazamiento horizontal.
Se creó un material temporal desde el formulario y se comprobó el mensaje de guardado y su aparición en el catálogo. Se comprobó el rechazo de un ajuste sin ubicación y luego el guardado de un ajuste de cinco unidades con destino válido. Se consultó el historial de cemento y se visualizaron los dos pares esperados de compras sospechosas. Los datos temporales se eliminaron al finalizar.
Pendiente ampliar las pruebas manuales a todos los tipos de movimiento y a pantalla móvil.

## Órdenes de compra
La pantalla Órdenes de compra permite crear una OC de una línea y aprobar órdenes pendientes. La API POST /api/ordenes también admite hasta 100 materiales distintos en detalles. GET /api/proveedores alimenta el selector. POST /api/ordenes/:id/aprobar cambia únicamente órdenes pendientes a aprobadas. Esta aprobación es manual y no implementa roles ni la matriz monetaria (extra opcional). La recepción exige estado aprobado. El estado no cambia automáticamente a RECIBIDA; el límite acumulado de recepción impide recibir de más.
Prueba del flujo completo: node tests/ordenes.mjs (datos temporales con limpieza automática).


## Verificación de pantalla de órdenes
Revisada en Chrome: formulario de número, fecha, proveedor, destino, material, cantidad y precio; listado de las siete OC semilla; selector de pendientes y aprobación deshabilitada cuando no hay pendientes. La creación y recepción completas se verifican mediante tests/ordenes.mjs. La creación y aprobación desde navegador y la distribución móvil se verificaron posteriormente; ver Validación adicional de interfaz.
Las copias de archivos cuyo nombre comienza con .env también están excluidas de Git. Solo .env.example se publica y no contiene contraseñas.

## Validación adicional de interfaz
Se creó UI-OC-1109 con dos unidades de cemento desde el formulario y se aprobó desde el selector. Ambos mensajes de éxito se verificaron en pantalla y la OC temporal se eliminó después, sin afectar órdenes originales.
Se comprobó la distribución de Órdenes en un viewport de 390 × 844: formulario de una columna, campos de unos 298 px dentro del ancho visible y navegación horizontal. No se detectó desbordamiento horizontal del documento. La captura de imagen móvil no estuvo disponible; esta comprobación fue de dimensiones y estilos del navegador, no una inspección visual completa en un teléfono. Se restauró el viewport normal.


## Revisión integral y seguridad básica
Las cinco suites funcionales fueron ejecutadas: entrega del frontend, movimientos y concurrencia, recepción y trazabilidad, órdenes y seguridad básica. Para repetirlas: npm test (requiere MySQL y .env configurados). Los datos temporales se eliminan al finalizar.
Se verificó que .env, .git/config, package.json y los scripts SQL no se publican por HTTP. Se añadieron cabeceras para limitar recursos al mismo origen, impedir inclusión en marcos y evitar detección de tipos MIME. JSON mal formado responde 400 y solicitudes mayores a 100 KB responden 413.
En Git solo se publica .env.example; .env y sus copias están ignorados. Las consultas que reciben datos usan parámetros y la interfaz inserta los textos con textContent.
Alcance: prototipo académico local, sin autenticación ni autorización por roles. Elegir un usuario en el formulario no verifica su identidad. No se considera listo para exposición pública sin implementar esos controles. La matriz monetaria de aprobación es un extra no implementado.

## Informe
El borrador de nueve páginas está en docs/Informe_Gestion_Inventarios_Borrador.pdf. Incluye A1-A5, circuito de compra, modelo entidad-relación, descripción del sistema, pruebas, conclusiones y fuentes. Falta confirmar el nombre completo de la autora. docs/Informe_contenido.md conserva el texto base; el PDF incluye además los diagramas gráficos.

## Preparar la entrega
- docs/Informe_Gestion_Inventarios_Borrador.pdf: informe de nueve páginas; pendiente nombre completo y revisión de autora.
- docs/Guion_video_demo.md: guion cronometrado para grabar un video de menos de cinco minutos. No es un video grabado.
- docs/Guia_exposicion_y_codigo.md: estructura para diez minutos y preguntas para practicar la explicación. No es un archivo de diapositivas.
- Video y exposición: pendientes de realizar. Antes de grabar, cerrar archivos .env y usar números de OC y lotes nuevos. Los movimientos de una demo real quedan en la base y no deben confundirse con el estado inicial del seed.

## Identidad visual
El frontend utiliza el estilo Materiales del Valle: base arena, superficies marfil, terracota para acciones y verde oliva para estados. Los encabezados serif y la numeración del menú distinguen la navegación. Los indicadores de reposición incluyen texto, además de color. Formularios y menú se adaptan a pantallas estrechas. Al cambiar de sección, la página vuelve al inicio.
