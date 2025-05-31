import type {
	TaskComponentAction,
	TaskComponentState,
} from "@/types/taskReducer";
import { DateTime } from "luxon";

export const taskComponentReducer = (
	state: TaskComponentState,
	action: TaskComponentAction,
): TaskComponentState => {
	// biome-ignore lint/style/useDefaultSwitchClause: This is using and "enum" so adding a default case means we may not deal with all cases
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
		case "MUTATE_FORMATED_DATE": {
			const dateFormat = "dd LLL";
			const formatedDate = (() => {
				if (DateTime.fromISO(action.payload).isValid) {
					return DateTime.fromISO(action.payload).toFormat(dateFormat);
				}
				return "";
			})();
			return { ...state, formatedDate: formatedDate };
		}
	}
};
