const UNSAVED = Symbol("unsaved");

type Options<T> = {
  /** Returns the current value to save. Compared by identity with the last saved value. */
  read: () => T;
  /** Persists a snapshot; resolves true on success. */
  save: (snapshot: T) => Promise<boolean>;
  /** Value already persisted, if any. */
  initial?: T;
};

/**
 * Serializes saves: at most one `save` call runs at a time, and each flush saves whatever is
 * current when its turn comes, so a slow older request can never land after a newer one.
 */
export function createSerialSaver<T>({ read, save, initial }: Options<T>) {
  let saved: T | typeof UNSAVED = initial === undefined ? UNSAVED : initial;
  let queue: Promise<unknown> = Promise.resolve();

  async function run(): Promise<boolean> {
    // Keep saving while the value changed during the previous request.
    for (let snapshot = read(); snapshot !== saved; snapshot = read()) {
      let ok = false;
      try {
        ok = await save(snapshot);
      } catch {
        ok = false;
      }
      if (!ok) return false;
      saved = snapshot;
    }
    return true;
  }

  return {
    flush(): Promise<boolean> {
      const next = queue.then(run);
      queue = next.catch(() => undefined);
      return next;
    },
    isDirty: () => read() !== saved,
  };
}
