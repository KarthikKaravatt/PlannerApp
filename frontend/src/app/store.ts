import { apiSlice } from "@/redux/api/apiSlice";
import { tasksReducer } from "@/redux/tasks/tasksListSlice";
import { configureStore } from "@reduxjs/toolkit";
import { listenerMiddleware } from "./listenerMiddleware.ts";

export const store = configureStore({
	reducer: {
		tasks: tasksReducer,
		[apiSlice.reducerPath]: apiSlice.reducer,
	},
	middleware: (getDefaultMiddleweare) =>
		getDefaultMiddleweare()
			.prepend(listenerMiddleware.middleware)
			.concat(apiSlice.middleware),
});

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
