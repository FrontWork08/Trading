import { describe, expect, it, vi } from 'vitest';
import { createWorker } from '../src/worker.js';

describe('worker lifecycle', () => {
  it('runs work until stopped and then resolves shutdown', async () => {
    const handle = vi.fn().mockResolvedValue(undefined);
    const worker = createWorker({ handle, pollIntervalMs: 1 });
    const running = worker.start();
    await new Promise((resolve) => setTimeout(resolve, 5));
    worker.stop();
    await running;
    expect(handle).toHaveBeenCalled();
  });
});
