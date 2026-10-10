import { describe, expect, it } from "vitest";
import { createBlankContent, createSection } from "./defaults";
import type { ResumeContent } from "./schema";
import { applyStrings, collectStrings } from "./translate";

function sample(): ResumeContent {
  const content = createBlankContent("id");
  content.personal = { fullName: "Irfan Qobus Salim", headline: "Insinyur AI" };
  content.links[0].value = "+6281333543975";
  const custom = createSection("custom", "id");
  custom.title = "Organisasi";
  content.sections.push(custom);
  const projects = content.sections.find(section => section.type === "projects")!;
  projects.items[0].subtitle = "github.com/irfanqs/proyek";
  return content;
}

describe("collectStrings / applyStrings", () => {
  it("round-trips unchanged with identity translation", () => {
    const content = sample();
    expect(applyStrings(content, collectStrings(content))).toEqual(content);
  });

  it("does not collect the full name, link values, or project links", () => {
    const strings = collectStrings(sample());
    expect(strings).not.toContain("Irfan Qobus Salim");
    expect(strings).not.toContain("+6281333543975");
    expect(strings).not.toContain("github.com/irfanqs/proyek");
    expect(strings).toContain("Insinyur AI");
  });

  it("collects custom section titles and skips empty default titles", () => {
    const content = sample();
    const strings = collectStrings(content);
    expect(strings).toContain("Organisasi");
    const translated = applyStrings(content, strings.map(value => (value ? `EN:${value}` : value)));
    expect(translated.sections.at(-1)?.title).toBe("EN:Organisasi");
    expect(translated.sections[0].title).toBe("");
  });

  it("keeps ids, links, and visibility untouched", () => {
    const content = sample();
    const translated = applyStrings(content, collectStrings(content).map(value => value.toUpperCase()));
    expect(translated.links).toEqual(content.links);
    expect(translated.sections.map(section => [section.id, section.visible, section.items.map(item => item.id)])).toEqual(
      content.sections.map(section => [section.id, section.visible, section.items.map(item => item.id)]),
    );
    expect(translated.personal.fullName).toBe("Irfan Qobus Salim");
  });

  it("throws when the number of strings does not match", () => {
    const content = sample();
    expect(() => applyStrings(content, collectStrings(content).slice(1))).toThrow();
  });
});
