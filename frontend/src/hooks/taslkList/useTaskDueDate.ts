import type { ZonedDateTime } from "@internationalized/date";
import { useUpdateTaskMutation } from "@/redux/apiSlice";
import type { Task } from "@/schemas/task";
import type { TaskComponentState } from "@/types/taskReducer";
import { logError } from "@/util/console";

export const useTaskDueDate = (task: Task, state: TaskComponentState) => {
  const [updateTask, { isLoading }] = useUpdateTaskMutation();
  const onDateButtonClicked = (inputDate: ZonedDateTime) => {
    if (state.isEditing) {
      return;
    }
    if (task.kind === "withDate") {
      updateTask({
        taskUpdate: {
          dueDate: inputDate.toAbsoluteString(),
          label: task.label,
        },
        listId: state.taskListId,
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
