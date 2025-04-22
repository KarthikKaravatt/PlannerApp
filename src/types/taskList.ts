export interface Task {
  label: string;
  completed: boolean;
  id: string;
}

export interface TaskProp {
  item: Task;
  setTasks: React.Dispatch<React.SetStateAction<Map<string, Task>>>;
}

const FILTER_STATE = {
  ALL: "ALL",
  INCOMPLETE: "INCOMPLETE",
  COMPLETE: "COMPLETE",
} as const;

export type FILTER_STATE = (typeof FILTER_STATE)[keyof typeof FILTER_STATE];
