import type { Task } from "@/schemas/taskList";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

const initialState: Task[] = [];

const tasksListSlice = createSlice({
	name: "tasks",
	initialState,
	reducers: {
		taskAdded(state, action: PayloadAction<Task>) {
			state.push(action.payload);
		},
	},
});

export const { taskAdded } = tasksListSlice.actions;

export const tasksReducer = tasksListSlice.reducer;
