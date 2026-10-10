"use client";

import type { DragHandleProps } from "./sortable-list";

const iconButton =
  "grid size-7 shrink-0 place-items-center rounded-md text-muted transition hover:bg-white hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent";

export function DragHandle({ handle, label }: { handle: DragHandleProps; label: string }) {
  return (
    <button type="button" {...handle} aria-label={`Seret untuk mengurutkan ${label}`} className={`${iconButton} cursor-grab touch-none active:cursor-grabbing`}>
      <svg viewBox="0 0 20 20" className="size-4 fill-current" aria-hidden="true">
        <circle cx="7" cy="5" r="1.5" />
        <circle cx="13" cy="5" r="1.5" />
        <circle cx="7" cy="10" r="1.5" />
        <circle cx="13" cy="10" r="1.5" />
        <circle cx="7" cy="15" r="1.5" />
        <circle cx="13" cy="15" r="1.5" />
      </svg>
    </button>
  );
}

type RowControlsProps = {
  index: number;
  count: number;
  onMove: (to: number) => void;
  visible?: boolean;
  onToggleVisible?: () => void;
  onDuplicate?: () => void;
  onRemove: () => void;
  label: string;
};

export function RowControls({ index, count, onMove, visible, onToggleVisible, onDuplicate, onRemove, label }: RowControlsProps) {
  return (
    <div className="flex items-center">
      <button type="button" className={iconButton} disabled={index === 0} onClick={() => onMove(index - 1)} aria-label={`Naikkan ${label}`} title="Naikkan">
        ↑
      </button>
      <button type="button" className={iconButton} disabled={index === count - 1} onClick={() => onMove(index + 1)} aria-label={`Turunkan ${label}`} title="Turunkan">
        ↓
      </button>
      {onToggleVisible && (
        <button
          type="button"
          className={iconButton}
          onClick={onToggleVisible}
          aria-pressed={!visible}
          aria-label={visible ? `Sembunyikan ${label}` : `Tampilkan ${label}`}
          title={visible ? "Sembunyikan dari CV" : "Tampilkan di CV"}
        >
          {visible ? (
            <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
              <path d="M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7zm0 11.5a4.5 4.5 0 110-9 4.5 4.5 0 010 9zm0-2.5a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
              <path d="M3.3 2.3L2 3.6l3.2 3.2C3.5 8.2 2.5 10 2 12c1 2.5 5 7 10 7 1.7 0 3.3-.5 4.6-1.3l3.8 3.8 1.3-1.3L3.3 2.3zM12 16.5A4.5 4.5 0 017.5 12c0-.8.2-1.5.5-2.1l1.6 1.6a2.5 2.5 0 002.9 2.9l1.6 1.6c-.6.3-1.3.5-2.1.5zM12 5c5 0 9 4.5 10 7-.5 1.3-1.6 2.9-3.1 4.3l-2.6-2.6c.1-.6.2-1.1.2-1.7A4.5 4.5 0 0012 7.5c-.6 0-1.1.1-1.7.2L8.2 5.6C9.4 5.2 10.7 5 12 5z" />
            </svg>
          )}
        </button>
      )}
      {onDuplicate && (
        <button type="button" className={iconButton} onClick={onDuplicate} aria-label={`Duplikat ${label}`} title="Duplikat">
          <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
            <path d="M16 1H4a2 2 0 00-2 2v14h2V3h12V1zm3 4H8a2 2 0 00-2 2v14a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2zm0 16H8V7h11v14z" />
          </svg>
        </button>
      )}
      <button type="button" className={`${iconButton} hover:!text-danger`} onClick={onRemove} aria-label={`Hapus ${label}`} title="Hapus">
        ×
      </button>
    </div>
  );
}
