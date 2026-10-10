"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useId, type ReactNode } from "react";

export type DragHandleProps = React.HTMLAttributes<HTMLButtonElement>;

type Props<T extends { id: string }> = {
  items: T[];
  onMove: (from: number, to: number) => void;
  renderItem: (item: T, handle: DragHandleProps, index: number) => ReactNode;
  className?: string;
};

function SortableRow({ id, children }: { id: string; children: (handle: DragHandleProps) => ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition, zIndex: isDragging ? 10 : undefined, position: "relative" }}
      className={isDragging ? "opacity-80 shadow-lg" : undefined}
    >
      {children({ ...attributes, ...listeners })}
    </div>
  );
}

export function SortableList<T extends { id: string }>({ items, onMove, renderItem, className }: Props<T>) {
  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = items.findIndex(item => item.id === active.id);
    const to = items.findIndex(item => item.id === over.id);
    if (from >= 0 && to >= 0) onMove(from, to);
  }

  return (
    <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <div className={className}>
          {items.map((item, index) => (
            <SortableRow key={item.id} id={item.id}>
              {handle => renderItem(item, handle, index)}
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
