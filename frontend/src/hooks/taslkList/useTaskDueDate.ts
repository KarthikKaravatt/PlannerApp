import type { ZonedDateTime } from "@internationalized/date";
import { useUpdateTaskMutation } from "@/redux/taskApiSlice";
import type { Task } from "@/schemas/task";
import { logError } from "@/util/console";

export const useTaskDueDate = (task: Task, taskListId: string) => {
  const [updateTask, { isLoading }] = useUpdateTaskMutation();
  const onDateButtonClicked = (inputDate: ZonedDateTime) => {
    if (task.kind === "withDate") {
      updateTask({
        taskUpdate: {
          dueDate: inputDate.toAbsoluteString(),
          label: task.label,
        },
        listId: taskListId,
        taskId: task.id,
      }).catch((err: unknown) => {
        if (err instanceof Error) {
          logError("Error updating task:", err);
        }
      });
    }
  };
  return {
    isLoading,
    onDateButtonClicked,
  };
};
