export const LOCAL_STORAGE_TASKS = "Tasks";

export const LOCAL_STORAGE_TASKS_CUSTOM_SORT = "TasksCustomSortOrder";

export const DRAG_ITEM_ID_KEY = "TaskID";

const FilterOption = {
  all: "ALL",
  incomplete: "INCOMPLETE",
  complete: "COMPLETE",
} as const;
export type FilterOption = (typeof FilterOption)[keyof typeof FilterOption];

const SortOption = {
  custom: "CUSTOM",
  date: "DATE",
  name: "NAME",
} as const;

export type SortOption = (typeof SortOption)[keyof typeof SortOption];
