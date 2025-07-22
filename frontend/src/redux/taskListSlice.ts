import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TaskListState } from "@/types/taskListReducer";

const initialState: TaskListState = {
  editingId: null,
};

const taskListSlice = createSlice({
  name: "taskListSlice",
  initialState,
  reducers: {
    setEditingTaskList: (state, action: PayloadAction<string | null>) => {
      state.editingId = action.payload;
    },
  },
});

export const { setEditingTaskList } = taskListSlice.actions;

export const taskListReducer = taskListSlice.reducer;

export const selectEditingTaskListId = (state: TaskListState) =>
  state.editingId;
export const selectIsEditing = (state: TaskListState, listId: string) => {
  return state.editingId === listId;
};
export const selectCanEditTaskList = (state: TaskListState) =>
  state.editingId === null;
