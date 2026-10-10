"use client";

import { newId } from "@/lib/resume/ids";
import { LINK_TYPES } from "@/lib/resume/links";
import { moveInPlace } from "@/lib/move";
import { LINK_TYPE_IDS, MAX_LINKS, type Link, type LinkType } from "@/lib/resume/schema";
import { useEditor } from "./editor-context";
import { DragHandle, RowControls } from "./row-controls";
import { SortableList } from "./sortable-list";

export function LinksEditor({ links }: { links: Link[] }) {
  const { update, setActiveKey } = useEditor();
  const move = (from: number, to: number) => update(draft => moveInPlace(draft.links, from, to));
  const used = new Set(links.map(link => link.type));

  return (
    <div onFocus={() => setActiveKey("header")}>
      <SortableList
        items={links}
        onMove={move}
        className="grid grid-cols-1 gap-2"
        renderItem={(link, handle, index) => (
          <div className={`flex items-center gap-1.5 rounded-lg border border-line bg-soft p-1.5 ${link.visible ? "" : "opacity-60"}`}>
            <DragHandle handle={handle} label={LINK_TYPES[link.type].label} />
            <select
              aria-label="Jenis tautan"
              className="input w-32 shrink-0 px-2 py-2 text-sm"
              value={link.type}
              onChange={event => update(draft => void (draft.links[index].type = event.target.value as LinkType))}
            >
              {LINK_TYPE_IDS.map(type => (
                <option key={type} value={type}>
                  {LINK_TYPES[type].label}
                </option>
              ))}
            </select>
            <input
              aria-label={`Isi ${LINK_TYPES[link.type].label}`}
              className="input min-w-0 flex-1 px-2.5 py-2 text-sm"
              value={link.value}
              maxLength={300}
              placeholder={LINK_TYPES[link.type].placeholder}
              onChange={event => update(draft => void (draft.links[index].value = event.target.value))}
            />
            <RowControls
              index={index}
              count={links.length}
              onMove={to => move(index, to)}
              visible={link.visible}
              onToggleVisible={() => update(draft => void (draft.links[index].visible = !draft.links[index].visible))}
              onRemove={() => update(draft => void draft.links.splice(index, 1))}
              label={LINK_TYPES[link.type].label}
            />
          </div>
        )}
      />
      <button
        type="button"
        disabled={links.length >= MAX_LINKS}
        className="mt-3 text-sm font-bold text-brand hover:underline disabled:opacity-50"
        onClick={() =>
          update(draft => {
            const type = LINK_TYPE_IDS.find(candidate => !used.has(candidate)) ?? "other";
            draft.links.push({ id: newId(), type, value: "", visible: true });
          })
        }
      >
        + Tambah tautan / media sosial
      </button>
    </div>
  );
}
