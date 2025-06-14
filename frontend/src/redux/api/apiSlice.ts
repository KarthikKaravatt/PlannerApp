import {
	ApiResponseTaskSchema,
	type Task,
	type TaskList,
	type TaskOrder,
	type TaskResponse,
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

//TODO: Move items between lists
export interface MoveTaskOrderPayload {
	id1: string;
	id2: string;
	listId: string;
	pos: "Before" | "After";
}

export interface TaskListRequest {
	name: string;
}
export const apiSlice = createApi({
	reducerPath: "api",
	baseQuery: fetchBaseQuery({ baseUrl: apiUrl }),
	//TODO: Make TaskList invalidation more precise
	tagTypes: ["Tasks", "TaskOrder", "TaskList"],
	endpoints: (builder) => ({
		getTaskList: builder.query<TaskList[], void>({
			query: () => ({
				url: "",
				method: "GET",
			}),
			providesTags: ["TaskList"],
		}),
		addNewTaskList: builder.mutation<TaskList, TaskListRequest>({
			query: (request) => ({
				url: "",
				method: "PUT",
				body: request,
			}),
			invalidatesTags: ["TaskList"],
		}),
		removeTaskList: builder.mutation<void, string>({
			query: (id) => ({
				url: `/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["TaskList"],
		}),
		getTasks: builder.query<Record<string, Task | undefined>, string>({
			query: (id) => `/${id}/tasks`,
			transformResponse: (response: unknown) => {
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
					return result.data.reduce<Record<string, Task>>((acc, task) => {
						acc[task.id] = task;
						return acc;
					}, {});
				}
				logError("Validation error:", result.error);
				throw new Error(
					"Failed to validate API response. Data format is incorrect.",
				);
			},
			providesTags: ["Tasks"],
		}),
		getTaskOrder: builder.query<TaskOrder[], string>({
			query: (listId) => ({
				url: `${listId}/tasks/order`,
			}),
			providesTags: ["TaskOrder"],
		}),
		addNewTask: builder.mutation<
			TaskResponse,
			{ request: NewTaskRequest; listId: string } // arg type
		>({
			query: ({ request, listId }) => ({
				url: `/${listId}/tasks`,
				method: "POST",
				body: request,
			}),

			async onQueryStarted(payload, { dispatch, queryFulfilled }) {
				const tempId = uuidv7();
				const { listId, request } = payload;
				const newTask: Task = { ...request, id: tempId, kind: "withoutDate" };
				const updateTasks = dispatch(
					apiSlice.util.updateQueryData("getTasks", listId, (draftTasks) => {
						draftTasks[tempId] = newTask;
					}),
				);
				const updateOrder = dispatch(
					apiSlice.util.updateQueryData(
						"getTaskOrder",
						listId,
						(draftOrder) => {
							const orderIndex = draftOrder.length;
							draftOrder.push({ id: tempId, orderIndex });
						},
					),
				);
				await queryFulfilled
					.then((results) => {
						const taskPayload = results.data;
						const serverTask = (() => {
							if ("dueDate" in taskPayload) {
								return { ...taskPayload, kind: "withDate" } satisfies Task;
							}
							return { ...taskPayload, kind: "withoutDate" } satisfies Task;
						})();
						dispatch(
							apiSlice.util.updateQueryData(
								"getTasks",
								listId,
								(draftTasks) => {
									draftTasks[serverTask.id] = serverTask;
								},
							),
						);
						dispatch(
							apiSlice.util.updateQueryData(
								"getTaskOrder",
								listId,
								(draftOrder) => {
									draftOrder.pop();
									const orderIndex = draftOrder.length;
									draftOrder.push({
										id: serverTask.id,
										orderIndex: orderIndex,
									});
								},
							),
						);
					})
					.catch(() => {
						logError("Error adding task");
						updateOrder.undo();
						updateTasks.undo();
					});
			},
			invalidatesTags: ["Tasks", "TaskOrder"],
		}),
		deleteTask: builder.mutation<void, { listId: string; taskId: string }>({
			query: (ids) => ({
				url: `/${ids.listId}/tasks/${ids.taskId}`,
				method: "DELETE",
			}),
			async onQueryStarted(ids, { dispatch, queryFulfilled }) {
				const taskPatchResult = dispatch(
					apiSlice.util.updateQueryData(
						"getTasks",
						ids.listId,
						(draftTasks) => {
							if (
								Object.prototype.hasOwnProperty.call(draftTasks, ids.taskId)
							) {
								// we are using immer so this is okay
								// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
								const deleted = delete draftTasks[ids.taskId];
								if (!deleted) {
									logError("Error delting task");
								}
							}
						},
					),
				);
				const taskOrderPatchResult = dispatch(
					apiSlice.util.updateQueryData(
						"getTaskOrder",
						ids.listId,
						(draftTaskOrder) => {
							const taskOrderIndex = draftTaskOrder.findIndex(
								(t) => t.id === ids.taskId,
							);
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
		updateTask: builder.mutation<void, { task: Task; listId: string }>({
			query: (taskData) => {
				type TaskRequest = Omit<Task, "kind"> & {
					dueDate: string | null;
				};
				let newBody: TaskRequest;
				const task = taskData.task;
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
					url: `/${taskData.listId}/tasks/${task.id}`,
					method: "PATCH",
					body: newBody,
				};
			},
			async onQueryStarted(taskData, { dispatch, queryFulfilled }) {
				const { task, listId } = taskData;
				const patchResult = dispatch(
					apiSlice.util.updateQueryData("getTasks", listId, (draftTasks) => {
						draftTasks[task.id] = task;
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
					url: `${moveTasks.listId}/tasks/move/${moveTasks.id1}/${moveTasks.id2}`,
					method: "PATCH",
					body: {
						pos: moveTasks.pos,
					},
				};
			},
			async onQueryStarted(payload, { dispatch, queryFulfilled }) {
				const patchResult = dispatch(
					apiSlice.util.updateQueryData(
						"getTaskOrder",
						payload.listId,
						(draft) => {
							draft.sort((a, b) => a.orderIndex - b.orderIndex);
							const movedTaskIndex = draft.findIndex(
								(t) => t.id === payload.id1,
							);
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
						},
					),
				);
				await queryFulfilled.catch(() => {
					logError("Error moving tasks");
					patchResult.undo();
				});
			},
			invalidatesTags: ["TaskOrder"],
		}),
		clearCompletedTasks: builder.mutation<void, string>({
			query: (listId) => ({
				url: `${listId}/tasks/clear`,
				method: "DELETE",
			}),
			async onQueryStarted(listId, { dispatch, queryFulfilled }) {
				const deletedTasks = new Map<string, string>();
				const taskPatchResult = dispatch(
					apiSlice.util.updateQueryData("getTasks", listId, (draft) => {
						for (const key in draft) {
							if (Object.prototype.hasOwnProperty.call(draft, key)) {
								const task = draft[key];
								if (task?.completed) {
									deletedTasks.set(key, "");
									// we are using immer so this is fine
									// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
									delete draft[key];
								}
							}
						}
					}),
				);
				const taskOrderPatchResult = dispatch(
					apiSlice.util.updateQueryData(
						"getTaskOrder",
						listId,
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
	useGetTaskOrderQuery,
	useGetTaskListQuery,
	useAddNewTaskListMutation,
	useRemoveTaskListMutation,
} = apiSlice;
