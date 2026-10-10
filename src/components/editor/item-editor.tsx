"use client";

import { useState } from "react";
import { FIELD_CONFIG } from "@/lib/resume/defaults";
import { newId } from "@/lib/resume/ids";
import { moveInPlace } from "@/lib/move";
import type { Item, Section } from "@/lib/resume/schema";
import { useEditor } from "./editor-context";
import { DragHandle, RowControls } from "./row-controls";
import type { DragHandleProps } from "./sortable-list";

type Field = "title" | "subtitle" | "date" | "detail" | "bullets";
const FIELD_ORDER: Field[] = ["title", "date", "subtitle", "detail", "bullets"];

const rowsFor = (value: string, min: number) => Math.min(12, Math.max(min, value.split("\n").length + 1));

type Props = { section: Section; sectionIndex: number; item: Item; index: number; handle: DragHandleProps };

export function ItemEditor({ section, sectionIndex, item, index, handle }: Props) {
  const { update, setActiveKey } = useEditor();
  const fields = FIELD_CONFIG[section.type];
  const collapsible = "bullets" in fields;
  const [open, setOpen] = useState(!collapsible);

  const setField = (field: Field, value: string) =>
    update(draft => void (draft.sections[sectionIndex].items[index][field] = value));
  const items = (draft: Parameters<Parameters<typeof update>[0]>[0]) => draft.sections[sectionIndex].items;
  const label = item.title || "item";

  return (
    <div
      onFocus={() => setActiveKey(item.id)}
      className={`rounded-lg border border-line bg-soft ${item.visible ? "" : "opacity-60"}`}
    >
      <div className="flex items-center gap-1 p-1.5">
        <DragHandle handle={handle} label={label} />
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen(value => !value)}
            aria-expanded={open}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-white"
          >
            <span className={`text-xs text-muted transition ${open ? "rotate-90" : ""}`}>▶</span>
            <span className="truncate font-bold">{item.title || "(tanpa judul)"}</span>
            {item.date && <span className="hidden shrink-0 text-xs text-muted sm:inline">{item.date}</span>}
          </button>
        ) : (
          <span className="flex-1" />
        )}
        <RowControls
          index={index}
          count={section.items.length}
          onMove={to => update(draft => moveInPlace(items(draft), index, to))}
          visible={item.visible}
          onToggleVisible={() => update(draft => void (items(draft)[index].visible = !items(draft)[index].visible))}
          onDuplicate={() => update(draft => void items(draft).splice(index + 1, 0, { ...items(draft)[index], id: newId() }))}
          onRemove={() => update(draft => void items(draft).splice(index, 1))}
          label={label}
        />
      </div>
      {open && (
        <div className="grid grid-cols-1 gap-x-3 px-3 pb-1 sm:grid-cols-2">
          {FIELD_ORDER.filter(field => fields[field]).map(field => {
            const wide = field === "bullets" || field === "detail" || (field === "title" && !fields.date);
            const multiline = field === "bullets" || (field === "detail" && (section.type === "summary" || section.type === "skills"));
            return (
              <label key={field} className={`label ${wide ? "sm:col-span-2" : ""}`}>
                {fields[field]}
                {multiline ? (
                  <textarea
                    className="input mt-1.5 resize-y"
                    rows={rowsFor(item[field], field === "bullets" ? 3 : 2)}
                    value={item[field]}
                    onChange={event => setField(field, event.target.value)}
                  />
                ) : (
                  <input className="input mt-1.5" value={item[field]} onChange={event => setField(field, event.target.value)} />
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
