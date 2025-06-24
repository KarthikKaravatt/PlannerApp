import { produce } from "immer";
import type {
  TaskComponentAction,
  TaskComponentState,
} from "@/types/taskReducer";

export const taskComponentReducer = (
  state: TaskComponentState,
  action: TaskComponentAction,
): TaskComponentState => {
  switch (action.type) {
    case "MUTATE_INPUT": {
      const filteredInput = action.payload.replace(/\s+/g, " ");
      return produce(state, (draftState) => {
        draftState.inputTaskName =
          filteredInput.length < 512 ? filteredInput : state.inputTaskName;
      });
    }
    case "MUTATE_LOADING":
      return { ...state, isLoading: action.payload };
  }
};
