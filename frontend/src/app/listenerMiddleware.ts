import { addListener, createListenerMiddleware } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "./store";

export const listenerMiddleware = createListenerMiddleware();

export const startAppListening = listenerMiddleware.stopListening.withTypes<
	RootState,
	AppDispatch
>();
export type AppStartListening = typeof startAppListening;
export const addAppListner = addListener.withTypes<RootState, AppDispatch>();
export type AppAddListener = typeof addAppListner;
