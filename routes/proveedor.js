const express = require('express');
const router = express.Router();

// Ruta GET para obtener proveedores
router.get('/', (req, res) => {
  res.json({ mensaje: 'Lista de proveedores' });
});

module.exports = router;
