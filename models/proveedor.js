const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Proveedor = sequelize.define('Proveedor', {
  id_proveedor: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'proveedor', // coincide exactamente con tu tabla
  timestamps: false        // evita createdAt/updatedAt
});

module.exports = Proveedor;
