import {
  Button,
  Keyboard,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
} from "react-aria-components";
import { BiDotsVertical } from "react-icons/bi";
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

export const TasksDisclosure: React.FC<{
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
    <CustomDisclosure
      headingItems={
        <MenuTrigger>
          <Button>
            <BiDotsVertical />
          </Button>
          <Popover>
            <Menu className={"bg-dark-background-sub-c text-white p-3"}>
              <MenuItem>
                <Button>LOL</Button>
                <Keyboard />
              </MenuItem>
              <MenuItem>
                <Button>LOL</Button>
                <Keyboard />
              </MenuItem>
            </Menu>
          </Popover>
        </MenuTrigger>
      }
      defaultExpanded={isIncompleteTasks}
      title={title}
    >
      <DraggableList
        items={tasks}
        onReorder={handleReorder}
        isDisabled={sortOption !== "CUSTOM"}
        renderItem={(item, _isDragging) => (
          <div
            draggable={sortOption === "CUSTOM"}
            className="flex flex-row items-center"
          >
            <MdDragIndicator />
            <TaskComponent task={item} taskListId={listId} />
          </div>
        )}
      />
    </CustomDisclosure>
  );
};
