import { describe, expect, it } from "vitest";
import { pdfFileName } from "./filename";

describe("pdfFileName", () => {
  it("uses the name plus month and two-digit year", () => {
    expect(pdfFileName("Budi Santoso", new Date("2026-10-10T12:00:00Z"))).toBe("CV_Budi Santoso_OCT26.pdf");
  });

  it("strips characters that are invalid in file names", () => {
    expect(pdfFileName('A/B\\C:D*E?F"G<H>I|J', new Date("2026-01-05T12:00:00Z"))).toBe("CV_ABCDEFGHIJ_JAN26.pdf");
  });

  it("omits the name part when the name is empty", () => {
    expect(pdfFileName("   ", new Date("2026-10-10T12:00:00Z"))).toBe("CV_OCT26.pdf");
  });
});
