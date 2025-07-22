import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { v7 as uuidv7 } from "uuid";
import { z } from "zod";
import {
  type Task,
  type TaskOrder,
  type TaskResponse,
  taskOrderSchema,
  taskResponseSchema,
  taskSchemea,
} from "@/schemas/task";
import {
  type TaskList,
  type TaskListOrder,
  taskListOrderSchema,
  taskListSchema,
} from "@/schemas/taskList";
import type {
  MoveTaskListRequest,
  MoveTaskOrderPayload,
  NewTaskListRequest,
  NewTaskRequest,
  TaskListUpdateRequest,
  TaskUpdate,
} from "@/types/api";
import { logError } from "@/util/console";

const apiUrl = `${import.meta.env.VITE_BACKEND_APP_API_URL}/taskLists`;

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: apiUrl }),
  tagTypes: ["Tasks", "TaskOrder", "TaskList", "TaskListOrder"],
  endpoints: (builder) => ({
    getTaskLists: builder.query<Record<string, TaskList>, void>({
      query: () => ({
        url: "",
        method: "GET",
      }),
      rawResponseSchema: z.array(taskListSchema),
      transformResponse: (response: TaskList[]) => {
        return response.reduce<Record<string, TaskList>>((acc, task) => {
          acc[task.id] = task;
          return acc;
        }, {});
      },
      responseSchema: z.record(z.uuidv7(), taskListSchema),
      providesTags: ["TaskList"],
    }),
    getTaskListOrder: builder.query<TaskListOrder[], void>({
      query: () => ({
        url: "/order",
        method: "GET",
      }),
      responseSchema: z.array(taskListOrderSchema),
      providesTags: ["TaskListOrder"],
    }),
    addNewTaskList: builder.mutation<TaskList, NewTaskListRequest>({
      query: (request) => ({
        url: "",
        method: "PUT",
        body: request,
      }),
      responseSchema: taskListSchema,
      async onQueryStarted(newTaskListRequest, { dispatch, queryFulfilled }) {
        const tempId = uuidv7();
        const addNewTaskListMutation = dispatch(
          apiSlice.util.updateQueryData(
            "getTaskLists",
            undefined,
            (draftTaskList) => {
              draftTaskList[tempId] = { ...newTaskListRequest, id: tempId };
            },
          ),
        );
        const addNewTaskListOrderMutation = dispatch(
          apiSlice.util.updateQueryData(
            "getTaskListOrder",
            undefined,
            (draftTasksOrder) => {
              draftTasksOrder.push({
                id: tempId,
                orderIndex: draftTasksOrder.length,
              });
            },
          ),
        );
        await queryFulfilled
          .then((response) => {
            dispatch(
              apiSlice.util.updateQueryData(
                "getTaskLists",
                undefined,
                (draftTasksList) => {
                  delete draftTasksList[tempId];
                  draftTasksList[response.data.id] = response.data;
                },
              ),
            );
            dispatch(
              apiSlice.util.updateQueryData(
                "getTaskListOrder",
                undefined,
                (draftTasksListOrder) => {
                  const tempTask = draftTasksListOrder.find(
                    (o) => o.id === tempId,
                  );
                  if (tempTask) {
                    tempTask.id = response.data.id;
                  }
                },
              ),
            );
          })
          .catch(() => {
            logError("Error adding task");
            addNewTaskListMutation.undo();
            addNewTaskListOrderMutation.undo();
          });
      },
    }),
    removeTaskList: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const updateTaskListData = dispatch(
          apiSlice.util.updateQueryData(
            "getTaskLists",
            undefined,
            (draftTaskList) => {
              delete draftTaskList[id];
            },
          ),
        );
        const updateTaskListOrderData = dispatch(
          apiSlice.util.updateQueryData(
            "getTaskListOrder",
            undefined,
            (draftTaskListOrder) => {
              return draftTaskListOrder.filter((o) => o.id !== id);
            },
          ),
        );
        await queryFulfilled.catch(() => {
          logError("Error removing task");
          updateTaskListData.undo();
          updateTaskListOrderData.undo();
        });
      },
    }),
    updateTaskList: builder.mutation<
      void,
      { listId: string; request: TaskListUpdateRequest }
    >({
      query: (data) => ({
        url: `/${data.listId}`,
        method: "PATCH",
        body: data.request,
      }),
      async onQueryStarted(taskListPayload, { dispatch, queryFulfilled }) {
        const updateTaskListName = dispatch(
          apiSlice.util.updateQueryData(
            "getTaskLists",
            undefined,
            (draftTaskLists) => {
              draftTaskLists[taskListPayload.listId] = {
                id: taskListPayload.listId,
                name: taskListPayload.request.name,
              };
            },
          ),
        );
        await queryFulfilled.catch(() => {
          updateTaskListName.undo();
        });
      },
    }),
    moveTaskList: builder.mutation<
      void,
      { moveId: string; request: MoveTaskListRequest }
    >({
      query: (data) => ({
        url: `/move/${data.moveId}`,
        method: "PATCH",
        body: data.request,
      }),
      async onQueryStarted({ moveId, request }, { dispatch, queryFulfilled }) {
        const taskListOrderUpdate = dispatch(
          apiSlice.util.updateQueryData(
            "getTaskListOrder",
            undefined,
            (draftTaskListOrder) => {
              if (request.targetId === moveId) return;
              const moveTaskIndex = draftTaskListOrder.findIndex(
                (o) => o.id === moveId,
              );
              const [movedTask] = draftTaskListOrder.splice(moveTaskIndex, 1);
              const targetTaskIndex = draftTaskListOrder.findIndex(
                (o) => o.id === request.targetId,
              );
              if (movedTask) {
                switch (request.position) {
                  case "Before": {
                    draftTaskListOrder.splice(targetTaskIndex, 0, movedTask);
                    break;
                  }
                  case "After": {
                    draftTaskListOrder.splice(
                      targetTaskIndex + 1,
                      0,
                      movedTask,
                    );
                    break;
                  }
                }
              } else {
                logError("error accessing task from order");
              }
              // re-index
              for (const [index, value] of draftTaskListOrder.entries()) {
                value.orderIndex = index;
              }
            },
          ),
        );
        await queryFulfilled.catch(() => {
          logError("Error moving task list");
          taskListOrderUpdate.undo();
        });
      },
    }),
    getTasks: builder.query<Record<string, Task | undefined>, string>({
      query: (id) => `/${id}/tasks`,
      rawResponseSchema: z.array(taskResponseSchema),
      transformResponse: (response: Task[]) => {
        const transformedTaskSchema = z
          .array(taskResponseSchema)
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
      responseSchema: z.record(z.uuidv7(), taskSchemea),
      providesTags: ["Tasks"],
    }),
    getTaskOrder: builder.query<TaskOrder[], string>({
      query: (listId) => ({
        url: `${listId}/tasks/order`,
      }),
      responseSchema: z.array(taskOrderSchema),
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
      responseSchema: taskResponseSchema,
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
                  if (Object.hasOwn(draftTasks, tempId)) {
                    delete draftTasks[tempId];
                  }
                  draftTasks[serverTask.id] = serverTask;
                },
              ),
            );
            dispatch(
              apiSlice.util.updateQueryData(
                "getTaskOrder",
                listId,
                (draftOrder) => {
                  const removeIndex = draftOrder.findIndex(
                    (item) => item.id === tempId,
                  );
                  if (removeIndex === -1) {
                    throw new Error("Task to remove not found");
                  }
                  const oldTaskOrder = draftOrder[removeIndex];
                  if (oldTaskOrder) {
                    oldTaskOrder.id = serverTask.id;
                  }
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
              if (Object.hasOwn(draftTasks, ids.taskId)) {
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
    }),
    toggleTaskCompetion: builder.mutation<
      void,
      { listId: string; taskId: string }
    >({
      query: ({ taskId, listId }) => ({
        url: `/${listId}/tasks/${taskId}/toggle-completion`,
        method: "PATCH",
      }),
      async onQueryStarted({ taskId, listId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          apiSlice.util.updateQueryData("getTasks", listId, (draftTasks) => {
            const task = draftTasks[taskId];
            if (task) {
              draftTasks[taskId] = { ...task, completed: !task.completed };
            }
          }),
        );
        await queryFulfilled.catch(() => {
          patchResult.undo();
          logError("error completing task");
        });
      },
    }),
    updateTask: builder.mutation<
      void,
      { listId: string; taskId: string; taskUpdate: TaskUpdate }
    >({
      query: ({ listId, taskId, taskUpdate }) => {
        return {
          url: `/${listId}/tasks/${taskId}`,
          method: "PATCH",
          body: taskUpdate,
        };
      },
      async onQueryStarted(taskData, { dispatch, queryFulfilled }) {
        const { taskUpdate, taskId, listId } = taskData;
        const patchResult = dispatch(
          apiSlice.util.updateQueryData("getTasks", listId, (draftTasks) => {
            const oldTask = draftTasks[taskId];
            if (oldTask) {
              if (taskUpdate.dueDate === null) {
                draftTasks[taskId] = {
                  id: taskId,
                  completed: oldTask.completed,
                  label: taskUpdate.label,
                  kind: "withoutDate",
                };
              } else {
                draftTasks[taskId] = {
                  id: taskId,
                  completed: oldTask.completed,
                  label: taskUpdate.label,
                  kind: "withDate",
                  dueDate: taskUpdate.dueDate,
                };
              }
            }
          }),
        );
        await queryFulfilled.catch(() => {
          logError("Updating task failed rolling back");
          patchResult.undo();
        });
      },
    }),
    moveTaskOrder: builder.mutation<void, MoveTaskOrderPayload>({
      query: (moveTasks) => {
        return {
          url: `${moveTasks.listId}/tasks/move/${moveTasks.id1}`,
          method: "PATCH",
          body: {
            targetTaskId: moveTasks.id2,
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
              if (movedTask) {
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
              } else {
                logError("Moved task is not in the state");
              }
              // re-index
              for (const [index, task] of draft.entries()) {
                task.orderIndex = index;
              }
            },
          ),
        );
        await queryFulfilled.catch(() => {
          logError("Error moving tasks");
          patchResult.undo();
        });
      },
    }),
    clearCompletedTasks: builder.mutation<void, string>({
      query: (listId) => ({
        url: `/${listId}/clear`,
        method: "DELETE",
      }),
      async onQueryStarted(listId, { dispatch, queryFulfilled }) {
        const deletedTasks = new Map<string, string>();
        const taskPatchResult = dispatch(
          apiSlice.util.updateQueryData("getTasks", listId, (draft) => {
            for (const key in draft) {
              if (Object.hasOwn(draft, key)) {
                const task = draft[key];
                if (task?.completed) {
                  deletedTasks.set(key, "");
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
  useGetTaskListsQuery,
  useAddNewTaskListMutation,
  useRemoveTaskListMutation,
  useUpdateTaskListMutation,
  useGetTaskListOrderQuery,
  useMoveTaskListMutation,
  useToggleTaskCompetionMutation,
} = apiSlice;
