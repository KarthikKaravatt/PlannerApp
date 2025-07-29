import { MdDragIndicator } from "react-icons/md";
import {
  useMoveCompleteTaskOrderMutation,
  useMoveIncompleteTaskOrderMutation,
} from "@/redux/taskApiSlice.ts";
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
  isIncompleteTasks?: boolean;
  sortOption: SortOption;
}> = ({ title, tasks, listId, isIncompleteTasks = false, sortOption }) => {
  const [moveTaskIncomplete] = useMoveIncompleteTaskOrderMutation();
  const [moveTaskCompelte] = useMoveCompleteTaskOrderMutation();
  const handleReorder = (
    draggedId: string,
    targetId: string,
    position: "before" | "after",
  ) => {
    if (!(sortOption === "CUSTOM")) {
      return;
    }
    if (isIncompleteTasks) {
      moveTaskIncomplete({
        id1: draggedId,
        id2: targetId,
        pos: position === "before" ? "Before" : "After",
        listId: listId,
      }).catch((err: unknown) => {
        if (err instanceof Error) {
          logError("Error moving task", err);
        }
      });
    } else {
      moveTaskCompelte({
        id1: draggedId,
        id2: targetId,
        pos: position === "before" ? "Before" : "After",
        listId: listId,
      }).catch((err: unknown) => {
        if (err instanceof Error) {
          logError("Error moving task", err);
        }
      });
    }
  };
  return (
    <CustomDisclosure defaultExpanded={isIncompleteTasks} title={title}>
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
