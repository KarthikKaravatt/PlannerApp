import {
	ApiResponseTaskSchema,
	type Task,
	type TaskOrder,
} from "@/schemas/taskList";
import { logError } from "@/util/console";
/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { v7 as uuidv7 } from "uuid";
import { z } from "zod/v4";
const apiUrl: string = import.meta.env.VITE_BACKEND_APP_API_URL;

interface NewTaskWithoutDatePayload {
	label: string;
	completed: boolean;
}
interface NewTaskWithDatePayload extends NewTaskWithoutDatePayload {
	dueDate: string;
}
type NewTaskRequest = NewTaskWithDatePayload | NewTaskWithoutDatePayload;

export interface MoveTaskOrderPayload {
	id1: string;
	id2: string;
	pos: "Before" | "After";
}
export const apiSlice = createApi({
	reducerPath: "api",
	baseQuery: fetchBaseQuery({ baseUrl: apiUrl }),
	tagTypes: ["Tasks", "TaskOrder"],
	endpoints: (builder) => ({
		getTasks: builder.query<Map<string, Task>, void>({
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
					return new Map(result.data.map((t) => [t.id, t]));
				}
				logError("Validation error:", result.error);
				throw new Error(
					"Failed to validate API response. Data format is incorrect.",
				);
			},
			providesTags: ["Tasks"],
		}),
		getTask: builder.query<Task, string>({
			query: (id) => ({
				url: `/${id}`,
			}),
		}),
		getTaskOrder: builder.query<TaskOrder[], void>({
			query: () => ({
				url: "/order",
			}),
			providesTags: ["TaskOrder"],
		}),
		addNewTask: builder.mutation<Task, NewTaskRequest>({
			query: (initialTask) => ({
				url: "",
				method: "POST",
				body: initialTask,
			}),
			async onQueryStarted(taskRequest, { dispatch, queryFulfilled }) {
				const taskId = uuidv7();
				const taskPatchResult = dispatch(
					apiSlice.util.updateQueryData("getTasks", undefined, (draftTasks) => {
						const task: Task = {
							id: taskId,
							kind: "withoutDate",
							...taskRequest,
						};
						draftTasks.set(task.id, task);
					}),
				);
				const taskOrderPatchResult = dispatch(
					apiSlice.util.updateQueryData(
						"getTaskOrder",
						undefined,
						(draftTasksOrder) => {
							draftTasksOrder.push({
								id: taskId,
								orderIndex: draftTasksOrder.length,
							});
						},
					),
				);

				await queryFulfilled.catch(() => {
					logError("Error adding task");
					taskPatchResult.undo();
					taskOrderPatchResult.undo();
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
				const taskPatchResult = dispatch(
					apiSlice.util.updateQueryData("getTasks", undefined, (draftTasks) => {
						if (!draftTasks.delete(id)) {
							logError("Error deleting task");
						}
					}),
				);
				const taskOrderPatchResult = dispatch(
					apiSlice.util.updateQueryData(
						"getTaskOrder",
						undefined,
						(draftTaskOrder) => {
							const taskOrderIndex = draftTaskOrder.findIndex((t) => t.id);
							draftTaskOrder.splice(taskOrderIndex, 1);
						},
					),
				);
				await queryFulfilled.catch(() => {
					logError("Error deleting task");
					taskPatchResult.undo();
					taskOrderPatchResult.undo();
				});
			},
			invalidatesTags: ["Tasks", "TaskOrder"],
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
					method: "PATCH",
					body: newBody,
				};
			},
			async onQueryStarted(task, { dispatch, queryFulfilled }) {
				const patchResult = dispatch(
					apiSlice.util.updateQueryData("getTasks", undefined, (draftTasks) => {
						draftTasks.set(task.id, task);
					}),
				);
				await queryFulfilled.catch(() => {
					logError("Updating task failed rolling back");
					patchResult.undo();
				});
			},
			// invalidatesTags: ["Tasks"],
		}),
		moveTaskOrder: builder.mutation<void, MoveTaskOrderPayload>({
			query: (moveTasks) => {
				return {
					url: `move/${moveTasks.id1}/${moveTasks.id2}`,
					method: "PATCH",
					body: {
						pos: moveTasks.pos,
					},
				};
			},
			async onQueryStarted(payload, { dispatch, queryFulfilled }) {
				const patchResult = dispatch(
					apiSlice.util.updateQueryData("getTaskOrder", undefined, (draft) => {
						draft.sort((a, b) => a.orderIndex - b.orderIndex);
						const movedTaskIndex = draft.findIndex((t) => t.id === payload.id1);
						const [movedTask] = draft.splice(movedTaskIndex, 1);
						const anchorTaskIndex = draft.findIndex(
							(t) => t.id === payload.id2,
						);
						// biome-ignore lint/style/useDefaultSwitchClause: <explanation>
						switch (payload.pos) {
							case "Before": {
								draft.splice(anchorTaskIndex, 0, movedTask);
								break;
							}
							case "After": {
								draft.splice(anchorTaskIndex + 1, 0, movedTask);
								break;
							}
						}
						// re-index
						for (let i = 0; i < draft.length; i++) {
							draft[i].orderIndex = i;
						}
					}),
				);
				await queryFulfilled.catch(() => {
					logError("Error moving tasks");
					patchResult.undo();
				});
			},
			invalidatesTags: ["TaskOrder"],
		}),
		clearCompletedTasks: builder.mutation<void, void>({
			query: () => ({
				url: "/clear",
				method: "DELETE",
			}),
			async onQueryStarted(_, { dispatch, queryFulfilled }) {
				const deletedTasks = new Map<string, string>();
				const taskPatchResult = dispatch(
					apiSlice.util.updateQueryData("getTasks", undefined, (draft) => {
						for (const t of draft.values()) {
							if (t.completed) {
								deletedTasks.set(t.id, "");
								draft.delete(t.id);
							}
						}
					}),
				);
				const taskOrderPatchResult = dispatch(
					apiSlice.util.updateQueryData(
						"getTaskOrder",
						undefined,
						(darftTaskOrder) => {
							return darftTaskOrder.filter((t) => !deletedTasks.has(t.id));
						},
					),
				);
				await queryFulfilled.catch(() => {
					logError("Removing completed tasks failed rolling back");
					taskPatchResult.undo();
					taskOrderPatchResult.undo();
				});
			},
			invalidatesTags: ["Tasks", "TaskOrder"],
		}),
	}),
});
export const {
	useGetTasksQuery,
	useAddNewTaskMutation,
	useDeleteTaskMutation,
	useUpdateTaskMutation,
	useClearCompletedTasksMutation,
	useMoveTaskOrderMutation,
	useGetTaskQuery,
	useGetTaskOrderQuery,
} = apiSlice;
