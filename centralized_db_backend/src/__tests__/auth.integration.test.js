'use strict';

const request = require('supertest');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_do_not_use_in_prod';

const app = require('../app');
const { dbQuery } = require('../db/query');
const { closePool } = require('../db/pool');

describe('Auth + RBAC integration', () => {
  const admin = { email: 'admin@example.com', password: 'password123', role: 'admin' };
  const viewer = { email: 'viewer@example.com', password: 'password123', role: 'viewer' };

  afterAll(async () => {
    // cleanup users created in tests
    try {
      await dbQuery('DELETE FROM users WHERE email IN ($1,$2)', [admin.email, viewer.email]);
    } catch (_e) {}
    await closePool();
  });

  test('register + login returns token', async () => {
    const regRes = await request(app).post('/auth/register').send(admin);
    expect(regRes.status).toBe(201);
    expect(regRes.body.token).toBeTruthy();

    const loginRes = await request(app).post('/auth/login').send({ email: admin.email, password: admin.password });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeTruthy();
  });

  test('viewer cannot access admin schema endpoint', async () => {
    const regViewer = await request(app).post('/auth/register').send(viewer);
    expect([201, 409]).toContain(regViewer.status); // if rerun, may already exist

    const loginRes = await request(app).post('/auth/login').send({ email: viewer.email, password: viewer.password });
    expect(loginRes.status).toBe(200);

    const token = loginRes.body.token;

    const ddlRes = await request(app)
      .post('/schema/tables')
      .set('Authorization', `Bearer ${token}`)
      .send({ schema: 'public', table: 'should_not_create', columns: [{ name: 'id', type: 'int', nullable: false }] });

    expect(ddlRes.status).toBe(403);
  });
});
