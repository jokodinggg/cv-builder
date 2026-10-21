import { describe, expect, it } from "vitest";
import { pickChromeSource } from "./chrome-source";

const none = () => false;

describe("pickChromeSource", () => {
  it("uses CHROME_EXECUTABLE_PATH first, even on serverless", () => {
    expect(pickChromeSource({ CHROME_EXECUTABLE_PATH: " /opt/chrome ", VERCEL: "1" }, none)).toEqual({ kind: "path", path: "/opt/chrome" });
  });

  it("uses an installed Chrome when one is found", () => {
    const exists = (path: string) => path === "/usr/bin/chromium";
    expect(pickChromeSource({}, exists)).toEqual({ kind: "path", path: "/usr/bin/chromium" });
  });

  it("uses the bundled serverless Chromium on Vercel and AWS Lambda", () => {
    expect(pickChromeSource({ VERCEL: "1" }, none)).toEqual({ kind: "serverless" });
    expect(pickChromeSource({ AWS_LAMBDA_FUNCTION_NAME: "fn" }, none)).toEqual({ kind: "serverless" });
  });

  it("returns null when no Chrome is available", () => {
    expect(pickChromeSource({}, none)).toBeNull();
  });
});
