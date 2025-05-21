import { useAddNewTaskMutation } from "@/features/api/apiSlice";
import { DateTime } from "luxon";
import { type ChangeEvent, useState } from "react";

const InputTask: React.FC = () => {
	const [inputTask, setInputTask] = useState<string>("");
	const [addNewTask, { isLoading }] = useAddNewTaskMutation();
	const onInputChanged = (event: ChangeEvent<HTMLInputElement>) => {
		setInputTask(event.target.value);
	};
	const onAddButtonClick = () => {
		addNewTask({
			label: inputTask,
			dueDate: DateTime.now().toISO(),
			completed: false,
		})
			.then(() => {
				setInputTask("");
			})
			.catch((err: unknown) => {
				if (err instanceof Error) {
					console.error(`Error adding a new task: ${err}`);
				}
			});
	};
	return (
		<>
			<div className="flex">
				<input
					className="border-1 p-1"
					placeholder="Task name"
					onChange={onInputChanged}
					value={inputTask}
				/>
				<button
					disabled={isLoading}
					className="border-1 p-1"
					type="button"
					onClick={onAddButtonClick}
				>
					Add task
				</button>
			</div>
		</>
	);
};

export default InputTask;
