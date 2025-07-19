import { Fragment, useRef, useState } from "react";
import {
  Button,
  GridList,
  GridListItem,
  useDragAndDrop,
} from "react-aria-components";
import { BsThreeDots } from "react-icons/bs";
import { CiEdit } from "react-icons/ci";
import { FaCheck, FaSpinner } from "react-icons/fa6";
import { MdDragIndicator } from "react-icons/md";
import { AutoResizeTextArea } from "@/app/General/AutoResizeTextArea";
import { SideBar } from "@/app/General/SideBar";
import { useTaskListEditing } from "@/hooks/taslkList/useTaskListEditing";
import {
  useAddNewTaskListMutation,
  useGetTaskListOrderQuery,
  useGetTaskListsQuery,
  useMoveTaskListMutation,
  useUpdateTaskListMutation,
} from "@/redux/apiSlice";
import type { TaskList } from "@/schemas/taskList";
import { logError } from "@/util/console";
import { stopSpaceOnInput } from "@/util/hacks";

const INPUT_LIMIT = 25;

export const TaskListSideBar: React.FC = () => {
  //TODO: add a loading state
  const [addTaskList] = useAddNewTaskListMutation();
  const [newListName, setNewListName] = useState("");
  return (
    <SideBar title="Task Lists">
      <div
        className="
            flex flex-row ml-1 justify-between
            border-1 border-gray-300 dark:border-white
            rounded-md
          "
      >
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
          className={"text-sm bg-blue-200 rounded-md p-1"}
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
      <TaskListsOrder />
    </SideBar>
  );
};

const TaskListsOrder: React.FC = () => {
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
  const { editingId } = useTaskListEditing(null);
  //TODO: Add loading state
  const [moveTaskList] = useMoveTaskListMutation();
  const { dragAndDropHooks } = useDragAndDrop({
    isDisabled: editingId !== null,
    getItems: (keys) =>
      [...keys].map((key) => {
        return { "text/plain": key.toString() };
      }),
    onReorder: (e) => {
      if (e.target.dropPosition === "before") {
        moveTaskList({
          moveId: Array.from(e.keys)[0].toString(),
          request: {
            targetId: e.target.key.toString(),
            position: "Before",
          },
        }).catch(() => {
          logError("Error chaning task list position");
        });
      } else if (e.target.dropPosition === "after") {
        moveTaskList({
          moveId: Array.from(e.keys)[0].toString(),
          request: {
            targetId: e.target.key.toString(),
            position: "After",
          },
        }).catch(() => {
          logError("Error chaning task list position");
        });
      }
    },
  });
  if (isTaskListLoading || isTaskListOrderLoading) {
    return <FaSpinner />;
  }
  //TODO: Make improve error handling
  if (!isTaskListQuerySuccess || !isTaskListOrderQuerySuccess) {
    return (
      <div className="flex flex-col justify-center items-center p-2">
        <p>Error loading task list data, press button to retry</p>
        <Button
          className="
            bg-blue-200 font-bold
            p-1 rounded-md
          "
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
  return (
    <>
      {/* HACK: Bug in react aria see stopSpaceOnInput for more details */}
      <div onKeyDownCapture={stopSpaceOnInput}>
        <GridList
          keyboardNavigationBehavior="tab"
          aria-label="Side bar task lists"
          items={taskListOrderData}
          dragAndDropHooks={dragAndDropHooks}
          selectionMode="single"
        >
          {(listMetaData) => {
            const list = taskListData[listMetaData.id];
            if (list) {
              return (
                <GridListItem textValue={list.name} key={list.id}>
                  <div className="flex flex-row">
                    <Button slot="drag" aria-label="Drag item">
                      <MdDragIndicator />
                    </Button>
                    <TaskListItem taskList={list} />
                  </div>
                </GridListItem>
              );
            } else {
              logError("List and order are out of sync");
              return <Fragment key={listMetaData.id} />;
            }
          }}
        </GridList>
      </div>
    </>
  );
};

interface TaskListItemProps {
  taskList: TaskList;
}
const TaskListItem: React.FC<TaskListItemProps> = ({ taskList }) => {
  const { isEditing, canEdit, setEditing } = useTaskListEditing(taskList.id);
  const [input, setInput] = useState(taskList.name);
  const [updateTaskList, { isLoading }] = useUpdateTaskListMutation();
  const listRef = useRef<HTMLDivElement>(null);
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Not static
    <div
      className="
        w-full flex flex-row pl-2 pr-2
        border-gray-300 border-1 rounded-md
        items-center
        justify-between
      "
      ref={listRef}
      onBlur={(event) => {
        if (listRef.current && !listRef.current.contains(event.relatedTarget)) {
          if (isEditing) {
            if (taskList.name !== input) {
              updateTaskList({
                listID: taskList.id,
                request: { name: input },
              })
                .unwrap()
                .then(() => {
                  setEditing(null);
                })
                .catch((err: unknown) => {
                  setEditing(null);
                  setInput(taskList.name);
                  if (err instanceof Error) {
                    logError("Error updating task list", err);
                  }
                });
            } else {
              setEditing(null);
            }
          }
        }
      }}
    >
      <AutoResizeTextArea
        className={`
          ${isEditing ? "caret-gray-400" : "caret-transparent"}
          outline-1
          outline-transparent
        `}
        readOnly={!isEditing}
        //HACK: This really should show the taskList.name when editing but for
        //some reason that doesn't update properly
        value={input}
        onDoubleClick={() => {
          if (canEdit) {
            setEditing(taskList.id);
          }
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
      <Button
        //TODO: Implement popover
        className={isEditing ? "opacity-0" : ""}
        isDisabled={isLoading || !isEditing}
      >
        <BsThreeDots />
      </Button>
      <Button
        isDisabled={isLoading}
        onClick={() => {
          if (isEditing) {
            if (taskList.name !== input) {
              updateTaskList({
                listID: taskList.id,
                request: { name: input },
              })
                .unwrap()
                .then(() => {
                  setEditing(null);
                })
                .catch((err: unknown) => {
                  setEditing(null);
                  setInput(taskList.name);
                  if (err instanceof Error) {
                    logError("Error updating task list", err);
                  }
                });
            } else {
              setEditing(null);
            }
          } else if (canEdit) {
            setEditing(taskList.id);
          }
        }}
      >
        {isEditing ? <FaCheck className="text-green-700" /> : <CiEdit />}
      </Button>
    </div>
  );
};
