import { z } from "zod";
import { createBlankContent } from "./defaults";

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

/** Parses stored content; falls back to a blank CV so a bad row never crashes the editor. */
export function parseContent(raw: unknown, language: Language = "id"): ResumeContent {
  const result = resumeContentSchema.safeParse(raw);
  if (result.success) return result.data;
  console.warn("Invalid resume content, using blank content", result.error.issues.slice(0, 3));
  return createBlankContent(language);
}
