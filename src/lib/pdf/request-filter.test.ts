import { describe, expect, it } from "vitest";
import { isAllowedRequest } from "./request-filter";

describe("isAllowedRequest", () => {
  it("allows same-origin and data URLs", () => {
    expect(isAllowedRequest("http://localhost:3000/_next/x.js", "http://localhost:3000")).toBe(true);
    expect(isAllowedRequest("data:font/woff2;base64,AAA", "http://localhost:3000")).toBe(true);
  });

  it("blocks other origins", () => {
    expect(isAllowedRequest("http://169.254.169.254/latest", "http://localhost:3000")).toBe(false);
  });

  it("blocks unparseable URLs instead of throwing", () => {
    expect(isAllowedRequest("::not a url::", "http://localhost:3000")).toBe(false);
  });
});
