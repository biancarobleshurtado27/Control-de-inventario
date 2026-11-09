
## Quiz 2 · Informe del prototipo

<b>Constructora Del Valle S.A.</b><br/>Opción 2: control de inventario para una empresa de construcción.

<b>Autora:</b> pendiente de confirmar nombre completo.<br/><b>Modalidad:</b> individual.<br/><b>Fecha de preparación:</b> 9 de noviembre de 2026.

<b>Tecnologías:</b> Node.js, Express, MySQL y una interfaz web con HTML, CSS y JavaScript.

Repositorio: https://github.com/biancarobleshurtado27/Control-de-inventario

Este informe reúne el análisis de compras, los cálculos de inventario y la solución implementada. Los datos de negocio son ficticios y proceden del enunciado del quiz. Los supuestos adicionales se identifican en cada sección.

<b>Estado:</b> borrador para revisión. Falta confirmar el nombre completo de la autora. El video y la presentación son entregables separados.


## A1. Circuito de compra y aprobaciones

| Etapa / responsable | Documento | Control |

| Requisición / área solicitante | Requisición y justificación | Revisar necesidad, stock y destino. |

| Aprobación / autoridad por monto | Autorización registrada | Verificar presupuesto, cotizaciones y compras relacionadas. |

| OC / Compras | Orden al proveedor | Respetar condiciones aprobadas y contratos. |

| Recepción / bodega u obra | Acta de recepción | Contar, revisar calidad y registrar diferencias. |

| Factura / Cuentas por Pagar | Factura validada | Conciliar OC, recepción y factura; revisar duplicados. |

| Pago / Tesorería | Comprobante | Verificar aprobación, vencimiento y cuenta del proveedor. |

| Monto | Aprueba | Cotizaciones |

| Hasta ₡250 000 | Jefatura del área | 1 |

| Más de ₡250 000 hasta ₡2 000 000 | Jefatura de Compras | 2 |

| Más de ₡2 000 000 hasta ₡10 000 000 | Gerencia Financiera | 3 |

| Más de ₡10 000 000 | Gerencia General | 3 y comité |

<b>Riesgo:</b> dividir ₡900 000 en cuatro órdenes de ₡225 000 evita controles superiores. Se propone aprobar por necesidad total, acumular compras relacionadas por proyecto y revisar coincidencias de proveedor/categoría en siete días. La alerta exige investigación, no confirma fraude.

Separar solicitante, aprobador, receptor y pagador; impedir autoaprobación; registrar cambios y justificar urgencias o proveedor único. Los límites monetarios se expresan sin vacíos entre rangos.


## A2. Taxonomía y normalización de materiales

| Línea | Categoría / subcategoría | Código estándar | Artículo |

| 1, 2, 3 | Materiales de construcción / Cementos | CEM-GRI-50 | Cemento gris, saco 50 kg |

| 4, 5 | Materiales de construcción / Acero de refuerzo | VAR-03-G40-6M | Varilla #3, grado 40, 6 m |

| 6 | Seguridad y protección / Guantes | EPP-GUA-NIT-L | Guantes de nitrilo L |

| 7 | Seguridad y protección / Guantes | EPP-GUA-TRA-L | Guantes de trabajo L |

| 8 | Instalaciones / Tubería PVC | PVC-050-S135 | PVC 1/2, SDR 13.5 |

<b>Supuestos:</b> la línea 2 se considera cemento gris de 50 kg. Las líneas 4 y 5 se consideran del mismo grado y longitud. Deben confirmarse sus fichas antes de unificarlas en una empresa real. Los guantes de las líneas 6 y 7 no se consideran equivalentes: su material y protección pueden diferir.


## Ahorro al menor precio observado

| Línea | Cantidad | Precio pagado | Mejor precio | Ahorro |

| 1 | 200 | ₡6 450 | ₡6 300 | ₡30 000 |

| 2 | 40 | ₡7 100 | ₡6 300 | ₡32 000 |

| 3 | 300 | ₡6 300 | ₡6 300 | ₡0 |

| 4 | 500 | ₡2 150 | ₡2 150 | ₡0 |

| 5 | 60 | ₡2 600 | ₡2 150 | ₡27 000 |

Cemento: gasto original ₡3 464 000; 540 × ₡6 300 = ₡3 402 000; ahorro <b>₡62 000</b>. Varilla: gasto original ₡1 231 000; 560 × ₡2 150 = ₡1 204 000; ahorro <b>₡27 000</b>. Ahorro conjunto: <b>₡89 000</b>. Se suponen condiciones equivalentes de calidad, transporte e impuestos.

Sin códigos y categorías uniformes, el mismo insumo aparece fragmentado entre áreas y nombres distintos. La empresa no puede identificar correctamente el volumen total ni comparar precios equivalentes. Normalizar permite consolidar cantidades, detectar sobrecostos y negociar mejores condiciones por volumen.


## A3. Compras duplicadas y fuga de valor

<b>OC-1041 y OC-1042:</b> mismo proveedor A, cemento de 50 kg, 200 sacos, precio ₡6 450 y fecha 02/10. Constituyen la sospecha más fuerte. Verificar requisiciones, destinos, recepciones y facturas antes de confirmar duplicidad.

<b>OC-1050 y OC-1053:</b> proveedor C, varilla, 500 y 480 unidades, con un día de diferencia. La diferencia es 20/500 = 4 %. Regla del prototipo: mismo proveedor y material, hasta tres días y hasta 5 % de diferencia sobre la cantidad mayor. Se excluyen canceladas y se acumulan líneas del mismo material por OC.

Contrato A: cemento ₡6 300 y varilla ₡2 050. Sobreprecio = cantidad × (precio pagado - precio contratado).

| OC | Cantidad | Precio pagado | Referencia | Sobreprecio |

| 1041 | 200 | ₡6 450 | ₡6 300 | ₡30 000 |

| 1042 | 200 | ₡6 450 | ₡6 300 | ₡30 000 |

| 1047 | 40 | ₡7 100 | ₡6 300 | ₡32 000 |

| 1050 | 500 | ₡2 150 | ₡2 050 | ₡50 000 |

| 1053 | 480 | ₡2 150 | ₡2 050 | ₡48 000 |

| 1058 | 60 | ₡2 600 | ₡2 050 | ₡33 000 |

| 1061 | 300 | ₡6 300 | ₡6 300 | ₡0 |

Compras a proveedores fuera del contrato: OC-1047, 1050, 1053 y 1058, por <b>₡2 547 000</b>. OC-1041 y 1042 incumplen el precio contratado aunque usan A. Incluyéndolas, el gasto no conforme es ₡5 127 000. El gasto no conforme completo no equivale a pérdida, porque puede existir material recibido útil.

<b>Escenario sin duplicidad confirmada:</b> sobreprecio mensual ₡223 000; proyección anual ₡2 676 000. <b>Si OC-1042 se confirma innecesaria y totalmente irrecuperable:</b> ₡1 290 000 + (₡223 000 - ₡30 000) = <b>₡1 483 000</b>; anual <b>₡17 796 000</b>. Se resta su sobreprecio para no contarlo dos veces. La anualización supone repetición mensual; no es una pérdida anual comprobada.

<b>Tres controles:</b> alerta previa por coincidencias; validación automática de precio y proveedor contratado con excepción autorizada; conciliación de OC, recepción y factura antes de pagar, bloqueando facturas repetidas.


## A4. Evaluación ponderada de proveedores

Se comparan proveedores ficticios con notas académicas de 1 (muy bajo) a 5 (excelente). Una nota mayor en precio significa menor costo total; en dependencia significa menor riesgo. No se atribuyen estas notas a empresas reales.

| Criterio | Peso | A | B | C |

| Precio | 30 % | 5 | 4 | 3 |

| Calidad | 25 % | 4 | 5 | 4 |

| Cumplimiento de plazos | 20 % | 3 | 5 | 4 |

| Condiciones de crédito | 10 % | 4 | 4 | 5 |

| Servicio posventa | 10 % | 3 | 4 | 5 |

| Menor riesgo de dependencia | 5 % | 4 | 4 | 5 |

| Total / resultado | 100 % | 4,00 | 4,45 | 3,95 |

Puntaje = suma de (nota × peso decimal). A: 1,50 + 1,00 + 0,60 + 0,40 + 0,30 + 0,20 = <b>4,00</b>. B: 1,20 + 1,25 + 1,00 + 0,40 + 0,40 + 0,20 = <b>4,45</b>. C: 0,90 + 1,00 + 0,80 + 0,50 + 0,50 + 0,25 = <b>3,95</b>.

Precio recibe el mayor peso por su impacto directo en gasto. Calidad y plazos evitan rechazos y paros de obra. Crédito, servicio y dependencia completan la evaluación del costo y continuidad operativa.

<b>Recomendación:</b> mantener B como principal y A como alternativa. B ofrece el mejor desempeño global y A una ventaja de precio. Como propuesta inicial negociable, asignar 70 % a B y 30 % a A, sujeto a capacidad y contratos vigentes. Mantener dos fuentes reduce dependencia sin dispersar demasiado el volumen; revisar desempeño periódicamente con datos reales.


## A5. Stock de seguridad y punto de reorden

<b>SS = (demanda máxima - demanda promedio) × entrega.</b><br/><b>PR = demanda promedio × entrega + SS.</b>

| Material | SS | PR | Stock | Decisión |

| Cemento | (55 - 40) × 3 = 45 | 40 × 3 + 45 = 165 | 190 | Vigilar |

| Varilla | (160 - 120) × 5 = 200 | 120 × 5 + 200 = 800 | 850 | Vigilar |

| Block | (900 - 600) × 4 = 1 200 | 600 × 4 + 1 200 = 3 600 | 2 800 | Reponer |

| Arena | (10 - 6) × 2 = 8 | 6 × 2 + 8 = 20 | 14 | Reponer |

<b>Prioridad 1: arena.</b> Está 30 % bajo el PR y cubre 2,33 días de demanda promedio frente a dos días de entrega. <b>Prioridad 2: block.</b> Está 22,22 % bajo el PR y cubre 4,67 días frente a cuatro de entrega. Ambas requieren emitir compra hoy.

<b>Vigilancia:</b> varilla alcanza el PR en 50/120 = 0,42 días y cemento en 25/40 = 0,63 días a consumo promedio. Se prioriza varilla antes que cemento. Se supone igual criticidad operativa; una necesidad urgente de obra puede modificar ese orden.

El PR indica cuándo comprar, no cuánto. Para definir cantidad se necesitan stock objetivo/máximo, pedidos pendientes y demanda prevista. Estar bajo PR no significa que ya exista un faltante físico.


## Trazabilidad mínima

Registrar identificador, fecha y hora, tipo, material normalizado, cantidad y unidad, origen/destino, usuario, documento y línea de OC cuando corresponda, proveedor identificable mediante la OC, lote, motivo y autorización. Un traslado conserva el lote y afecta ambas ubicaciones en una operación. Las correcciones deben dejar movimientos compensatorios y referencia documental, sin borrar el historial.

Stock = entradas y traslados recibidos menos salidas y traslados enviados, más o menos ajustes. El prototipo obtiene el saldo de los movimientos; no permite escribir directamente el stock. La referencia a OC se conserva a través del lote en salidas y traslados. Los saldos iniciales tienen documento de ajuste y no una OC inventada.


## Parte B. Solución y reglas implementadas

El sistema centraliza el inventario de Bodega Central y Obra Principal. La interfaz consume una API REST de Node.js y Express conectada a MySQL mediante mysql2. Incluye catálogo, dashboard, alertas, órdenes de compra, movimientos, detección de duplicados e historial de trazabilidad.

| Requisito de opción 2 | Implementación |

| Materiales y reorden | Catálogo con demanda promedio/máxima y entrega; mínimos/máximos por ubicación. PR calculado, no digitado. |

| Movimientos y saldos | Entrada, salida, traslado y ajuste con fecha, usuario, cantidad, ubicación y documento. Stock derivado de movimientos. |

| Alerta de reposición | Vista SQL y endpoint que muestran stock estrictamente menor al PR; tabla visible en dashboard. |

| Posibles duplicados | Mismo proveedor/material, tres días y 5 % de tolerancia; parámetros en configuración. |

| Trazabilidad | Historial por material con lote, usuario, documento, ubicaciones y OC de procedencia. |

<b>Integridad:</b> las operaciones usan transacciones. El bloqueo del material serializa movimientos simultáneos; se rechazan saldos insuficientes por lote. Las recepciones requieren OC aprobada del mismo material y destino y no pueden superar lo pedido. El material y su política de stock se crean juntos.

<b>Supuestos de datos:</b> las órdenes de A3 se cargan aprobadas para demostrar detección, sin tratarlas como recibidas. Los stocks de A5 se cargan como ajustes iniciales separados. Los límites mínimos/máximos del prototipo son propuestos. Una ubicación nueva receptora hereda inicialmente una política del material. Demanda y entrega son globales del material.

<b>Alcance:</b> aprobación manual de OC, sin roles ni matriz monetaria. La interfaz crea OC de una línea; la API admite hasta 100 materiales distintos. No hay autenticación: seleccionar usuario identifica al responsable declarado, pero no verifica identidad. Prototipo restringido a la computadora local. No se implementan comparador de precios ni promociones, porque corresponden a otras opciones.


## Modelo de datos: diagrama entidad-relación

PK = clave primaria; FK = clave foránea. Una OC pertenece a un proveedor y una ubicación y contiene varias líneas. Cada línea referencia un material y puede originar varias recepciones parciales. Los movimientos referencian material y usuario; origen y destino referencian ubicaciones. La línea de OC es opcional y se exige para las entradas por compra.

Políticas de stock utiliza una clave compuesta material/ubicación. Configuración almacena los umbrales de duplicados y no tiene relación directa con las entidades de inventario. Las vistas stock_actual y alertas_reorden calculan saldos y necesidades; no duplican el historial.

El vínculo de salidas y traslados con una OC se reconstruye por material y lote de entrada. El sistema impide reutilizar un lote de compra para una procedencia distinta.


## Verificación, ejecución y conclusiones

| Prueba | Resultado observado |

| Materiales | Registro válido; rechazo de código repetido, campos incompletos, demandas y ubicación inválidas. |

| Movimientos | Ajustes, salidas, traslados, stock insuficiente y concurrencia verificados. |

| Recepción y OC | Recepciones parciales/completas; rechazo de exceso y de recepción pendiente; aprobación válida. |

| Detección y trazabilidad | Pares 1041/1042 y 1050/1053 detectados; OC de origen conservada después del traslado. |

| Interfaz | Material y ajuste creados desde navegador; OC creada/aprobada; historial y duplicados consultados. |

| Seguridad básica | Archivos privados no accesibles por HTTP; JSON inválido 400 y mayor a 100 KB 413; cabeceras restrictivas. |

<b>Ejecución:</b> instalar Node.js LTS y MySQL 8.0.16 o superior; ejecutar db/schema.sql y db/seed.sql una sola vez en base nueva; ejecutar npm install; copiar .env.example a .env y completar credenciales locales; iniciar con npm start y abrir http://localhost:3000. npm test ejecuta cinco suites con datos temporales y limpieza. No publicar .env. El README conserva instrucciones y limitaciones.

<b>Revisión móvil:</b> se comprobó a 390 × 844 una columna de campos sin desbordamiento horizontal del documento. La captura móvil no estuvo disponible; queda pendiente una inspección visual completa en teléfono. El video y la exposición todavía deben prepararse.

<b>Conclusiones:</b> normalizar materiales permite identificar volumen y ahorro; comparar con contratos evita confundir gasto con pérdida; separar sospechas de duplicidad de pérdidas confirmadas mejora el análisis. La trazabilidad y el stock derivado del historial permiten explicar cada existencia. El prototipo conecta esos controles con una solución operativa y verificable, aunque requiere autenticación y autorizaciones por rol antes de un uso público.


## Fuentes y declaración de apoyo

Fuente de datos y fórmulas: Trabajo_Gestion_de_Inventarios_Quiz_2.pdf, páginas 3 a 9, enunciado suministrado. Los proveedores y sus notas en A4 son ficticios. No se extrajeron precios de sitios externos. Código desarrollado con apoyo de IA durante este trabajo; la autora debe revisar y poder explicar cada componente antes de presentar. Dependencias de terceros: Express, mysql2 y dotenv, registradas en package.json y package-lock.json; no se reutilizó un proyecto externo como plantilla.