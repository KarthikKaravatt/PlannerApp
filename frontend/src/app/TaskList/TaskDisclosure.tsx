import { MdDragIndicator } from "react-icons/md";
import { useMoveTaskOrderMutation } from "@/redux/taskApiSlice.ts";
import type { Task } from "@/schemas/task";
import type { SortOption } from "@/types/taskList.ts";
import { logError } from "@/util/console.ts";
import { CustomDisclosure } from "../General/Disclosure.tsx";
import { DraggableList } from "../General/DraggableList.tsx";
import { TaskComponent } from "./TaskComponent.tsx";

export const TaskDisclosure: React.FC<{
  title: string;
  listId: string;
  tasks: Task[];
  defaultOpen?: boolean;
  sortOption: SortOption;
}> = ({ title, tasks, listId, defaultOpen = false, sortOption }) => {
  const [moveTask] = useMoveTaskOrderMutation();
  const handleReorder = (
    draggedId: string,
    targetId: string,
    position: "before" | "after",
  ) => {
    if (!(sortOption === "CUSTOM")) {
      return;
    }
    moveTask({
      id1: draggedId,
      id2: targetId,
      pos: position === "before" ? "Before" : "After",
      listId: listId,
    }).catch((err: unknown) => {
      if (err instanceof Error) {
        logError("Error moving task", err);
      }
    });
  };
  return (
    <CustomDisclosure defaultExpanded={defaultOpen} title={title}>
      <DraggableList
        items={tasks}
        onReorder={handleReorder}
        isDisabled={sortOption !== "CUSTOM"}
        renderItem={(item, _isDragging) => (
          <div className="flex flex-row items-center">
            <MdDragIndicator />
            <TaskComponent task={item} taskListId={listId} />
          </div>
        )}
      />
    </CustomDisclosure>
  );
};
