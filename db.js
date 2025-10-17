require('dotenv').config();
const { Sequelize } = require('sequelize');

const connectionString = process.env.DB_URL;
if (!connectionString) {
  console.error('⚠️  DATABASE_URL no está definida. Asegúrate de configurar la variable de entorno en el servidor (Render).');
}

// Configuración por defecto: asume Postgres. En plataformas como Render/Postgres es habitual
// requerir SSL con rejectUnauthorized=false.
const sequelize = new Sequelize(connectionString || '', {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: (function () {
    // Permitir deshabilitar SSL con DB_SSL=false (útil para dev local)
    if (process.env.DB_SSL === 'false') return {};
    return {
      ssl: {
        require: true,
        // Para muchos proveedores gestionados (Render, Heroku) hace falta esto
        rejectUnauthorized: false,
      },
    };
  })(),
});

module.exports = sequelize;
