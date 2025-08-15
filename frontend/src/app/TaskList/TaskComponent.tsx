import { parseAbsoluteToLocal } from "@internationalized/date";
import React, {
  type ChangeEvent,
  memo,
  useCallback,
  useRef,
  useState,
} from "react";
import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  Checkbox,
  DialogTrigger,
  Heading,
  Popover,
  SubmenuTrigger,
} from "react-aria-components";
import { BsThreeDots } from "react-icons/bs";
import { CiEdit } from "react-icons/ci";
import { FaRegCheckCircle } from "react-icons/fa";
import { FaCheck, FaRegCircle } from "react-icons/fa6";
import { useMoreOptions } from "@/hooks/taslkList/useMoreOptions";
import { useTaskDueDate } from "@/hooks/taslkList/useTaskDueDate";
import {
  useToggleTaskCompetionMutation,
  useUpdateTaskMutation,
} from "@/redux/taskApiSlice";
import type { Task } from "@/schemas/task";
import { logError } from "@/util/console";
import { AutoResizeTextArea } from "../General/AutoResizeTextArea.tsx";
import {
  CustomMenu,
  CustomMenuButton,
  CustomMenuItem,
  CustomMenuPopOver,
} from "../General/CustomMenu.tsx";
import { TagDisplay } from "./TagDisplayComponent.tsx";

const INPUT_LIMIT = 512;
export const TaskComponent = memo(
  ({ task, taskListId }: { task: Task; taskListId: string }) => (
    <TaskComponentBase task={task} taskListId={taskListId} />
  ),
);
const TaskComponentBase = ({
  task,
  taskListId,
}: {
  task: Task;
  taskListId: string;
}) => {
  return (
    <div className="flex w-full flex-row items-center gap-1">
      <TaskCheckBoxMemo
        isCompleted={!task.completed}
        listId={taskListId}
        task={task}
      />
      <TaskInputWithOptions task={task} listId={taskListId} />
    </div>
  );
};

const TaskCheckBoxMemo = React.memo(
  ({ isCompleted, listId, task }: TaskCheckBoxProps) => (
    <TaskCheckBox isCompleted={isCompleted} listId={listId} task={task} />
  ),
);
interface TaskCheckBoxProps {
  isCompleted: boolean;
  listId: string;
  task: Task;
}
const TaskCheckBox = ({ isCompleted, listId, task }: TaskCheckBoxProps) => {
  //TODO: Add Toast on error
  const [toggleCompletion] = useToggleTaskCompetionMutation();
  return (
    <Checkbox
      isSelected={isCompleted}
      className={"text-sm"}
      onChange={() => {
        toggleCompletion({ listId: listId, task }).catch(() => {
          logError("Error chaning completion");
        });
      }}
    >
      {({ isSelected }) => (
        <>
          {isSelected ? (
            <FaRegCircle />
          ) : (
            <FaRegCheckCircle className="text-green-700" />
          )}
        </>
      )}
    </Checkbox>
  );
};

const TaskInputWithOptions = ({
  task,
  listId,
}: {
  task: Task;
  listId: string;
}) => {
  const [inputTaskLabel, setInputTaskLabel] = useState<string>(task.label);
  const inputTaskLabelRef = useRef(inputTaskLabel);
  const [isEditable, setIsEditable] = useState(false);
  //TODO: Loading state
  const [updateTask] = useUpdateTaskMutation();
  const onInputTaskLabelChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value.replace(/\s+/g, " ");
      if (newValue.length < INPUT_LIMIT) {
        setInputTaskLabel(newValue);
        inputTaskLabelRef.current = newValue;
      }
    },
    [],
  );
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: this is intractable
    <div
      className="flex w-full flex-row items-center gap-0.5 pr-3 text-sm"
      onDoubleClick={() => setIsEditable(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          if (task.label !== inputTaskLabel) {
            updateTask({
              listId: listId,
              taskId: task.id,
              taskUpdate: {
                label: inputTaskLabel,
                dueDate: task.kind === "withDate" ? task.dueDate : null,
              },
            });
          }
          setIsEditable(false);
        }
      }}
    >
      <AutoResizeTextArea
        className={`${!isEditable ? "caret-transparent" : ""} tex-sm w-fit leading-snug`}
        readOnly={!isEditable}
        value={inputTaskLabel}
        onChange={onInputTaskLabelChange}
      />
      <div className="ml-auto flex flex-row items-center gap-1.5">
        {task.kind === "withDate" ? (
          <DueDateDisplayMemo task={task} listId={listId} />
        ) : (
          <div className="w-5"></div>
        )}
        <EditIcons isEditable={isEditable} setIsEditable={setIsEditable} />
        {!isEditable ? (
          <MoreOptions
            task={task}
            listId={listId}
            inputTaskLabel={inputTaskLabel}
          />
        ) : (
          <DotsMemo />
        )}
      </div>
    </div>
  );
};
const DotsMemo = React.memo(() => <BsThreeDots className="opacity-0" />);

const DueDateDisplay = ({ task, listId }: { task: Task; listId: string }) => {
  const { isLoading, onDateButtonClicked } = useTaskDueDate(task, listId);
  if (task.kind === "withoutDate") {
    return;
  }
  const date = parseAbsoluteToLocal(task.dueDate);
  const monthAbbr = new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(date.toDate());
  return (
    <div
      className={`${isLoading ? "dark:text-gray-300" : "dark:text-white"} ${isLoading ? "text-gray-400" : "text-blue-950"}  w-5 text-xs `}
    >
      <DialogTrigger>
        <Button type="button">{`${date.day.toString()} ${monthAbbr}`}</Button>
        <Popover className={"shadow-md"}>
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

const DueDateDisplayMemo = React.memo(
  ({ task, listId }: { task: Task; listId: string }) => (
    <DueDateDisplay task={task} listId={listId} />
  ),
);

const EditIcons = React.memo(
  ({
    isEditable,
    setIsEditable,
  }: {
    isEditable: boolean;
    setIsEditable: (value: React.SetStateAction<boolean>) => void;
  }) => (
    <Button onClick={() => setIsEditable((prev) => !prev)} className="text-sm">
      {isEditable ? <FaCheck /> : <CiEdit />}
    </Button>
  ),
);
const MoreOptions = React.memo(
  ({
    task,
    listId,
    inputTaskLabel,
  }: {
    task: Task;
    listId: string;
    inputTaskLabel: string;
  }) => {
    const {
      handleDeleteButtonClick,
      handleAddDateButtonClicked,
      handleRemoveButtonDateClicked,
    } = useMoreOptions(task, listId, inputTaskLabel);

    return (
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
              <CustomMenuItem className={"hover:transition-none"}>
                <TagDisplay listId={listId} taskId={task.id} />
              </CustomMenuItem>
            </CustomMenu>
          </CustomMenuPopOver>
        </SubmenuTrigger>
        <CustomMenuItem
          onPress={
            task.kind === "withoutDate"
              ? handleAddDateButtonClicked
              : handleRemoveButtonDateClicked
          }
        >
          {task.kind === "withDate" ? "Remove Date" : "Add Date"}
        </CustomMenuItem>
        <CustomMenuItem onPress={handleDeleteButtonClick}>
          Delete
        </CustomMenuItem>
      </CustomMenuButton>
    );
  },
);
