"use client";

import { useCallback, useRef } from "react";
import { PaginatedCv } from "@/components/cv/paginated-cv";
import type { Language, ResumeContent } from "@/lib/resume/schema";

export function PrintView({ content, language, autoPrint }: { content: ResumeContent; language: Language; autoPrint: boolean }) {
  const printed = useRef(false);
  const onPaginate = useCallback(() => {
    if (!autoPrint || printed.current) return;
    printed.current = true;
    // Let the browser paint the final pages before opening the print dialog.
    requestAnimationFrame(() => setTimeout(() => window.print(), 50));
  }, [autoPrint]);

  return (
    <main className="cv-print">
      <PaginatedCv content={content} language={language} onPaginate={onPaginate} />
    </main>
  );
}
