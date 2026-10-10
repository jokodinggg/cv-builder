"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { translateResumeAction } from "@/actions/resume";
import type { Language } from "@/lib/resume/schema";

type Props = { resumeId: string; language: Language; className?: string; beforeRun?: () => Promise<boolean> };

/** Creates a translated copy (ID ⇄ EN) and opens it. */
export function TranslateButton({ resumeId, language, className, beforeRun }: Props) {
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
        title={`Buat salinan CV dalam ${target === "en" ? "bahasa Inggris" : "bahasa Indonesia"}`}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            if (beforeRun && !(await beforeRun())) {
              setError("Simpan perubahan dulu, lalu coba lagi.");
              return;
            }
            const result = await translateResumeAction(resumeId, target);
            if (result.ok) router.push(`/cv/${result.id}`);
            else setError(result.error);
          })
        }
      >
        {pending ? "Menerjemahkan…" : target === "en" ? "Terjemahkan ke EN" : "Terjemahkan ke ID"}
      </button>
      {error && (
        <span role="alert" className="basis-full text-xs text-danger">
          {error}
        </span>
      )}
    </>
  );
}
