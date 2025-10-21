// index.js
const express = require('express');
const Proveedor = require('./models/proveedor');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Middleware CORS opcional
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Rutas
app.get('/', (req, res) => res.send('¡Servidor funcionando!'));

const obtenerProveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.findAll();
    res.json(proveedores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};

app.get(['/proveedores', '/proveedor'], obtenerProveedores);

app.post(['/proveedores', '/proveedor'], async (req, res) => {
  try {
    const nuevo = await Proveedor.create(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear proveedor' });
  }
});

module.exports = app;
