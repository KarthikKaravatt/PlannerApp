import type { DateTime } from "luxon";

export interface Task {
  label: string;
  completed: boolean;
  id: string;
  date: DateTime;
}

export interface TaskProp {
  item: Task;
  setTasks: React.Dispatch<React.SetStateAction<Map<string, Task>>>;
}

export interface TaskListOptionsProp {
  filterState: FILTER_STATE;
  setFilterState: React.Dispatch<React.SetStateAction<FILTER_STATE>>;
  setTasks: React.Dispatch<React.SetStateAction<Map<string, Task>>>;
  setSortState: React.Dispatch<React.SetStateAction<SORT_STATE>>;
}

const FILTER_STATE = {
  ALL: "ALL",
  INCOMPLETE: "INCOMPLETE",
  COMPLETE: "COMPLETE",
} as const;

export type FILTER_STATE = (typeof FILTER_STATE)[keyof typeof FILTER_STATE];

const SORT_STATE = {
  CUSTOM: "CUSTOM",
  DATE: "DATE",
  NAME: "NAME",
} as const;

export type SORT_STATE = (typeof SORT_STATE)[keyof typeof SORT_STATE];

export const LOCAL_STORAGE_TASKS = "Tasks";

export const LOCAL_STORAGE_TASKS_CUSTOM_SORT = "TasksCustomSortOrder";
