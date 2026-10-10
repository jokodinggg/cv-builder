import { z } from "zod";
import { createBlankContent, SECTION_TITLES } from "./defaults";

export const MAX_TEXT = 5000;
export const MAX_ITEMS = 50;
export const MAX_SECTIONS = 30;
export const MAX_LINKS = 20;

export const LANGUAGES = ["id", "en"] as const;
export const SECTION_TYPES = ["summary", "education", "skills", "experience", "projects", "achievements", "custom"] as const;
export const LINK_TYPE_IDS = [
  "email",
  "phone",
  "whatsapp",
  "linkedin",
  "github",
  "website",
  "instagram",
  "x",
  "youtube",
  "other",
] as const;

const text = z.string().max(MAX_TEXT);
const id = z.string().min(1).max(64);

export const languageSchema = z.enum(LANGUAGES);

export const linkSchema = z.object({
  id,
  type: z.enum(LINK_TYPE_IDS),
  value: text,
  visible: z.boolean(),
});

export const itemSchema = z.object({
  id,
  title: text,
  subtitle: text,
  date: text,
  detail: text,
  bullets: text,
  visible: z.boolean(),
});

export const sectionSchema = z.object({
  id,
  type: z.enum(SECTION_TYPES),
  title: text,
  visible: z.boolean(),
  pageBreakBefore: z.boolean(),
  items: z.array(itemSchema).max(MAX_ITEMS),
});

export const resumeContentSchema = z.object({
  schemaVersion: z.literal(1),
  personal: z.object({ fullName: text, headline: text }),
  links: z.array(linkSchema).max(MAX_LINKS),
  sections: z.array(sectionSchema).max(MAX_SECTIONS),
});

export type Language = z.infer<typeof languageSchema>;
export type SectionType = (typeof SECTION_TYPES)[number];
export type LinkType = (typeof LINK_TYPE_IDS)[number];
export type Link = z.infer<typeof linkSchema>;
export type Item = z.infer<typeof itemSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type ResumeContent = z.infer<typeof resumeContentSchema>;

export type ParsedContent = { content: ResumeContent; recovered: boolean };

const clip = (value: unknown) => (typeof value === "string" ? value.slice(0, MAX_TEXT) : value);

function clipStrings(value: unknown): unknown {
  if (typeof value === "string") return clip(value);
  if (Array.isArray(value)) return value.map(clipStrings);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, clipStrings(inner)]));
  return value;
}

/** Keeps every valid piece of damaged content: clips long strings, drops only invalid links/sections/items. */
function salvage(raw: unknown, language: Language): ResumeContent {
  const blank = createBlankContent(language);
  if (!raw || typeof raw !== "object") return blank;
  const source = clipStrings(raw) as Record<string, unknown>;
  const personal = (source.personal ?? {}) as Record<string, unknown>;
  const links = Array.isArray(source.links) ? source.links : [];
  const sections = Array.isArray(source.sections) ? source.sections : [];
  const validSections = sections.slice(0, MAX_SECTIONS).flatMap(section => {
    if (!section || typeof section !== "object") return [];
    const record = section as Record<string, unknown>;
    const items = (Array.isArray(record.items) ? record.items : []).flatMap(item => {
      const parsed = itemSchema.safeParse(item);
      return parsed.success ? [parsed.data] : [];
    });
    const parsed = sectionSchema.safeParse({ ...record, items: items.slice(0, MAX_ITEMS) });
    return parsed.success ? [parsed.data] : [];
  });
  return {
    schemaVersion: 1,
    personal: {
      fullName: typeof personal.fullName === "string" ? personal.fullName : "",
      headline: typeof personal.headline === "string" ? personal.headline : "",
    },
    links: links.slice(0, MAX_LINKS).flatMap(link => {
      const parsed = linkSchema.safeParse(link);
      return parsed.success ? [parsed.data] : [];
    }),
    sections: validSections.length > 0 || sections.length > 0 ? validSections : blank.sections,
  };
}

/** Parses stored content. Damaged rows are salvaged (never replaced wholesale) and flagged. */
export function parseContentWithStatus(raw: unknown, language: Language = "id"): ParsedContent {
  const result = resumeContentSchema.safeParse(raw);
  if (result.success) return { content: result.data, recovered: false };
  console.warn("Invalid resume content, salvaging", result.error.issues.slice(0, 3));
  return { content: salvage(raw, language), recovered: true };
}

export function parseContent(raw: unknown, language: Language = "id"): ResumeContent {
  return parseContentWithStatus(raw, language).content;
}

const FIELD_LABEL: Record<string, string> = {
  fullName: "Nama lengkap",
  headline: "Headline",
  value: "Isi tautan",
  title: "Judul",
  subtitle: "Subjudul",
  date: "Periode",
  detail: "Keterangan",
  bullets: "Poin",
};

/** Human-readable (Indonesian) pointer to the first invalid field, e.g. "Pengalaman › item 1 › Poin". */
export function describeContentError(error: z.ZodError, content: unknown): string {
  const issue = error.issues[0];
  if (!issue) return "Data CV tidak valid.";
  const path = issue.path;
  const parts: string[] = [];
  if (path[0] === "sections" && typeof path[1] === "number") {
    const section = (content as ResumeContent).sections?.[path[1]];
    parts.push(section ? section.title || SECTION_TITLES[section.type].id : `Bagian ${path[1] + 1}`);
    if (path[2] === "items" && typeof path[3] === "number") parts.push(`item ${path[3] + 1}`);
  } else if (path[0] === "links") {
    parts.push("Kontak & media sosial");
  }
  const field = path.at(-1);
  if (typeof field === "string" && FIELD_LABEL[field]) parts.push(FIELD_LABEL[field]);
  const where = parts.join(" › ") || "Isian";
  if (issue.code === "too_big") return `${where} terlalu panjang (maksimal ${MAX_TEXT} karakter per kolom).`;
  return `${where} tidak valid.`;
}
