-- Obra360Pulse — Esquema de base de datos
-- Ejecutar en el editor SQL de Supabase (proyecto existente:
-- jcmarto44-blip's project), como tablas NUEVAS, sin tocar las
-- tablas actuales de la plataforma (login, CSV, PDFs, etc.)

-- Un registro por proyecto/obra
CREATE TABLE proyectos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Cada sincronización desde Revit genera un registro aquí
CREATE TABLE modelos (
  id SERIAL PRIMARY KEY,
  proyecto_id INTEGER REFERENCES proyectos(id),
  version TEXT,
  fecha_sync TIMESTAMP DEFAULT NOW()
);

-- Parámetros de proyecto de Revit (ligados al modelo, no al elemento)
CREATE TABLE parametros_proyecto (
  id SERIAL PRIMARY KEY,
  modelo_id INTEGER REFERENCES modelos(id),
  nombre_parametro TEXT NOT NULL,
  valor TEXT
);

-- Un registro por cada elemento del modelo (todas las categorías)
CREATE TABLE elementos (
  id SERIAL PRIMARY KEY,
  modelo_id INTEGER REFERENCES modelos(id),
  element_id TEXT,
  unique_id TEXT,
  category TEXT,
  family_name TEXT,
  type_name TEXT,
  level_name TEXT,
  workset TEXT,
  phase TEXT
);

-- Parámetros de instancia de cada elemento (nombre-valor, sin lista fija)
CREATE TABLE parametros_instancia (
  id SERIAL PRIMARY KEY,
  elemento_id INTEGER REFERENCES elementos(id),
  nombre_parametro TEXT NOT NULL,
  valor TEXT
);

-- Geometría 3D de cada elemento (separada de los parámetros)
CREATE TABLE geometria (
  id SERIAL PRIMARY KEY,
  elemento_id INTEGER REFERENCES elementos(id),
  vertices JSONB,
  faces JSONB,
  bounding_box_min JSONB,
  bounding_box_max JSONB
);

-- Índices básicos para que las consultas no se pongan lentas
CREATE INDEX idx_modelos_proyecto ON modelos(proyecto_id);
CREATE INDEX idx_elementos_modelo ON elementos(modelo_id);
CREATE INDEX idx_parametros_instancia_elemento ON parametros_instancia(elemento_id);
CREATE INDEX idx_geometria_elemento ON geometria(elemento_id);
CREATE INDEX idx_parametros_proyecto_modelo ON parametros_proyecto(modelo_id);
