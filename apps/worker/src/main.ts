import { createWorker } from './worker.js';

const worker = createWorker({ handle: async () => new Promise((resolve) => setTimeout(resolve, 1_000)) });
const shutdown = () => worker.stop();
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
worker.start().catch((error: unknown) => {
  console.error('Worker stopped after an unrecoverable error', error);
  process.exitCode = 1;
});
