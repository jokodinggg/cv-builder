import { describe, expect, it } from "vitest";
import { languageCopyTitle } from "./language-copy";

describe("languageCopyTitle", () => {
  it("adds the target language suffix", () => {
    expect(languageCopyTitle("AI Engineer", "en")).toBe("AI Engineer (EN)");
  });

  it("replaces an existing language suffix instead of stacking them", () => {
    expect(languageCopyTitle("AI Engineer (EN)", "id")).toBe("AI Engineer (ID)");
  });

  it("keeps the result within the 120-character title limit", () => {
    expect(languageCopyTitle("x".repeat(130), "en")).toHaveLength(120);
    expect(languageCopyTitle("x".repeat(130), "en").endsWith(" (EN)")).toBe(true);
  });
});
