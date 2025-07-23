import { type ReactNode, useState } from "react";

export interface DraggableItem {
  id: string;
  [key: string]: unknown;
}

interface DraggableListProps<T extends DraggableItem> {
  items: T[];
  onReorder?: (
    draggedId: string,
    targetId: string,
    position: "before" | "after",
  ) => void;
  renderItem: (item: T, isDragging: boolean) => ReactNode;
  isDisabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function DraggableList<T extends DraggableItem>({
  items,
  onReorder,
  renderItem,
  isDisabled = false,
  className = "",
  "aria-label": ariaLabel,
}: DraggableListProps<T>) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(
    null,
  );

  const handleDragStart = (e: React.DragEvent, item: T) => {
    if (isDisabled) return;
    setDraggedId(item.id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", item.id);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
    setDropPosition(null);
  };

  const handleDragOver = (e: React.DragEvent, targetItem: T) => {
    if (isDisabled || !draggedId || draggedId === targetItem.id) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position = e.clientY < midpoint ? "before" : "after";

    setDragOverId(targetItem.id);
    setDropPosition(position);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;

    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      setDragOverId(null);
      setDropPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetItem: T) => {
    if (isDisabled || !draggedId || !dropPosition) return;

    e.preventDefault();

    if (draggedId !== targetItem.id && onReorder) {
      onReorder(draggedId, targetItem.id, dropPosition);
    }

    handleDragEnd();
  };

  const handleKeyDown = (e: React.KeyboardEvent, item: T, index: number) => {
    if (isDisabled) return;

    const isFirst = index === 0;
    const isLast = index === items.length - 1;

    switch (e.key) {
      case "ArrowUp":
        if (!isFirst && onReorder) {
          e.preventDefault();
          const targetItem = items[index - 1];
          if (targetItem) {
            onReorder(item.id, targetItem.id, "before");
          }
        }
        break;
      case "ArrowDown":
        if (!isLast && onReorder) {
          e.preventDefault();
          const targetItem = items[index + 1];
          if (targetItem) {
            onReorder(item.id, targetItem.id, "after");
          }
        }
        break;
    }
  };
  return (
    <ul className={className} aria-label={ariaLabel}>
      {items.map((item, index) => {
        const isDragging = draggedId === item.id;
        const isDragOver = dragOverId === item.id;
        const showDropIndicator = isDragOver && dropPosition && !isDragging;

        return (
          <li key={item.id} className="relative list-none">
            {showDropIndicator && dropPosition === "before" && (
              <div className="absolute -top-0.5 right-0 left-0 z-10 h-0.5 bg-blue-500" />
            )}

            {/* biome-ignore lint/a11y/useSemanticElements: Drag and drop requires div element */}
            <div
              draggable={!isDisabled}
              onDragStart={(e) => handleDragStart(e, item)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, item)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, item)}
              onKeyDown={(e) => handleKeyDown(e, item, index)}
              tabIndex={isDisabled ? -1 : 0}
              role="button"
              className={` ${isDragging ? "opacity-60" : ""} ${!isDisabled ? "cursor-move" : ""} focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none `}
              aria-describedby={isDragging ? "dragging-item" : undefined}
            >
              {renderItem(item, isDragging)}
            </div>

            {showDropIndicator && dropPosition === "after" && (
              <div className="absolute right-0 -bottom-0.5 left-0 z-10 h-0.5 bg-blue-500" />
            )}
          </li>
        );
      })}
    </ul>
  );
}
