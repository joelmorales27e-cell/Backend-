// server.js
const app = require('./index');
const sequelize = require('./db');

const PORT = 4000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}/proveedores`));

  // Heartbeat
  setInterval(() => console.log('heartbeat - server alive at', new Date().toISOString()), 5000);

  sequelize.authenticate()
    .then(() => console.log('✅ Conectado a la base de datos'))
    .catch(err => console.error('❌ Error al conectar:', err));

  sequelize.sync()
    .then(() => console.log('🗂️ Modelos sincronizados'))
    .catch(err => console.error('❌ Error al sincronizar modelos:', err));
}
