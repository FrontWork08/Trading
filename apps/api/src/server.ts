import Fastify from 'fastify';
import { pathToFileURL } from 'node:url';

export function createServer() {
  const app = Fastify({ logger: false });
  app.get('/health', async () => ({ status: 'ok' }));
  return app;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const app = createServer();
  const port = Number(process.env.API_PORT ?? 3000);
  app.listen({ host: '0.0.0.0', port }).catch((error: unknown) => {
    app.log.error(error);
    process.exitCode = 1;
  });
}
