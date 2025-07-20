import { type ChangeEvent, useState } from "react";
import { Button } from "react-aria-components";
import { useAddNewTaskMutation } from "@/redux/apiSlice.ts";
import { logError } from "@/util/console.ts";
import { AutoResizeTextArea } from "../General/AutoResizeTextArea.tsx";

const MAX_TASK_LENGTH = 256;

interface TaskListInputProps {
  taskListId: string;
}

export const TaskListInput: React.FC<TaskListInputProps> = ({ taskListId }) => {
  const [inputTask, setInputTask] = useState<string>("");
  const [addNewTask, { isLoading }] = useAddNewTaskMutation();
  const onInputChanged = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (event.target.value.length < MAX_TASK_LENGTH) {
      setInputTask(event.target.value.replace(/\s+/g, " "));
    }
  };
  const onAddButtonClick = () => {
    addNewTask({
      listId: taskListId,
      request: {
        label: inputTask,
        completed: false,
      },
    }).catch((err: unknown) => {
      if (err instanceof Error) {
        logError("Error adding a new task:", err);
      }
    });
    setInputTask("");
  };
  return (
    <div className=" flex w-full border-b-1 border-gray-400 p-1 dark:border-white ">
      <AutoResizeTextArea
        className=" w-2/3 pl-1 text-blue-950 outline-1 outline-transparent dark:text-white dark:placeholder-gray-300 "
        placeholder="Enter new task"
        onChange={onInputChanged}
        value={inputTask}
      />
      <Button
        isDisabled={isLoading}
        className=" w-1/3 rounded-lg bg-blue-200 dark:bg-white dark:text-black "
        type="button"
        onClick={onAddButtonClick}
      >
        Add task
      </Button>
    </div>
  );
};
