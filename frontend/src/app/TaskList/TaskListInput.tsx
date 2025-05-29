import { useAddNewTaskMutation } from "@/redux/api/apiSlice";
import { type ChangeEvent, useState } from "react";
import AutoResizeTextInput from "../General/AutoResizeTextArea";

const InputTask: React.FC = () => {
	const [inputTask, setInputTask] = useState<string>("");
	const [addNewTask, { isLoading }] = useAddNewTaskMutation();
	const onInputChanged = (event: ChangeEvent<HTMLTextAreaElement>) => {
		setInputTask(event.target.value.replace(/\s+/g, " "));
	};
	const onAddButtonClick = () => {
		addNewTask({
			label: inputTask,
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
          w-full
          p-1
        "
			>
				<AutoResizeTextInput
					className="
            text-blue-950 dark:text-white
            dark:placeholder-gray-300
            outline-none
            w-2/3
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
            rounded-lg
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
