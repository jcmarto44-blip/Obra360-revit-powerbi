const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // limite alto porque luego van a llegar geometrias grandes

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    servicio: 'obra360pulse-api',
    mensaje: 'Backend de Obra360Pulse funcionando'
  });
});

app.listen(PORT, () => {
  console.log(`Obra360Pulse API corriendo en el puerto ${PORT}`);
});
