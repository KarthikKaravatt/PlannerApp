import { useUpdateTaskMutation } from "@/redux/api/apiSlice";
import type { TaskComponentState } from "@/types/taskReducer";
import { DateTime } from "luxon";
import { type ChangeEvent, useState } from "react";

export const useTaskDueDate = (state: TaskComponentState) => {
	const taskDueDate = DateTime.fromISO(state.task.dueDate);
	const dateFormat = "dd LLL";
	const [formatedDate, setFormatedDate] = useState(() => {
		if (taskDueDate.isValid) {
			return DateTime.fromISO(state.task.dueDate).toFormat(dateFormat);
		}
		return "Invalid";
	});
	const [updateTask, { isLoading }] = useUpdateTaskMutation();
	const [inputDate, setInputDate] = useState(
		DateTime.fromISO(state.task.dueDate).toFormat("yyyy-MM-dd'T'HH:mm"),
	);
	const onDateButtonClicked = (event: ChangeEvent<HTMLInputElement>) => {
		if (state.editable) return;
		const date = DateTime.fromFormat(event.target.value, "yyyy-MM-dd'T'HH:mm");
		if (date.isValid) {
			updateTask({ ...state.task, dueDate: date.toISO() })
				.then(() => {
					setInputDate(event.target.value);
					setFormatedDate(date.toFormat(dateFormat));
				})
				.catch((err: unknown) => {
					if (err instanceof Error) {
						console.log(`Error updating task:${err}`);
					}
				});
		}
	};
	return {
		isLoading,
		formatedDate,
		inputDate,
		onDateButtonClicked,
	};
};
