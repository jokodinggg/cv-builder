import { produce } from "immer";
import { FIELD_CONFIG } from "./defaults";
import type { Item, ResumeContent, SectionType } from "./schema";

type TextField = "title" | "subtitle" | "date" | "detail" | "bullets";

/** Item fields worth translating per section type. Project subtitles hold a URL, so they are skipped. */
function translatableFields(type: SectionType): TextField[] {
  const fields = Object.keys(FIELD_CONFIG[type]) as TextField[];
  return type === "projects" ? fields.filter(field => field !== "subtitle") : fields;
}

/**
 * Visits every translatable string in a fixed order. The full name and contact links are never
 * visited. Empty section titles are skipped so the default title follows the new CV language.
 */
function visit(content: ResumeContent, onString: (get: () => string, set: (value: string) => void) => void) {
  onString(() => content.personal.headline, value => (content.personal.headline = value));
  for (const section of content.sections) {
    if (section.title.trim()) onString(() => section.title, value => (section.title = value));
    for (const item of section.items) {
      for (const field of translatableFields(section.type)) {
        onString(() => item[field], value => ((item as Item)[field] = value));
      }
    }
  }
}

export function collectStrings(content: ResumeContent): string[] {
  const strings: string[] = [];
  visit(content, get => strings.push(get()));
  return strings;
}

export function applyStrings(content: ResumeContent, strings: string[]): ResumeContent {
  const expected = collectStrings(content).length;
  if (strings.length !== expected) throw new Error(`Expected ${expected} translated strings, got ${strings.length}`);
  return produce(content, draft => {
    let index = 0;
    visit(draft, (_get, set) => set(strings[index++]));
  });
}
