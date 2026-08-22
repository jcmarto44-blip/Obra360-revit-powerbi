# Arquitectura general — Obra360Pulse

Este documento resume el flujo completo del sistema, de principio
a fin, uniendo las piezas ya documentadas en `01`, `02` y `03`.
Sirve como mapa general para no perder de vista cómo se conectan
las partes conforme se vayan construyendo.

## Objetivo del proyecto

Sustituir la dependencia de Speckle en la plataforma
"Análisis y Reportes de Obra 360", con un sistema propio
(Obra360Pulse) que:

- Extrae el modelo completo de Revit (todas las categorías:
  arquitectura, estructura, sanitarias, hidráulicas, eléctricas,
  HVAC — sin limitarse a un caso de uso específico).
- Guarda esa información en la infraestructura ya existente
  (Supabase, mismo proyecto que usa la plataforma hoy).
- Se visualiza dentro de Power BI mediante un visual custom
  (Three.js), igualando la funcionalidad del visualizador de
  Speckle, con interacción cruzada (cross-filtering) con el resto
  del dashboard.

## Flujo end-to-end
