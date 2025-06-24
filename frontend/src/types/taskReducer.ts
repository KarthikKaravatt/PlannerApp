export interface TaskComponentState {
  inputTaskName: string;
  isLoading: boolean;
  taskListId: string;
}

const TaskComponentActions = {
  mutateInput: "MUTATE_INPUT",
  mutateLoading: "MUTATE_LOADING",
} as const;
export type TaskComponentActions =
  (typeof TaskComponentActions)[keyof typeof TaskComponentActions];

interface MutateInputAction {
  type: "MUTATE_INPUT";
  payload: string;
}

interface MutateLoading {
  type: "MUTATE_LOADING";
  payload: boolean;
}

export type TaskComponentAction = MutateInputAction | MutateLoading;
