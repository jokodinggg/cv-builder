import { describe, expect, it } from "vitest";
import { buildBlocks } from "./blocks";
import { createBlankContent, createItem, createSection } from "./defaults";
import type { ResumeContent } from "./schema";

function contentWith(...sections: ResumeContent["sections"]): ResumeContent {
  return { ...createBlankContent("id"), sections };
}

describe("buildBlocks", () => {
  it("starts with the header block", () => {
    expect(buildBlocks(contentWith())[0]).toMatchObject({ kind: "header", key: "header" });
  });

  it("glues the heading to the first item and gives other items their own block", () => {
    const section = createSection("experience", "id");
    section.items.push(createItem("experience", "id"), createItem("experience", "id"));
    const blocks = buildBlocks(contentWith(section));
    expect(blocks.slice(1).map(block => [block.kind, block.itemId])).toEqual([
      ["section-start", section.items[0].id],
      ["item", section.items[1].id],
      ["item", section.items[2].id],
    ]);
  });

  it("skips hidden sections, hidden items, and sections without visible items", () => {
    const hidden = { ...createSection("skills", "id"), visible: false };
    const empty = { ...createSection("projects", "id"), items: [] };
    const partly = createSection("education", "id");
    const hiddenItem = { ...createItem("education", "id"), visible: false };
    partly.items.unshift(hiddenItem);
    const blocks = buildBlocks(contentWith(hidden, empty, partly));
    expect(blocks.slice(1).map(block => block.itemId)).toEqual([partly.items[1].id]);
  });

  it("follows the sections array order", () => {
    const a = createSection("skills", "id");
    const b = createSection("education", "id");
    expect(buildBlocks(contentWith(b, a)).slice(1).map(block => block.sectionId)).toEqual([b.id, a.id]);
  });

  it("marks the section-start block when the section starts a new page", () => {
    const section = { ...createSection("projects", "id"), pageBreakBefore: true };
    section.items.push(createItem("projects", "id"));
    const [, start, next] = buildBlocks(contentWith(section));
    expect(start.breakBefore).toBe(true);
    expect(next.breakBefore).toBe(false);
  });
});
