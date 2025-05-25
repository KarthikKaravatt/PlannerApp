import { useAddNewTaskMutation } from "@/redux/api/apiSlice";
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
			<div
				className="
          flex rounded-lg
          border-2
          border-gray-300 dark:border-white
          h-10 w-75
        "
			>
				<input
					className="
            text-blue-950 dark:text-white
            dark:placeholder-gray-300
            outline-none
            h-10 p-1
          "
					placeholder="Enter new task"
					onChange={onInputChanged}
					value={inputTask}
				/>
				<button
					disabled={isLoading}
					className="
            w-1/3
            bg-blue-200
            dark:bg-white
            dark:text-black
            rounded-l-lg
            p-1
          
          "
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
