import type { Task } from "@/schemas/task";

interface NewTaskWithoutDatePayload {
  label: string;
  completed: boolean;
}
interface NewTaskWithDatePayload extends NewTaskWithoutDatePayload {
  dueDate: string;
}
export type NewTaskRequest = NewTaskWithDatePayload | NewTaskWithoutDatePayload;

export interface MoveTaskOrderPayload {
  id1: string;
  id2: string;
  listId: string;
  pos: "Before" | "After";
}

export interface NewTaskListRequest {
  name: string;
}

export interface TaskListUpdateRequest {
  name: string;
}

export interface MoveTaskListRequest {
  targetId: string;
  position: "Before" | "After";
}

export type TaskUpdate = Omit<Task, "kind" | "completed" | "id"> & {
  dueDate: string | null;
};
