import type { Language } from "@/lib/resume/schema";

/** Translates a batch of non-empty strings; must return exactly one result per input, in order. */
export type Provider = (batch: string[], source: Language, target: Language) => Promise<string[]>;

/**
 * Translates every string, sending each distinct non-blank string to the provider once.
 * Blank strings come back unchanged.
 */
export async function translateStrings(
  strings: string[],
  source: Language,
  target: Language,
  provider: Provider,
): Promise<string[]> {
  const unique = [...new Set(strings.filter(value => value.trim()))];
  if (unique.length === 0) return [...strings];
  const translated = await provider(unique, source, target);
  if (translated.length !== unique.length) {
    throw new Error(`Translation returned ${translated.length} strings for ${unique.length} inputs`);
  }
  const byValue = new Map(unique.map((value, index) => [value, translated[index]]));
  return strings.map(value => byValue.get(value) ?? value);
}
