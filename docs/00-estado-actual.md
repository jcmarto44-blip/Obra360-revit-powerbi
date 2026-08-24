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
