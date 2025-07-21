import { parseAbsoluteToLocal } from "@internationalized/date";
import { useReducer, useRef } from "react";
import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DialogTrigger,
  Heading,
  Popover,
} from "react-aria-components";
import { CiEdit } from "react-icons/ci";
import { FaCheck } from "react-icons/fa6";
import { useMoreOptions } from "@/hooks/taslkList/useMoreOptions";
import { useTaskDueDate } from "@/hooks/taslkList/useTaskDueDate";
import { taskComponentReducer } from "@/reducers/taskReducer";
import { useUpdateTaskMutation } from "@/redux/apiSlice.ts";
import type { Task } from "@/schemas/task";
import type {
  TaskComponentAction,
  TaskComponentState,
} from "@/types/taskReducer";
import { logError } from "@/util/console.ts";
import { AutoResizeTextArea } from "../General/AutoResizeTextArea.tsx";
import { PopOverMenu } from "../General/PopOverMenu.tsx";

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
  const taskRef = useRef<HTMLDivElement>(null);
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: This is not a static element
    <div
      ref={taskRef}
      onBlur={(event) => {
        // don't lose focus when tab is pressed for navigation (within task)
        if (taskRef.current && !taskRef.current.contains(event.relatedTarget)) {
          if (isEditing && task.label !== state.inputTaskName) {
            dispatch({ type: "MUTATE_LOADING", payload: true });
            updateTask({
              task: { ...task, label: state.inputTaskName },
              listId: state.taskListId,
            }).catch((err: unknown) => {
              dispatch({ type: "MUTATE_INPUT", payload: task.label });
              if (err instanceof Error) {
                logError(`Error updating task: ${err}`);
              }
            });
          }
          setCurEditing("");
          dispatch({ type: "MUTATE_LOADING", payload: false });
        }
      }}
      className={`${state.isLoading ? "dark:text-gray-300" : "dark:text-white"} ${state.isLoading ? "text-gray-400" : "text-blue-950"} w-full bg-sky-100 shadow dark:border-b-white dark:bg-dark-background-c`}
      draggable={isEditable}
    >
      <div className="flex flex-row items-center gap-2 pr-2 pl-2">
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
      className={`${isEditing ? "opacity-0" : "opacity-100"} ${task.completed ? "bg-green-500" : "dark:bg-dark-background-c"} ${task.completed ? "border-green-900" : "border-gray-500"} ${isInteractive ? "cursor-pointer" : "cursor-default"} ${isLoading ? "opacity-50" : ""} h-3.5 w-4.5 rounded-full border-2 `}
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
      className={` ${isEditing ? "caret-gray-400" : "caret-transparent"} w-full leading-4.5 outline-1 outline-transparent `}
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
    // biome-ignore lint/complexity/noUselessFragments: Need a way of representing return nothing
    return <></>;
  }
  const date = parseAbsoluteToLocal(task.dueDate);
  const monthAbbr = new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(date.toDate());
  return (
    <div
      className={`${isLoading ? "dark:text-gray-300" : "dark:text-white"} ${isLoading ? "text-gray-400" : "text-blue-950"} ${isEditing ? "opacity-0" : "opacity-100"} w-10 text-xs `}
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
            className="bg-sky-100 text-xs outline-1 outline-gray-300"
          >
            <header className="mx-1 mb-2 flex items-center">
              <Button slot="previous" className="p-0">
                ◀
              </Button>
              <Heading className="m-0 flex-1 text-center" />
              <Button slot="next" className="p-0">
                ▶
              </Button>
            </header>
            <CalendarGrid className="gird grid-cols-7">
              {(date) => (
                <CalendarCell
                  date={date}
                  className=" p-0.5 text-center data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-blue-500 data-[outside-month]:hidden data-[pressed]:bg-gray-100 data-[selected]:bg-blue-500 data-[selected]:text-white "
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
      <PopOverMenu isDisabled={isEditing || !isEditable}>
        <Button
          className={"rounded-md p-1"}
          type="button"
          onClick={() => {
            handleAddDateButtonClicked();
          }}
        >
          Add Date
        </Button>
        <Button
          className={"rounded-md p-1"}
          type="button"
          onClick={() => {
            handleRemoveButtonDateClicked();
          }}
        >
          Remove Date
        </Button>
        <Button
          className={"rounded-md p-1"}
          onClick={() => {
            handleDeleteButtonClick();
          }}
          type="button"
        >
          Delete
        </Button>
      </PopOverMenu>
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
