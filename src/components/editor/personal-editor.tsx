"use client";

import type { ResumeContent } from "@/lib/resume/schema";
import { useEditor } from "./editor-context";

export function PersonalEditor({ personal }: { personal: ResumeContent["personal"] }) {
  const { update, setActiveKey } = useEditor();
  return (
    <div onFocus={() => setActiveKey("header")} className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
      <label className="label">
        Nama lengkap
        <input
          className="input mt-1.5"
          value={personal.fullName}
          maxLength={200}
          onChange={event => update(draft => void (draft.personal.fullName = event.target.value))}
        />
      </label>
      <label className="label">
        Headline <span className="font-medium text-muted">(opsional)</span>
        <input
          className="input mt-1.5"
          value={personal.headline}
          maxLength={300}
          placeholder="Contoh: AI Engineer · Jakarta"
          onChange={event => update(draft => void (draft.personal.headline = event.target.value))}
        />
      </label>
    </div>
  );
}
