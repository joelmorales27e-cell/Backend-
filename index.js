// index.js
const express = require('express');
const sequelize = require('./db');
const Proveedor = require('./models/proveedor');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Simple request logger (útil en despliegues para ver llamadas entrantes)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} -> ${req.method} ${req.originalUrl}`);
  next();
});

// Manejar errores de parsing JSON (body-parser) y devolver JSON claro en vez de HTML
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON received:', err.message);
    return res.status(400).json({ error: 'Invalid JSON in request body', message: err.message });
  }
  next(err);
});

// registro global de errores no manejados (útil en despliegue para debug)
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Rutas
app.get('/', (req, res) => res.send('¡Servidor funcionando!'));

// Health check para plataformas de despliegue
app.get('/health', async (req, res) => {
  try {
    // simple ping a la DB
    await sequelize.authenticate();
    return res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    console.error('Health check DB error:', err);
    return res.status(503).json({ status: 'error', db: 'unavailable' });
  }
});

// Helper para enviar errores más detallados fuera de producción
function sendError(res, message, err) {
  const payload = { error: message };
  const allowDebug = process.env.ALLOW_DEBUG === 'true';
  if ((process.env.NODE_ENV !== 'production' && err) || allowDebug) {
    payload.details = err && (err.message || String(err));
    payload.stack = err && err.stack;
  }
  return res.status(500).json(payload);
}

const obtenerProveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.findAll();
    res.json(proveedores);
  } catch (err) {
    console.error('Error al obtener proveedores:', err);
    if (err && err.original) console.error('Sequelize original error:', err.original);
    if (err && err.errors) console.error('Sequelize validation errors:', err.errors);
    return sendError(res, 'Error al obtener proveedores', err);
  }
};

app.get(['/proveedores', '/proveedor'], obtenerProveedores);

app.post(['/proveedores', '/proveedor'], async (req, res) => {
  try {
    console.log('POST /proveedores body:', req.body);
    // Validación simple antes de intentar crear (evita errores de validación no controlados)
    if (!req.body || !req.body.nombre) {
      return res.status(400).json({ error: 'Missing required field', field: 'nombre' });
    }
    const nuevo = await Proveedor.create(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    console.error('Error al crear proveedor:', err);
    if (err && err.original) console.error('Sequelize original error:', err.original);
    if (err && err.errors) console.error('Sequelize validation errors:', err.errors);
    // Manejar errores de validación de Sequelize y devolver 400 con mensajes
    if (err && (err.name === 'SequelizeValidationError' || err.name === 'ValidationError')) {
      const messages = (err.errors || []).map(e => ({ field: e.path, message: e.message }));
      return res.status(400).json({ error: 'Validation error', details: messages });
    }
    return sendError(res, 'Error al crear proveedor', err);
  }
});

// Si este archivo se ejecuta directamente, conectar DB, sincronizar y arrancar el servidor
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  (async () => {
    try {
      await sequelize.authenticate();
      console.log('✅ Conectado a la base de datos');
      await sequelize.sync();
      console.log('🗂️ Modelos sincronizados');

      const server = app.listen(PORT, () => console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`));

      // Manejo de cierre limpio
      const shutdown = async (signal) => {
        console.log(`Received ${signal}, closing server...`);
        server.close(async () => {
          try {
            await sequelize.close();
            console.log('✅ Conexión a la BD cerrada');
            process.exit(0);
          } catch (err) {
            console.error('Error cerrando sequelize:', err);
            process.exit(1);
          }
        });
      };
      process.on('SIGINT', () => shutdown('SIGINT'));
      process.on('SIGTERM', () => shutdown('SIGTERM'));

    } catch (err) {
      console.error('❌ Error iniciando la aplicación:', err);
      process.exit(1);
    }
  })();
}

module.exports = app;
