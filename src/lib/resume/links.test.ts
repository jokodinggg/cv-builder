import { describe, expect, it } from "vitest";
import { linkDisplay, linkHref } from "./links";
import type { Link } from "./schema";

const link = (type: Link["type"], value: string): Link => ({ id: "l1", type, value, visible: true });

describe("linkHref", () => {
  it("builds a wa.me URL from a local WhatsApp number", () => {
    expect(linkHref(link("whatsapp", "0813-3354-3975"))).toBe("https://wa.me/6281333543975");
  });

  it("builds a wa.me URL from an international WhatsApp number", () => {
    expect(linkHref(link("whatsapp", "+6281333543975"))).toBe("https://wa.me/6281333543975");
  });

  it("adds https to a bare LinkedIn URL", () => {
    expect(linkHref(link("linkedin", "linkedin.com/in/irfanqs"))).toBe("https://linkedin.com/in/irfanqs");
  });

  it("builds mailto and tel links", () => {
    expect(linkHref(link("email", "a@b.co"))).toBe("mailto:a@b.co");
    expect(linkHref(link("phone", "+62 813 3354"))).toBe("tel:+628133354");
  });

  it("refuses javascript URLs", () => {
    expect(linkHref(link("website", "javascript:alert(1)"))).toBeNull();
  });

  it("returns null for an empty value", () => {
    expect(linkHref(link("github", "  "))).toBeNull();
  });
});

describe("linkDisplay", () => {
  it("strips the protocol and www prefix", () => {
    expect(linkDisplay(link("website", "https://www.irfan.dev/"))).toBe("irfan.dev");
  });

  it("shows handles for instagram and x usernames", () => {
    expect(linkDisplay(link("instagram", "irfanqs"))).toBe("@irfanqs");
    expect(linkHref(link("instagram", "@irfanqs"))).toBe("https://instagram.com/irfanqs");
  });
});
