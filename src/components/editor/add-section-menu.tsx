"use client";

import { useState } from "react";
import { createSection, defaultSectionTitle } from "@/lib/resume/defaults";
import { MAX_SECTIONS, SECTION_TYPES, type SectionType } from "@/lib/resume/schema";
import { useEditor } from "./editor-context";

export function AddSectionMenu({ count }: { count: number }) {
  const { update, language } = useEditor();
  const [type, setType] = useState<SectionType>("custom");
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-[#c9d3c6] bg-white p-3">
      <span className="text-sm font-bold text-muted">Tambah bagian</span>
      <select aria-label="Jenis bagian" className="input w-auto flex-1 py-2 text-sm" value={type} onChange={event => setType(event.target.value as SectionType)}>
        {SECTION_TYPES.map(option => (
          <option key={option} value={option}>
            {defaultSectionTitle(option, "id")}
            {option === "custom" ? " (bebas: organisasi, sertifikasi, …)" : ""}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="btn-secondary py-2"
        disabled={count >= MAX_SECTIONS}
        onClick={() => update(draft => void draft.sections.push(createSection(type, language)))}
      >
        Tambah
      </button>
    </div>
  );
}
