"use client";

import { produce, type Draft } from "immer";
import { useCallback, useEffect, useRef, useState } from "react";
import { saveResumeAction } from "@/actions/resume";
import { createSerialSaver } from "@/lib/serial-saver";
import type { ResumeContent } from "@/lib/resume/schema";

export type SaveState = "saved" | "pending" | "saving" | "error";

const SAVE_DELAY_MS = 800;

/** Holds the CV being edited and autosaves it 800 ms after the last change, one request at a time. */
export function useResumeState(id: string, initial: ResumeContent) {
  const [content, setContent] = useState(initial);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [saveError, setSaveError] = useState<string | null>(null);
  const contentRef = useRef(initial);
  contentRef.current = content;

  const [saver] = useState(() =>
    createSerialSaver<ResumeContent>({
      initial,
      read: () => contentRef.current,
      save: async snapshot => {
        setSaveState("saving");
        try {
          const result = await saveResumeAction(id, snapshot);
          if (!result.ok) throw new Error(result.error);
          setSaveError(null);
          return true;
        } catch (error) {
          setSaveError(error instanceof Error ? error.message : "Gagal menyimpan.");
          return false;
        }
      },
    }),
  );

  const flush = useCallback(async (): Promise<boolean> => {
    const ok = await saver.flush();
    setSaveState(!ok ? "error" : saver.isDirty() ? "pending" : "saved");
    return ok;
  }, [saver]);

  useEffect(() => {
    if (!saver.isDirty()) return;
    setSaveState(state => (state === "saving" ? state : "pending"));
    const timer = setTimeout(flush, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [content, flush, saver]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (saver.isDirty()) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saver]);

  const update = useCallback((recipe: (draft: Draft<ResumeContent>) => void) => {
    setContent(previous => produce(previous, recipe));
  }, []);

  return { content, update, saveState, saveError, flush };
}
