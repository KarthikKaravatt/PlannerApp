import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import {
  selectCanEditTask,
  selectIsEditingTask,
  setEditingTask,
} from "@/redux/taskSlice";

export const useTask = (listId: string, taskId?: string) => {
  const dispatch = useDispatch();
  const isEditing = useSelector<RootState, boolean>((state) => {
    return selectIsEditingTask(state.tasks, taskId, listId);
  });
  const canEdit = useSelector<RootState, boolean>((state) => {
    return selectCanEditTask(state.tasks, listId);
  });
  return {
    isEditing: isEditing,
    canEdit: canEdit,
    setEditingTask: (taskId: string | null) =>
      dispatch(setEditingTask({ listId: listId, taskId: taskId })),
  };
};
