/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { Task } from "@/schemas/taskList";
import type { NewTask } from "../tasks/tasksSlice";
const apiURL: string | undefined = import.meta.env.VITE_BACKEND_APP_API_URL;

export const apiSlice = createApi({
	reducerPath: "api",
	baseQuery: fetchBaseQuery({ baseUrl: apiURL }),
	tagTypes: ["Tasks"],
	endpoints: (builder) => ({
		getTasks: builder.query<Task[], void>({
			query: () => "",
			providesTags: ["Tasks"],
		}),
		getTask: builder.query<Task, string>({
			query: (id) => ({
				url: `/${id}`,
			}),
		}),
		addNewTask: builder.mutation<Task, NewTask>({
			query: (initialPost) => ({
				url: "",
				method: "POST",
				body: initialPost,
			}),
			// TODO : Make this optimistic
			// async onQueryStarted() {
			//
			// },
			invalidatesTags: ["Tasks"],
		}),
		deleteTask: builder.mutation<void, string>({
			query: (id) => ({
				url: `/${id}`,
				method: "DELETE",
			}),
			async onQueryStarted(id, { dispatch, queryFulfilled }) {
				const patchResult = dispatch(
					apiSlice.util.updateQueryData("getTasks", undefined, (draftTasks) => {
						const taskIndex = draftTasks.findIndex((task) => task.id === id);
						if (taskIndex !== -1) {
							draftTasks.splice(taskIndex, 1);
						}
					}),
				);
				await queryFulfilled.catch(() => {
					console.error("Error deleting task");
					patchResult.undo();
				});
			},
			invalidatesTags: ["Tasks"],
		}),
		updateTask: builder.mutation<void, Task>({
			query: (task) => ({
				url: `/${task.id}`,
				method: "PUT",
				body: task,
			}),
			async onQueryStarted(task, { dispatch, queryFulfilled }) {
				const patchResult = dispatch(
					apiSlice.util.updateQueryData("getTasks", undefined, (draftTasks) => {
						const taskIndex = draftTasks.findIndex(
							(curTask) => curTask.id === task.id,
						);
						if (taskIndex !== -1) {
							draftTasks[taskIndex] = {
								...draftTasks[taskIndex],
								...task,
							};
						}
					}),
				);
				await queryFulfilled.catch(() => {
					console.error("Updating task failed rolling back");
					patchResult.undo();
				});
			},
			invalidatesTags: ["Tasks"],
		}),
		swapTaskOrder: builder.mutation<void, { id1: string; id2: string }>({
			query: (updateTasks) => ({
				url: `/${updateTasks.id1}/${updateTasks.id2}`,
				method: "PUT",
			}),
			//TODO: Make this optimistic
			invalidatesTags: ["Tasks"],
		}),
		clearCompletedTasks: builder.mutation<void, void>({
			query: () => ({
				url: "/clear",
				method: "DELETE",
			}),
			async onQueryStarted(_, { dispatch, queryFulfilled }) {
				const patchResult = dispatch(
					apiSlice.util.updateQueryData("getTasks", undefined, (draft) => {
						return draft.filter((item) => !item.completed);
					}),
				);
				await queryFulfilled.catch(() => {
					console.error("Removing completed tasks failed rolling back");
					patchResult.undo();
				});
			},
			invalidatesTags: ["Tasks"],
		}),
	}),
});
export const {
	useGetTasksQuery,
	useAddNewTaskMutation,
	useDeleteTaskMutation,
	useUpdateTaskMutation,
	useSwapTaskOrderMutation,
	useClearCompletedTasksMutation,
	useGetTaskQuery,
} = apiSlice;
