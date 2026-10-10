"use client";

import { produce, type Draft } from "immer";
import { useCallback, useEffect, useRef, useState } from "react";
import { saveResumeAction } from "@/actions/resume";
import type { ResumeContent } from "@/lib/resume/schema";

export type SaveState = "saved" | "pending" | "saving" | "error";

const SAVE_DELAY_MS = 800;

/** Holds the CV being edited and autosaves it 800 ms after the last change. */
export function useResumeState(id: string, initial: ResumeContent) {
  const [content, setContent] = useState(initial);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [saveError, setSaveError] = useState<string | null>(null);

  const contentRef = useRef(initial);
  const savedRef = useRef(initial);
  const inFlight = useRef<Promise<boolean> | null>(null);
  contentRef.current = content;

  const flush = useCallback(async (): Promise<boolean> => {
    if (inFlight.current) await inFlight.current;
    const snapshot = contentRef.current;
    if (snapshot === savedRef.current) return true;
    setSaveState("saving");
    const run = (async () => {
      try {
        const result = await saveResumeAction(id, snapshot);
        if (!result.ok) throw new Error(result.error);
        savedRef.current = snapshot;
        setSaveError(null);
        return true;
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Gagal menyimpan.");
        setSaveState("error");
        return false;
      }
    })();
    inFlight.current = run;
    const ok = await run;
    inFlight.current = null;
    if (!ok) return false;
    // Changes made while the request was running still need saving.
    if (contentRef.current !== savedRef.current) return flush();
    setSaveState("saved");
    return true;
  }, [id]);

  useEffect(() => {
    if (content === savedRef.current) return;
    setSaveState(state => (state === "saving" ? state : "pending"));
    const timer = setTimeout(flush, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [content, flush]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (contentRef.current !== savedRef.current) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const update = useCallback((recipe: (draft: Draft<ResumeContent>) => void) => {
    setContent(previous => produce(previous, recipe));
  }, []);

  return { content, update, saveState, saveError, flush };
}
