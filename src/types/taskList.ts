import type { DateTime } from "luxon";

export const LOCAL_STORAGE_TASKS = "Tasks";

export const LOCAL_STORAGE_TASKS_CUSTOM_SORT = "TasksCustomSortOrder";

export const DRAG_ITEM_ID_KEY = "TaskID";

export interface Task {
  label: string;
  completed: boolean;
  id: string;
  date: DateTime;
}
const FILTER_OPTION = {
  ALL: "ALL",
  INCOMPLETE: "INCOMPLETE",
  COMPLETE: "COMPLETE",
} as const;
export type FILTER_OPTION = (typeof FILTER_OPTION)[keyof typeof FILTER_OPTION];

const SORT_OPTION = {
  CUSTOM: "CUSTOM",
  DATE: "DATE",
  NAME: "NAME",
} as const;

export interface TaskListState {
  taskList: Map<string, Task>;
  order: string[];
}
export interface AddTaskAction {
  type: "ADD_TASK";
  task: Task;
}

export interface RenameTask {
  type: "RENAME_TASK";
  taskID: string;
  newName: string;
}

export interface UpdateDate {
  type: "UPDATE_DATE";
  date: DateTime;
  id: string;
}

export interface RemoveTaskAction {
  type: "REMOVE_TASK";
  taskID: string;
}

export interface ClearCompletedAction {
  type: "CLEAR_COMPLETED";
}

export interface CompleteTaskAction {
  type: "CHANGE_TASK_COMPLETION";
  taskID: string;
  completed: boolean;
}

export interface SwapTaskOrder {
  type: "SWAP_TASK_ORDER";
  taskID_A: string;
  taskID_B: string;
}

export type TaskListAction =
  | AddTaskAction
  | RemoveTaskAction
  | ClearCompletedAction
  | CompleteTaskAction
  | RenameTask
  | SwapTaskOrder
  | UpdateDate;

export type SORT_OPTION = (typeof SORT_OPTION)[keyof typeof SORT_OPTION];

export interface TaskProp {
  item: Task;
  sortOption: SORT_OPTION;
  setSortOption: React.Dispatch<React.SetStateAction<SORT_OPTION>>;
  dispatch: React.ActionDispatch<[action: TaskListAction]>;
}

export interface TaskListOptionsProp {
  filterState: FILTER_OPTION;
  setFilterState: React.Dispatch<React.SetStateAction<FILTER_OPTION>>;
  dispatch: React.ActionDispatch<[action: TaskListAction]>;
  setSortState: React.Dispatch<React.SetStateAction<SORT_OPTION>>;
}
