import { ApiResponseTaskSchema, type Task } from "@/schemas/taskList";
import { logError } from "@/util/console";
/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { produce } from "immer";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod/v4";
const apiUrl: string = import.meta.env.VITE_BACKEND_APP_API_URL;

interface NewTaskRequestWithoutDate {
	label: string;
	completed: boolean;
}
interface NewTaskRequestWithDate extends NewTaskRequestWithoutDate {
	dueDate: string;
}
type NewTaskRequest = NewTaskRequestWithDate | NewTaskRequestWithoutDate;
export const apiSlice = createApi({
	reducerPath: "api",
	baseQuery: fetchBaseQuery({ baseUrl: apiUrl }),
	tagTypes: ["Tasks"],
	endpoints: (builder) => ({
		getTasks: builder.query<Task[], void>({
			query: () => "",
			transformResponse: (response) => {
				const transformedTaskSchema = z
					.array(ApiResponseTaskSchema)
					.transform((data) => {
						return data.map((t) => {
							if ("dueDate" in t) {
								return { ...t, kind: "withDate" } as Task;
							}
							return { ...t, kind: "withoutDate" } as Task;
						});
					});

				const result = transformedTaskSchema.safeParse(response);

				if (result.success) {
					return result.data;
				}
				logError("Validation error:", result.error);
				throw new Error(
					"Failed to validate API response. Data format is incorrect.",
				);
			},
			//TODO: Need to look into making this better. changing anything about
			//tasks causes a re-fetch of all tasks
			providesTags: ["Tasks"],
		}),
		getTask: builder.query<Task, string>({
			query: (id) => ({
				url: `/${id}`,
			}),
		}),
		addNewTask: builder.mutation<Task, NewTaskRequest>({
			query: (initialTask) => ({
				url: "",
				method: "POST",
				body: initialTask,
			}),
			async onQueryStarted(taskRequest, { dispatch, queryFulfilled }) {
				const patchResult = dispatch(
					apiSlice.util.updateQueryData("getTasks", undefined, (draftTasks) => {
						const task: Task = {
							id: uuidv4(),
							kind: "withoutDate",
							orderIndex: draftTasks.length,
							...taskRequest,
						};
						draftTasks.push(task);
					}),
				);
				await queryFulfilled.catch(() => {
					logError("Error adding task");
					patchResult.undo();
				});
			},
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
					logError("Error deleting task");
					patchResult.undo();
				});
			},
			invalidatesTags: ["Tasks"],
		}),
		updateTask: builder.mutation<void, Task>({
			query: (task) => {
				type TaskRequest = Omit<Task, "kind"> & {
					dueDate: string | null;
				};
				let newBody: TaskRequest;
				// biome-ignore lint/style/useDefaultSwitchClause: Discriminated union
				switch (task.kind) {
					case "withDate": {
						const { kind: _kind, ...transformedBody } = task;
						newBody = transformedBody;
						break;
					}
					case "withoutDate": {
						const { kind: _kind, ...transformedBody } = task;
						newBody = { dueDate: null, ...transformedBody };
					}
				}
				return {
					url: `/${task.id}`,
					method: "PUT",
					body: newBody,
				};
			},
			async onQueryStarted(task, { dispatch, queryFulfilled }) {
				const patchResult = dispatch(
					apiSlice.util.updateQueryData("getTasks", undefined, (draftTasks) => {
						const taskIndex = draftTasks.findIndex(
							(curTask) => curTask.id === task.id,
						);
						if (taskIndex !== -1) {
							draftTasks[taskIndex] = {
								...task,
							};
						}
					}),
				);
				await queryFulfilled.catch(() => {
					logError("Updating task failed rolling back");
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
			async onQueryStarted({ id1, id2 }, { dispatch, queryFulfilled }) {
				const patchResult = dispatch(
					apiSlice.util.updateQueryData("getTasks", undefined, (draft) => {
						const taskA = draft.findIndex((t) => t.id === id1);
						const taskB = draft.findIndex((t) => t.id === id2);
						if (taskA !== -1 && taskB !== -1) {
							const temp = draft[taskA].orderIndex;
							draft[taskA].orderIndex = draft[taskB].orderIndex;
							draft[taskB].orderIndex = temp;
							draft.sort((a, b) => a.orderIndex - b.orderIndex);
							let count = 0;
							for (const [i, _item] of draft.entries()) {
								draft[i].orderIndex = count;
								count += 1;
							}
						}
					}),
				);
				await queryFulfilled.catch(() => {
					logError("Removing completed tasks failed rolling back");
					patchResult.undo();
				});
			},
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
						let count = 0;
						return draft
							.filter((item) => !item.completed)
							.sort((a, b) => a.orderIndex - b.orderIndex)
							.map((t) => {
								const newTask = produce(t, (tdraft) => {
									tdraft.orderIndex = count;
									count += 1;
								});
								return newTask;
							});
					}),
				);
				await queryFulfilled.catch(() => {
					logError("Removing completed tasks failed rolling back");
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
