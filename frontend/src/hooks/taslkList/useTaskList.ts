import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import {
  selectCanEditTaskList,
  selectEditingTaskListId,
  setEditingTaskList,
} from "@/redux/taskListSlice";

export const useTaskListEditing = (taskListId: string | null) => {
  const dispatch = useDispatch();
  const editingId = useSelector<RootState>((state) =>
    selectEditingTaskListId(state.taskList),
  );
  const canEdit = useSelector<RootState>((state) =>
    selectCanEditTaskList(state.taskList),
  );
  return {
    isEditing: taskListId ? editingId === taskListId : false,
    canEdit,
    setEditing: (id: string | null) => dispatch(setEditingTaskList(id)),
  };
};
