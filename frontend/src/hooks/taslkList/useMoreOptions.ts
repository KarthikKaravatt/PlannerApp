import { getLocalTimeZone, now } from "@internationalized/date";
import { useDeleteTaskMutation, useUpdateTaskMutation } from "@/redux/apiSlice";
import type { Task } from "@/schemas/task";
import type {
  TaskComponentAction,
  TaskComponentState,
} from "@/types/taskReducer";
import { logError } from "@/util/console";

export const useMoreOptions = (
  task: Task,
  state: TaskComponentState,
  dispatch: (action: TaskComponentAction) => void,
) => {
  const [updateTask, { isLoading }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleteLoading }] = useDeleteTaskMutation();
  const handleConfirmButtonClick = () => {
    if (task.label !== state.inputTaskName) {
      updateTask({
        taskId: task.id,
        taskUpdate: {
          dueDate: task.kind === "withDate" ? task.dueDate : null,
          label: state.inputTaskName,
        },
        listId: state.taskListId,
      })
        .finally(() => {
          dispatch({ type: "MUTATE_EDITING", payload: false });
        })
        .catch((err: unknown) => {
          dispatch({ type: "MUTATE_INPUT", payload: task.label });
          if (err instanceof Error) {
            logError(`Error updating task: ${err}`);
          }
        });
    } else {
      dispatch({ type: "MUTATE_EDITING", payload: false });
    }
  };
  const handleDeleteButtonClick = () => {
    deleteTask({ taskId: task.id, listId: state.taskListId }).catch(
      (err: unknown) => {
        if (err instanceof Error) {
          logError(`Error removing tasks:${err}`);
        }
      },
    );
  };
  const handleRemoveButtonDateClicked = () => {
    switch (task.kind) {
      case "withDate": {
        updateTask({
          taskUpdate: { dueDate: null, label: task.label },
          listId: state.taskListId,
          taskId: task.id,
        }).catch((err: unknown) => {
          if (err instanceof Error) {
            logError(`Error removing date:${err}`);
          }
          logError("Error removing date");
        });
        break;
      }
      case "withoutDate": {
        return;
      }
    }
  };
  const handleAddDateButtonClicked = () => {
    if (task.kind === "withoutDate") {
      updateTask({
        taskUpdate: {
          dueDate: now(getLocalTimeZone()).toAbsoluteString(),
          label: task.label,
        },
        listId: state.taskListId,
        taskId: task.id,
      }).catch((err: unknown) => {
        if (err instanceof Error) {
          logError("Error removing date:", err);
        }
      });
    }
  };
  return {
    isLoading,
    isDeleteLoading,
    handleConfirmButtonClick,
    handleDeleteButtonClick,
    handleRemoveButtonDateClicked,
    handleAddDateButtonClicked,
  };
};
