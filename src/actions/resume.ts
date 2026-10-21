"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createBlankContent } from "@/lib/resume/defaults";
import { withFreshIds } from "@/lib/resume/ids";
import * as repo from "@/lib/resume/repository";
import { describeContentError, languageSchema, resumeContentSchema, type Language } from "@/lib/resume/schema";
import { languageCopyTitle } from "@/lib/resume/language-copy";
import { requireUser } from "@/lib/session";

export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const NOT_FOUND = "CV tidak ditemukan.";

export type CreateState = { error: string | null };

export async function createResumeAction(_previous: CreateState, formData: FormData): Promise<CreateState> {
  const user = await requireUser();
  const language: Language = languageSchema.catch("id").parse(formData.get("language"));
  const sourceId = String(formData.get("sourceId") ?? "");
  const title = String(formData.get("title") ?? "");

  let content = createBlankContent(language);
  if (sourceId) {
    const source = await repo.getResume(user.id, sourceId);
    if (!source) return { error: NOT_FOUND };
    content = withFreshIds(source.content);
  } else if (user.name) {
    content.personal.fullName = user.name;
  }

  const result = await createOrLimit(() => repo.createResume(user.id, { title, language, content }));
  if (!result.ok) return { error: result.error };
  redirect(`/cv/${result.id}`);
}

export async function saveResumeAction(id: string, input: unknown): Promise<ActionResult<{ updatedAt: string }>> {
  const user = await requireUser();
  const parsed = resumeContentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: describeContentError(parsed.error, input) };
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
  return createOrLimit(() =>
    repo.createResume(user.id, { title: `${source.title} (salinan)`, language: source.language, content: withFreshIds(source.content) }),
  );
}

export async function deleteResumeAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!(await repo.deleteResume(user.id, id))) return { ok: false, error: NOT_FOUND };
  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Copies the CV into a new CV in the other language. The text stays as-is for the user to rewrite;
 * default section titles switch to the target language automatically.
 */
export async function createLanguageCopyAction(id: string, target: Language): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  if (!languageSchema.safeParse(target).success) return { ok: false, error: "Bahasa tidak dikenal." };
  const source = await repo.getResume(user.id, id);
  if (!source) return { ok: false, error: NOT_FOUND };
  return createOrLimit(() =>
    repo.createResume(user.id, { title: languageCopyTitle(source.title, target), language: target, content: withFreshIds(source.content) }),
  );
}

async function createOrLimit(create: () => Promise<repo.ResumeRecord>): Promise<ActionResult<{ id: string }>> {
  try {
    const created = await create();
    revalidatePath("/dashboard");
    return { ok: true, id: created.id };
  } catch (error) {
    if (error instanceof repo.ResumeLimitError) return { ok: false, error: error.message };
    throw error;
  }
}
