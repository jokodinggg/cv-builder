"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { buildBlocks, type Block } from "@/lib/resume/blocks";
import { paginate, type Pagination } from "@/lib/resume/paginate";
import type { Item, Language, ResumeContent, Section } from "@/lib/resume/schema";
import { CvHeader, CvItem, CvSectionStart } from "./cv-block-view";
import "./cv-sheet.css";

export type CvLayout = "stack" | "spread";

type Props = {
  content: ResumeContent;
  language: Language;
  layout?: CvLayout;
  zoom?: number;
  activeKey?: string | null;
  onPaginate?: (info: { pageCount: number; overflowKeys: string[] }) => void;
};

function useIndex(content: ResumeContent) {
  return useMemo(() => {
    const sections = new Map<string, Section>();
    const items = new Map<string, Item>();
    for (const section of content.sections) {
      sections.set(section.id, section);
      for (const item of section.items) items.set(item.id, item);
    }
    return { sections, items };
  }, [content]);
}

function BlockView({ block, content, language, index }: { block: Block; content: ResumeContent; language: Language; index: ReturnType<typeof useIndex> }) {
  if (block.kind === "header") return <CvHeader content={content} />;
  const section = index.sections.get(block.sectionId!);
  const item = index.items.get(block.itemId!);
  if (!section || !item) return null;
  return block.kind === "section-start" ? (
    <CvSectionStart section={section} item={item} language={language} />
  ) : (
    <CvItem section={section} item={item} />
  );
}

/**
 * Renders the CV as A4 sheets. All blocks render once in an off-screen column to measure them,
 * then `paginate` packs them into pages. The root gets data-ready="true" once fonts are loaded
 * and the pages match the current content; the PDF exporter waits for that flag.
 */
export function PaginatedCv({ content, language, layout = "stack", zoom = 1, activeKey, onPaginate }: Props) {
  const blocks = useMemo(() => buildBlocks(content), [content]);
  const index = useIndex(content);
  const measureRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [result, setResult] = useState<{ blocks: Block[]; pagination: Pagination; fontsReady: boolean } | null>(null);

  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, []);

  useLayoutEffect(() => {
    const measure = measureRef.current;
    const probe = probeRef.current;
    if (!measure || !probe) return;
    const nodes = Array.from(measure.querySelectorAll<HTMLElement>(":scope > .cv-content > .cv-block"));
    const heights = nodes.map(node => node.getBoundingClientRect().height);
    const pagination = paginate(heights, blocks.map(block => block.breakBefore), probe.getBoundingClientRect().height);
    setResult({ blocks, pagination, fontsReady });
  }, [blocks, index, language, fontsReady]);

  const pagination = result?.blocks === blocks ? result.pagination : null;
  // Final means measured with the real web fonts; only then may print/PDF capture the pages.
  const final = pagination !== null && result?.fontsReady === true;

  useEffect(() => {
    if (!pagination || !final) return;
    onPaginate?.({ pageCount: pagination.pages.length, overflowKeys: pagination.overflow.map(i => blocks[i].key) });
  }, [pagination, final, blocks, onPaginate]);

  const renderBlock = (block: Block, extra?: { active?: boolean }) => {
    const section = block.sectionId ? index.sections.get(block.sectionId) : undefined;
    return (
      <div
        key={block.key}
        className={`cv-block${section ? ` cv-${section.type}` : ""}`}
        data-block-key={block.key}
        data-active={extra?.active ? "true" : undefined}
      >
        <BlockView block={block} content={content} language={language} index={index} />
      </div>
    );
  };

  return (
    <div data-ready={final ? "true" : "false"} data-pages={pagination?.pages.length ?? 0}>
      <div ref={measureRef} className="cv-measure cv-sheet" aria-hidden="true">
        <div className="cv-content">{blocks.map(block => renderBlock(block))}</div>
        <div ref={probeRef} className="cv-page-height-probe" />
      </div>
      <div className="cv-pages" data-layout={layout} style={{ zoom }}>
        {(pagination?.pages ?? [blocks.map((_, i) => i)]).map((page, pageIndex) => (
          <div key={pageIndex} className="cv-sheet" data-page={pageIndex + 1}>
            <div className="cv-content">
              {page.map(i => renderBlock(blocks[i], { active: activeKey != null && blocks[i].key.includes(activeKey) }))}
            </div>
            {pagination?.overflow.some(i => page.includes(i)) && <span className="cv-overflow-badge">Isi melebihi 1 halaman</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
