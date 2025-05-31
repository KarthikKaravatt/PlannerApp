export interface TaskComponentState {
	inputTaskName: string;
	editable: boolean;
	isLoading: boolean;
	formatedDate: string;
}

const TaskComponentActions = {
	mutateInput: "MUTATE_INPUT",
	mutateLoading: "MUTATE_LOADING",
	mutateEditable: "MUTATE_EDITABLE",
	mutateFormatedDate: "MUTATE_FORMATED_DATE",
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

interface MutateFormatedDateAction {
	type: "MUTATE_FORMATED_DATE";
	payload: string;
}

export type TaskComponentAction =
	| MutateInputAction
	| MutateLoading
	| MutateFormatedDateAction
	| MutateEditable;
