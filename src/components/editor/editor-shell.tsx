"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { updateResumeMetaAction } from "@/actions/resume";
import type { Language, ResumeContent } from "@/lib/resume/schema";
import { moveInPlace } from "@/lib/move";
import { AddSectionMenu } from "./add-section-menu";
import { EditorContext, type EditorApi } from "./editor-context";
import { LinksEditor } from "./links-editor";
import { PersonalEditor } from "./personal-editor";
import { PreviewPanel } from "./preview-panel";
import { SectionEditor } from "./section-editor";
import { SortableList } from "./sortable-list";
import { useResumeState, type SaveState } from "./use-resume-state";

type Props = { id: string; title: string; language: Language; content: ResumeContent; recovered?: boolean };

const SAVE_LABEL: Record<SaveState, string> = {
  saved: "Tersimpan",
  pending: "Belum tersimpan…",
  saving: "Menyimpan…",
  error: "Gagal menyimpan",
};

export function EditorShell({ id, title: initialTitle, language: initialLanguage, content: initialContent, recovered = false }: Props) {
  const { content, update, saveState, saveError, flush } = useResumeState(id, initialContent);
  const [title, setTitle] = useState(initialTitle);
  const [savedTitle, setSavedTitle] = useState(initialTitle);
  const [language, setLanguage] = useState(initialLanguage);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [metaError, setMetaError] = useState<string | null>(null);

  const api = useMemo<EditorApi>(() => ({ update, language, setActiveKey }), [update, language]);

  async function saveMeta(meta: { title?: string; language?: Language }) {
    const result = await updateResumeMetaAction(id, meta);
    setMetaError(result.ok ? null : result.error);
    return result.ok;
  }

  return (
    <EditorContext.Provider value={api}>
      <div className="flex h-dvh flex-col">
        <header className="flex flex-wrap items-center gap-2 border-b border-line bg-white px-3 py-2 sm:px-4">
          <Link href="/dashboard" className="btn-ghost px-2.5 py-2" aria-label="Kembali ke daftar CV">
            ←<span className="hidden sm:inline"> CV saya</span>
          </Link>
          <input
            aria-label="Nama CV"
            className="min-w-0 flex-1 rounded-md border border-transparent px-2 py-1.5 font-display text-lg font-bold tracking-tight outline-none hover:border-line focus:border-brand"
            value={title}
            maxLength={120}
            onChange={event => setTitle(event.target.value)}
            onBlur={async () => {
              if (title.trim() && title !== savedTitle && (await saveMeta({ title }))) setSavedTitle(title);
            }}
          />
          <select
            aria-label="Bahasa CV"
            title="Bahasa judul bagian bawaan"
            className="rounded-lg border border-line bg-white px-2 py-2 text-sm font-bold"
            value={language}
            onChange={async event => {
              const next = event.target.value as Language;
              setLanguage(next);
              await saveMeta({ language: next });
            }}
          >
            <option value="id">ID</option>
            <option value="en">EN</option>
          </select>
          <span
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${saveState === "error" ? "bg-[#feecec] text-danger" : "bg-soft text-muted"}`}
            title={saveError ?? undefined}
            aria-live="polite"
          >
            {SAVE_LABEL[saveState]}
            {saveState === "error" && (
              <button type="button" className="underline" onClick={() => flush()}>
                Coba lagi
              </button>
            )}
          </span>
        </header>
        {recovered && (
          <p role="status" className="bg-[#fff6dc] px-4 py-1.5 text-sm text-[#7a5a00]">
            Sebagian data CV ini rusak dan sudah diperbaiki otomatis (teks terlalu panjang dipotong, entri tidak valid dibuang). Periksa isinya sebelum mengedit.
          </p>
        )}
        {metaError && <p role="alert" className="bg-[#feecec] px-4 py-1.5 text-sm text-danger">{metaError}</p>}

        <div className="flex border-b border-line bg-white lg:hidden" role="tablist">
          {(["edit", "preview"] as const).map(tab => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={mobileTab === tab}
              onClick={() => setMobileTab(tab)}
              className={`flex-1 py-2.5 text-sm font-bold ${mobileTab === tab ? "border-b-2 border-brand text-brand-strong" : "text-muted"}`}
            >
              {tab === "edit" ? "Edit" : "Pratinjau"}
            </button>
          ))}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(380px,40%)_minmax(0,1fr)]">
          <aside className={`min-h-0 min-w-0 overflow-y-auto border-line bg-[#fbfcfa] p-4 sm:p-5 lg:block lg:border-r ${mobileTab === "edit" ? "block" : "hidden"}`}>
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-5">
              <section className="rounded-xl border border-line bg-white p-4">
                <h2 className="mb-3 font-display text-base font-bold tracking-tight">Identitas</h2>
                <PersonalEditor personal={content.personal} />
                <h3 className="mb-2 mt-1 text-[13px] font-bold text-[#59635b]">Kontak & media sosial</h3>
                <LinksEditor links={content.links} />
              </section>
              <SortableList
                items={content.sections}
                onMove={(from, to) => update(draft => moveInPlace(draft.sections, from, to))}
                className="grid grid-cols-1 gap-4"
                renderItem={(section, handle, index) => (
                  <SectionEditor section={section} index={index} count={content.sections.length} handle={handle} />
                )}
              />
              <AddSectionMenu count={content.sections.length} />
              <p className="pb-6 text-center text-xs text-muted">
                Tips: seret ikon ⋮⋮ atau pakai tombol ↑ ↓ untuk mengubah urutan. Perubahan tersimpan otomatis.
              </p>
            </div>
          </aside>
          <section className={`min-h-0 bg-canvas lg:block ${mobileTab === "preview" ? "block" : "hidden"}`} aria-label="Pratinjau CV">
            <PreviewPanel resumeId={id} content={content} language={language} activeKey={activeKey} flush={flush} />
          </section>
        </div>
      </div>
    </EditorContext.Provider>
  );
}
