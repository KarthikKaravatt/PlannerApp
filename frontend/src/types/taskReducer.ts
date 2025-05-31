export interface TaskComponentState {
	inputTaskName: string;
	editable: boolean;
	isLoading: boolean;
}

const TaskComponentActions = {
	mutateInput: "MUTATE_INPUT",
	mutateLoading: "MUTATE_LOADING",
	mutateEditable: "MUTATE_EDITABLE",
} as const;
export type TaskComponentActions =
	(typeof TaskComponentActions)[keyof typeof TaskComponentActions];

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
