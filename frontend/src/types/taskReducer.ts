export interface TaskComponentState {
  inputTaskName: string;
  isEditing: boolean;
  isLoading: boolean;
  taskListId: string;
}

const TaskComponentActions = {
  mutateInput: "MUTATE_INPUT",
  mutateEditing: "MUTATE_EDITING",
  mutateLoading: "MUTATE_LOADING",
} as const;
export type TaskComponentActions =
  (typeof TaskComponentActions)[keyof typeof TaskComponentActions];

interface MutateInputAction {
  type: "MUTATE_INPUT";
  payload: string;
}

interface MutateLoadingAction {
  type: "MUTATE_LOADING";
  payload: boolean;
}
interface MutateEditingAction {
  type: "MUTATE_EDITING";
  payload: boolean;
}

export type TaskComponentAction =
  | MutateInputAction
  | MutateLoadingAction
  | MutateEditingAction;

export interface TaskState {
  editingTaskId: string | null;
}

export interface AllTaskState {
  [taskListId: string]: TaskState;
}
