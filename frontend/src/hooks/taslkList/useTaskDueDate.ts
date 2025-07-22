import type { ZonedDateTime } from "@internationalized/date";
import { useUpdateTaskMutation } from "@/redux/apiSlice";
import type { Task } from "@/schemas/task";
import type {
  TaskComponentAction,
  TaskComponentState,
} from "@/types/taskReducer";
import { logError } from "@/util/console";

export const useTaskDueDate = (
  task: Task,
  state: TaskComponentState,
  dispatch: React.ActionDispatch<[action: TaskComponentAction]>,
  isEditing: boolean,
) => {
  const [updateTask, { isLoading }] = useUpdateTaskMutation();
  const onDateButtonClicked = (inputDate: ZonedDateTime) => {
    dispatch({ type: "MUTATE_LOADING", payload: true });
    if (isEditing) {
      return;
    }
    switch (task.kind) {
      case "withDate": {
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
        dispatch({ type: "MUTATE_LOADING", payload: false });
        break;
      }
      case "withoutDate": {
        dispatch({ type: "MUTATE_LOADING", payload: false });
        return;
      }
    }
  };
  return {
    isLoading,
    onDateButtonClicked,
  };
};
