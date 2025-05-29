import {
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} from "@/redux/api/apiSlice";
import type { Task } from "@/schemas/taskList";
import type {
  TaskComponentAction,
  TaskComponentState,
} from "@/types/taskReducer";

export const useMoreOptions = (
  task: Task,
  state: TaskComponentState,
  dispatch: (action: TaskComponentAction) => void,
) => {
  const [updateTask, { isLoading }] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const handleConfirmClick = () => {
    if (task.label !== state.inputTaskName) {
      dispatch({ type: "MUTATE_LOADING", payload: true });
      updateTask({ ...task, label: state.inputTaskName })
        .then(() => {
          dispatch({ type: "MUTATE_LOADING", payload: false });
        })
        .catch((err: unknown) => {
          dispatch({ type: "MUTATE_INPUT", payload: task.label });
          dispatch({ type: "MUTATE_LOADING", payload: false });
          if (err instanceof Error) {
            console.error(`Error updating task: ${err}`);
          }
        });
    }
    dispatch({ type: "MUTATE_EDITABLE", payload: false });
  };
  const handleDeleteButtonClick = () => {
    deleteTask(task.id).catch((err: unknown) => {
      if (err instanceof Error) {
        console.error(`Error removing tasks:${err}`);
      }
    });
  };
  const handleRemoveDateClicked = () => {
    dispatch({ type: "MUTATE_LOADING", payload: false });
    dispatch({ type: "MUTATE_FORMATED_DATE", payload: "" });
    switch (task.kind) {
      case "withDate": {
        const { kind: _kind, dueDate: _dueDate, ...transformedTask } = task;
        const updatedTask = { kind: "withoutDate", ...transformedTask } as Task;
        updateTask(updatedTask)
          .then(() => {
            dispatch({ type: "MUTATE_LOADING", payload: false });
          })
          .catch((err: unknown) => {
            dispatch({ type: "MUTATE_FORMATED_DATE", payload: task.dueDate });
            dispatch({ type: "MUTATE_LOADING", payload: false });
            if (err instanceof Error) {
              console.error(`Error removing date:${err}`);
            }
            console.error("Error removing date");
          });
        break;
      }
      case "withoutDate": {
        return;
      }
    }
  };
  return {
    isLoading,
    handleConfirmClick,
    handleDeleteButtonClick,
    handleRemoveDateClicked,
  };
};
