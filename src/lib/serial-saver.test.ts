import { describe, expect, it } from "vitest";
import { createSerialSaver } from "./serial-saver";

const tick = () => new Promise(resolve => setTimeout(resolve, 0));

describe("createSerialSaver", () => {
  it("never runs two saves at once and ends with the latest value saved", async () => {
    let value = 1;
    let running = 0;
    let maxRunning = 0;
    const saved: number[] = [];
    const saver = createSerialSaver({
      read: () => value,
      save: async snapshot => {
        running++;
        maxRunning = Math.max(maxRunning, running);
        await tick();
        await tick();
        saved.push(snapshot);
        running--;
        return true;
      },
    });

    const a = saver.flush();
    const b = saver.flush();
    value = 2;
    const c = saver.flush();
    await tick();
    value = 3;
    const d = saver.flush();
    await Promise.all([a, b, c, d]);

    expect(maxRunning).toBe(1);
    expect(saved.at(-1)).toBe(3);
    expect(saver.isDirty()).toBe(false);
  });

  it("does not call save when nothing changed", async () => {
    let calls = 0;
    const saver = createSerialSaver({ read: () => "same", save: async () => (calls++, true), initial: "same" });
    expect(await saver.flush()).toBe(true);
    expect(calls).toBe(0);
  });

  it("reports failure and stays dirty when save fails", async () => {
    const saver = createSerialSaver({ read: () => 2, save: async () => false, initial: 1 });
    expect(await saver.flush()).toBe(false);
    expect(saver.isDirty()).toBe(true);
  });
});
