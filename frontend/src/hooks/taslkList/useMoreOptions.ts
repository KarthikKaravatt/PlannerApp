import { getLocalTimeZone, now } from "@internationalized/date";
import {
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} from "@/redux/taskApiSlice";
import type { Task } from "@/schemas/task";
import { logError } from "@/util/console";

export const useMoreOptions = (
  task: Task,
  taskListId: string,
  inputTaskName: string,
) => {
  const [updateTask, { isLoading }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleteLoading }] = useDeleteTaskMutation();
  const handleConfirmButtonClick = () => {
    if (task.label !== inputTaskName) {
      updateTask({
        taskId: task.id,
        taskUpdate: {
          dueDate: task.kind === "withDate" ? task.dueDate : null,
          label: inputTaskName,
        },
        listId: taskListId,
      }).catch((err: unknown) => {
        if (err instanceof Error) {
          logError(`Error updating task: ${err}`);
        }
      });
    }
  };
  const handleDeleteButtonClick = () => {
    deleteTask({ taskId: task.id, listId: taskListId }).catch(
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
          listId: taskListId,
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
        listId: taskListId,
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
