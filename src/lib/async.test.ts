import { describe, expect, it } from "vitest";
import { createLimiter, withDeadline } from "./async";

describe("withDeadline", () => {
  it("rejects and runs the cleanup when the deadline passes", async () => {
    let cleaned = false;
    const never = new Promise<string>(() => undefined);
    await expect(withDeadline(never, 10, () => void (cleaned = true))).rejects.toThrow(/waktu/i);
    expect(cleaned).toBe(true);
  });

  it("resolves with the value when it finishes in time", async () => {
    expect(await withDeadline(Promise.resolve(5), 100, () => undefined)).toBe(5);
  });
});

describe("createLimiter", () => {
  it("runs at most n tasks at once", async () => {
    const limit = createLimiter(2);
    let running = 0;
    let max = 0;
    const task = () =>
      limit(async () => {
        running++;
        max = Math.max(max, running);
        await new Promise(resolve => setTimeout(resolve, 5));
        running--;
      });
    await Promise.all([task(), task(), task(), task(), task()]);
    expect(max).toBe(2);
  });

  it("releases the slot when a task throws", async () => {
    const limit = createLimiter(1);
    await expect(limit(async () => Promise.reject(new Error("x")))).rejects.toThrow("x");
    expect(await limit(async () => "ok")).toBe("ok");
  });
});
