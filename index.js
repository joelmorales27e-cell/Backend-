const express = require('express');
const sequelize = require('./db');
const Proveedor = require('./models/proveedor');
const cors = require('cors');

const app = express();
app.use(express.json());

// Configurar CORS público para todas las rutas
// Permite cualquier origen y habilita responses a preflight (OPTIONS)
app.use(cors());
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
})
// Conexión a la base de datos
sequelize.authenticate()
  .then(() => console.log('✅ Conectado a la base de datos'))
  .catch(err => console.error('❌ Error al conectar:', err));

// Sincronizar modelos (no borra datos)
sequelize.sync()
  .then(() => console.log('🗂️ Modelos sincronizados'))
  .catch(err => console.error('❌ Error al sincronizar modelos:', err));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡Servidor funcionando!');
});

// --------------------------------------
// Rutas de proveedores
// --------------------------------------

// Alias: Obtener todos los proveedores
const obtenerProveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.findAll();
    res.json(proveedores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};

// GET todos los proveedores
app.get('/proveedores', obtenerProveedores);
app.get('/proveedor', obtenerProveedores); // alias singular

// GET proveedor por ID
app.get(['/proveedores/:id', '/proveedor/:id'], async (req, res) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);
    if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(proveedor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener proveedor' });
  }
});

// POST crear proveedor
app.post(['/proveedores', '/proveedor'], async (req, res) => {
  try {
    const nuevo = await Proveedor.create(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear proveedor' });
  }
});

// PUT actualizar proveedor
app.put(['/proveedores/:id', '/proveedor/:id'], async (req, res) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);
    if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
    await proveedor.update(req.body);
    res.json(proveedor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar proveedor' });
  }
});

// DELETE eliminar proveedor
app.delete(['/proveedores/:id', '/proveedor/:id'], async (req, res) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);
    if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
    await proveedor.destroy();
    res.json({ mensaje: 'Proveedor eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar proveedor' });
  }
});

// Iniciar servidor
app.listen(3000, () => console.log('🚀 Servidor ejecutándose en http://localhost:3000'));
