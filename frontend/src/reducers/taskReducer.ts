import type {
	TaskComponentAction,
	TaskComponentState,
} from "@/types/taskReducer";

export const taskComponentReducer = (
	state: TaskComponentState,
	action: TaskComponentAction,
): TaskComponentState => {
	// biome-ignore lint/style/useDefaultSwitchClause: This is using and "enum" so adding a default case means we may not deal with all cases
	switch (action.type) {
		case "MUTATE_INPUT": {
			const filteredInput = action.payload.replace(/\s+/g, " ");
			return {
				...state,
				//Remove new lines and normalise spaces
				inputTaskName:
					filteredInput.length < 512 ? filteredInput : state.inputTaskName,
			};
		}
		case "MUTATE_LOADING":
			return { ...state, isLoading: action.payload };
		case "MUTATE_EDITABLE":
			return { ...state, editable: action.payload };
	}
};
