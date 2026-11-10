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
- [x] Seis suites de pruebas: cinco existentes y una con 26 casos de middlewares.
- [x] Cinco middlewares de validación conectados antes de los controladores.
- [x] Configuración privada fuera de Git y README reproducible.
- [x] Informe borrador de 9 páginas, actualizado a la arquitectura actual.

## Pendientes
- [ ] Confirmar nombre completo de la autora y finalizar portada.
- [ ] Revisión visual del nuevo estilo en escritorio.
- [ ] Revisión visual completa en teléfono y formularios tras modularizar.
- [ ] Revisión y aceptación final del informe por la autora.
- [ ] Grabar y revisar video de máximo 5 minutos con alerta o detección. Pospuesto por la usuaria; no hay video final entregable.
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

