"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PaginatedCv, type CvLayout } from "@/components/cv/paginated-cv";
import { TranslateButton } from "@/components/dashboard/translate-button";
import type { Language, ResumeContent } from "@/lib/resume/schema";

const A4_WIDTH_PX = (210 / 25.4) * 96;
const PAGE_GAP_PX = (8 / 25.4) * 96;
const MIN_SPREAD_ZOOM = 0.4;
const ZOOM_OPTIONS = [0.5, 0.75, 1, 1.25];

type Props = {
  resumeId: string;
  content: ResumeContent;
  language: Language;
  activeKey: string | null;
  flush: () => Promise<boolean>;
};

function fileNameFrom(header: string | null): string {
  const encoded = header?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) return decodeURIComponent(encoded);
  return header?.match(/filename="([^"]+)"/i)?.[1] ?? "CV.pdf";
}

export function PreviewPanel({ resumeId, content, language, activeKey, flush }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [layout, setLayout] = useState<CvLayout>("spread");
  const [zoomChoice, setZoomChoice] = useState<"fit" | number>("fit");
  const [info, setInfo] = useState({ pageCount: 1, overflowKeys: [] as string[] });
  const [busy, setBusy] = useState<"pdf" | "print" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const available = Math.max(0, width - 32);
  // Two sheets side by side only when both stay readable; otherwise fall back to one column.
  const sideBySide = layout === "spread" && info.pageCount > 1 && available / (A4_WIDTH_PX * 2 + PAGE_GAP_PX) >= MIN_SPREAD_ZOOM;
  const needed = sideBySide ? A4_WIDTH_PX * 2 + PAGE_GAP_PX : A4_WIDTH_PX;
  const fitZoom = width ? Math.min(1.25, Math.max(0.3, available / needed)) : 0.6;
  const zoom = zoomChoice === "fit" ? fitZoom : zoomChoice;

  useEffect(() => {
    if (!activeKey) return;
    const target = containerRef.current?.querySelector(`.cv-pages [data-block-key*="${CSS.escape(activeKey)}"]`);
    target?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeKey]);

  const onPaginate = useCallback((next: { pageCount: number; overflowKeys: string[] }) => setInfo(next), []);

  async function downloadPdf() {
    setBusy("pdf");
    setError(null);
    try {
      if (!(await flush())) throw new Error("Perubahan belum tersimpan. Coba lagi.");
      const response = await fetch(`/api/cv/${resumeId}/pdf`);
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Gagal membuat PDF.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileNameFrom(response.headers.get("content-disposition"));
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (caught) {
      setError(`${caught instanceof Error ? caught.message : "Gagal membuat PDF."} Anda bisa memakai “Cetak via browser”.`);
    } finally {
      setBusy(null);
    }
  }

  async function printInBrowser() {
    setBusy("print");
    await flush();
    setBusy(null);
    window.open(`/cv/${resumeId}/print?autoprint=1`, "_blank", "noopener");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-white/80 px-4 py-2.5 backdrop-blur">
        <span className="mr-auto text-sm font-bold text-muted">
          <span className="mr-2 inline-block size-2.5 rounded-full bg-[#67b531]" />
          {info.pageCount} halaman
          {info.overflowKeys.length > 0 && <span className="ml-2 text-danger">· ada isi yang terpotong</span>}
        </span>
        <div className="flex rounded-lg border border-line bg-white p-0.5 text-xs font-bold" role="group" aria-label="Tata letak pratinjau">
          {(["stack", "spread"] as const).map(option => (
            <button
              key={option}
              type="button"
              aria-pressed={layout === option}
              onClick={() => setLayout(option)}
              className={`rounded-md px-2.5 py-1.5 ${layout === option ? "bg-brand-soft text-brand-strong" : "text-muted"}`}
            >
              {option === "stack" ? "1 kolom" : "Berdampingan"}
            </button>
          ))}
        </div>
        <select
          aria-label="Perbesaran"
          className="rounded-lg border border-line bg-white px-2 py-1.5 text-xs font-bold"
          value={String(zoomChoice)}
          onChange={event => setZoomChoice(event.target.value === "fit" ? "fit" : Number(event.target.value))}
        >
          <option value="fit">Pas layar ({Math.round(fitZoom * 100)}%)</option>
          {ZOOM_OPTIONS.map(option => (
            <option key={option} value={option}>
              {option * 100}%
            </option>
          ))}
        </select>
        <TranslateButton resumeId={resumeId} language={language} beforeRun={flush} className="btn-secondary py-2 text-xs" />
        <button type="button" className="btn-secondary py-2 text-xs" disabled={busy !== null} onClick={printInBrowser}>
          Cetak via browser
        </button>
        <button type="button" className="btn-primary py-2 text-xs" disabled={busy !== null} onClick={downloadPdf}>
          {busy === "pdf" ? "Membuat PDF…" : "Download PDF"}
        </button>
      </div>
      {error && (
        <p role="alert" className="flex items-start justify-between gap-3 bg-[#feecec] px-4 py-2 text-sm text-danger">
          {error}
          <button type="button" onClick={() => setError(null)} aria-label="Tutup pesan" className="font-bold">
            ×
          </button>
        </p>
      )}
      <div ref={containerRef} className="flex-1 overflow-auto overscroll-contain p-4 sm:p-6">
        <PaginatedCv content={content} language={language} layout={sideBySide ? "spread" : "stack"} zoom={zoom} activeKey={activeKey} onPaginate={onPaginate} />
      </div>
    </div>
  );
}
