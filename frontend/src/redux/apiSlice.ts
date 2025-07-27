import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiUrl = `${import.meta.env.VITE_BACKEND_APP_API_URL}/taskLists`;

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: apiUrl }),
  tagTypes: [
    "IncompleteTasks",
    "IncompleteTasksOrder",
    "CompleteTasks",
    "CompleteTasksOrder",
    "TaskList",
    "TaskListOrder",
  ],
  endpoints: () => ({}),
});
