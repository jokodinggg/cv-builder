import { describe, expect, it } from "vitest";
import { translateStrings, type Provider } from "./providers";

describe("translateStrings", () => {
  it("sends each distinct non-empty string once and maps results back in order", async () => {
    const calls: string[][] = [];
    const provider: Provider = async batch => {
      calls.push(batch);
      return batch.map(value => `<${value}>`);
    };
    const result = await translateStrings(["a", "", "b", "a", "  "], "id", "en", provider);
    expect(result).toEqual(["<a>", "", "<b>", "<a>", "  "]);
    expect(calls).toEqual([["a", "b"]]);
  });

  it("rejects a provider answer with the wrong length", async () => {
    const provider: Provider = async batch => batch.slice(1);
    await expect(translateStrings(["a", "b"], "id", "en", provider)).rejects.toThrow();
  });

  it("does not call the provider when nothing needs translating", async () => {
    let called = false;
    const provider: Provider = async batch => {
      called = true;
      return batch;
    };
    expect(await translateStrings(["", " "], "id", "en", provider)).toEqual(["", " "]);
    expect(called).toBe(false);
  });
});
