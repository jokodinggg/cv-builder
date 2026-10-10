"use client";

import type { Draft } from "immer";
import { createContext, useContext } from "react";
import type { Language, ResumeContent } from "@/lib/resume/schema";

export type EditorApi = {
  update: (recipe: (draft: Draft<ResumeContent>) => void) => void;
  language: Language;
  setActiveKey: (key: string | null) => void;
};

export const EditorContext = createContext<EditorApi | null>(null);

export function useEditor(): EditorApi {
  const api = useContext(EditorContext);
  if (!api) throw new Error("useEditor must be used inside EditorContext");
  return api;
}
