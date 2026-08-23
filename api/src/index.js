const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 3000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    servicio: 'obra360pulse-api',
    mensaje: 'Backend de Obra360Pulse funcionando'
  });
});

app.get('/test-conexion', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('op_proyectos')
      .select('*')
      .limit(1);

    if (error) {
      return res.status(500).json({ conexion: 'error', detalle: error.message });
    }

    res.json({
      conexion: 'ok',
      mensaje: 'Conectado correctamente a Supabase',
      tabla_op_proyectos: data
    });
  } catch (err) {
    res.status(500).json({ conexion: 'error', detalle: err.message });
  }
});

// -----------------------------------------------------------
// Endpoint principal: recibe el modelo completo desde Revit
// y lo guarda en las 6 tablas relacionadas, en orden.
// -----------------------------------------------------------
app.post('/api/sync-modelo', async (req, res) => {
  try {
    const body = req.body;

    if (!body || !body.proyecto || !body.elementos) {
      return res.status(400).json({
        status: 'error',
        mensaje: 'El JSON debe incluir "proyecto" y "elementos".'
      });
    }

    const nombreProyecto = body.proyecto.nombre;

    // 1) Buscar si el proyecto ya existe (por nombre); si no, crearlo
    let { data: proyectoExistente, error: errBuscarProyecto } = await supabase
      .from('op_proyectos')
      .select('id')
      .eq('nombre', nombreProyecto)
      .maybeSingle();

    if (errBuscarProyecto) throw errBuscarProyecto;

    let proyectoId;

    if (proyectoExistente) {
      proyectoId = proyectoExistente.id;
    } else {
      const { data: nuevoProyecto, error: errCrearProyecto } = await supabase
        .from('op_proyectos')
        .insert({ nombre: nombreProyecto })
        .select('id')
        .single();

      if (errCrearProyecto) throw errCrearProyecto;
      proyectoId = nuevoProyecto.id;
    }

    // 2) Crear el modelo (cada sync = un registro nuevo, historial)
    const { data: nuevoModelo, error: errModelo } = await supabase
      .from('op_modelos')
      .insert({
        proyecto_id: proyectoId,
        version: body.proyecto.modeloVersion || null
      })
      .select('id')
      .single();

    if (errModelo) throw errModelo;
    const modeloId = nuevoModelo.id;

    // 3) Insertar parámetros de proyecto (si vienen)
    if (body.parametrosProyecto) {
      const filasParametrosProyecto = Object.entries(body.parametrosProyecto).map(
        ([nombre_parametro, valor]) => ({
          modelo_id: modeloId,
          nombre_parametro,
          valor: String(valor)
        })
      );

      if (filasParametrosProyecto.length > 0) {
        const { error: errParamsProyecto } = await supabase
          .from('op_parametros_proyecto')
          .insert(filasParametrosProyecto);

        if (errParamsProyecto) throw errParamsProyecto;
      }
    }

    // 4) Insertar elementos, uno por uno (para poder ligar sus
    //    parámetros y geometría al id correcto de cada uno)
    let totalElementos = 0;

    for (const el of body.elementos) {
      const { data: nuevoElemento, error: errElemento } = await supabase
        .from('op_elementos')
        .insert({
          modelo_id: modeloId,
          element_id: el.elementId || null,
          unique_id: el.uniqueId || null,
          category: el.category || null,
          family_name: el.familyName || null,
          type_name: el.typeName || null,
          level_name: el.levelName || null,
          workset: el.workset || null,
          phase: el.phase || null
        })
        .select('id')
        .single();

      if (errElemento) throw errElemento;
      const elementoId = nuevoElemento.id;

      // 4a) Parámetros de instancia de este elemento
      if (el.parametrosInstancia) {
        const filasParams = Object.entries(el.parametrosInstancia).map(
          ([nombre_parametro, valor]) => ({
            elemento_id: elementoId,
            nombre_parametro,
            valor: String(valor)
          })
        );

        if (filasParams.length > 0) {
          const { error: errParams } = await supabase
            .from('op_parametros_instancia')
            .insert(filasParams);

          if (errParams) throw errParams;
        }
      }

      // 4b) Geometría de este elemento
      if (el.geometria) {
        const { error: errGeom } = await supabase
          .from('op_geometria')
          .insert({
            elemento_id: elementoId,
            vertices: el.geometria.vertices || [],
            faces: el.geometria.faces || [],
            bounding_box_min: el.geometria.boundingBoxMin || null,
            bounding_box_max: el.geometria.boundingBoxMax || null
          });

        if (errGeom) throw errGeom;
      }

      totalElementos++;
    }

    res.json({
      status: 'ok',
      mensaje: 'Modelo sincronizado correctamente',
      proyectoId,
      modeloId,
      elementosGuardados: totalElementos
    });

  } catch (err) {
    console.error('Error en /api/sync-modelo:', err.message);
    res.status(500).json({
      status: 'error',
      mensaje: 'Error al guardar el modelo',
      detalle: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Obra360Pulse API corriendo en el puerto ${PORT}`);
});
