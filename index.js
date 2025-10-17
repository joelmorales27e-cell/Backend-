const express = require('express');
const sequelize = require('./db');
const Proveedor = require('./models/proveedor');
const cors = require('cors');

const app = express();
app.use(express.json());

// Configurar CORS público para todas las rutas
// Permite cualquier origen y habilita responses a preflight (OPTIONS)
// Usar cors() como middleware global (maneja preflight automáticamente)
app.use(cors());

// Registro de eventos para ayuda en debugging si el proceso termina
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('beforeExit', (code) => {
  console.log('Process beforeExit event with code:', code);
});
process.on('exit', (code) => {
  console.log('Process exit event with code:', code);
});

// Heartbeat para facilitar debug: registra cada 5s y mantiene el event loop vivo
setInterval(() => {
  console.log('heartbeat - server alive at', new Date().toISOString());
}, 5000);
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
    console.error('Error en obtenerProveedores:', err);
    // En producción no devolvemos detalles; en desarrollo devolvemos el error para depurar
    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({ error: 'Error al obtener proveedores' });
    }
    return res.status(500).json({ error: 'Error al obtener proveedores', details: err.message || err });
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
app.listen(4000, () => console.log('🚀 Servidor ejecutándose en http://localhost:4000/proveedores'));
