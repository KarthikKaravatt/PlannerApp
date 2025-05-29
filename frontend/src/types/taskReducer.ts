export interface TaskComponentState {
	inputTaskName: string;
	editable: boolean;
	isLoading: boolean;
	formatedDate: string;
}

const TASK_COMPONENT_ACTIONS = {
	MUTATE_INPUT: "MUTATE_INPUT",
	MUTATE_LOADING: "MUTATE_LOADING",
	MUTATE_EDITABLE: "MUTATE_EDITABLE",
	MUTATE_FORMATED_DATE: "MUTATE_FORMATED_DATE",
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

interface MutateFormatedDateAction {
	type: "MUTATE_FORMATED_DATE";
	payload: string;
}

export type TaskComponentAction =
	| MutateInputAction
	| MutateLoading
	| MutateFormatedDateAction
	| MutateEditable;
