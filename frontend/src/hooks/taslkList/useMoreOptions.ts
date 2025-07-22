import { getLocalTimeZone, now } from "@internationalized/date";
import { useDeleteTaskMutation, useUpdateTaskMutation } from "@/redux/apiSlice";
import type { Task } from "@/schemas/task";
import type {
  TaskComponentAction,
  TaskComponentState,
} from "@/types/taskReducer";
import { logError } from "@/util/console";
import { useTask } from "./useTask.ts";

export const useMoreOptions = (
  task: Task,
  state: TaskComponentState,
  dispatch: (action: TaskComponentAction) => void,
) => {
  const [updateTask, { isLoading }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleteLoading }] = useDeleteTaskMutation();
  const { setEditingTask } = useTask(state.taskListId);
  const handleConfirmButtonClick = () => {
    if (task.label !== state.inputTaskName) {
      // dispatch({ type: "MUTATE_LOADING", payload: true });

      updateTask({
        taskId: task.id,
        taskUpdate: {
          dueDate: task.kind === "withDate" ? task.dueDate : null,
          label: state.inputTaskName,
        },
        listId: state.taskListId,
      })
        .finally(() => {
          setEditingTask(null);
          dispatch({ type: "MUTATE_LOADING", payload: false });
        })
        .catch((err: unknown) => {
          dispatch({ type: "MUTATE_INPUT", payload: task.label });
          if (err instanceof Error) {
            logError(`Error updating task: ${err}`);
          }
        });
    } else {
      setEditingTask(null);
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
    dispatch({ type: "MUTATE_LOADING", payload: false });
    switch (task.kind) {
      case "withDate": {
        updateTask({
          taskUpdate: { dueDate: null, label: task.label },
          listId: state.taskListId,
          taskId: task.id,
        })
          .then(() => {
            dispatch({ type: "MUTATE_LOADING", payload: false });
          })
          .catch((err: unknown) => {
            dispatch({ type: "MUTATE_LOADING", payload: false });
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
    dispatch({ type: "MUTATE_LOADING", payload: true });
    switch (task.kind) {
      case "withDate": {
        dispatch({ type: "MUTATE_LOADING", payload: false });
        return;
      }
      case "withoutDate": {
        updateTask({
          taskUpdate: {
            dueDate: now(getLocalTimeZone()).toAbsoluteString(),
            label: task.label,
          },
          listId: state.taskListId,
          taskId: task.id,
        })
          .then(() => {
            dispatch({ type: "MUTATE_LOADING", payload: false });
          })
          .catch((err: unknown) => {
            dispatch({ type: "MUTATE_LOADING", payload: false });
            if (err instanceof Error) {
              logError("Error removing date:", err);
            }
          });
        break;
      }
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
