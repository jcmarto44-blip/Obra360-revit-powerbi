# Estado actual del proyecto — Obra360Pulse

Última actualización: 23 agosto 2026

## Completado

### Fase 1 — Documentación
- ✅ Repo creado: `Obra360-revit-powerbi` (público)
- ✅ Documentación completa en `docs/`: formato JSON, esquema
  PostgreSQL, vista SQL, arquitectura general

### Fase 4 — Base de datos
- ✅ 6 tablas creadas en Supabase (proyecto "Obra360",
  jcmarto44-blip's project), con prefijo `op_`:
  `op_proyectos`, `op_modelos`, `op_parametros_proyecto`,
  `op_elementos`, `op_parametros_instancia`, `op_geometria`
- ✅ Vista `vista_revit_visual360` creada y validada

### Fase 3 — Backend
- ✅ Servicio en Render: `obra360pulse-api`
  (https://obra360pulse-api.onrender.com), proyecto Render
  "Obra360Pulse"
- ✅ Conectado exitosamente a Supabase (variables de entorno
  `SUPABASE_URL` y `SUPABASE_SERVICE_KEY`)
- ✅ Endpoint `/api/sync-modelo` construido y **probado
  end-to-end** con un modelo de prueba (1 elemento, geometría y
  parámetros) — guardó correctamente en las 6 tablas

### Fase 5 — Consulta en Power BI
- ✅ Power BI Desktop conectado directamente a Supabase
  (PostgreSQL), usando Host: `db.fhdzvawbaujajafvsweu.supabase.co`
- ✅ Vista `vista_revit_visual360` cargada e importada
  correctamente en Power BI, datos de prueba visibles

### Fase 6 — Visual custom Obra360Pulse (EN PROGRESO)
- ✅ Herramientas instaladas: `pbiviz` (v7.2.1), PowerShell 7
  (necesario para generar certificados de pbiviz)
- ✅ Modo desarrollador activado en Power BI Desktop
- ⚠️ Se descubrió que el "live preview" de `pbiviz start` NO
  funciona en Power BI Desktop, solo en Power BI Service. El
  ciclo de trabajo real es:
  1. Editar código del visual
  2. `pbiviz package` (genera archivo .pbiviz en carpeta dist/)
  3. Importar manualmente el .pbiviz a Power BI Desktop cada vez
     (panel Compilar → "..." → "Importar un objeto visual de un
     archivo")
- ✅ Proyecto base del visual creado localmente en:
  `C:\Users\ingci\Documents\obra360pulse`
  (⚠️ PENDIENTE: subir este código a GitHub, carpeta
  `powerbi-visual/` del repo — todavía no se ha hecho)
- ✅ Ciclo completo probado: visual de ejemplo (sin Three.js
  todavía) empaquetado e importado correctamente a Power BI
  Desktop, visible en el reporte con categorías de datos

## Actualización — Código subido a GitHub (23 agosto 2026)

- ✅ Git y PowerShell 7 instalados en la PC de trabajo
- ✅ Proyecto del visual conectado con el repo remoto
- ✅ Código del visual (pbiviz base, sin Three.js todavía) subido
  correctamente a GitHub, dentro de `powerbi-visual/`
- ⚠️ Pendiente de limpieza menor (no urgente): dos archivos
  `webpack.statistics.dev.html` y `webpack.statistics.prod.html`
  quedaron en la raíz del repo en vez de dentro de
  `powerbi-visual/` — se pueden borrar cuando se quiera, son solo
  reportes automáticos de pbiviz, no afectan el funcionamiento.

## Siguiente paso pendiente

Programar el visual real: leer los campos de datos de
`vista_revit_visual360` (geometría, categoría, parámetros) y
renderizarlos con Three.js. Empezar con algo simple (un cubo de
prueba) antes de la geometría real de Revit.

Después: Fase 2 (botón "Enviar a Obra360Pulse" en el add-in de
Revit existente `OpenViewer3D`) — se deja hasta el final.

## Cómo continuar el ciclo de trabajo del visual (PC local)

En PowerShell, para retomar:
## Notas importantes para no repetir errores

- NO tocar las tablas existentes de la plataforma (`proyectos`,
  `clientes`, `despachos`, `fotografico`, `planos`, etc.)
- NO tocar el Launcher (`Program.cs`) ni el add-in `OpenViewer3D`
  hasta la Fase 2.
- Todo debe mantenerse gratis (Render free tier, Supabase free
  tier, Vercel free tier).
- Multi-targeting Revit: empezar en 2024, luego replicar a
  2025/2026 (pendiente hasta Fase 2).
- Trabajar siempre paso a paso, un cambio a la vez.
- IMPORTANTE: en Windows, usar `npm.cmd` con ruta completa o
  agregar `C:\Users\ingci\AppData\Roaming\npm` al PATH si `npm`
  da error de "seleccionar programa" — hay un archivo conflictivo
  en `C:\Windows\System32\npm`.
## Actualización — Conector de Revit funcionando + Visual interactivo (24 agosto 2026)

### Logros de esta sesión

- ✅ Visual limpio, sin texto de diagnóstico
- ✅ **Conector de Revit nuevo creado y funcionando** — repo separado:
  `https://github.com/jcmarto44-blip/-Obra360Pulse-revit-connector`
  (nota: el nombre del repo tiene un guion al inicio: `-Obra360Pulse-revit-connector`)
- ✅ Add-in de Revit 2024 con botón "Enviar a Obra360Pulse" en su propia
  pestaña de la cinta, sin tocar el add-in existente `OpenViewer3D`
- ✅ **Primer envio real de datos de Revit confirmado**: 177 elementos
  procesados y visualizados correctamente en Power BI (el modelo de
  prueba tenia 1179 elementos totales, pero hay un limite de
  seguridad de 300 elementos en el codigo actual — ver pendientes)
- ✅ Control de camara con mouse (OrbitControls de Three.js): rotar,
  zoom, mover — ya no gira solo
- ✅ Seleccion de elementos con clic: se resalta en amarillo y
  muestra un panel con ElementId y Categoria

### Ubicaciones importantes en la PC de trabajo

- Visual (Power BI): `C:\Users\ingci\Documents\obra360pulse\powerbi-visual`
- Conector de Revit (Visual Studio): `C:\Users\ingci\Documents\Obra360Pulse.RevitConnector`
- Archivo .addin de Revit: `%APPDATA%\Autodesk\Revit\Addins\2024\Obra360PulseConnector.addin`
- El .addin apunta al .dll compilado en modo Debug:
  `...\Obra360Pulse.RevitConnector\bin\x64\Debug\Obra360Pulse.RevitConnector.dll`

### Decisiones tecnicas tomadas

- El proyecto de Visual Studio se compila en plataforma **x64**
  (no "Any CPU"), porque Revit es de 64 bits — esto ya esta
  configurado en el Administrador de configuracion del proyecto.
- El conector manda **todo el modelo** en un solo envio (no hay
  filtro de seleccion todavia) — limitado a 300 elementos como
  medida de seguridad para las pruebas.
- El campo `.Value` se usa en vez de `.IntegerValue` (que esta
  obsoleto en Revit 2024) para leer ElementId.

### Pendientes claros para la siguiente sesion

1. **Quitar o subir el limite de 300 elementos** en
   `SendToObra360PulseCommand.cs` (variable `maxElementos`), para
   poder mandar el modelo completo (probado con uno de 1179
   elementos)
2. **Mostrar mas parametros** al seleccionar un elemento en el
   visual (ahora mismo solo muestra ElementId y Categoria — falta
   family_name, level_name, y los parametros de instancia guardados
   en Supabase)
3. **Probar con un modelo que sí tenga el parametro "Check" Sí/No**
   real (el modelo de prueba de hoy no lo tenia, era solo para
   validar el flujo tecnico)
4. **Multi-targeting**: replicar el conector para Revit 2025 y 2026
   (decision ya tomada: empezar en 2024 primero, que es lo que ya
   esta hecho)
5. Filtro de seleccion antes de enviar (elegir que categorias o
   elementos mandar, en vez de todo el modelo)

### Notas importantes para no repetir errores

- NO tocar las tablas existentes de la plataforma
  (`proyectos`, `clientes`, `despachos`, `fotografico`, `planos`)
- NO tocar el Launcher (`Program.cs`) ni el add-in `OpenViewer3D`
  existente — el conector nuevo es un add-in completamente separado
- Todo debe mantenerse gratis (Render, Supabase, Vercel free tier)
- En Windows, usar `npm.cmd` con ruta completa
  (`C:\Program Files\nodejs\npm.cmd`) si `npm` solo da error de
  "seleccionar programa para abrir"
- Trabajar siempre paso a paso, un cambio a la vez, con codigo
  completo (no fragmentos) para evitar errores de copiado/pegado
## Actualización — Fix critico de geometria + limite subido (25 agosto 2026)

### Logros de esta sesión

- ✅ Limite de elementos subido de 300 a 5000 (variable `maxElementos`
  en `SendToObra360PulseCommand.cs`)
- ✅ **Fix critico de geometria anidada**: el codigo original solo
  leia `Solid` directo, pero muchos elementos (pilares, armazon,
  techos por capas) tienen su geometria dentro de `GeometryInstance`
  (geometria anidada de familias complejas). Se agrego una funcion
  recursiva `ProcesarGeometria()` que tambien entra a esas instancias.
  Esto corrigio el problema: antes solo llegaban 177 elementos
  (incompletos), ahora llegan 500 elementos reales y representativos
  del modelo.
- ✅ Se agrego una lista de categorias excluidas intencionalmente
  (decision del usuario, no bug): Armadura estructural (673
  elementos - geometria especial de refuerzo, no prioritaria),
  Lineas, y varias categorias de sistema/configuracion de Revit que
  no son geometria de construccion real (Materiales, Vistas,
  Camaras, Fases, etc.)
- ✅ Probado con modelo real de 1179 elementos totales en Revit:
  ahora llegan correctamente 500 elementos de construccion
  (Muros, Pilares estructurales, Armazon estructural, Cimentacion,
  Cubiertas, Techos, Suelos)
- ✅ Confirmado visualmente en Power BI: el modelo se ve completo
  y representa la obra real

### Como se diagnostico el problema (para referencia futura)

Se agrego temporalmente un contador de diagnostico que mostraba,
por categoria, cuantos elementos SI tenian geometria vs cuantos NO
— eso permitio confirmar exactamente que categorias fallaban y por
que (geometria anidada vs elementos de sistema sin geometria real).
Ese codigo de diagnostico ya se quito de la version final.

### Pendientes para la siguiente sesión

1. Mostrar mas parametros al seleccionar un elemento en el visual
   (ahora mismo solo ElementId y Categoria — falta family_name,
   level_name, y los parametros de instancia/tipo ya guardados)
2. Probar con un modelo que SI tenga el parametro "Check" Si/No
   real de avance de obra
3. Multi-targeting: replicar el conector para Revit 2025 y 2026
4. (Opcional, no prioritario segun el usuario) Si se necesita en
   el futuro, investigar como capturar geometria de Armadura
   estructural (posiblemente via AnalyticalModel o RebarInSystem,
   API distinta a Solid normal)
5. Filtro de seleccion antes de enviar (elegir que mandar, en vez
   de todo el modelo siempre)

### Notas importantes

- El .addin sigue apuntando al mismo .dll compilado en modo Debug
- Recordar SIEMPRE cerrar Revit antes de recompilar en Visual
  Studio (el .dll queda bloqueado mientras Revit esta abierto)
- Repo del conector: https://github.com/jcmarto44-blip/-Obra360Pulse-revit-connector
  (nota: el nombre tiene un guion al inicio)
## Actualización — Correcciones de datos y apariencia (26 agosto 2026)

### Problema crítico resuelto: acumulación de modelos viejos

- ❌ PROBLEMA ENCONTRADO: la vista `vista_revit_visual360` traía TODOS
  los modelos históricos mezclados (pruebas viejas de 177, 177, 177,
  y 1 elemento, sumadas al modelo real de 500), causando que el
  visual se viera incompleto/incorrecto
- ✅ RESUELTO: la vista se modificó para filtrar automáticamente
  SOLO el modelo más reciente:
  `WHERE e.modelo_id = (SELECT MAX(id) FROM op_modelos)`
- ✅ Confirmado con conteos exactos: 500 elementos coinciden
  perfectamente con el filtro real de Revit (excluyendo Armadura
  estructural y Líneas, por decisión de negocio)

### Renombrado de la vista

- La vista `vista_revit_visual360` se renombró a **`visual360`**
  (nombre corto). IMPORTANTE: en Power BI, la consulta de Power
  Query también se actualizó (Editor avanzado) para apuntar al
  nuevo nombre.

### Mejoras de apariencia del visual (estilo Speckle)

- ✅ Colores actualizados: fondo claro (`0xf5f5f5` o similar),
  modelo en gris uniforme claro (`0xe0e0e0`), sin diferenciar por
  categoría (decisión del usuario)
- ✅ Iluminación mejorada (luces más intensas) para mejor
  visibilidad
- ✅ Indicador de carga: spinner + texto "Cargando modelo..." en
  vez de mostrar un cubo gris de respaldo mientras no hay datos
- ✅ Nombre del visual limpio: `displayName` cambiado a
  "Obra360Pulse", y el `guid` cambiado a "obra360pulsevisual"
  (antes tenía un GUID largo tipo
  "obra360pulse23CEEBD0BFFA4BB7958DBAD94C151CC5")
- ✅ Ícono personalizado: se reemplazó el ícono genérico por el
  logo de la empresa (CAASA), copiado a
  `powerbi-visual/assets/icon.png`
- ⚠️ Pendiente/sin resolver a satisfacción: el ícono sigue sin
  verse del todo bien en el panel "Compilar" de Power BI (el
  usuario reporta que "se ve culero") — no se investigó más a
  fondo, posible tema de resolución/proporción de la imagen

### Aclaraciones importantes

- El sufijo "1.0.0.0" en el nombre del archivo
  `obra360pulsevisual.1.0.0.0.pbiviz` es el número de VERSIÓN del
  visual, no un identificador feo — es normal y estándar en todos
  los archivos .pbiviz, no se puede/debe quitar.

## Pendientes para la siguiente sesión

1. Multi-targeting: replicar el conector para Revit 2025 y 2026
2. Relación con tabla CSV de la plataforma por `elementId` — el
   usuario está preparando esta tabla por su cuenta desde su
   plataforma, para después crear la relación en Power BI (Modelo
   de datos) y que el visual responda a filtros/medidas DAX
3. Revisar y mejorar el ícono del visual si se retoma ese tema
4. Empaquetado del conector de Revit como instalador (.exe) para
   distribución más fácil — pendiente, no urgente
## Actualización — Multi-targeting completado (27 agosto 2026)

### Logro: el conector ahora compila para Revit 2024, 2025 y 2026

- ✅ El proyecto de Visual Studio se convirtió al formato moderno (SDK-style .csproj)
- ✅ Se configuró TargetFrameworks: net48 (Revit 2024) y net8.0-windows (Revit 2025/2026)
- ✅ Se usa el paquete NuGet publico Revit_All_Main_Versions_API_x64
  - Version 2024.2.0 para net48
  - Version 2026.0.0 para net8.0-windows
- ✅ Confirmado en Revit 2024 real: sigue funcionando exactamente igual
- ⚠️ NO probado en vivo Revit 2025/2026 (usuario no tiene esas versiones instaladas)

### Ubicacion de los .dll compilados
- net48\Obra360Pulse.RevitConnector.dll (Revit 2024)
- net8.0-windows\Obra360Pulse.RevitConnector.dll (Revit 2025 y 2026)

### Archivos .addin
- 2024\Obra360PulseConnector.addin → apunta a net48
- 2026\Obra360PulseConnector.addin → apunta a net8.0-windows
- PENDIENTE: crear tambien carpeta 2025 con su .addin

### Pendiente: instalador (.exe) automatico
Falta crear instalador que detecte version de Revit del cliente y copie el .dll correcto sin pasos manuales.

## Prioridades siguiente sesion
1. ✅ Multi-targeting — COMPLETADO
2. Sistema de vigencia/licencia del conector
3. Instalador automatico (.exe)
