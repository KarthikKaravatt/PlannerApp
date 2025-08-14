import React, { lazy, Suspense, useCallback } from "react";
import { SubmenuTrigger } from "react-aria-components";
import { BiDotsVertical } from "react-icons/bi";
import { FaSpinner } from "react-icons/fa6";
import { MdDragIndicator } from "react-icons/md";
import {
  useMoveCompleteTaskOrderMutation,
  useMoveIncompleteTaskOrderMutation,
} from "@/redux/taskApiSlice.ts";
import type { Task } from "@/schemas/task";
import type { SortOption } from "@/types/taskList.ts";
import { logError } from "@/util/console.ts";
import { CustomDisclosure } from "../General/CustomDisclosure.tsx";
import {
  CustomMenu,
  CustomMenuButton,
  CustomMenuItem,
  CustomMenuPopOver,
} from "../General/CustomMenu.tsx";
import { DraggableList } from "../General/DraggableList.tsx";

const TaskComponent = lazy(() =>
  import("@/app/TaskList/TaskComponent").then((module) => ({
    default: module.TaskComponent,
  })),
);

export const TasksDisclosure: React.FC<{
  title: string;
  listId: string;
  tasks: Task[];
  isIncompleteTasks?: boolean;
  sortOption: SortOption;
  setSortOption: React.Dispatch<React.SetStateAction<SortOption>>;
}> = ({
  title,
  tasks,
  listId,
  isIncompleteTasks = false,
  sortOption,
  setSortOption,
}) => {
  const [moveTaskIncomplete] = useMoveIncompleteTaskOrderMutation();
  const [moveTaskCompelte] = useMoveCompleteTaskOrderMutation();
  const handleReorder = useCallback(
    (draggedId: string, targetId: string, position: "before" | "after") => {
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
    },
    [
      isIncompleteTasks,
      sortOption,
      moveTaskIncomplete,
      moveTaskCompelte,
      listId,
    ],
  );
  const renderItem = useCallback(
    (item: Task, _isDragging: boolean) => {
      return (
        <div className="flex flex-row items-center">
          <DragIconMemo draggable={sortOption === "CUSTOM"} />
          <Suspense fallback={<FaSpinner className="animate-spin" />}>
            <TaskComponent task={item} taskListId={listId} />
          </Suspense>
        </div>
      );
    },
    [listId, sortOption],
  );
  return (
    <CustomDisclosure
      headingItems={
        <CustomMenuButton
          icon={BiDotsVertical}
          hoverMessage="Task list options"
        >
          <SubmenuTrigger>
            <CustomMenuItem>SortOption</CustomMenuItem>
            <CustomMenuPopOver>
              <CustomMenu
                selectionMode="single"
                selectedKeys={[sortOption.toString().toLowerCase()]}
              >
                <CustomMenuItem
                  id={"custom"}
                  onAction={() =>
                    handleSortOptionChange(
                      listId,
                      isIncompleteTasks,
                      "CUSTOM",
                      setSortOption,
                    )
                  }
                >
                  Custom
                </CustomMenuItem>
                <CustomMenuItem
                  id={"name"}
                  onAction={() =>
                    handleSortOptionChange(
                      listId,
                      isIncompleteTasks,
                      "NAME",
                      setSortOption,
                    )
                  }
                >
                  Name
                </CustomMenuItem>
                <CustomMenuItem
                  id={"date"}
                  onAction={() =>
                    handleSortOptionChange(
                      listId,
                      isIncompleteTasks,
                      "DATE",
                      setSortOption,
                    )
                  }
                >
                  Date
                </CustomMenuItem>
              </CustomMenu>
            </CustomMenuPopOver>
          </SubmenuTrigger>
        </CustomMenuButton>
      }
      defaultExpanded={isIncompleteTasks}
      title={title}
    >
      <DraggableList
        items={tasks}
        onReorder={handleReorder}
        isDisabled={sortOption !== "CUSTOM"}
        renderItem={renderItem}
      />
    </CustomDisclosure>
  );
};
const DragIconMemo = React.memo(({ draggable }: { draggable: boolean }) => (
  <div draggable={draggable}>
    <MdDragIndicator />
  </div>
));

function handleSortOptionChange(
  listId: string,
  isIncompleteTasks: boolean,
  sortOption: SortOption,
  setSortOption: React.Dispatch<React.SetStateAction<SortOption>>,
) {
  setSortOption(sortOption);
  if (isIncompleteTasks) {
    localStorage.setItem(
      `Incompleted:${listId}:SORT_OPTION`,
      sortOption.toString(),
    );
  } else {
    localStorage.setItem(
      `Completed:${listId}:SORT_OPTION`,
      sortOption.toString(),
    );
  }
}
