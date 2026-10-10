import { describe, expect, it } from "vitest";
import { moveInPlace } from "./move";

describe("moveInPlace", () => {
  it("moves an element down", () => {
    const list = ["a", "b", "c"];
    moveInPlace(list, 0, 2);
    expect(list).toEqual(["b", "c", "a"]);
  });

  it("moves an element up", () => {
    const list = ["a", "b", "c"];
    moveInPlace(list, 2, 1);
    expect(list).toEqual(["a", "c", "b"]);
  });

  it("ignores a target outside the list", () => {
    const list = ["a", "b"];
    moveInPlace(list, 0, -1);
    moveInPlace(list, 1, 2);
    expect(list).toEqual(["a", "b"]);
  });
});
