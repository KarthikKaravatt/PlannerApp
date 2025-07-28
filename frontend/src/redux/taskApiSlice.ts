import { v7 as uuidv7 } from "uuid";
import { z } from "zod";
import {
  type Task,
  type TaskOrder,
  type TaskResponse,
  taskOrderSchema,
  taskResponseSchema,
  taskSchemea,
} from "@/schemas/task.ts";
import type {
  MoveTaskOrderPayload,
  NewTaskRequest,
  TaskUpdate,
} from "@/types/api.ts";
import { logError } from "@/util/console.ts";
import { apiSlice } from "./apiSlice.ts";

const taskApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getIncompleteTasks: builder.query<Record<string, Task>, string>({
      query: (id) => `/${id}/tasks/incomplete`,
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
        return {};
      },
      responseSchema: z.record(z.uuidv7(), taskSchemea),
      providesTags: ["IncompleteTasks"],
    }),
    getIncompleteTaskOrder: builder.query<TaskOrder[], string>({
      query: (listId) => ({
        url: `${listId}/tasks/incomplete/order`,
      }),
      responseSchema: z.array(taskOrderSchema),
      providesTags: ["IncompleteTasks"],
    }),
    getCompleteTasks: builder.query<Record<string, Task>, string>({
      query: (id) => `/${id}/tasks/complete`,
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
        return {};
      },
      responseSchema: z.record(z.uuidv7(), taskSchemea),
      providesTags: ["CompleteTasks"],
    }),
    getCompleteTaskOrder: builder.query<TaskOrder[], string>({
      query: (listId) => ({
        url: `${listId}/tasks/complete/order`,
      }),
      responseSchema: z.array(taskOrderSchema),
      providesTags: ["CompleteTasksOrder"],
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
          taskApiSlice.util.updateQueryData(
            "getIncompleteTasks",
            listId,
            (draftTasks) => {
              draftTasks[tempId] = newTask;
            },
          ),
        );
        const updateOrder = dispatch(
          taskApiSlice.util.updateQueryData(
            "getIncompleteTaskOrder",
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
              taskApiSlice.util.updateQueryData(
                "getIncompleteTasks",
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
              taskApiSlice.util.updateQueryData(
                "getIncompleteTaskOrder",
                listId,
                (draftOrder) => {
                  const removeIndex = draftOrder.findIndex(
                    (item) => item.id === tempId,
                  );
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
        //TODO: mabye check if the task is complted or not at each step to avoid
        //iterations
        const incompleteTasksPatchResult = dispatch(
          taskApiSlice.util.updateQueryData(
            "getIncompleteTasks",
            ids.listId,
            (draftTasks) => {
              if (Object.hasOwn(draftTasks, ids.taskId)) {
                delete draftTasks[ids.taskId];
              }
            },
          ),
        );
        const incompleteTasksOrderPatchResult = dispatch(
          taskApiSlice.util.updateQueryData(
            "getIncompleteTaskOrder",
            ids.listId,
            (draftTaskOrder) => {
              const taskOrderIndex = draftTaskOrder.findIndex(
                (t) => t.id === ids.taskId,
              );
              if (taskOrderIndex !== -1) {
                draftTaskOrder.splice(taskOrderIndex, 1);
              }
            },
          ),
        );
        const completeTasksPatchResult = dispatch(
          taskApiSlice.util.updateQueryData(
            "getCompleteTasks",
            ids.listId,
            (draftTasks) => {
              if (Object.hasOwn(draftTasks, ids.taskId)) {
                delete draftTasks[ids.taskId];
              }
            },
          ),
        );
        const completeTasksOrderPatchResult = dispatch(
          taskApiSlice.util.updateQueryData(
            "getCompleteTaskOrder",
            ids.listId,
            (draftTaskOrder) => {
              const taskOrderIndex = draftTaskOrder.findIndex(
                (t) => t.id === ids.taskId,
              );
              if (taskOrderIndex !== -1) {
                draftTaskOrder.splice(taskOrderIndex, 1);
              }
            },
          ),
        );
        await queryFulfilled.catch(() => {
          logError("Error deleting task");
          incompleteTasksPatchResult.undo();
          incompleteTasksOrderPatchResult.undo();
          completeTasksPatchResult.undo();
          completeTasksOrderPatchResult.undo();
        });
      },
    }),
    toggleTaskCompetion: builder.mutation<void, { listId: string; task: Task }>(
      {
        query: ({ task, listId }) => ({
          url: `/${listId}/tasks/${task.id}/toggle-completion`,
          method: "PATCH",
        }),
        async onQueryStarted({ task, listId }, { dispatch, queryFulfilled }) {
          const incompltedTaskPatchResult = dispatch(
            taskApiSlice.util.updateQueryData(
              "getIncompleteTasks",
              listId,
              (draftTasks) => {
                if (!task.completed) {
                  delete draftTasks[task.id];
                } else {
                  draftTasks[task.id] = { ...task, completed: false };
                }
              },
            ),
          );
          const incompltedTaskOrderPatchResult = dispatch(
            taskApiSlice.util.updateQueryData(
              "getIncompleteTaskOrder",
              listId,
              (draftOrder) => {
                if (!task.completed) {
                  const deleteIndex = draftOrder.findIndex(
                    (t) => t.id === task.id,
                  );
                  if (deleteIndex !== -1) {
                    draftOrder.splice(deleteIndex, 1);
                  }
                } else {
                  draftOrder.push({
                    id: task.id,
                    orderIndex: draftOrder.length,
                  });
                }
              },
            ),
          );
          const compltedTaskPatchResult = dispatch(
            taskApiSlice.util.updateQueryData(
              "getCompleteTasks",
              listId,
              (draftTasks) => {
                if (task.completed) {
                  delete draftTasks[task.id];
                } else {
                  draftTasks[task.id] = { ...task, completed: true };
                }
              },
            ),
          );
          const compltedTaskOrderPatchResult = dispatch(
            taskApiSlice.util.updateQueryData(
              "getCompleteTaskOrder",
              listId,
              (draftOrder) => {
                if (task.completed) {
                  const deleteIndex = draftOrder.findIndex(
                    (t) => t.id === task.id,
                  );
                  if (deleteIndex !== -1) {
                    draftOrder.splice(deleteIndex, 1);
                  }
                } else {
                  draftOrder.push({
                    id: task.id,
                    orderIndex: draftOrder.length,
                  });
                }
              },
            ),
          );
          await queryFulfilled.catch(() => {
            incompltedTaskPatchResult.undo();
            incompltedTaskOrderPatchResult.undo();
            compltedTaskPatchResult.undo();
            compltedTaskOrderPatchResult.undo();
            logError("error completing task");
          });
        },
      },
    ),
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
          taskApiSlice.util.updateQueryData(
            "getIncompleteTasks",
            listId,
            (draftTasks) => {
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
            },
          ),
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
          taskApiSlice.util.updateQueryData(
            "getIncompleteTaskOrder",
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
        const taskPatchResult = dispatch(
          taskApiSlice.util.updateQueryData(
            "getCompleteTasks",
            listId,
            (draft) => {
              for (const key of Object.keys(draft)) {
                delete draft[key];
              }
            },
          ),
        );
        const taskOrderPatchResult = dispatch(
          taskApiSlice.util.updateQueryData(
            "getCompleteTaskOrder",
            listId,
            (darftTaskOrder) => {
              //empty array
              darftTaskOrder.length = 0;
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
  overrideExisting: false,
});

export const {
  useGetCompleteTaskOrderQuery,
  useGetCompleteTasksQuery,
  useGetIncompleteTasksQuery,
  useAddNewTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
  useClearCompletedTasksMutation,
  useMoveTaskOrderMutation,
  useGetIncompleteTaskOrderQuery,
  useToggleTaskCompetionMutation,
} = taskApiSlice;
