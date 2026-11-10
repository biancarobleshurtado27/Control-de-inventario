# Guía de exposición — 10 minutos

Material de apoyo para exponer individualmente. Esta guía no es un archivo de diapositivas ni sustituye la presentación en clase.

## Distribución del tiempo
| Tiempo | Contenido | Qué mostrar |
|---|---|---|
| 0:00–1:00 | Problema de negocio y objetivo | Inventario disperso entre bodega y obras; necesidades de reposición y duplicidad. |
| 1:00–2:30 | Hallazgos de la Parte A | Circuito de compra; ahorro A2 de ₡89000; sobreprecio A3 de ₡223000. |
| 2:30–3:30 | Cálculos de reposición | Fórmulas SS y PR; block y arena requieren reposición. |
| 3:30–4:30 | Arquitectura y modelo de datos | Interfaz → API Express → MySQL; diagrama entidad-relación. |
| 4:30–7:30 | Demostración | Stock, alerta, OC, entrada y trazabilidad; duplicados. Ensayar para ajustar a 3 minutos. |
| 7:30–8:30 | Integridad y pruebas | Transacciones, control de cantidades y concurrencia; suites de pruebas. |
| 8:30–9:30 | Aprendizajes y límites | Normalización, trazabilidad, sospecha vs. pérdida; sin autenticación ni roles. |
| 9:30–10:00 | Conclusión | Cómo ayuda a decidir qué reponer y explicar el origen de las existencias. |

## Cifras que debes poder explicar
- A2: ahorro potencial ₡62000 en cemento + ₡27000 en varilla = ₡89000.
- A3: ₡223000 de sobreprecios. Si una OC de ₡1290000 se confirma duplicada e irrecuperable: ₡1290000 + ₡223000 - ₡30000 = ₡1483000. Se resta ₡30000 para no contar dos veces el sobreprecio de esa OC.
- Arena: SS=(10-6)×2=8; PR=6×2+8=20; stock=14.
- Block: SS=(900-600)×4=1200; PR=600×4+1200=3600; stock=2800.
- No se unifican guantes de nitrilo y guantes genéricos sin confirmar especificaciones.

## Preguntas para practicar

### ¿Dónde está el backend?
En backend/src/index.js se configura el servidor y sus rutas. db.js crea el pool de conexión; routes/ declara las rutas y controllers/ contiene las validaciones, consultas y respuestas. db.js centraliza la conexión. El frontend está en frontend/, con components/, services/, routes/ y pages/.

### ¿Cómo se calcula el stock?
Se suman cantidades que llegan a una ubicación y se restan las que salen. La vista stock_actual obtiene ese saldo desde movimientos. Un traslado tiene origen y destino en el mismo registro.

### ¿Por qué el punto de reorden no se guarda como un campo editable?
Porque se obtiene de la demanda y el tiempo de entrega. Así cambia al cambiar esos parámetros y se evita que alguien digite un resultado inconsistente.

### ¿Qué evita que dos salidas simultáneas dejen stock negativo?
La transacción bloquea la fila del material con FOR UPDATE. Otra operación del mismo material debe esperar; luego se vuelve a comprobar el saldo del lote antes de insertar.

### ¿Por qué importa la transacción?
Permite confirmar o deshacer la operación completa. Un error no debe dejar una OC sin líneas ni una actualización parcial.

### ¿Cómo se vincula una salida con una compra?
La entrada tiene una línea de OC y un lote. Las salidas y traslados conservan material y lote, por lo que la consulta reconstruye la OC de origen. Los saldos iniciales son ajustes documentados y no tienen OC inventada.

### ¿Cómo se detectan posibles duplicados?
Se acumulan cantidades por OC y material, se compara proveedor/material y se aplican tres días y cinco por ciento de tolerancia. Se comparan pares una sola vez y se excluyen órdenes canceladas. Los parámetros se guardan en configuracion.

### ¿Una alerta prueba que hubo pérdida?
No. Deben revisarse requisición, recepción, destino y factura. Dos compras similares pueden ser legítimas. La pérdida por una duplicidad requiere confirmación y evaluar si el material se puede aprovechar o devolver.

### ¿Cómo se protegen las credenciales?
Se guardan en .env local, excluido de Git junto con sus copias. Solo se publica .env.example sin contraseña. El servidor sirve únicamente public/, no toda la carpeta.

### ¿Qué significan 201, 400 y 409?
201 indica creación correcta; 400, datos inválidos; 409, conflicto como código duplicado o saldo insuficiente. El frontend muestra el mensaje devuelto por la API.

### ¿Qué significa aprobación manual?
Una orden pendiente se cambia a aprobada. El prototipo no verifica identidad ni aplica permisos por monto. La matriz A1 está analizada en el informe, pero su implementación con roles es un extra no realizado.

### ¿Qué límites tiene el prototipo?
Uso local sin autenticación; interfaz de OC de una línea; demanda y entrega globales del material; políticas heredadas al recibir en una nueva ubicación; no hay captura de precios externos. El estado de OC no pasa automáticamente a RECIBIDA, aunque el control acumulado evita recibir cantidades de más.

## Ensayo final
1. Practicar el guion con cronómetro y sin leer el código completo.
2. Repetir una entrada y un traslado con números de documento y lote únicos.
3. Explicar cada tabla principal y una consulta de trazabilidad con tus palabras.
4. Si no entiendes una función, revisarla antes de presentar y simplificar su explicación.
5. La asistencia de IA está permitida por el enunciado; debes poder explicar lo entregado.

