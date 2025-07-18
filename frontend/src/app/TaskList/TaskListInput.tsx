import { type ChangeEvent, useState } from "react";
import { Button } from "react-aria-components";
import { useAddNewTaskMutation } from "@/redux/apiSlice.ts";
import { logError } from "@/util/console.ts";
import { AutoResizeTextArea } from "../General/AutoResizeTextArea.tsx";

interface TaskListInputProps {
  taskListId: string;
}

export const TaskListInput: React.FC<TaskListInputProps> = ({ taskListId }) => {
  const [inputTask, setInputTask] = useState<string>("");
  const [addNewTask, { isLoading }] = useAddNewTaskMutation();
  const onInputChanged = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (event.target.value.length < 256) {
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
    <div
      className="
          flex rounded-lg
          border-2
          border-gray-300 dark:border-white
          w-full
          p-1
        "
    >
      <AutoResizeTextArea
        className="
            text-blue-950 dark:text-white
            dark:placeholder-gray-300
            outline-1
            outline-transparent
            w-2/3
            pl-1
          "
        placeholder="Enter new task"
        onChange={onInputChanged}
        value={inputTask}
      />
      <Button
        isDisabled={isLoading}
        className="
            w-1/3
            bg-blue-200
            dark:bg-white
            dark:text-black
            rounded-lg
          "
        type="button"
        onClick={onAddButtonClick}
      >
        Add task
      </Button>
    </div>
  );
};
