import { useRef, useState } from "react";
import { Button } from "react-aria-components";
import { CiEdit } from "react-icons/ci";
import { FaCheck, FaRegTrashCan, FaSpinner } from "react-icons/fa6";
import { MdDragIndicator } from "react-icons/md";
import { AutoResizeTextArea } from "@/app/General/AutoResizeTextArea";
import { type DraggableItem, DraggableList } from "@/app/General/DraggableList";
import { SideBar } from "@/app/General/SideBar";
import {
  useAddNewTaskListMutation,
  useGetTaskListOrderQuery,
  useGetTaskListsQuery,
  useMoveTaskListMutation,
  useRemoveTaskListMutation,
  useUpdateTaskListMutation,
} from "@/redux/taskListApiSlice.ts";
import type { TaskList } from "@/schemas/taskList";
import { logError } from "@/util/console";
import { CustomDialog } from "../General/CustomDialog.tsx";
import { CustomTooltip } from "../General/CustomToolTip.tsx";
import { ThemeSwitcher } from "../ThemeSwitcher.tsx";

const INPUT_LIMIT = 25;

export const TaskListSideBar = () => {
  //TODO: add a loading state
  const [addTaskList] = useAddNewTaskListMutation();
  const [newListName, setNewListName] = useState("");
  return (
    <SideBar title="Task Lists" textColor="text-blue-950 dark:text-white">
      <div className="flex h-[calc(100vh-2rem)] flex-col">
        <div className="ml-1 flex flex-row justify-between border-b-1 border-gray-300 p-1 dark:border-white">
          <AutoResizeTextArea
            value={newListName}
            onChange={(event) => {
              // no colons for local storage sort order persistence
              const newValue = event.target.value
                .replace(/\s+/g, " ")
                .replace(/:/g, "");
              setNewListName(
                newValue.length > INPUT_LIMIT
                  ? newValue.slice(0, INPUT_LIMIT)
                  : newValue,
              );
            }}
            placeholder="Add new task list"
            className="m-1 outline-1 outline-transparent"
          />
          <Button
            type="button"
            className="rounded-md bg-blue-200 p-1 text-sm dark:bg-white dark:text-black"
            onClick={() => {
              if (!(newListName === "" || newListName === " ")) {
                addTaskList({ name: newListName })
                  .then(() => {
                    setNewListName("");
                  })
                  .catch((err: unknown) => {
                    if (err instanceof Error) {
                      logError("Error adding task list", err);
                    }
                  });
              }
            }}
          >
            Add
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          <TaskListsOrder />
        </div>
        <div className="flex-shrink-0 p-1">
          <ThemeSwitcher />
        </div>
      </div>
    </SideBar>
  );
};

const TaskListsOrder = () => {
  const {
    data: taskListData,
    isLoading: isTaskListLoading,
    isSuccess: isTaskListQuerySuccess,
    refetch,
  } = useGetTaskListsQuery();
  const {
    data: taskListOrderData,
    isLoading: isTaskListOrderLoading,
    isSuccess: isTaskListOrderQuerySuccess,
  } = useGetTaskListOrderQuery();
  //TODO: Add loading state
  const [moveTaskList] = useMoveTaskListMutation();
  const handleReorder = (
    draggedId: string,
    targetId: string,
    position: "before" | "after",
  ) => {
    moveTaskList({
      moveId: draggedId,
      request: {
        targetId: targetId,
        position: position === "before" ? "Before" : "After",
      },
    }).catch(() => {
      logError("Error changing task list position");
    });
  };
  if (isTaskListLoading || isTaskListOrderLoading) {
    return <FaSpinner className="animate-spin" />;
  }
  //TODO: Make improve error handling
  if (
    !isTaskListQuerySuccess ||
    !isTaskListOrderQuerySuccess ||
    !taskListData ||
    !taskListOrderData
  ) {
    return (
      <div className="flex flex-col items-center justify-center p-2">
        <p>Error loading task list data, press button to retry</p>
        <Button
          className=" rounded-md bg-blue-200 p-1 font-bold "
          onClick={() => {
            refetch().catch(() => {
              logError("Error fetching task list data");
            });
          }}
        >
          Retry
        </Button>
      </div>
    );
  }
  const draggableItems: (DraggableItem & { taskList: TaskList })[] =
    taskListOrderData
      .map((listMetaData) => {
        const list = taskListData[listMetaData.id];
        if (list) {
          return {
            id: list.id,
            taskList: list,
          };
        }
        logError("List and order are out of sync");
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <DraggableList
      className="overflow-auto"
      items={draggableItems}
      onReorder={handleReorder}
      aria-label="Side bar task lists"
      renderItem={(item) => (
        <div className="flex flex-row items-center">
          <div className="flex cursor-move items-center p-1" draggable={true}>
            <MdDragIndicator />
          </div>
          <TaskListItem taskList={item.taskList} />
        </div>
      )}
    />
  );
};

const TaskListItem = ({ taskList }: { taskList: TaskList }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [input, setInput] = useState(taskList.name);
  const [updateTaskList, { isLoading }] = useUpdateTaskListMutation();
  const [removeTaskList] = useRemoveTaskListMutation();
  const listRef = useRef<HTMLDivElement>(null);
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Not static
    <div
      className=" flex w-full flex-row items-center justify-between rounded-md pr-2 pl-2"
      ref={listRef}
      draggable={!isEditing}
      onBlur={(event) => {
        if (listRef.current && !listRef.current.contains(event.relatedTarget)) {
          if (isEditing) {
            if (taskList.name !== input) {
              updateTaskList({
                listId: taskList.id,
                request: { name: input },
              })
                .then(() => {
                  setIsEditing(false);
                })
                .catch((err: unknown) => {
                  setIsEditing(false);
                  setInput(taskList.name);
                  if (err instanceof Error) {
                    logError("Error updating task list", err);
                  }
                });
            } else {
              setIsEditing(false);
            }
          }
        }
      }}
    >
      <AutoResizeTextArea
        className={` ${isEditing ? "caret-gray-400" : "caret-transparent"} outline-1 outline-transparent `}
        readOnly={!isEditing}
        //HACK: This really should show the taskList.name when editing but for
        //some reason that doesn't update properly
        value={input}
        onDoubleClick={() => {
          setIsEditing(true);
        }}
        onChange={(event) => {
          if (isEditing) {
            const filteredInput = event.target.value.replace(/\s+/g, " ");
            if (filteredInput.length < INPUT_LIMIT) {
              setInput(filteredInput);
            }
          }
        }}
      />
      <CustomDialog
        toolTipMessage="Delete task list"
        dialogMessage="The task list and all its tasks will be deleted"
        heading="Delete Task List"
        triggerIcon={FaRegTrashCan}
        onPressAllow={() => removeTaskList(taskList.id)}
      />
      <CustomTooltip message={isEditing ? "Confirm edit" : "Edit task list"}>
        <Button
          isDisabled={isLoading}
          onClick={() => {
            if (isEditing) {
              if (taskList.name !== input) {
                updateTaskList({
                  listId: taskList.id,
                  request: { name: input },
                })
                  .then(() => {
                    setIsEditing(false);
                  })
                  .catch((err: unknown) => {
                    setIsEditing(false);
                    setInput(taskList.name);
                    if (err instanceof Error) {
                      logError("Error updating task list", err);
                    }
                  });
              } else {
                setIsEditing(false);
              }
            } else {
              setIsEditing(true);
            }
          }}
        >
          {isEditing ? <FaCheck className="text-green-700" /> : <CiEdit />}
        </Button>
      </CustomTooltip>
    </div>
  );
};
