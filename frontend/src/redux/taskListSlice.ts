import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TaskListState } from "@/types/taskListReducer";

const initialState: TaskListState = {
  editingId: null,
};

const taskListSlice = createSlice({
  name: "taskListSlice",
  initialState,
  reducers: {
    setEditingTask: (state, action: PayloadAction<string | null>) => {
      state.editingId = action.payload;
    },
    setEditingTaskList: (state, action: PayloadAction<string | null>) => {
      state.editingId = action.payload;
    },
  },
});

export const { setEditingTaskList, setEditingTask } = taskListSlice.actions;

export const taskListReducer = taskListSlice.reducer;

export const selectEditingTaskListId = (state: { ui: TaskListState }) =>
  state.ui.editingId;
export const selectCanEditTaskList = (state: { ui: TaskListState }) =>
  state.ui.editingId === null;
