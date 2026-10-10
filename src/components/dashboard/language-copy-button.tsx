"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createLanguageCopyAction } from "@/actions/resume";
import type { Language } from "@/lib/resume/schema";

type Props = { resumeId: string; language: Language; className?: string; beforeRun?: () => Promise<boolean> };

/** Copies the CV into a new CV in the other language, then opens it so the user can rewrite the text. */
export function LanguageCopyButton({ resumeId, language, className, beforeRun }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const target: Language = language === "id" ? "en" : "id";

  return (
    <>
      <button
        type="button"
        disabled={pending}
        className={className}
        title={`Salin CV ini jadi CV ${target === "en" ? "bahasa Inggris" : "bahasa Indonesia"}, lalu tulis ulang teksnya`}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            if (beforeRun && !(await beforeRun())) {
              setError("Simpan perubahan dulu, lalu coba lagi.");
              return;
            }
            const result = await createLanguageCopyAction(resumeId, target);
            if (result.ok) router.push(`/cv/${result.id}?copy=${target}`);
            else setError(result.error);
          })
        }
      >
        {pending ? "Menyalin…" : `Buat versi ${target.toUpperCase()}`}
      </button>
      {error && (
        <span role="alert" className="basis-full text-xs text-danger">
          {error}
        </span>
      )}
    </>
  );
}
