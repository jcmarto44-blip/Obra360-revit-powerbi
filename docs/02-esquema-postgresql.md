# Esquema de PostgreSQL — Obra360Pulse (Supabase)

Este documento define las tablas que van a vivir en el proyecto de
Supabase ya existente (jcmarto44-blip's project), como tablas
NUEVAS, sin tocar las tablas actuales de la plataforma (login,
CSV, PDFs, avance fotográfico, etc.).

Estas tablas traducen a base de datos la estructura definida en
`01-formato-json.md`.

## Tablas

### `proyectos`
Un registro por proyecto/obra.

- `id` (PK)
- `nombre`
- `fecha_creacion`

### `modelos`
Cada sincronización desde Revit genera un registro aquí
(un "modelo" = una versión/momento del envío).

- `id` (PK)
- `proyecto_id` (FK → proyectos.id)
- `version`
- `fecha_sync`

### `parametros_proyecto`
Parámetros de proyecto de Revit (ProjectInformation), ligados al
modelo (no al elemento).

- `id` (PK)
- `modelo_id` (FK → modelos.id)
- `nombre_parametro`
- `valor`

### `elementos`
Un registro por cada elemento del modelo de Revit (todas las
categorías: arquitectura, estructura, sanitarias, hidráulicas,
eléctricas, HVAC).

- `id` (PK)
- `modelo_id` (FK → modelos.id)
- `element_id`
- `unique_id`
- `category`
- `family_name`
- `type_name`
- `level_name`
- `workset`
- `phase`

### `parametros_instancia`
Todos los parámetros de instancia de cada elemento, como pares
nombre-valor (sin lista fija).

- `id` (PK)
- `elemento_id` (FK → elementos.id)
- `nombre_parametro`
- `valor`

### `geometria`
La malla 3D de cada elemento (vértices y caras), separada de los
parámetros para poder actualizar uno sin tocar el otro.

- `id` (PK)
- `elemento_id` (FK → elementos.id)
- `vertices` (JSONB)
- `faces` (JSONB)
- `bounding_box_min` (JSONB)
- `bounding_box_max` (JSONB)

## Relación entre tablas (jerarquía)
