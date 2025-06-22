export interface TaskListState {
  input: string;
  editable: boolean;
  loading: boolean;
}

const TaskListComponentActions = {
  mutateInputAction: "MUTATE_INPUT_ACTION",
  mutateEditableAction: "MUTATE_EDITABLE_ACTION",
  mutateLoadingAction: "MUTATE_LOADING_ACTION",
} as const;

export type TaskListComponentActions =
  (typeof TaskListComponentActions)[keyof typeof TaskListComponentActions];

interface MutateInputAction {
  type: "MUTATE_INPUT_ACTION";
  payload: string;
}

interface MutateEditableAction {
  type: "MUTATE_EDITABLE_ACTION";
  payload: boolean;
}

interface MutateLoadingAction {
  type: "MUTATE_LOADING_ACTION";
  payload: boolean;
}

export type TaskListActions =
  | MutateInputAction
  | MutateEditableAction
  | MutateLoadingAction;
