export interface WorkerOptions {
  handle: () => Promise<void>;
  pollIntervalMs?: number;
}

export function createWorker({ handle, pollIntervalMs = 1_000 }: WorkerOptions) {
  let stopping = false;
  let activeTimer: NodeJS.Timeout | undefined;
  let wakeWorker: (() => void) | undefined;

  return {
    async start(): Promise<void> {
      while (!stopping) {
        await handle();
        if (!stopping) {
          await new Promise<void>((resolve) => {
            wakeWorker = resolve;
            activeTimer = setTimeout(resolve, pollIntervalMs);
          });
          wakeWorker = undefined;
          activeTimer = undefined;
        }
      }
    },
    stop(): void {
      stopping = true;
      if (activeTimer) clearTimeout(activeTimer);
      wakeWorker?.();
    },
  };
}
