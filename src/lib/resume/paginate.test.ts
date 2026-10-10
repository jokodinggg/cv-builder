import { describe, expect, it } from "vitest";
import { paginate } from "./paginate";

const none = (n: number) => Array<boolean>(n).fill(false);

describe("paginate", () => {
  it("fills a page and moves the rest to the next page", () => {
    expect(paginate([100, 100, 100], none(3), 250)).toEqual({ pages: [[0, 1], [2]], overflow: [] });
  });

  it("starts a new page on a forced break even when there is room", () => {
    expect(paginate([100, 100, 100], [false, true, false], 1000).pages).toEqual([[0], [1, 2]]);
  });

  it("does not create an empty first page for a forced break on the first block", () => {
    expect(paginate([100, 100], [true, false], 1000).pages).toEqual([[0, 1]]);
  });

  it("places a block taller than a page alone and reports it as overflow", () => {
    expect(paginate([100, 400, 100], none(3), 250)).toEqual({ pages: [[0], [1], [2]], overflow: [1] });
  });

  it("returns one empty page when there are no blocks", () => {
    expect(paginate([], [], 250)).toEqual({ pages: [[]], overflow: [] });
  });

  it("fits blocks whose total equals the page height exactly", () => {
    expect(paginate([125, 125], none(2), 250).pages).toEqual([[0, 1]]);
  });
});
