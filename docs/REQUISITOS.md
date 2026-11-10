# Requisitos y estado de entrega

Última revisión: 10 de noviembre de 2026.

## Terminados
- [x] Opción 2, Node.js + Express, MySQL y frontend web.
- [x] A1: circuito, responsables, documentos, controles y matriz de aprobación.
- [x] A2: taxonomía, equivalencias, códigos y ahorro.
- [x] A3: duplicados sospechosos, sobreprecios, escenarios y controles.
- [x] A4: matriz ponderada y recomendación de proveedores.
- [x] A5: stock de seguridad, reorden, prioridades y trazabilidad.
- [x] Modelo de datos y diagrama entidad-relación.
- [x] Scripts SQL y datos semilla, verificados en MySQL.
- [x] Materiales y políticas de stock con validaciones.
- [x] Entrada, salida, traslado y ajuste con control por lote.
- [x] Stock derivado de movimientos y alertas de reorden.
- [x] Detección configurable de posibles duplicados.
- [x] Historial y OC de procedencia mediante el lote.
- [x] Creación y aprobación manual de órdenes.
- [x] Backend con routes y controllers separados.
- [x] Frontend con components, services, routes y pages.
- [x] Ocho suites: ORM, backend, middlewares y prueba DOM del frontend con API simulada.
- [x] Cinco middlewares de validación conectados antes de los controladores.
- [x] Configuración privada fuera de Git y README reproducible.
- [x] Informe borrador de 9 páginas, actualizado a la arquitectura actual.

## Revisión final pendiente
- [x] Portada con Bianca Robles Hurtado.
- [x] Diseño de Stitch integrado con animaciones y tipografías locales.
- [ ] Revisión visual del diseño Stitch en escritorio (herramienta de navegador no disponible).
- [ ] Revisión visual completa en teléfono y formularios tras modularizar.
- [ ] Revisión y aceptación final del informe por la autora.
- [ ] Video de máximo 5 minutos: cancelado por la usuaria; no se generará. Verificar con el docente si se exige para la entrega.
- [ ] Realizar la entrega en el canal indicado por el docente.

## Alcance y preferencias
La usuaria indicó que no realizará presentación ni diapositivas. El enunciado sí enumera presentación en clase: su exención no se ha verificado aquí. La implementación de roles y matriz monetaria dentro del sistema es un extra y no está incluida. El prototipo opera localmente y no tiene autenticación.

## Para revisar visualmente
Abrir el servidor y comprobar, sin escribir contraseñas en capturas:
1. Resumen: cuatro materiales y alertas iniciales de block y arena (si no hubo nuevos movimientos).
2. Navegación entre las seis secciones, recarga de /#materiales y Atrás/Adelante.
3. Textos legibles y sin recortes en escritorio y teléfono.
4. Formularios de material, movimiento y OC; mensajes de éxito/error visibles.
5. Selecciones de ubicación y material correctas después de actualizar.

Las pruebas que escriben registros temporales deben ejecutarse solo en la base académica de desarrollo. No repetir seed.sql sobre una base con datos de trabajo.




## Mejoras adicionales completadas
- [x] Editar materiales y políticas por ubicación sin alterar movimientos.
- [x] Errores por campo y conservación de los datos rechazados.
- [x] Estados de recepción de OC y cantidades recibidas/pendientes.
- [x] Selector de lotes con saldo por material y origen.
- [x] Filtros de bitácora aplicados en el servidor y conservados al actualizar.
- [x] Confirmación accesible antes de guardar y aprobar; cancelación sin cambios.
- [x] Pruebas DOM y de integración MySQL ampliadas y verificadas.
- [ ] Revisar visualmente los nuevos diálogos, filtros y edición en escritorio y móvil.

## Capa ORM
- [x] Sequelize configurado con MySQL y el mismo archivo .env.
- [x] Nueve modelos, relaciones y clave compuesta de políticas.
- [x] Controladores conectados al ORM y reportes mediante SQL parametrizado en Sequelize.
- [x] Transacciones y bloqueos de inventario conservados.
- [x] Uso de las tablas existentes sin sincronización destructiva.
- [x] Prueba de modelos, relaciones y rollback; regresión de los flujos existentes.

- [ ] Regenerar el PDF del informe con las últimas mejoras y la capa ORM; el texto fuente y README ya describen Sequelize.
