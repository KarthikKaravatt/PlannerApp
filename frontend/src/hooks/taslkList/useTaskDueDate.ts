import type { ZonedDateTime } from "@internationalized/date";
import { useUpdateTaskMutation } from "@/redux/api/apiSlice";
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
) => {
  const [updateTask, { isLoading }] = useUpdateTaskMutation();
  const onDateButtonClicked = (inputDate: ZonedDateTime) => {
    dispatch({ type: "MUTATE_LOADING", payload: true });
    if (state.editable) {
      return;
    }
    switch (task.kind) {
      case "withDate": {
        updateTask({
          task: { ...task, dueDate: inputDate.toAbsoluteString() },
          listId: state.taskListId,
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
