import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { languageSchema, parseContent, resumeContentSchema, type Language, type ResumeContent } from "./schema";

export type ResumeSummary = { id: string; title: string; language: Language; updatedAt: Date };
export type ResumeRecord = ResumeSummary & { template: string; content: ResumeContent };
export type ResumePatch = { title?: string; language?: Language; content?: ResumeContent };

const MAX_TITLE = 120;

const toLanguage = (value: string): Language => (languageSchema.safeParse(value).success ? (value as Language) : "id");

export function cleanTitle(title: string): string {
  return title.trim().slice(0, MAX_TITLE) || "CV tanpa judul";
}

export async function listResumes(userId: string): Promise<ResumeSummary[]> {
  const rows = await prisma.resume.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, language: true, updatedAt: true },
  });
  return rows.map(row => ({ ...row, language: toLanguage(row.language) }));
}

export async function getResume(userId: string, id: string): Promise<ResumeRecord | null> {
  const row = await prisma.resume.findFirst({ where: { id, userId } });
  if (!row) return null;
  const language = toLanguage(row.language);
  return {
    id: row.id,
    title: row.title,
    language,
    template: row.template,
    updatedAt: row.updatedAt,
    content: parseContent(row.content, language),
  };
}

export async function createResume(
  userId: string,
  input: { title: string; language: Language; content: ResumeContent },
): Promise<ResumeRecord> {
  const content = resumeContentSchema.parse(input.content);
  const row = await prisma.resume.create({
    data: { userId, title: cleanTitle(input.title), language: input.language, content: content as Prisma.InputJsonValue },
  });
  return { id: row.id, title: row.title, language: input.language, template: row.template, updatedAt: row.updatedAt, content };
}

export async function updateResume(userId: string, id: string, patch: ResumePatch): Promise<boolean> {
  return (await touchResume(userId, id, patch)) !== null;
}

/** Returns the new updatedAt, or null when the resume does not exist or is not owned by the user. */
export async function touchResume(userId: string, id: string, patch: ResumePatch): Promise<Date | null> {
  const data: Prisma.ResumeUpdateManyMutationInput = {};
  if (patch.title !== undefined) data.title = cleanTitle(patch.title);
  if (patch.language !== undefined) data.language = languageSchema.parse(patch.language);
  if (patch.content !== undefined) data.content = resumeContentSchema.parse(patch.content) as Prisma.InputJsonValue;
  const updatedAt = new Date();
  const result = await prisma.resume.updateMany({ where: { id, userId }, data: { ...data, updatedAt } });
  return result.count > 0 ? updatedAt : null;
}

export async function deleteResume(userId: string, id: string): Promise<boolean> {
  const result = await prisma.resume.deleteMany({ where: { id, userId } });
  return result.count > 0;
}
