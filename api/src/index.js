const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 3000;

// Conexión a Supabase usando las variables de entorno configuradas en Render
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

// Endpoint de prueba: confirma que la conexión a Supabase funciona
app.get('/test-conexion', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('op_proyectos')
      .select('*')
      .limit(1);

    if (error) {
      return res.status(500).json({
        conexion: 'error',
        detalle: error.message
      });
    }

    res.json({
      conexion: 'ok',
      mensaje: 'Conectado correctamente a Supabase',
      tabla_op_proyectos: data
    });
  } catch (err) {
    res.status(500).json({
      conexion: 'error',
      detalle: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Obra360Pulse API corriendo en el puerto ${PORT}`);
});
