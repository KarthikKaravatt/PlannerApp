import type { Task } from "@/schemas/taskList";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

const initialState: Task[] = [];
export type NewTask = Pick<Task, "label" | "dueDate" | "completed">;

const tasksSlice = createSlice({
	name: "tasks",
	initialState,
	reducers: {
		taskAdded(state, action: PayloadAction<Task>) {
			state.push(action.payload);
		},
	},
});

export const { taskAdded } = tasksSlice.actions;
export default tasksSlice.reducer;
