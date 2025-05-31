import { useUpdateTaskMutation } from "@/redux/api/apiSlice";
import type { Task } from "@/schemas/taskList";
import type {
	TaskComponentAction,
	TaskComponentState,
} from "@/types/taskReducer";
import { logError } from "@/util/console";
import { DateTime } from "luxon";

export const useTaskDueDate = (
	task: Task,
	state: TaskComponentState,
	dispatch: React.ActionDispatch<[action: TaskComponentAction]>,
) => {
	const [updateTask, { isLoading }] = useUpdateTaskMutation();
	const onDateButtonClicked = (inputValue: string) => {
		dispatch({ type: "MUTATE_LOADING", payload: true });
		if (state.editable) {
			return;
		}
		const date = DateTime.fromFormat(inputValue, "yyyy-MM-dd'T'HH:mm");
		// biome-ignore lint/style/useDefaultSwitchClause: Discriminated union
		switch (task.kind) {
			case "withDate": {
				if (date.isValid) {
					const isoDate = date.toISO();
					updateTask({ ...task, dueDate: isoDate }).catch((err: unknown) => {
						if (err instanceof Error) {
							logError("Error updating task:", err);
						}
					});
				}
				dispatch({ type: "MUTATE_LOADING", payload: false });
				break;
			}
			case "withoutDate": {
				dispatch({ type: "MUTATE_LOADING", payload: false });
				return;
			}
		}
	};
	return {
		isLoading,
		onDateButtonClicked,
	};
};
