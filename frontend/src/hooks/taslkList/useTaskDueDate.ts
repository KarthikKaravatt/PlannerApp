import { useUpdateTaskMutation } from "@/redux/api/apiSlice";
import type { Task } from "@/schemas/taskList";
import type {
	TaskComponentAction,
	TaskComponentState,
} from "@/types/taskReducer";
import { DateTime } from "luxon";
import { type ChangeEvent, useState } from "react";

export const useTaskDueDate = (
	task: Task,
	state: TaskComponentState,
	dispatch: React.ActionDispatch<[action: TaskComponentAction]>,
) => {
	const [updateTask, { isLoading }] = useUpdateTaskMutation();
	const [inputDate, setInputDate] = useState(() => {
		if (task.kind === "withDate") {
			return DateTime.fromISO(task.dueDate).toFormat("yyyy-MM-dd'T'HH:mm");
		}
		return "";
	});
	const onDateButtonClicked = (event: ChangeEvent<HTMLInputElement>) => {
		if (state.editable) {
			return;
		}
		const date = DateTime.fromFormat(event.target.value, "yyyy-MM-dd'T'HH:mm");
		// biome-ignore lint/style/useDefaultSwitchClause: Discriminated union
		switch (task.kind) {
			case "withDate": {
				if (date.isValid) {
					const isoDate = date.toISO();
					updateTask({ ...task, dueDate: isoDate })
						.then(() => {
							setInputDate(event.target.value);
							dispatch({ type: "MUTATE_FORMATED_DATE", payload: isoDate });
						})
						.catch((err: unknown) => {
							if (err instanceof Error) {
								console.error(`Error updating task:${err}`);
							}
						});
				}
				break;
			}
			case "withoutDate": {
				setInputDate("");
			}
		}
	};
	return {
		isLoading,
		inputDate,
		onDateButtonClicked,
	};
};
