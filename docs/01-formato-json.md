# Formato JSON de intercambio — Obra360Pulse

Este documento define la estructura de datos que viaja desde Revit
hasta la base de datos (Supabase), y de ahí hacia Power BI / el
visual Obra360Pulse. Es el "idioma común" que va a usar todo el
sistema, sin importar en qué parte del proyecto estemos.

## Estructura general

Un envío ("sync") desde Revit manda UN modelo completo, con esta forma:

```json
{
  "proyecto": {
    "nombre": "",
    "modeloVersion": "",
    "fechaSync": ""
  },
  "parametrosProyecto": {
    "nombreParametro1": "valor1",
    "nombreParametro2": "valor2"
  },
  "elementos": [
    {
      "elementId": "",
      "uniqueId": "",
      "category": "",
      "familyName": "",
      "typeName": "",
      "levelName": "",
      "workset": "",
      "phase": "",
      "parametrosInstancia": {
        "nombreParametro1": "valor1",
        "nombreParametro2": "valor2"
      },
      "geometria": {
        "vertices": [],
        "faces": [],
        "boundingBoxMin": [0, 0, 0],
        "boundingBoxMax": [0, 0, 0]
      }
    }
  ]
}
```

## Explicación de cada bloque

### `proyecto`
Información general del envío: qué modelo es, qué versión/momento
de sincronización representa.

### `parametrosProyecto`
Todos los parámetros de proyecto de Revit (ProjectInformation),
como pares nombre-valor. No se limita a una lista fija: cualquier
parámetro de proyecto que exista en el modelo se incluye aquí.

### `elementos`
Una lista con TODOS los elementos del modelo, sin filtrar por
categoría (arquitectura, estructura, sanitarias, hidráulicas,
eléctricas, HVAC — todo).

Cada elemento tiene:
- **Identificadores:** `elementId`, `uniqueId` (para saber qué
  elemento de Revit es cada uno)
- **Clasificación:** `category`, `familyName`, `typeName`,
  `levelName`, `workset`, `phase`
- **`parametrosInstancia`:** TODOS los parámetros de instancia del
  elemento, como pares nombre-valor, sin lista fija ni filtrada
- **`geometria`:** la malla triangulada (vértices y caras) para
  poder renderizar el elemento en 3D con Three.js

## Por qué esta estructura (no otra)

- **Parámetros como pares nombre-valor (no columnas fijas):**
  cualquier parámetro que exista en Revit —de cualquier tipo,
  compartido o no— cabe aquí sin tener que rediseñar el formato
  cada vez que se agregue un parámetro nuevo en el futuro.
- **Todo el modelo, todas las categorías:** el objetivo es igualar
  la cobertura de Speckle, no limitarse a un caso de uso específico.
- **Separar geometría de parámetros:** permite que en el futuro se
  puedan actualizar solo los parámetros (más rápido) sin tener que
  volver a mandar toda la geometría cada vez.

## Estado de este documento

📝 Primera versión — pendiente de validar contra un ejemplo real
exportado desde tu modelo de Revit, antes de construir el backend
sobre esta estructura.
