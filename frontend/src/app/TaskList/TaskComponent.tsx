import { parseAbsoluteToLocal } from "@internationalized/date";
import { useReducer } from "react";
import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  Dialog,
  DialogTrigger,
  Heading,
  Popover,
} from "react-aria-components";
import { BsThreeDots } from "react-icons/bs";
import { CiEdit } from "react-icons/ci";
import { FaCheck } from "react-icons/fa6";
import { useMoreOptions } from "@/hooks/taslkList/useMoreOptions";
import { useTaskDueDate } from "@/hooks/taslkList/useTaskDueDate";
import { taskComponentReducer } from "@/reducers/taskReducer";
import { useUpdateTaskMutation } from "@/redux/api/apiSlice";
import type { Task } from "@/schemas/task";
import type {
  TaskComponentAction,
  TaskComponentState,
} from "@/types/taskReducer";
import { logError } from "@/util/console.ts";
import { AutoResizeTextArea } from "../General/AutoResizeTextArea.tsx";

export interface TaskProp {
  task: Task;
  taskListId: string;
  isEditable: boolean;
  isEditing: boolean;
  setCurEditing: React.Dispatch<React.SetStateAction<string>>;
}
export const TaskComponent: React.FC<TaskProp> = ({
  task,
  taskListId,
  isEditing,
  isEditable,
  setCurEditing,
}) => {
  const initalTaskComponentState: TaskComponentState = {
    inputTaskName: task.label,
    taskListId,
    isLoading: false,
  };
  const [state, dispatch] = useReducer(
    taskComponentReducer,
    initalTaskComponentState,
  );
  const [updateTask] = useUpdateTaskMutation();
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: This is not a static element
    <div
      onBlur={() => {
        if (isEditing) {
          if (task.label !== state.inputTaskName) {
            // dispatch({ type: "MUTATE_LOADING", payload: true });
            updateTask({
              task: { ...task, label: state.inputTaskName },
              listId: state.taskListId,
            })
              .finally(() => {
                setCurEditing("");
                dispatch({ type: "MUTATE_LOADING", payload: false });
              })
              .catch((err: unknown) => {
                dispatch({ type: "MUTATE_INPUT", payload: task.label });
                if (err instanceof Error) {
                  logError(`Error updating task: ${err}`);
                }
              });
          }
        }
      }}
      className={`
          dark:bg-dark-background-c bg-sky-100 
          ${state.isLoading ? "dark:text-gray-300" : "dark:text-white"}
          ${state.isLoading ? "text-gray-400" : "text-blue-950"}
          dark:border-white border-gray-300 
          border-1
          rounded-lg
          shadow
          w-full
        `}
      draggable={isEditable}
    >
      <div className="flex flex-row gap-2 items-center pr-2 pl-2">
        <CheckBox
          task={task}
          state={state}
          dispatch={dispatch}
          isEditing={isEditing}
        />
        <InputField
          listId={taskListId}
          task={task}
          state={state}
          dispatch={dispatch}
          isEditable={isEditable}
          isEditing={isEditing}
          setCurEditing={setCurEditing}
        />
        <DueDateDisplay
          task={task}
          state={state}
          dispatch={dispatch}
          isEditing={isEditing}
        />
        <MoreOptions
          task={task}
          state={state}
          dispatch={dispatch}
          isEditable={isEditable}
          isEditing={isEditing}
          setCurEditing={setCurEditing}
        />
      </div>
    </div>
  );
};

interface CheckBoxProp {
  task: Task;
  state: TaskComponentState;
  dispatch: React.ActionDispatch<[action: TaskComponentAction]>;
  isEditing: boolean;
}
const CheckBox: React.FC<CheckBoxProp> = ({
  task,
  state,
  dispatch,
  isEditing,
}) => {
  //TODO:: Use React aria checkbok and make this its own general use custom
  //component
  const [updateTask, { isLoading }] = useUpdateTaskMutation();
  const handleClick = () => {
    if (isEditing || isLoading || state.isLoading) {
      return;
    }
    dispatch({ type: "MUTATE_LOADING", payload: true });
    updateTask({
      task: { ...task, completed: !task.completed },
      listId: state.taskListId,
    })
      .then(() => {
        dispatch({ type: "MUTATE_LOADING", payload: false });
      })
      .catch((err: unknown) => {
        dispatch({ type: "MUTATE_LOADING", payload: false });
        if (err instanceof Error) {
          logError("Failed to update task completion:", err);
        }
      });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  const isInteractive = !(isEditing || isLoading) || state.isLoading;

  return (
    <div
      onClick={
        isInteractive
          ? () => {
              handleClick();
            }
          : undefined
      }
      className={`
          ${isEditing ? "opacity-0" : "opacity-100"}
          w-4.5 h-3.5 
          ${task.completed ? "bg-green-500" : "dark:bg-dark-background-c"} 
          rounded-full border-2 
          ${task.completed ? "border-green-900" : "border-gray-500"}
          ${isInteractive ? "cursor-pointer" : "cursor-default"}
          ${isLoading ? "opacity-50" : ""}
        `}
      tabIndex={isInteractive ? 0 : -1}
      onKeyDown={
        isInteractive
          ? (event) => {
              handleKeyDown(event);
            }
          : undefined
      }
      role="checkbox"
      aria-checked={task.completed}
      aria-disabled={!isInteractive}
    />
  );
};
interface InputFieldProps {
  listId: string;
  task: Task;
  state: TaskComponentState;
  dispatch: React.ActionDispatch<[action: TaskComponentAction]>;
  isEditing: boolean;
  isEditable: boolean;
  setCurEditing: React.Dispatch<React.SetStateAction<string>>;
}
const InputField: React.FC<InputFieldProps> = ({
  task,
  state,
  dispatch,
  isEditing,
  setCurEditing,
}) => {
  return (
    <AutoResizeTextArea
      value={isEditing ? state.inputTaskName : task.label}
      className={`
        w-full outline-none leading-4.5
        ${isEditing ? "caret-gray-400" : "caret-transparent"}
      `}
      readOnly={!isEditing}
      onDoubleClick={() => {
        setCurEditing(task.id);
      }}
      onChange={(event) => {
        dispatch({ type: "MUTATE_INPUT", payload: event.target.value });
      }}
    />
  );
};
interface DueDateProp {
  task: Task;
  state: TaskComponentState;
  dispatch: React.ActionDispatch<[action: TaskComponentAction]>;
  isEditing: boolean;
}
const DueDateDisplay: React.FC<DueDateProp> = ({
  task,
  state,
  dispatch,
  isEditing,
}) => {
  const { isLoading, onDateButtonClicked } = useTaskDueDate(
    task,
    state,
    dispatch,
    isEditing,
  );
  if (task.kind === "withoutDate") {
    return "";
  }
  const date = parseAbsoluteToLocal(task.dueDate);
  const monthAbbr = new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(date.toDate());
  return (
    <div
      className={`
          ${isLoading ? "dark:text-gray-300" : "dark:text-white"}
          ${isLoading ? "text-gray-400" : "text-blue-950"}
          ${isEditing ? "opacity-0" : "opacity-100"}
          text-xs
          w-10
        `}
    >
      <DialogTrigger>
        <Button
          isDisabled={isEditing}
          type="button"
        >{`${date.day.toString()} ${monthAbbr}`}</Button>
        <Popover>
          <Calendar
            value={date}
            defaultValue={date}
            onChange={(event) => {
              onDateButtonClicked(event);
            }}
            aria-label="Appointment date"
            className="bg-sky-100 outline-1 outline-gray-300 text-xs"
          >
            <header className="flex items-center mx-1 mb-2">
              <Button slot="previous" className="p-0">
                ◀
              </Button>
              <Heading className="flex-1 m-0 text-center" />
              <Button slot="next" className="p-0">
                ▶
              </Button>
            </header>
            <CalendarGrid className="gird grid-cols-7">
              {(date) => (
                <CalendarCell
                  date={date}
                  className="
                    text-center p-0.5
                    data-[outside-month]:hidden data-[pressed]:bg-gray-100
                    data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-blue-500
                    data-[selected]:bg-blue-500 data-[selected]:text-white
                    "
                />
              )}
            </CalendarGrid>
          </Calendar>
        </Popover>
      </DialogTrigger>
    </div>
  );
};
interface MoreOptionsProp {
  task: Task;
  state: TaskComponentState;
  dispatch: React.ActionDispatch<[action: TaskComponentAction]>;
  isEditable: boolean;
  isEditing: boolean;
  setCurEditing: React.Dispatch<React.SetStateAction<string>>;
}
const MoreOptions: React.FC<MoreOptionsProp> = ({
  task,
  state,
  dispatch,
  setCurEditing,
  isEditable,
  isEditing,
}) => {
  const {
    isLoading,
    isDeleteLoading,
    handleConfirmButtonClick,
    handleDeleteButtonClick,
    handleAddDateButtonClicked,
    handleRemoveButtonDateClicked,
  } = useMoreOptions(task, state, dispatch, setCurEditing);

  return (
    <div
      className="
          flex flex-row items-center
        "
    >
      <div className="flex">
        <DialogTrigger>
          <Button
            isDisabled={isEditing || !isEditable}
            type="button"
            className={isEditing ? "opacity-0" : "opacity-100"}
          >
            <BsThreeDots className="text-blue-950 dark:text-white" />
          </Button>
          <Popover>
            <Dialog>
              <div
                className="
                  text-xs
                  flex flex-col     
                  justify-center
                  text-blue-950 dark:text-white
                  dark:bg-dark-background-c bg-blue-100
                  border-2 border-gray-300 dark:border-gray-200
                  rounded
                  p-0.5
                "
              >
                <Button
                  type="button"
                  onClick={() => {
                    handleAddDateButtonClicked();
                  }}
                >
                  Add Date
                </Button>
                <hr />
                <Button
                  type="button"
                  onClick={() => {
                    handleRemoveButtonDateClicked();
                  }}
                >
                  Remove Date
                </Button>
                <hr />
                <Button
                  onClick={() => {
                    handleDeleteButtonClick();
                  }}
                  type="button"
                >
                  Delete
                </Button>
              </div>
            </Dialog>
          </Popover>
        </DialogTrigger>
      </div>
      <Button
        type="button"
        className={`"
          ${
            isLoading || isDeleteLoading || state.isLoading
              ? "text-gray-400"
              : isEditing
                ? "text-green-700 dark:text-green-400"
                : ""
          }
        "`}
        onClick={() => {
          if (isEditing) {
            handleConfirmButtonClick();
          } else {
            setCurEditing(task.id);
          }
        }}
      >
        {isEditing ? <FaCheck /> : <CiEdit />}
      </Button>
    </div>
  );
};
