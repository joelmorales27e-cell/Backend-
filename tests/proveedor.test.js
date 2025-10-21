// tests/proveedor.test.js
const request = require('supertest');
const app = require('../index');
const Proveedor = require('../models/proveedor');

jest.mock('../models/proveedor', () => ({
  findAll: jest.fn(),
  create: jest.fn(),
}));

describe('🔍 Pruebas de /proveedores API (solo GET y POST)', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });


  test('GET /proveedores debe devolver lista de proveedores', async () => {
    const mockProveedores = [
      { id_proveedor: 1, nombre: 'Proveedor A' },
      { id_proveedor: 2, nombre: 'Proveedor B' },
    ];
    Proveedor.findAll.mockResolvedValue(mockProveedores);

    const res = await request(app).get('/proveedores');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockProveedores);
    expect(Proveedor.findAll).toHaveBeenCalledTimes(1);
  });

  // POST /proveedores
  test('POST /proveedores debe crear un proveedor', async () => {
    const nuevoProveedor = { id_proveedor: 3, nombre: 'Proveedor C' };
    Proveedor.create.mockResolvedValue(nuevoProveedor);

    const res = await request(app).post('/proveedores').send({ nombre: 'Proveedor C' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(nuevoProveedor);
    expect(Proveedor.create).toHaveBeenCalledWith({ nombre: 'Proveedor C' });
  });

});
