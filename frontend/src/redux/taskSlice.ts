import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AllTaskState } from "@/types/taskReducer";

const initialState: AllTaskState = {};

const taskSlice = createSlice({
  name: "taskSlice",
  initialState,
  reducers: {
    setEditingTask: (
      state,
      action: PayloadAction<{ listId: string; taskId: string | null }>,
    ) => {
      const { listId, taskId } = action.payload;
      if (!state[listId]) {
        state[listId] = { editingTaskId: null };
      }
      state[listId].editingTaskId = taskId;
    },
  },
});

export const { setEditingTask } = taskSlice.actions;
export const taskReducer = taskSlice.reducer;

export const selectCanEditTask = (
  state: AllTaskState,
  listId: string,
): boolean => {
  const list = state[listId];
  return list ? list.editingTaskId === null : true;
};
export const selectIsEditingTask = (
  state: AllTaskState,
  taskId: string | undefined,
  listId: string,
) => {
  const list = state[listId];
  return list ? list.editingTaskId === taskId : false;
};
