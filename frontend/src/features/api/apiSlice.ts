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
			invalidatesTags: ["Tasks"],
		}),
		deleteTask: builder.mutation<void, string>({
			query: (id) => ({
				url: `/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Tasks"],
		}),
		updateTask: builder.mutation<void, Task>({
			query: (task) => ({
				url: `/${task.id}`,
				method: "PUT",
				body: task,
			}),
			invalidatesTags: ["Tasks"],
		}),
		swapTaskOrder: builder.mutation<void, { id1: string; id2: string }>({
			query: (updateTasks) => ({
				url: `/${updateTasks.id1}/${updateTasks.id2}`,
				method: "PUT",
			}),
			invalidatesTags: ["Tasks"],
		}),
		clearCompletedTasks: builder.mutation<void, void>({
			query: () => ({
				url: "/clear",
				method: "DELETE",
			}),
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
