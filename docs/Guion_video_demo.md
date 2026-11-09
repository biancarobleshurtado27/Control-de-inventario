# Guion de video demo — máximo 5 minutos

Duración objetivo: 4 minutos 40 segundos. Este archivo es una guía; el video todavía debe grabarse.

## Preparación antes de grabar
- Iniciar MySQL y el servidor. Abrir la URL que muestra la terminal (npm start usa el puerto definido en .env; en las revisiones se usó 3002).
- Mostrar únicamente el navegador y el proyecto necesario. Mantener cerrados .env y cualquier copia con contraseñas.
- Probar el audio y evitar notificaciones durante la grabación.
- Usar un número de OC y un lote nuevos. Los registros de la demostración quedarán en la base de datos; no ejecutar nuevamente seed.sql.
- Si la base conserva el estado inicial: cemento 190, varilla 850, block 2800 y arena 14. Si ya hiciste movimientos, explica los saldos reales que se muestran.

## 0:00–0:30 — Problema y solución
Mostrar Resumen.

Texto sugerido:
«Este sistema resuelve el control de materiales de Constructora Del Valle. Permite conocer las existencias por ubicación, registrar movimientos, detectar necesidades de reposición y revisar compras posiblemente duplicadas. Está construido con Node.js, Express y una base de datos MySQL, con una interfaz web que consume la API.»

## 0:30–1:10 — Stock y alerta obligatoria
Mostrar existencias y la tabla Requieren reposición.

«El stock no se escribe directamente: se calcula a partir de los movimientos. El punto de reorden es demanda promedio por tiempo de entrega más stock de seguridad. En los datos iniciales, block tiene 2800 unidades frente a un punto de reorden de 3600; arena tiene 14 metros cúbicos frente a 20. Por eso aparecen estas dos alertas.»

Esta vista ya cumple el requisito de mostrar un caso de alerta. No hace falta provocar un error para cumplirlo.

## 1:10–2:10 — Orden, aprobación y recepción
1. Abrir Órdenes de compra.
2. Crear una OC con número único, fecha de la demostración, Proveedor A, Bodega Central, cemento, cantidad 2 y precio 6300.
3. Seleccionar la nueva OC pendiente y aprobarla.
4. Abrir Movimientos. Tipo ENTRADA, cemento, cantidad 2, usuario Bianca, destino Bodega Central y la línea de la nueva OC.
5. Lote nuevo: DEMO-CEM-01 (cambiar si ya existe); documento: número de la OC; motivo: Recepción de demostración.
6. Guardar y volver a Resumen: cemento debe subir dos unidades respecto del saldo anterior.

«La recepción requiere una OC aprobada y no puede superar su cantidad. El proveedor y el documento de origen se pueden consultar después mediante la trazabilidad.»

## 2:10–2:55 — Traslado
Registrar TRASLADO del mismo material y lote: cantidad 1, origen Bodega Central y destino Obra Principal, documento TRAS-DEMO-01, motivo Abastecimiento de obra.

«El traslado descuenta una unidad del origen y suma una en el destino dentro de una sola transacción. El total de la empresa no cambia y se conserva el lote.»

## 2:55–3:30 — Trazabilidad
Seleccionar cemento en Trazabilidad y consultar.

«El historial conserva fecha, usuario, cantidad, ubicaciones, lote y documento. La entrada está asociada con la OC y el traslado conserva la referencia a esa procedencia.»

Desplazar horizontalmente la tabla si es necesario para mostrar OC de origen.

## 3:30–4:10 — Compras sospechosas
Abrir Compras sospechosas.

«La regla compara el mismo proveedor y material, hasta tres días de diferencia y cantidades cuya diferencia no exceda el cinco por ciento de la mayor. Detecta las OC 1041 y 1042, y también 1050 y 1053. Son alertas para investigar; no se declaran pérdidas confirmadas automáticamente.»

## 4:10–4:40 — Pruebas y cierre
«Se probaron recepciones parciales, excesos de recepción, stock insuficiente y salidas simultáneas. Se usan transacciones para conservar la integridad. Este es un prototipo local: la aprobación es manual y falta autenticación por roles para utilizarlo públicamente. La solución permite explicar cada existencia y anticipar compras.»

## Verificación del archivo final
- Duración menor o igual a 5 minutos y audio comprensible.
- Mostrar sistema funcionando y al menos una alerta o detección.
- No mostrar contraseñas ni archivos .env.
- Revisar la reproducción del video antes de entregarlo.
