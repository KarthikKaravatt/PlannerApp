import { Fragment, useReducer, useState } from "react";
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
import {
  useAddNewTaskListMutation,
  useGetTaskListOrderQuery,
  useGetTaskListQuery,
  useUpdateTaskListMutation,
} from "@/redux/api/apiSlice";
import type { TaskList } from "@/schemas/taskList";
import { taskListReducer } from "@/types/taskListReducer";
import { logError } from "@/util/console";
import { stopSpaceOnInput } from "@/util/hacks";
export const TaskListSideBar: React.FC = () => {
  //TODO: add a loading state
  const [addTaskList] = useAddNewTaskListMutation();
  const [newListName, setNewListName] = useState("");
  return (
    <>
      <SideBar>
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
              const newValue = event.target.value.replace(/\s+/g, " ");
              setNewListName(
                newValue.length > 25 ? newValue.slice(0, 25) : newValue,
              );
            }}
            placeholder="Add new task list"
            className="p-1 outline-none"
          />
          <Button
            type="button"
            className={"text-sm bg-blue-200 rounded-md p-1"}
            onClick={() => {
              addTaskList({ name: newListName })
                .then(() => {
                  setNewListName("");
                })
                .catch((err: unknown) => {
                  if (err instanceof Error) {
                    logError("Error adding task list", err);
                  }
                });
            }}
          >
            Add
          </Button>
        </div>
        <TaskListsOrder />
      </SideBar>
    </>
  );
};

const TaskListsOrder: React.FC = () => {
  const {
    data: taskListData,
    isLoading: isTaskListLoading,
    isSuccess: isTaskListQuerySuccess,
    refetch,
  } = useGetTaskListQuery();
  const [currEditing, setCurEditing] = useState<string>("");
  const {
    data: taskListOrderData,
    isLoading: isTaskListOrderLoading,
    isSuccess: isTaskListOrderQuerySuccess,
  } = useGetTaskListOrderQuery();
  const { dragAndDropHooks } = useDragAndDrop({
    isDisabled: currEditing !== "",
    getItems: (keys) =>
      [...keys].map((key) => {
        return { "text/plain": key.toString() };
      }),
  });
  if (isTaskListLoading || isTaskListOrderLoading) {
    return (
      <>
        <FaSpinner />
      </>
    );
  }
  //TODO: Make improve error handling
  if (!isTaskListQuerySuccess || !isTaskListOrderQuerySuccess) {
    return (
      <>
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
      </>
    );
  }
  return (
    <>
      {/* HACK: Bug in react aria see stopSpaceOnInput for more details */}
      <div onKeyDownCapture={stopSpaceOnInput}>
        <GridList
          aria-label="Side bar task lists"
          dragAndDropHooks={dragAndDropHooks}
        >
          {taskListOrderData.map((listOrder) => {
            const list = taskListData.find((l) => l.id === listOrder.id);
            if (list) {
              return (
                <GridListItem textValue={list.name} key={list.id}>
                  <div className="flex flex-row">
                    <Button slot="drag" aria-label="Drag item">
                      <MdDragIndicator />
                    </Button>
                    <TaskListItem
                      taskList={list}
                      curEditing={currEditing}
                      setCurEditing={setCurEditing}
                    />
                  </div>
                </GridListItem>
              );
            } else {
              logError("List and order are out of sync");
              return <Fragment key={listOrder.id} />;
            }
          })}
        </GridList>
      </div>
    </>
  );
};

interface TaskListItemProps {
  taskList: TaskList;
  curEditing: string;
  setCurEditing: React.Dispatch<React.SetStateAction<string>>;
}
const TaskListItem: React.FC<TaskListItemProps> = ({
  taskList,
  curEditing,
  setCurEditing,
}) => {
  const [state, dispatch] = useReducer(taskListReducer, {
    input: taskList.name,
    loading: false,
  });
  const [updateTaskList] = useUpdateTaskListMutation();
  const isEditing = curEditing === taskList.id;
  const isEditable = curEditing === "";
  return (
    <div
      className="
        w-full flex flex-row pl-2 pr-2
        border-gray-300 border-1 rounded-md
        items-center
        justify-between
      "
    >
      <AutoResizeTextArea
        className={`
          ${curEditing === taskList.id ? "caret-gray-400" : "caret-transparent"}
          outline-none
        `}
        readOnly={!isEditing}
        onDoubleClick={() => {
          if (isEditable) {
            setCurEditing(taskList.id);
            dispatch({
              type: "MUTATE_INPUT_ACTION",
              payload: taskList.name,
            });
          }
        }}
        value={!isEditing || isEditable ? taskList.name : state.input}
        onChange={(event) => {
          dispatch({
            type: "MUTATE_INPUT_ACTION",
            payload: event.target.value,
          });
        }}
      />
      <Button
        //TODO: Implement popover
        className={isEditing ? "opacity-0" : ""}
        isDisabled={state.loading || curEditing !== taskList.id}
      >
        <BsThreeDots />
      </Button>
      <Button
        isDisabled={state.loading}
        onClick={() => {
          if (isEditing) {
            dispatch({ type: "MUTATE_LOADING_ACTION", payload: true });
            updateTaskList({
              listID: taskList.id,
              request: { name: state.input },
            })
              .then(() => {
                setCurEditing("");
                dispatch({ type: "MUTATE_LOADING_ACTION", payload: false });
                dispatch({
                  type: "MUTATE_INPUT_ACTION",
                  payload: taskList.name,
                });
              })
              .catch((err: unknown) => {
                setCurEditing("");
                dispatch({ type: "MUTATE_LOADING_ACTION", payload: false });
                dispatch({
                  type: "MUTATE_INPUT_ACTION",
                  payload: taskList.name,
                });
                if (err instanceof Error) {
                  logError("Error updating task list", err);
                }
              });
          } else if (isEditable) {
            setCurEditing(taskList.id);
            dispatch({
              type: "MUTATE_INPUT_ACTION",
              payload: taskList.name,
            });
          }
        }}
      >
        {isEditing ? <FaCheck className="text-green-700" /> : <CiEdit />}
      </Button>
    </div>
  );
};
