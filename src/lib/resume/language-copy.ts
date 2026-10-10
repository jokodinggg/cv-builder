import type { Language } from "./schema";

const MAX_TITLE = 120;
const SUFFIX: Record<Language, string> = { id: " (ID)", en: " (EN)" };

/** Title for a copy of a CV in another language, e.g. "AI Engineer" → "AI Engineer (EN)". */
export function languageCopyTitle(title: string, target: Language): string {
  const base = title.trim().replace(/ \((ID|EN)\)$/, "");
  return base.slice(0, MAX_TITLE - SUFFIX[target].length) + SUFFIX[target];
}
