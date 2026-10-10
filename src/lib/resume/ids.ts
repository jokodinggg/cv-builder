import type { ResumeContent } from "./schema";

export function newId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

export function withFreshIds(content: ResumeContent): ResumeContent {
  return {
    ...content,
    personal: { ...content.personal },
    links: content.links.map(link => ({ ...link, id: newId() })),
    sections: content.sections.map(section => ({
      ...section,
      id: newId(),
      items: section.items.map(item => ({ ...item, id: newId() })),
    })),
  };
}
