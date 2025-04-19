export interface Task {
  label: string;
  completed: boolean;
  id: string;
}

export interface TaskProp {
  item: Task;
  setTasks: React.Dispatch<React.SetStateAction<Map<string, Task>>>;
}
