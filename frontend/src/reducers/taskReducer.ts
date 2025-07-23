import { produce } from "immer";
import type {
  TaskComponentAction,
  TaskComponentState,
} from "@/types/taskReducer";

const INPUT_LIMIT = 512;

export const taskComponentReducer = (
  state: TaskComponentState,
  action: TaskComponentAction,
): TaskComponentState => {
  switch (action.type) {
    case "MUTATE_INPUT": {
      const filteredInput = action.payload.replace(/\s+/g, " ");
      return produce(state, (draftState) => {
        draftState.inputTaskName =
          filteredInput.length < INPUT_LIMIT
            ? filteredInput
            : state.inputTaskName;
      });
    }
    case "MUTATE_EDITING": {
      return { ...state, isEditing: action.payload };
    }
  }
};
