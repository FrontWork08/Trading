import Fastify from 'fastify';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerAdminRoutes } from '../src/admin/routes.js';

describe('admin command route', () => {
  const apps: ReturnType<typeof Fastify>[] = [];
  afterEach(async () => { await Promise.all(apps.splice(0).map((app) => app.close())); });

  it('rejects requests without an authenticated principal', async () => {
    const app = Fastify();
    apps.push(app);
    await app.register(registerAdminRoutes, {
      authenticate: async () => null,
      writeAudit: vi.fn(),
      execute: vi.fn(),
    });
    const response = await app.inject({ method: 'POST', url: '/admin/commands/pause', payload: { targetId: 'm1', requestId: 'r1' } });
    expect(response.statusCode).toBe(401);
  });

  it('rejects malformed command payloads before command execution', async () => {
    const execute = vi.fn();
    const app = Fastify();
    apps.push(app);
    await app.register(registerAdminRoutes, {
      authenticate: async () => ({ userId: 'admin-1', role: 'admin' }),
      writeAudit: vi.fn(),
      execute,
    });
    const response = await app.inject({ method: 'POST', url: '/admin/commands/pause', payload: { requestId: 'r1' } });
    expect(response.statusCode).toBe(400);
    expect(execute).not.toHaveBeenCalled();
  });
});
