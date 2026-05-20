const request = require('supertest');

// Mock mongoose so tests run without a real MongoDB
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue(true),
    connection: { readyState: 0 }, // 0 = disconnected → triggers in-memory fallback
    Schema: actualMongoose.Schema,
    model: jest.fn(() => ({})),
  };
});

const app = require('./app');

describe('GET /health', () => {
  it('should return status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('db');
    expect(res.body).toHaveProperty('uptime');
  });
});

describe('Todo API (in-memory)', () => {
  it('GET /api/todos → returns an array', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/todos → creates a todo', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ text: 'Learn GitHub Actions' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('text', 'Learn GitHub Actions');
    expect(res.body).toHaveProperty('done', false);
    expect(res.body).toHaveProperty('_id');
  });

  it('POST /api/todos → rejects empty text', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ text: '   ' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('PATCH /api/todos/:id → toggles done', async () => {
    // First create one
    const create = await request(app)
      .post('/api/todos')
      .send({ text: 'Toggle me' });
    const id = create.body._id;

    const res = await request(app)
      .patch(`/api/todos/${id}`)
      .send({ done: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.done).toBe(true);
  });

  it('PATCH /api/todos/:id → 404 for missing id', async () => {
    const res = await request(app)
      .patch('/api/todos/nonexistent-id')
      .send({ done: true });
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/todos/:id → deletes a todo', async () => {
    const create = await request(app)
      .post('/api/todos')
      .send({ text: 'Delete me' });
    const id = create.body._id;

    const res = await request(app).delete(`/api/todos/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });
});
