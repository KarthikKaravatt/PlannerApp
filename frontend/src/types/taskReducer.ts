import type { Task } from "@/schemas/taskList";

export interface TaskComponentState {
	task: Task;
	inputTaskName: string;
	editable: boolean;
	isLoading: boolean;
}

const TASK_COMPONENT_ACTIONS = {
	MUTATE_INPUT: "MUTATE_INPUT",
	MUTATE_LOADING: "MUTATE_LOADING",
	MUTATE_EDITABLE: "MUTATE_EDITABLE",
} as const;
export type TASK_COMPONENT_ACTIONS =
	(typeof TASK_COMPONENT_ACTIONS)[keyof typeof TASK_COMPONENT_ACTIONS];

interface MutateInputAction {
	type: "MUTATE_INPUT";
	payload: string;
}

interface MutateLoading {
	type: "MUTATE_LOADING";
	payload: boolean;
}

interface MutateEditable {
	type: "MUTATE_EDITABLE";
	payload: boolean;
}

export type TaskComponentAction =
	| MutateInputAction
	| MutateLoading
	| MutateEditable;
