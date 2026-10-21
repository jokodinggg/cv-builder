"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteResumeAction, duplicateResumeAction, updateResumeMetaAction } from "@/actions/resume";
import type { ResumeSummary } from "@/lib/resume/repository";
import { LanguageCopyButton } from "./language-copy-button";

const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });

export function ResumeCard({ resume }: { resume: ResumeSummary }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(task: () => Promise<{ ok: boolean; error?: string; id?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await task();
      if (!result.ok) setError(result.error ?? "Gagal.");
      else router.refresh();
    });
  }

  return (
    <article className="flex flex-col rounded-xl border border-line bg-white p-4 transition hover:shadow-[0_10px_30px_#2630291a]">
      <Link href={`/cv/${resume.id}`} className="group block flex-1">
        <div className="mb-3 flex aspect-[210/120] items-end rounded-lg border border-line bg-soft p-3">
          <span className="font-serif text-lg font-bold leading-tight text-ink group-hover:text-brand">{resume.title}</span>
        </div>
      </Link>
      <div className="flex items-center justify-between gap-2 text-xs text-muted">
        <span>Diubah {dateFormat.format(resume.updatedAt)}</span>
        <span className="rounded bg-brand-soft px-1.5 py-0.5 font-bold uppercase text-brand-strong">{resume.language}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Link href={`/cv/${resume.id}`} className="btn-secondary px-3 py-1.5 text-xs">
          Edit
        </Link>
        <button type="button" disabled={pending} className="btn-ghost px-3 py-1.5 text-xs" onClick={() => run(() => duplicateResumeAction(resume.id))}>
          Duplikat
        </button>
        <button
          type="button"
          disabled={pending}
          className="btn-ghost px-3 py-1.5 text-xs"
          onClick={() => {
            const title = window.prompt("Nama baru CV", resume.title);
            if (title && title.trim() !== resume.title) run(() => updateResumeMetaAction(resume.id, { title }));
          }}
        >
          Ganti nama
        </button>
        <LanguageCopyButton resumeId={resume.id} language={resume.language} className="btn-ghost px-3 py-1.5 text-xs" />
        <button
          type="button"
          disabled={pending}
          className="btn-ghost px-3 py-1.5 text-xs text-danger"
          onClick={() => {
            if (window.confirm(`Hapus “${resume.title}”? Tindakan ini tidak bisa dibatalkan.`)) run(() => deleteResumeAction(resume.id));
          }}
        >
          Hapus
        </button>
      </div>
      {error && <p role="alert" className="mt-2 text-xs text-danger">{error}</p>}
    </article>
  );
}
