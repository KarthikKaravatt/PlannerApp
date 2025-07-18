import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UiState } from "@/types/ui";

const initialState: UiState = {
  taskList: {
    editingId: null,
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setEditingTaskList: (state, action: PayloadAction<string | null>) => {
      state.taskList.editingId = action.payload;
    },
  },
});

export const { setEditingTaskList } = uiSlice.actions;

export const uiReducer = uiSlice.reducer;

export const selectEditingTaskListId = (state: { ui: UiState }) =>
  state.ui.taskList.editingId;
export const selectCanEditTaskList = (state: { ui: UiState }) =>
  state.ui.taskList.editingId === null;
