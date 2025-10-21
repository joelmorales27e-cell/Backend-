require('dotenv').config();
const { Sequelize } = require('sequelize');

// Accept either DATABASE_URL (common in hosts) or DB_URL (legacy in this project)
const connectionString = process.env.DATABASE_URL || process.env.DB_URL || '';
if (!connectionString) {
  console.error('⚠️  No se encontró la cadena de conexión. Define `DATABASE_URL` (recomendado) o `DB_URL` en las variables de entorno del servidor (Render, Heroku, etc.).');
}

// Configuración por defecto: asume Postgres. En plataformas como Render/Postgres es habitual
// requerir SSL con rejectUnauthorized=false.
const sequelize = new Sequelize(connectionString || '', {
  dialect: 'postgres',
  protocol: 'postgres',
  // habilitar logging SQL con DEBUG_SEQUELIZE=true en env para depuración
  logging: process.env.DEBUG_SEQUELIZE === 'true' ? console.log : false,
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
