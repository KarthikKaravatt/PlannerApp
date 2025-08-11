import React, { type ChangeEvent, useCallback, useRef, useState } from "react";
import { Button } from "react-aria-components";
import { useAddNewTaskMutation } from "@/redux/taskApiSlice.ts";
import { logError } from "@/util/console.ts";
import { AutoResizeTextArea } from "../General/AutoResizeTextArea.tsx";

const MAX_TASK_LENGTH = 256;

const MemoizedButton = React.memo(
  ({ isLoading, onClick }: { isLoading: boolean; onClick: () => void }) => (
    <Button
      isDisabled={isLoading}
      className={`${!isLoading ? "bg-blue-200 dark:bg-white" : "bg-gray-300"} w-1/3 rounded-lg dark:text-black`}
      type="button"
      onClick={onClick}
    >
      Add task
    </Button>
  ),
);

export const TaskListInput = ({ taskListId }: { taskListId: string }) => {
  const [inputTask, setInputTask] = useState<string>("");
  // Have a ref so the even handlers don't depend on the input state
  const inputTaskRef = useRef(inputTask);
  const [addNewTask, { isLoading }] = useAddNewTaskMutation();

  const onInputChanged = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value.replace(/\s+/g, " ");
    if (newValue.length < MAX_TASK_LENGTH) {
      setInputTask(newValue);
      inputTaskRef.current = newValue;
    }
  };

  const onAddButtonClick = useCallback(() => {
    const currentTask = inputTaskRef.current.trim();
    if (!currentTask) return;

    addNewTask({
      listId: taskListId,
      request: { label: currentTask, completed: false },
    }).catch((err: unknown) => {
      if (err instanceof Error) logError("Error adding a new task:", err);
    });

    setInputTask("");
    inputTaskRef.current = "";
  }, [addNewTask, taskListId]);

  return (
    <div className="flex w-full border-b-1 border-gray-400 p-1 shadow-md dark:rounded-md dark:border-none dark:border-blue-100 dark:bg-dark-background-sub-c">
      <AutoResizeTextArea
        className="w-2/3 pl-1 text-blue-950 outline-1 outline-transparent dark:text-white dark:placeholder-gray-300"
        placeholder="Enter new task"
        onChange={onInputChanged}
        value={inputTask}
      />
      <MemoizedButton isLoading={isLoading} onClick={onAddButtonClick} />
    </div>
  );
};
