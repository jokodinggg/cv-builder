"use client";

import { useState } from "react";
import { createItem, defaultSectionTitle } from "@/lib/resume/defaults";
import { moveInPlace } from "@/lib/move";
import { MAX_ITEMS, type Section } from "@/lib/resume/schema";
import { useEditor } from "./editor-context";
import { ItemEditor } from "./item-editor";
import { DragHandle, RowControls } from "./row-controls";
import { SortableList, type DragHandleProps } from "./sortable-list";

const ADD_LABEL: Record<Section["type"], string> = {
  summary: "+ Tambah paragraf",
  education: "+ Tambah pendidikan",
  skills: "+ Tambah kategori keterampilan",
  experience: "+ Tambah pengalaman",
  projects: "+ Tambah proyek",
  achievements: "+ Tambah prestasi",
  custom: "+ Tambah entri",
};

type Props = { section: Section; index: number; count: number; handle: DragHandleProps };

export function SectionEditor({ section, index, count, handle }: Props) {
  const { update, language, setActiveKey } = useEditor();
  const [open, setOpen] = useState(true);
  const fallbackTitle = defaultSectionTitle(section.type, language);
  const label = section.title || fallbackTitle;

  return (
    <section className={`rounded-xl border border-line bg-white ${section.visible ? "" : "opacity-70"}`}>
      <div className="flex items-center gap-1 border-b border-line p-2" onFocus={() => setActiveKey(section.id)}>
        <DragHandle handle={handle} label={label} />
        <button
          type="button"
          onClick={() => setOpen(value => !value)}
          aria-expanded={open}
          aria-label={open ? `Tutup ${label}` : `Buka ${label}`}
          className="grid size-7 place-items-center rounded-md text-xs text-muted hover:bg-soft"
        >
          <span className={`transition ${open ? "rotate-90" : ""}`}>▶</span>
        </button>
        <input
          aria-label="Judul bagian"
          className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 font-display text-base font-bold tracking-tight outline-none placeholder:text-ink hover:border-line focus:border-brand"
          value={section.title}
          placeholder={fallbackTitle}
          maxLength={120}
          onChange={event => update(draft => void (draft.sections[index].title = event.target.value))}
        />
        <RowControls
          index={index}
          count={count}
          onMove={to => update(draft => moveInPlace(draft.sections, index, to))}
          visible={section.visible}
          onToggleVisible={() => update(draft => void (draft.sections[index].visible = !draft.sections[index].visible))}
          onRemove={() => {
            if (window.confirm(`Hapus bagian “${label}” beserta isinya?`)) update(draft => void draft.sections.splice(index, 1));
          }}
          label={`bagian ${label}`}
        />
      </div>
      {open && (
        <div className="p-3">
          <label className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-muted">
            <input
              type="checkbox"
              className="size-4 accent-[var(--color-brand)]"
              checked={section.pageBreakBefore}
              onChange={event => update(draft => void (draft.sections[index].pageBreakBefore = event.target.checked))}
            />
            Mulai bagian ini di halaman baru
          </label>
          <SortableList
            items={section.items}
            onMove={(from, to) => update(draft => moveInPlace(draft.sections[index].items, from, to))}
            className="grid grid-cols-1 gap-2"
            renderItem={(item, itemHandle, itemIndex) => (
              <ItemEditor section={section} sectionIndex={index} item={item} index={itemIndex} handle={itemHandle} />
            )}
          />
          <button
            type="button"
            disabled={section.items.length >= MAX_ITEMS}
            className="mt-3 text-sm font-bold text-brand hover:underline disabled:opacity-50"
            onClick={() => update(draft => void draft.sections[index].items.push(createItem(section.type, language)))}
          >
            {ADD_LABEL[section.type]}
          </button>
        </div>
      )}
    </section>
  );
}
