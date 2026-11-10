# Materiales del Valle · Control de inventario

Prototipo académico para Constructora Del Valle S.A., opción 2 del Quiz de Gestión de Inventarios. Incluye una interfaz web y una API REST con Node.js, Express y MySQL.

## Requisitos
- Node.js LTS compatible con Express 5 (Node 20 o superior).
- MySQL 8.0.16 o superior, iniciado y accesible localmente.
- npm y una cuenta MySQL con acceso a la base del proyecto.

## Instalación y ejecución
1. En una base nueva, ejecutar `backend/db/schema.sql` y después `backend/db/seed.sql`, una sola vez. No repetirlos sobre datos de trabajo.
2. Desde la raíz del proyecto, ejecutar `npm ci`.
3. Copiar `backend/.env.example` a `backend/.env` y completar los datos de conexión localmente. No publicar contraseñas.
4. Ejecutar `npm start`. Para desarrollo con reinicio automático: `npm run dev`.
5. Abrir la dirección indicada en la terminal. El valor predeterminado es `http://localhost:3000`; si `PORT=3002`, abrir `http://localhost:3002`.
6. Abrir `/api/salud`: debe responder `estado: ok` y `baseDeDatos: conectada`.

Frontend y backend comparten el mismo servidor: no hay que iniciar dos proyectos. `frontend/` contiene la interfaz y `backend/src/` contiene la API. El servidor escucha solamente en la computadora local.

## Configuración
| Variable | Uso |
|---|---|
| PORT | Puerto web, predeterminado 3000 |
| DB_HOST | Servidor MySQL, predeterminado localhost |
| DB_PORT | Puerto MySQL, predeterminado 3306 |
| DB_USER | Usuario local MySQL |
| DB_PASSWORD | Contraseña local MySQL |
| DB_NAME | Base de datos, inventario_quiz |

`.env` y sus copias están excluidos de Git. Solo `.env.example` contiene un ejemplo publicable sin contraseña.

## Funciones
- Dashboard de existencias y alertas por ubicación, con búsqueda de materiales.
- Registro de materiales, demanda, tiempo de entrega y política de mínimos/máximos.
- Entradas por compra, salidas, traslados y ajustes con lote, usuario y documento.
- Órdenes de compra pendientes y aprobación manual antes de recibirlas.
- Detección configurable de posibles compras duplicadas.
- Historial por material y trazabilidad de la OC de origen mediante el lote.

## Reglas de negocio
**Stock:** entradas recibidas menos salidas enviadas, incluyendo traslados y ajustes. No se edita directamente. Un traslado afecta ambas ubicaciones en una sola operación.

**Stock de seguridad:** (demanda máxima - demanda promedio) × tiempo de entrega.

**Punto de reorden:** demanda promedio × tiempo de entrega + stock de seguridad. La alerta aparece cuando el stock es estrictamente menor al PR. Demanda y entrega son parámetros globales del material; los límites mínimo y máximo son por ubicación.

**Duplicados:** mismo proveedor y material, hasta tres días de diferencia y cantidades cuya diferencia sea de hasta 5 % respecto de la mayor. Los parámetros están en `configuracion`. Se acumulan líneas por material dentro de cada OC, se excluyen órdenes canceladas y cada par se compara una sola vez. Es una sospecha para revisión, no una pérdida confirmada.

**Recepciones:** requieren OC aprobada, material y destino coincidentes. La suma recibida no puede superar la cantidad pedida. Los saldos iniciales se registran como ajustes, no como compras inventadas.

**Concurrencia y trazabilidad:** las transacciones bloquean el material antes de registrar movimientos. Se verifica saldo por lote y ubicación. Salidas y traslados conservan el lote. No hay funciones para borrar movimientos históricos; las correcciones operativas se registran mediante movimientos compensatorios documentados.

## API
| Método | Ruta | Función |
|---|---|---|
| GET | /api/salud | Comprobar MySQL |
| GET / POST | /api/materiales | Consultar o registrar materiales |
| GET | /api/ubicaciones | Ubicaciones disponibles |
| GET | /api/usuarios | Responsables disponibles |
| GET | /api/proveedores | Proveedores disponibles |
| GET | /api/stock | Existencias por material y ubicación con política |
| GET | /api/alertas/reorden | Alertas calculadas |
| GET / POST | /api/movimientos | Últimos 200 movimientos o nuevo registro |
| GET / POST | /api/ordenes | Líneas de OC o creación de una OC |
| POST | /api/ordenes/:id/aprobar | Aprobar una orden pendiente |
| GET | /api/ordenes/posibles-duplicados | Pares sospechosos y regla aplicada |
| GET | /api/materiales/:id/trazabilidad | Historial y OC de origen |

POST /api/materiales recibe codigo, nombre, categoria, subcategoria, unidad, demanda_promedio, demanda_maxima, tiempo_entrega, ubicacion_id, stock_minimo y stock_maximo. El material nuevo inicia con cero existencias.

POST /api/movimientos recibe tipo, material_id, usuario_id, cantidad, documento, motivo, lote y las ubicaciones correspondientes. ENTRADA requiere destino y orden_detalle_id; SALIDA requiere origen; TRASLADO requiere ambos y deben ser distintos; AJUSTE requiere solo origen para reducir o solo destino para aumentar.

POST /api/ordenes recibe numero, fecha (AAAA-MM-DD), proveedor_id, ubicacion_id y detalles con material_id, cantidad y precio_unitario. La API admite hasta 100 materiales distintos. La interfaz captura una línea por OC.

Respuestas comunes: 201 creación correcta, 400 entrada inválida, 404 recurso no encontrado, 409 conflicto y 413 solicitud mayor a 100 KB. Los errores internos no devuelven credenciales.

## Datos semilla y demostración
| Material | Stock inicial | Seguridad | PR |
|---|---:|---:|---:|
| Cemento | 190 | 45 | 165 |
| Varilla | 850 | 200 | 800 |
| Block | 2800 | 1200 | 3600 |
| Arena | 14 | 8 | 20 |

Block y arena generan las dos alertas iniciales. Las OC de A3 se cargan aprobadas para demostrar duplicados, sin sumarlas a los saldos iniciales de A5. Se esperan OC-1041/OC-1042 y OC-1050/OC-1053. Mínimos y máximos son supuestos del prototipo documentados en seed.sql.

Para una demo: mostrar alertas, crear una OC con número único, aprobarla, registrar su entrada con un lote nuevo y consultar trazabilidad. Los registros de una demo real quedan en la base. No volver a cargar seed.sql para restablecer datos.

## Pruebas
- `npm run check`: revisar sintaxis de backend y frontend.
- `npm test`: ejecutar cinco suites de pruebas funcionales.
- Requieren MySQL, .env y los datos semilla. Crearán datos temporales identificados como pruebas y los eliminarán al finalizar. Ejecutarlas únicamente en la base académica de desarrollo.

Cobertura: entrega de archivos web, consultas iniciales, saldos por lote, salidas simultáneas, traslados, recepciones parciales y completas, rechazo de excesos, creación/aprobación de OC, duplicados, trazabilidad, archivos privados y errores JSON.

Se probaron formularios en navegador antes del rediseño. La distribución de órdenes se verificó a 390 × 844, pero falta una revisión visual completa en teléfono. El nuevo estilo tierra aún requiere revisión visual en navegador.

## Seguridad y límites
- Consultas con parámetros y validaciones de entrada.
- Solo frontend/ se sirve por HTTP. No se sirven .env, scripts SQL ni .git.
- Cabeceras para recursos del mismo origen, impedir marcos y evitar detección de tipos MIME.
- Prototipo local sin autenticación ni permisos por rol. Seleccionar usuario no verifica identidad.
- La aprobación manual no aplica la matriz monetaria A1, que es un extra opcional.
- El estado de una OC no cambia automáticamente a RECIBIDA; el límite acumulado impide recibir de más.
- Una ubicación receptora nueva hereda inicialmente los límites de una política existente del material.

## Entregables y pendientes
- docs/Informe_Gestion_Inventarios_Borrador.pdf: nueve páginas con A1-A5, circuito, modelo, solución, conclusiones y fuentes. Falta confirmar nombre completo y revisión de la autora.
- docs/Informe_contenido.md: texto base del informe.
- docs/Guion_video_demo.md: guía del video. La grabación está pospuesta y todavía no existe un video final entregable.
- docs/Guia_exposicion_y_codigo.md: material de estudio opcional. La usuaria indicó que no realizará diapositivas ni presentación.

El informe usa el enunciado Trabajo_Gestion_de_Inventarios_Quiz_2.pdf como fuente de datos ficticios. No se extraen precios de sitios externos. El código se desarrolló con apoyo de IA y utiliza Express, mysql2 y dotenv. La autora debe revisar y comprender lo entregado.

## Identidad visual
Materiales del Valle utiliza arena, marfil, terracota y oliva, encabezados serif y navegación numerada. Los estados incluyen texto, además de color. Los formularios se adaptan al ancho disponible y cada sección vuelve al inicio al abrirse.

## Organización del proyecto
```text
backend/
  .env.example             Ejemplo público sin contraseña
  .env                     Configuración local ignorada por Git
  db/                      Creación SQL y datos semilla
  src/
    index.js               Servidor y manejo de errores
    db.js                  Conexión MySQL
    routes/                Rutas HTTP de la API
    controllers/           Validaciones, consultas y respuestas
  tests/                   Pruebas del servidor y entrega del frontend
frontend/
  index.html               Estructura HTML de las seis pantallas
  styles/styles.css        Identidad visual y adaptación de tamaños
  src/
    app.js                 Inicio y actualización de datos
    components/ui.js       Tablas, selectores y mensajes reutilizables
    components/forms.js    Envío común de formularios
    services/api.js        Solicitudes HTTP a /api
    routes/router.js       Navegación por hash y sección activa
    pages/                 Lógica de cada pantalla
      resumen.js
      materiales.js
      movimientos.js
      ordenes.js
      duplicados.js
      trazabilidad.js
package.json               Comandos y dependencias compartidas
package-lock.json          Versiones reproducibles
README.md
```

Ejecutar npm ci, npm start, npm run dev, npm run check y npm test desde la raíz. La separación es de archivos y responsabilidades: Express sigue sirviendo ambos lados en el mismo puerto, sin necesitar CORS ni dos servidores. frontend/index.html no se abre con doble clic: se accede mediante la URL local del servidor.

El frontend usa módulos nativos de JavaScript, no React. pages/ contiene la lógica por pantalla y index.html sus secciones HTML. components/ reúne los elementos reutilizables, services/ centraliza la API y routes/ permite enlaces como /#materiales y /#ordenes, además de Atrás/Adelante. No requiere JSX, Vite ni React Router para cumplir el enunciado.

No existe una capa ORM: los controladores usan consultas SQL con parámetros y db.js centraliza el pool. Las direcciones /api existentes se conservan.
