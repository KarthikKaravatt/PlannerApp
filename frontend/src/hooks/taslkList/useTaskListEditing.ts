import { useDispatch, useSelector } from "react-redux";
import {
  selectCanEditTaskList,
  selectEditingTaskListId,
  setEditingTaskList,
} from "@/redux/taskListSlice";

export const useTaskListEditing = (taskListId: string | null) => {
  const dispatch = useDispatch();
  const editingId = useSelector(selectEditingTaskListId);
  const canEdit = useSelector(selectCanEditTaskList);
  return {
    editingId,
    isEditing: taskListId ? editingId === taskListId : false,
    canEdit,
    setEditing: (id: string | null) => dispatch(setEditingTaskList(id)),
  };
};
