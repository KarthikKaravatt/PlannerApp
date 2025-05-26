import type {
	TaskComponentAction,
	TaskComponentState,
} from "@/types/taskReducer";

export const taskComponentReducer = (
	state: TaskComponentState,
	action: TaskComponentAction,
): TaskComponentState => {
	switch (action.type) {
		case "MUTATE_INPUT":
			return {
				...state,
				//Remove new lines and normalise spaces
				inputTaskName: action.payload.replace(/\s+/g, " "),
			};
		case "MUTATE_LOADING":
			return { ...state, isLoading: action.payload };
		case "MUTATE_EDITABLE":
			return { ...state, editable: action.payload };
	}
};
