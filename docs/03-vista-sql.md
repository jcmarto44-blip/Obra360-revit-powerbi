# Vista SQL "REVIT+VISUAL360" — Obra360Pulse

Este documento define la vista SQL que Power BI (Power Query) va
a consultar directamente desde Supabase. Es el punto de entrada
único: desde Power BI, toda la información del modelo de Revit
se ve a través de esta vista, sin necesidad de cruzar manualmente
las tablas de `02-esquema-postgresql.md` cada vez.

## Propósito

- Unir `elementos` + `parametros_instancia` + `geometria` en una
  sola consulta, ya lista para Power Query.
- Los `parametros_proyecto` se traen aparte (tabla pequeña, se
  cruza en Power BI por `modelo_id`) porque son datos generales
  del modelo, no de cada elemento — traerlos aquí duplicaría el
  mismo dato miles de veces (uno por cada elemento).

## Definición de la vista (referencia, no ejecutable todavía)

```sql
CREATE VIEW vista_revit_visual360 AS
SELECT
  e.id AS elemento_id,
  e.modelo_id,
  e.element_id,
  e.unique_id,
  e.category,
  e.family_name,
  e.type_name,
  e.level_name,
  e.workset,
  e.phase,
  pi.nombre_parametro AS parametro_instancia,
  pi.valor AS valor_instancia,
  g.vertices,
  g.faces,
  g.bounding_box_min,
  g.bounding_box_max
FROM elementos e
LEFT JOIN parametros_instancia pi ON pi.elemento_id = e.id
LEFT JOIN geometria g ON g.elemento_id = e.id;
```

## Cómo la va a usar Power BI

1. Power Query se conecta a Supabase (PostgreSQL) y trae esta
   vista como una tabla más.
2. Desde el modelo de datos de Power BI, se cruza con
   `parametros_proyecto` (por `modelo_id`) cuando se necesiten
   datos generales del proyecto.
3. El visual `Obra360Pulse` (Three.js) toma de aquí lo mínimo que
   necesita para renderizar: geometría + identificadores +
   categoría — filtrado según lo que el usuario seleccione en el
   resto del dashboard (cross-filtering).
4. Las tablas normales de Power BI (gráficas, KPIs) también leen
   de esta misma vista, sin necesitar el visual 3D.

## Nota sobre parámetros como filas (no columnas)

Como `parametros_instancia` está en formato nombre-valor (una fila
por parámetro), esta vista entrega los datos "en formato largo"
(long format): un elemento puede aparecer en varias filas, una
por cada parámetro que tenga.

Esto es intencional (por la razón explicada en
`02-esquema-postgresql.md`: parámetros sin lista fija). Power BI
puede necesitar un paso adicional en Power Query para "pivotear"
(convertir de formato largo a formato ancho) si se requieren los
parámetros como columnas separadas para ciertos análisis — esto
se resuelve en la Fase 5, no aquí.

## Estado de este documento

📝 Primera versión — pendiente de crear como SQL ejecutable real
(dentro de `/db`) una vez que el esquema de tablas esté creado en
Supabase.
