import { useUpdateTaskMutation } from "@/features/api/apiSlice";
import type { Task } from "@/schemas/taskList";
import { DateTime } from "luxon";
import { type ChangeEvent, useState } from "react";

export const useTaskDueDate = (task: Task, editable: boolean) => {
	const taskDueDate = DateTime.fromISO(task.dueDate);
	const dateFormat = "dd LLL";
	const [formatedDate, setFormatedDate] = useState(() => {
		if (taskDueDate.isValid) {
			return DateTime.fromISO(task.dueDate).toFormat(dateFormat);
		}
		return "Invalid";
	});
	const [updateTask, { isLoading }] = useUpdateTaskMutation();
	const [inputDate, setInputDate] = useState(
		DateTime.fromISO(task.dueDate).toFormat("yyyy-MM-dd'T'HH:mm"),
	);
	const onDateButtonClicked = (event: ChangeEvent<HTMLInputElement>) => {
		if (editable) return;
		const date = DateTime.fromFormat(event.target.value, "yyyy-MM-dd'T'HH:mm");
		if (date.isValid) {
			updateTask({ ...task, dueDate: date.toISO() })
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
