import { apiSlice } from "@/features/api/apiSlice";
import tasksReducer from "@/features/tasks/tasksSlice";
import { configureStore } from "@reduxjs/toolkit";
import { listenerMiddleware } from "./listenerMiddleware";

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
