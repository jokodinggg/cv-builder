"use client";

import { useRef } from "react";
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

export function NewResumeDialog({ resumes, label = "+ CV baru" }: { resumes: ResumeSummary[]; label?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className="btn-primary" onClick={() => dialog.current?.showModal()}>
        {label}
      </button>
      <dialog
        ref={dialog}
        className="m-auto w-[min(100%-2rem,28rem)] rounded-2xl border border-line p-0 shadow-2xl backdrop:bg-black/30"
      >
        <form action={createResumeAction} className="p-6">
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
