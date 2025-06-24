import { getLocalTimeZone, now } from "@internationalized/date";
import {
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} from "@/redux/api/apiSlice";
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
  setCurEditing: React.Dispatch<React.SetStateAction<string>>,
) => {
  const [updateTask, { isLoading }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleteLoading }] = useDeleteTaskMutation();
  const handleConfirmButtonClick = () => {
    if (task.label !== state.inputTaskName) {
      dispatch({ type: "MUTATE_LOADING", payload: true });
      updateTask({
        task: { ...task, label: state.inputTaskName },
        listId: state.taskListId,
      })
        .then(() => {
          dispatch({ type: "MUTATE_LOADING", payload: false });
        })
        .catch((err: unknown) => {
          dispatch({ type: "MUTATE_INPUT", payload: task.label });
          dispatch({ type: "MUTATE_LOADING", payload: false });
          if (err instanceof Error) {
            logError(`Error updating task: ${err}`);
          }
        });
    }
    setCurEditing("");
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
        const { kind: _kind, dueDate: _dueDate, ...transformedTask } = task;
        const updatedTask = { kind: "withoutDate", ...transformedTask } as Task;
        updateTask({ task: updatedTask, listId: state.taskListId })
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
        const { kind: _kind, ...transformedTask } = task;
        const updatedTask = {
          kind: "withDate",
          dueDate: now(getLocalTimeZone()).toAbsoluteString(),
          ...transformedTask,
        } as Task;
        updateTask({ task: updatedTask, listId: state.taskListId })
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
