"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createBlankContent } from "@/lib/resume/defaults";
import { withFreshIds } from "@/lib/resume/ids";
import * as repo from "@/lib/resume/repository";
import { languageSchema, resumeContentSchema, type Language } from "@/lib/resume/schema";
import { requireUser } from "@/lib/session";

export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const NOT_FOUND = "CV tidak ditemukan.";

export async function createResumeAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const language: Language = languageSchema.catch("id").parse(formData.get("language"));
  const sourceId = String(formData.get("sourceId") ?? "");
  const title = String(formData.get("title") ?? "");

  let content = createBlankContent(language);
  if (sourceId) {
    const source = await repo.getResume(user.id, sourceId);
    if (!source) throw new Error(NOT_FOUND);
    content = withFreshIds(source.content);
  } else if (user.name) {
    content.personal.fullName = user.name;
  }

  const created = await repo.createResume(user.id, { title, language, content });
  revalidatePath("/dashboard");
  redirect(`/cv/${created.id}`);
}

export async function saveResumeAction(id: string, input: unknown): Promise<ActionResult<{ updatedAt: string }>> {
  const user = await requireUser();
  const parsed = resumeContentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Data CV tidak valid. Periksa panjang isian." };
  const updatedAt = await repo.touchResume(user.id, id, { content: parsed.data });
  if (!updatedAt) return { ok: false, error: NOT_FOUND };
  return { ok: true, updatedAt: updatedAt.toISOString() };
}

export async function updateResumeMetaAction(
  id: string,
  meta: { title?: string; language?: Language },
): Promise<ActionResult> {
  const user = await requireUser();
  const language = meta.language === undefined ? undefined : languageSchema.safeParse(meta.language).data;
  if (meta.language !== undefined && !language) return { ok: false, error: "Bahasa tidak dikenal." };
  const ok = await repo.updateResume(user.id, id, { title: meta.title, language });
  if (!ok) return { ok: false, error: NOT_FOUND };
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function duplicateResumeAction(id: string): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const source = await repo.getResume(user.id, id);
  if (!source) return { ok: false, error: NOT_FOUND };
  const copy = await repo.createResume(user.id, {
    title: `${source.title} (salinan)`,
    language: source.language,
    content: withFreshIds(source.content),
  });
  revalidatePath("/dashboard");
  return { ok: true, id: copy.id };
}

export async function deleteResumeAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!(await repo.deleteResume(user.id, id))) return { ok: false, error: NOT_FOUND };
  revalidatePath("/dashboard");
  return { ok: true };
}
