-- Obra360Pulse — Esquema de base de datos
-- Tablas con prefijo "op_" para no interferir con las tablas
-- ya existentes de la plataforma Obra360 (proyectos, clientes,
-- despachos, fotografico, planos, etc.)

CREATE TABLE op_proyectos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);

CREATE TABLE op_modelos (
  id SERIAL PRIMARY KEY,
  proyecto_id INTEGER REFERENCES op_proyectos(id),
  version TEXT,
  fecha_sync TIMESTAMP DEFAULT NOW()
);

CREATE TABLE op_parametros_proyecto (
  id SERIAL PRIMARY KEY,
  modelo_id INTEGER REFERENCES op_modelos(id),
  nombre_parametro TEXT NOT NULL,
  valor TEXT
);

CREATE TABLE op_elementos (
  id SERIAL PRIMARY KEY,
  modelo_id INTEGER REFERENCES op_modelos(id),
  element_id TEXT,
  unique_id TEXT,
  category TEXT,
  family_name TEXT,
  type_name TEXT,
  level_name TEXT,
  workset TEXT,
  phase TEXT
);

CREATE TABLE op_parametros_instancia (
  id SERIAL PRIMARY KEY,
  elemento_id INTEGER REFERENCES op_elementos(id),
  nombre_parametro TEXT NOT NULL,
  valor TEXT
);

CREATE TABLE op_geometria (
  id SERIAL PRIMARY KEY,
  elemento_id INTEGER REFERENCES op_elementos(id),
  vertices JSONB,
  faces JSONB,
  bounding_box_min JSONB,
  bounding_box_max JSONB
);

CREATE INDEX idx_op_modelos_proyecto ON op_modelos(proyecto_id);
CREATE INDEX idx_op_elementos_modelo ON op_elementos(modelo_id);
CREATE INDEX idx_op_parametros_instancia_elemento ON op_parametros_instancia(elemento_id);
CREATE INDEX idx_op_geometria_elemento ON op_geometria(elemento_id);
CREATE INDEX idx_op_parametros_proyecto_modelo ON op_parametros_proyecto(modelo_id);
