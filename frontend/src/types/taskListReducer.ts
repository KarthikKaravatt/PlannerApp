import { produce } from "immer";
import type {
  TaskListActions,
  TaskListState,
} from "@/reducers/taskListReducer";

export const taskListReducer = (
  state: TaskListState,
  action: TaskListActions,
): TaskListState => {
  switch (action.type) {
    case "MUTATE_INPUT_ACTION": {
      const filteredInput = action.payload.replace(/\s+/g, " ");
      return produce(state, (draftState) => {
        draftState.input =
          filteredInput.length > 20
            ? filteredInput.slice(0, 20)
            : filteredInput;
      });
    }
    case "MUTATE_LOADING_ACTION": {
      return produce(state, (draftState) => {
        draftState.loading = action.payload;
      });
    }
  }
};
