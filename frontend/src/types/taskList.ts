export const LOCAL_STORAGE_TASKS = "Tasks";

export const LOCAL_STORAGE_TASKS_CUSTOM_SORT = "TasksCustomSortOrder";

export const DRAG_ITEM_ID_KEY = "TaskID";

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

export type SORT_OPTION = (typeof SORT_OPTION)[keyof typeof SORT_OPTION];
