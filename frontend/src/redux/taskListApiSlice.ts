import { v7 as uuidv7 } from "uuid";
import { z } from "zod";
import {
  type TaskList,
  type TaskListOrder,
  taskListOrderSchema,
  taskListSchema,
} from "@/schemas/taskList";
import type {
  MoveTaskListRequest,
  NewTaskListRequest,
  TaskListUpdateRequest,
} from "@/types/api.ts";
import { logError } from "@/util/console";
import { apiSlice } from "./apiSlice.ts";

const taskListApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTaskLists: builder.query<Record<string, TaskList>, void>({
      query: () => ({
        url: "/taskLists",
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
        url: "/taskLists/order",
        method: "GET",
      }),
      responseSchema: z.array(taskListOrderSchema),
      providesTags: ["TaskListOrder"],
    }),
    addNewTaskList: builder.mutation<TaskList, NewTaskListRequest>({
      query: (request) => ({
        url: "/taskLists",
        method: "PUT",
        body: request,
      }),
      responseSchema: taskListSchema,
      async onQueryStarted(newTaskListRequest, { dispatch, queryFulfilled }) {
        const tempId = uuidv7();
        const addNewTaskListMutation = dispatch(
          taskListApiSlice.util.updateQueryData(
            "getTaskLists",
            undefined,
            (draftTaskList) => {
              draftTaskList[tempId] = { ...newTaskListRequest, id: tempId };
            },
          ),
        );
        const addNewTaskListOrderMutation = dispatch(
          taskListApiSlice.util.updateQueryData(
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
              taskListApiSlice.util.updateQueryData(
                "getTaskLists",
                undefined,
                (draftTasksList) => {
                  delete draftTasksList[tempId];
                  draftTasksList[response.data.id] = response.data;
                },
              ),
            );
            dispatch(
              taskListApiSlice.util.updateQueryData(
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
        url: `/taskLists/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const updateTaskListData = dispatch(
          taskListApiSlice.util.updateQueryData(
            "getTaskLists",
            undefined,
            (draftTaskList) => {
              delete draftTaskList[id];
            },
          ),
        );
        const updateTaskListOrderData = dispatch(
          taskListApiSlice.util.updateQueryData(
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
        url: `/taskLists/${data.listId}`,
        method: "PATCH",
        body: data.request,
      }),
      async onQueryStarted(taskListPayload, { dispatch, queryFulfilled }) {
        const updateTaskListName = dispatch(
          taskListApiSlice.util.updateQueryData(
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
        url: `/taskLists/move/${data.moveId}`,
        method: "PATCH",
        body: data.request,
      }),
      async onQueryStarted({ moveId, request }, { dispatch, queryFulfilled }) {
        const taskListOrderUpdate = dispatch(
          taskListApiSlice.util.updateQueryData(
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
  }),
  overrideExisting: false,
});

export const {
  useGetTaskListsQuery,
  useAddNewTaskListMutation,
  useRemoveTaskListMutation,
  useUpdateTaskListMutation,
  useGetTaskListOrderQuery,
  useMoveTaskListMutation,
} = taskListApiSlice;
