"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { createResumeAction } from "@/actions/resume";
import type { ResumeSummary } from "@/lib/resume/repository";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? "Membuat…" : "Buat CV"}
    </button>
  );
}

type Props = { resumes: ResumeSummary[]; limit: number; label?: string };

export function NewResumeDialog({ resumes, limit, label = "+ CV baru" }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, formAction] = useActionState(createResumeAction, { error: null });
  const full = resumes.length >= limit;
  return (
    <>
      <button
        type="button"
        className="btn-primary"
        disabled={full}
        title={full ? `Maksimal ${limit} CV per akun. Hapus CV lama dulu.` : undefined}
        onClick={() => dialog.current?.showModal()}
      >
        {label}
      </button>
      <dialog
        ref={dialog}
        className="m-auto w-[min(100%-2rem,28rem)] rounded-2xl border border-line p-0 shadow-2xl backdrop:bg-black/30"
      >
        <form action={formAction} className="p-6">
          <h2 className="mb-5 font-display text-xl font-extrabold tracking-tight">CV baru</h2>
          <label className="label">
            Nama CV
            <input name="title" required maxLength={120} placeholder="Contoh: AI Engineer — Gojek" className="input mt-1.5" />
          </label>
          <label className="label">
            Mulai dari
            <select name="sourceId" defaultValue="" className="input mt-1.5">
              <option value="">CV kosong (template contoh)</option>
              {resumes.map(resume => (
                <option key={resume.id} value={resume.id}>
                  Salin: {resume.title}
                </option>
              ))}
            </select>
          </label>
          <label className="label">
            Bahasa CV
            <select name="language" defaultValue="id" className="input mt-1.5">
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
            <span className="mt-1 block font-medium text-muted">Menentukan judul bagian bawaan, mis. “Pengalaman” atau “Experience”.</span>
          </label>
          {state.error && (
            <p role="alert" className="mt-2 rounded-lg bg-[#feecec] px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => dialog.current?.close()}>
              Batal
            </button>
            <SubmitButton />
          </div>
        </form>
      </dialog>
    </>
  );
}
