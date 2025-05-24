import { useUpdateTaskMutation } from "@/features/api/apiSlice";
import type { Task } from "@/schemas/taskList";
import { useState } from "react";

export const useTaskLabelEditing = (task: Task) => {
	const [updateTask, { isLoading: isUpdateLoading }] = useUpdateTaskMutation();
	const [label, setLabel] = useState(task.label);
	const [editable, setEditable] = useState(false);

	const handleLabelChange = (newLabel: string) => {
		setLabel(newLabel);
	};
	const enableEditMode = () => {
		setEditable(true);
	};

	const handleExitEditMode = () => {
		if (task.label !== label) {
			updateTask({ ...task, label: label })
				.unwrap()
				.catch((err: unknown) => {
					setLabel(task.label);
					if (err instanceof Error) {
						console.error(`Error updating task: ${err}`);
					}
				});
		}
		setEditable(false);
	};
	return {
		isUpdateLoading,
		label,
		handleLabelChange,
		editable,
		enableEditMode,
		handleExitEditMode,
	};
};
