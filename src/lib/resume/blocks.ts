import type { ResumeContent } from "./schema";

/**
 * Smallest unit the paginator moves between pages.
 * "section-start" renders the section heading together with its first item so a heading never
 * ends a page alone.
 */
export type Block = {
  key: string;
  kind: "header" | "section-start" | "item";
  sectionId?: string;
  itemId?: string;
  breakBefore: boolean;
};

export function buildBlocks(content: ResumeContent): Block[] {
  const blocks: Block[] = [{ key: "header", kind: "header", breakBefore: false }];
  for (const section of content.sections) {
    if (!section.visible) continue;
    const items = section.items.filter(item => item.visible);
    items.forEach((item, index) => {
      const first = index === 0;
      blocks.push({
        key: `${section.id}:${item.id}`,
        kind: first ? "section-start" : "item",
        sectionId: section.id,
        itemId: item.id,
        breakBefore: first && section.pageBreakBefore,
      });
    });
  }
  return blocks;
}
