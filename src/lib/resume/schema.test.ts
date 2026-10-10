import { describe, expect, it } from "vitest";
import { createBlankContent, createItem, createSection, sectionTitle } from "./defaults";
import { withFreshIds } from "./ids";
import { parseContent, resumeContentSchema } from "./schema";

describe("resume content schema", () => {
  it("round-trips blank content with the default section order", () => {
    const blank = createBlankContent("id");
    expect(parseContent(blank)).toEqual(blank);
    expect(blank.sections.map(section => section.type)).toEqual([
      "education",
      "skills",
      "experience",
      "projects",
      "achievements",
    ]);
  });

  it("rejects strings longer than 5000 characters", () => {
    const content = createBlankContent("id");
    content.personal.fullName = "x".repeat(5001);
    expect(resumeContentSchema.safeParse(content).success).toBe(false);
  });

  it("rejects a section with 51 items", () => {
    const content = createBlankContent("id");
    content.sections[0].items = Array.from({ length: 51 }, () => createItem("education", "id"));
    expect(resumeContentSchema.safeParse(content).success).toBe(false);
  });

  it("returns blank content instead of throwing for garbage input", () => {
    const parsed = parseContent({ garbage: true });
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.sections.length).toBeGreaterThan(0);
  });

  it("uses the language default title only when the custom title is empty", () => {
    const section = createSection("experience", "en");
    expect(sectionTitle(section, "en")).toBe("Experience");
    expect(sectionTitle(section, "id")).toBe("Pengalaman");
    expect(sectionTitle({ ...section, title: "Riwayat Kerja" }, "en")).toBe("Riwayat Kerja");
  });
});

describe("withFreshIds", () => {
  it("changes every section, item, and link id and keeps the text", () => {
    const content = createBlankContent("id");
    content.links.push({ id: "link-a", type: "github", value: "github.com/irfanqs", visible: true });
    const copy = withFreshIds(content);
    const ids = (c: typeof content) => [
      ...c.links.map(link => link.id),
      ...c.sections.flatMap(section => [section.id, ...section.items.map(item => item.id)]),
    ];
    const before = ids(content);
    const after = ids(copy);
    expect(after).toHaveLength(before.length);
    after.forEach(id => expect(before).not.toContain(id));
    expect(copy.sections[0].items[0].title).toBe(content.sections[0].items[0].title);
    expect(copy.links.at(-1)?.value).toBe("github.com/irfanqs");
  });
});

describe("parseContent salvage", () => {
  it("keeps valid sections and truncates an oversized field instead of dropping the CV", async () => {
    const { parseContentWithStatus } = await import("./schema");
    const content = createBlankContent("id");
    content.personal.fullName = "Irfan";
    content.sections[2].items[0].bullets = "x".repeat(6000);
    const result = parseContentWithStatus(content);
    expect(result.recovered).toBe(true);
    expect(result.content.personal.fullName).toBe("Irfan");
    expect(result.content.sections).toHaveLength(content.sections.length);
    expect(result.content.sections[2].items[0].bullets).toHaveLength(5000);
  });

  it("drops only invalid links and reports recovery", async () => {
    const { parseContentWithStatus } = await import("./schema");
    const content = createBlankContent("id") as unknown as { links: unknown[] };
    content.links.push({ id: "bad", type: "telegram", value: "x", visible: true });
    const result = parseContentWithStatus(content);
    expect(result.recovered).toBe(true);
    expect(result.content.links.map(link => link.id)).not.toContain("bad");
    expect(result.content.links).toHaveLength(4);
  });

  it("reports no recovery for valid content", async () => {
    const { parseContentWithStatus } = await import("./schema");
    expect(parseContentWithStatus(createBlankContent("en")).recovered).toBe(false);
  });
});

describe("describeContentError", () => {
  it("names the section and field that is too long", async () => {
    const { describeContentError } = await import("./schema");
    const content = createBlankContent("id");
    content.sections[2].items[0].bullets = "x".repeat(6000);
    const result = resumeContentSchema.safeParse(content);
    expect(result.success).toBe(false);
    if (!result.success) expect(describeContentError(result.error, content)).toMatch(/Pengalaman.*5000/);
  });
});
