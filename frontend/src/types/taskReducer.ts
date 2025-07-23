export interface TaskComponentState {
  inputTaskName: string;
  isEditing: boolean;
  isLoading: boolean;
  taskListId: string;
}

const TaskComponentActions = {
  mutateInput: "MUTATE_INPUT",
  mutateEditing: "MUTATE_EDITING",
} as const;
export type TaskComponentActions =
  (typeof TaskComponentActions)[keyof typeof TaskComponentActions];

interface MutateInputAction {
  type: "MUTATE_INPUT";
  payload: string;
}

interface MutateEditingAction {
  type: "MUTATE_EDITING";
  payload: boolean;
}

export type TaskComponentAction = MutateInputAction | MutateEditingAction;

export interface TaskState {
  editingTaskId: string | null;
}

export interface AllTaskState {
  [taskListId: string]: TaskState;
}
