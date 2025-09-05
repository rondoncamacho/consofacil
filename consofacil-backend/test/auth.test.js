const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');

describe('Auth Routes', () => {
  it('debe registrar un usuario', async () => {
    const res = await request(app)
      .post('/api/auth/registro')
      .send({ email: 'test@example.com', password: 'password123', rol: 'usuario', edificio_id: '550e8400-e29b-41d4-a716-446655440000' });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('message');
  });

  it('debe fallar con email duplicado', async () => {
    const res = await request(app)
      .post('/api/auth/registro')
      .send({ email: 'test@example.com', password: 'password123', rol: 'usuario', edificio_id: '550e8400-e29b-41d4-a716-446655440000' });
    expect(res.status).to.equal(400);
    expect(res.body.error).to.equal('Email ya registrado');
  });
});
