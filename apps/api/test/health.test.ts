import { afterAll, describe, expect, it } from 'vitest';
import { createServer } from '../src/server.js';

describe('health endpoint', () => {
  const app = createServer();
  afterAll(() => app.close());

  it('returns a dependency-free liveness response', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });
});
