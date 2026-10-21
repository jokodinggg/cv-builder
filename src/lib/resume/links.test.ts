import { describe, expect, it } from "vitest";
import { linkDisplay, linkHref } from "./links";
import type { Link } from "./schema";

const link = (type: Link["type"], value: string): Link => ({ id: "l1", type, value, visible: true });

describe("linkHref", () => {
  it("builds a wa.me URL from a local WhatsApp number", () => {
    expect(linkHref(link("whatsapp", "0812-3456-7890"))).toBe("https://wa.me/6281234567890");
  });

  it("builds a wa.me URL from an international WhatsApp number", () => {
    expect(linkHref(link("whatsapp", "+6281234567890"))).toBe("https://wa.me/6281234567890");
  });

  it("adds https to a bare LinkedIn URL", () => {
    expect(linkHref(link("linkedin", "linkedin.com/in/budisantoso"))).toBe("https://linkedin.com/in/budisantoso");
  });

  it("builds mailto and tel links", () => {
    expect(linkHref(link("email", "a@b.co"))).toBe("mailto:a@b.co");
    expect(linkHref(link("phone", "+62 812 3456"))).toBe("tel:+628123456");
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
    expect(linkDisplay(link("instagram", "budisantoso"))).toBe("@budisantoso");
    expect(linkHref(link("instagram", "@budisantoso"))).toBe("https://instagram.com/budisantoso");
  });
});
