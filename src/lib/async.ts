/** Rejects when `promise` does not settle within `ms`, after calling `onTimeout` (e.g. to close a page). */
export function withDeadline<T>(promise: Promise<T>, ms: number, onTimeout: () => void): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      onTimeout();
      reject(new Error("Batas waktu habis."));
    }, ms);
  });
  return Promise.race([promise, deadline]).finally(() => clearTimeout(timer));
}

/** Returns a wrapper that runs at most `concurrency` tasks at the same time. */
export function createLimiter(concurrency: number) {
  let active = 0;
  const waiting: Array<() => void> = [];
  return async function limit<T>(task: () => Promise<T>): Promise<T> {
    if (active >= concurrency) await new Promise<void>(resolve => waiting.push(resolve));
    active++;
    try {
      return await task();
    } finally {
      active--;
      waiting.shift()?.();
    }
  };
}
