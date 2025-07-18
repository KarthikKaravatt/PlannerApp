import {
  addListener,
  configureStore,
  createListenerMiddleware,
} from "@reduxjs/toolkit";
import { apiSlice } from "@/redux/apiSlice";
import { uiReducer } from "@/redux/uiSlice";

const listenerMiddleware = createListenerMiddleware();

export const startAppListening = listenerMiddleware.stopListening.withTypes<
  RootState,
  AppDispatch
>();
export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleweare) =>
    getDefaultMiddleweare()
      .prepend(listenerMiddleware.middleware)
      .concat(apiSlice.middleware),
});

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export type AppStartListening = typeof startAppListening;
export const addAppListner = addListener.withTypes<RootState, AppDispatch>();
export type AppAddListener = typeof addAppListner;
