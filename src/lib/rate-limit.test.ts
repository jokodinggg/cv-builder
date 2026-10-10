import { describe, expect, it } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  it("allows 10 calls per window and blocks the 11th", () => {
    const key = `user-${Math.random()}`;
    const results = Array.from({ length: 11 }, () => rateLimit(key, 10, 60_000, 1_000));
    expect(results.slice(0, 10).every(Boolean)).toBe(true);
    expect(results[10]).toBe(false);
  });

  it("allows calls again after the window passes", () => {
    const key = `user-${Math.random()}`;
    for (let i = 0; i < 10; i++) rateLimit(key, 10, 60_000, 1_000);
    expect(rateLimit(key, 10, 60_000, 1_000 + 60_001)).toBe(true);
  });

  it("tracks keys separately", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    rateLimit(a, 1, 60_000, 0);
    expect(rateLimit(a, 1, 60_000, 0)).toBe(false);
    expect(rateLimit(b, 1, 60_000, 0)).toBe(true);
  });
});
