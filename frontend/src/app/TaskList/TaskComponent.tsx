import { parseAbsoluteToLocal } from "@internationalized/date";
import { useReducer, useRef, useState } from "react";
import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DialogTrigger,
  Heading,
  Popover,
  parseColor,
  SubmenuTrigger,
} from "react-aria-components";
import { BsThreeDots } from "react-icons/bs";
import { CiEdit } from "react-icons/ci";
import { FaCheck, FaSpinner } from "react-icons/fa6";
import { useMoreOptions } from "@/hooks/taslkList/useMoreOptions";
import { useTaskDueDate } from "@/hooks/taslkList/useTaskDueDate";
import { taskComponentReducer } from "@/reducers/taskReducer";
import { useAddTagMutation, useGetTagsQuery } from "@/redux/tagApiSlice.ts";
import {
  useGetTaskTagsQuery,
  useToggleTaskCompetionMutation,
  useUpdateTaskMutation,
} from "@/redux/taskApiSlice.ts";
import type { Colour } from "@/schemas/tag.ts";
import type { Task } from "@/schemas/task";
import type { TaskUpdate } from "@/types/api.ts";
import type {
  TaskComponentAction,
  TaskComponentState,
} from "@/types/taskReducer";
import { logError } from "@/util/console.ts";
import { rgbToOklch } from "@/util/rgb-to-okclh.ts";
import { AutoResizeTextArea } from "../General/AutoResizeTextArea.tsx";
import {
  CustomMenu,
  CustomMenuButton,
  CustomMenuItem,
  CustomMenuPopOver,
} from "../General/CustomMenu.tsx";
import { CustomTooltip } from "../General/CustomToolTip.tsx";
import { CustomColorPicker } from "../General/colour-picker/CustomColourPicker.tsx";
import { TAG_MAX_LENGTH, TagComponent } from "./TagComponent.tsx";

export const TaskComponent = ({
  task,
  taskListId,
}: {
  task: Task;
  taskListId: string;
}) => {
  const initalTaskComponentState: TaskComponentState = {
    inputTaskName: task.label,
    taskListId,
    isEditing: false,
    isLoading: false,
  };
  const [state, dispatch] = useReducer(
    taskComponentReducer,
    initalTaskComponentState,
  );
  const [updateTask, { isLoading }] = useUpdateTaskMutation();
  const taskRef = useRef<HTMLDivElement>(null);
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: This is not a static element
    <div
      ref={taskRef}
      onBlur={(event) => {
        // don't lose focus when tab is pressed for navigation (within task)
        if (taskRef.current && !taskRef.current.contains(event.relatedTarget)) {
          if (state.isEditing && task.label !== state.inputTaskName) {
            const updateTaskPayload: TaskUpdate = {
              dueDate: task.kind === "withDate" ? task.dueDate : null,
              label: state.inputTaskName,
            };
            updateTask({
              taskUpdate: updateTaskPayload,
              taskId: task.id,
              listId: state.taskListId,
            }).catch((err: unknown) => {
              dispatch({ type: "MUTATE_INPUT", payload: task.label });
              if (err instanceof Error) {
                logError(`Error updating task: ${err}`);
              }
            });
          }
          dispatch({ type: "MUTATE_EDITING", payload: false });
        }
      }}
      className={`${isLoading ? "dark:text-gray-300" : "dark:text-white"} ${isLoading ? "text-gray-400" : "text-blue-950"} w-full bg-sky-100 dark:border-b-white dark:bg-dark-background-c`}
    >
      <div>
        <div className="flex flex-row items-center gap-2 pr-2 pl-2">
          <CheckBox task={task} state={state} />
          <InputField task={task} state={state} dispatch={dispatch} />
          <DueDateDisplay task={task} state={state} />
          <MoreOptions task={task} state={state} dispatch={dispatch} />
        </div>
      </div>
    </div>
  );
};

const CheckBox = ({
  task,
  state,
}: {
  task: Task;
  state: TaskComponentState;
}) => {
  const [toggleCompletion, { isLoading }] = useToggleTaskCompetionMutation();
  const handleClick = () => {
    if (state.isEditing || isLoading) {
      return;
    }
    toggleCompletion({
      listId: state.taskListId,
      task: { ...task },
    }).catch((err: unknown) => {
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

  const isInteractive = !(state.isEditing || isLoading);

  return (
    // biome-ignore lint/a11y/useSemanticElements: This is a custom component
    <div
      onClick={
        isInteractive
          ? () => {
              handleClick();
            }
          : undefined
      }
      className={`${state.isEditing ? "opacity-0" : "opacity-100"} ${task.completed ? "bg-green-500" : "dark:bg-dark-background-c"} ${task.completed ? "border-green-900" : "border-gray-500"} ${isInteractive ? "cursor-pointer" : "cursor-default"} ${isLoading ? "opacity-50" : ""} h-3.5 w-4.5 rounded-full border-2 `}
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
const InputField = ({
  task,
  state,
  dispatch,
}: {
  task: Task;
  state: TaskComponentState;
  dispatch: React.ActionDispatch<[action: TaskComponentAction]>;
}) => {
  return (
    <AutoResizeTextArea
      value={state.isEditing ? state.inputTaskName : task.label}
      className={` ${state.isEditing ? "caret-gray-400" : "caret-transparent"} w-full leading-4.5 outline-1 outline-transparent `}
      readOnly={!state.isEditing}
      onDoubleClick={() => {
        dispatch({ type: "MUTATE_EDITING", payload: true });
      }}
      onChange={(event) => {
        dispatch({ type: "MUTATE_INPUT", payload: event.target.value });
      }}
    />
  );
};
const DueDateDisplay = ({
  task,
  state,
}: {
  task: Task;
  state: TaskComponentState;
}) => {
  const { isLoading, onDateButtonClicked } = useTaskDueDate(task, state);
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
      className={`${isLoading ? "dark:text-gray-300" : "dark:text-white"} ${isLoading ? "text-gray-400" : "text-blue-950"} ${state.isEditing ? "opacity-0" : "opacity-100"} w-10 text-xs `}
    >
      <DialogTrigger>
        <Button
          isDisabled={state.isEditing}
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
            className="bg-sky-100 text-xs outline-1 outline-gray-300 dark:bg-dark-background-sub-c dark:text-white dark:outline-none"
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
            <CalendarGrid className={"gird grid-cols-7"}>
              {(date) => (
                <CalendarCell
                  date={date}
                  className=" p-2 text-center data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-blue-500 data-[outside-month]:hidden data-[pressed]:bg-gray-100 data-[selected]:bg-blue-500 data-[selected]:text-white "
                />
              )}
            </CalendarGrid>
          </Calendar>
        </Popover>
      </DialogTrigger>
    </div>
  );
};
const MoreOptions = ({
  task,
  state,
  dispatch,
}: {
  task: Task;
  state: TaskComponentState;
  dispatch: React.ActionDispatch<[action: TaskComponentAction]>;
}) => {
  const {
    isLoading,
    isDeleteLoading,
    handleConfirmButtonClick,
    handleDeleteButtonClick,
    handleAddDateButtonClicked,
    handleRemoveButtonDateClicked,
  } = useMoreOptions(task, state, dispatch);

  return (
    <div className=" flex flex-row items-center gap-1">
      <CustomMenuButton hoverMessage={"More options"} icon={BsThreeDots}>
        <SubmenuTrigger>
          <CustomMenuItem
            //@ts-expect-error
            //HACK: Its not exposed yet but will be soon https://github.com/adobe/react-spectrum/pull/8315
            //TODO: Change name to shouldCloseOnSelect after pr is accepted
            closeOnSelect={false}
          >
            Tags
          </CustomMenuItem>
          <CustomMenuPopOver>
            <CustomMenu selectionMode="multiple">
              <CustomMenuItem className="rounded-sm bg-sky-100 p-0.5 dark:bg-dark-background-sub-c">
                <TagDisplay listId={state.taskListId} taskId={task.id} />
              </CustomMenuItem>
            </CustomMenu>
          </CustomMenuPopOver>
        </SubmenuTrigger>
        <CustomMenuItem onAction={handleAddDateButtonClicked}>
          Add Date
        </CustomMenuItem>
        <CustomMenuItem onAction={handleRemoveButtonDateClicked}>
          Remove Date
        </CustomMenuItem>
        <CustomMenuItem onAction={handleDeleteButtonClick}>
          Delete Task
        </CustomMenuItem>
      </CustomMenuButton>
      <CustomTooltip message={state.isEditing ? "Confirm edit" : "Edit task"}>
        <Button
          type="button"
          className={`" ${isLoading || isDeleteLoading ? "text-gray-400" : state.isEditing ? "text-green-700 dark:text-green-400" : ""} "`}
          onClick={() => {
            if (state.isEditing) {
              handleConfirmButtonClick();
            } else {
              dispatch({ type: "MUTATE_EDITING", payload: true });
            }
          }}
        >
          {state.isEditing ? <FaCheck /> : <CiEdit />}
        </Button>
      </CustomTooltip>
    </div>
  );
};
const TagDisplay = ({ listId, taskId }: { listId: string; taskId: string }) => {
  const {
    data: tags,
    isLoading: isLoadingTags,
    isError: isErrorTags,
  } = useGetTagsQuery();
  const {
    data: taskTags,
    isLoading: isLoadingTaskTags,
    isError: isErrorTaskTags,
  } = useGetTaskTagsQuery({ listId: listId, taskId: taskId });
  //TODO: Loading state
  const [addTag] = useAddTagMutation();
  const isLoading = isLoadingTags || isLoadingTaskTags;
  const isError = isErrorTags || isErrorTaskTags;
  const [inputColour, setInputColour] = useState(
    parseColor("rgb(255, 255, 255)"),
  );
  const [inputTagName, setInputTagName] = useState("");
  const handleAddTag = () => {
    if (inputTagName.length === 0) {
      //TODO: Maybe use a toast here
      return;
    }
    const rgb = inputColour.toFormat("rgb");
    const colour = rgbToOklch({
      r: rgb.getChannelValue("red"),
      g: rgb.getChannelValue("green"),
      b: rgb.getChannelValue("blue"),
    }) satisfies Colour;
    addTag({ name: inputTagName, colour: colour });
  };
  if (isLoading) {
    return <FaSpinner className="animate-spin" />;
  }
  if (isError || !tags || !taskTags) {
    //TODO: Not sure if I want to display error information to the user?
    if (!tags) {
      return <p>Error loading tags</p>;
    }
    if (!taskTags) {
      return <p>Error loading task tags</p>;
    }
  }

  return (
    <div className="p-1">
      <div className="flex flex-row items-center gap-1 pb-1">
        <AutoResizeTextArea
          className="w-35"
          value={inputTagName}
          onChange={(event) => {
            setInputTagName(
              event.target.value.replace("/\s+g", "").slice(0, TAG_MAX_LENGTH),
            );
          }}
          placeholder="tag name"
        ></AutoResizeTextArea>
        <CustomColorPicker value={inputColour} onChange={setInputColour} />
        <Button
          onPress={handleAddTag}
          className="rounded-md bg-blue-200 p-0.5 pr-1.5 pl-1.5 text-blue-950 dark:bg-white dark:text-black"
        >
          Add
        </Button>
      </div>
      <div className="flex flex-col">
        {tags.map((t) => {
          return <TagComponent key={t.id} tag={t} />;
        })}
      </div>
    </div>
  );
};
