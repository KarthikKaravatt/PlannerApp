import {
	useDeleteTaskMutation,
	useUpdateTaskMutation,
} from "@/features/api/apiSlice";
import { useDragAndDrop } from "@/hooks/taslkList/useDragAndDrop";
import { useTaskDueDate } from "@/hooks/taslkList/useTaskDueDate";
import { useTaskLabelEditing } from "@/hooks/taslkList/useTaskLabelEdditing";
import type { Task } from "@/schemas/taskList";
import type {
	CheckBoxProp,
	DueDateProp,
	MoreOptionsProp,
	TaskProp,
} from "@/types/taskList";
import { useRef, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaCheck } from "react-icons/fa6";

const TaskComponent: React.FC<TaskProp> = ({ item: task }) => {
	const {
		isUpdateLoading,
		label,
		handleLabelChange,
		editable,
		enableEditMode,
		handleExitEditMode,
	} = useTaskLabelEditing(task);
	const { onDragStart, onDragOver, onDrop } = useDragAndDrop(task);
	return (
		<div
			className={`
        flex items-center 
        dark:bg-dark-background-c bg-sky-100 
        ${isUpdateLoading ? "dark:text-gray-300" : "dark:text-white"}
        ${isUpdateLoading ? "text-gray-400" : "text-blue-950"}
        dark:border-white border-gray-300 
        border-2
        rounded-lg h-10 w-75
        shadow
      `}
		>
			<li
				draggable={true}
				key={task.id}
				className="flex flex-row gap-2 items-center pr-2 pl-2"
				onDragStart={(event) => {
					onDragStart(task, event);
				}}
				onDragOver={(event) => {
					onDragOver(event);
				}}
				onDrop={(event) => {
					onDrop(event);
				}}
			>
				<CheckBox editable={editable} task={task} />
				<input
					className={`
            w-full 
            outline-none 
            ${!editable ? "dark:caret-dark-background-c" : "dark:caret-white"}
            ${!editable ? "caret-blue-100" : "caret-gray-400"}
          `}
					readOnly={!editable}
					onDoubleClick={enableEditMode}
					type="text"
					onChange={(event) => {
						handleLabelChange(event.target.value);
					}}
					value={editable ? label : task.label}
				/>
				<DueDateDisplay editable={editable} task={task} />
				<MoreOptions
					editable={editable}
					task={task}
					handleExitEditMode={handleExitEditMode}
				/>
			</li>
		</div>
	);
};
const CheckBox: React.FC<CheckBoxProp> = ({ task, editable }) => {
	const [updateTask, { isLoading }] = useUpdateTaskMutation();
	const handleClick = () => {
		if (editable || isLoading) {
			return;
		}
		updateTask({ ...task, completed: !task.completed }).catch(
			(err: unknown) => {
				console.error("Failed to update task completion:", err);
			},
		);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			handleClick();
		}
	};

	const isInteractive = !editable && !isLoading;

	return (
		<>
			<div
				onClick={
					isInteractive
						? () => {
								handleClick();
							}
						: undefined
				}
				className={`
          w-5.5 h-4.5 
          ${task.completed ? "bg-green-500" : "dark:bg-dark-background-c"} 
          rounded-full text-xl border-2 
          ${task.completed ? "border-green-900" : "border-gray-500"}
          ${isInteractive ? "cursor-pointer" : "cursor-default"}
          ${isLoading ? "opacity-50" : ""}
        `}
				tabIndex={isInteractive ? 0 : -1}
				onKeyDown={
					isInteractive
						? (event) => {
								handleKeyDown(event);
							}
						: undefined
				}
				role="checkbox"
				aria-checked={task.completed}
				aria-disabled={!isInteractive}
			/>
		</>
	);
};
const DueDateDisplay: React.FC<DueDateProp> = ({ task, editable }) => {
	const dateInputRef = useRef<HTMLInputElement>(null);
	const { isLoading, formatedDate, inputDate, onDateButtonClicked } =
		useTaskDueDate(task, editable);
	const handleButtonClick = () => {
		//FIX: Positioning is not aligned with the button on Firefox
		dateInputRef.current?.showPicker();
	};

	return (
		<>
			<div
				className={`
          ${isLoading ? "dark:text-gray-300" : "dark:text-white"}
          ${isLoading ? "text-gray-400" : "text-blue-950"}
          text-xs p-2
        `}
			>
				<button type="button" onClick={handleButtonClick}>
					{formatedDate}
				</button>
				<input
					type="datetime-local"
					ref={dateInputRef}
					value={inputDate}
					onChange={(event) => {
						onDateButtonClicked(event);
					}}
					hidden={true}
				/>
			</div>
		</>
	);
};
const MoreOptions: React.FC<MoreOptionsProp> = ({
	task,
	editable,
	handleExitEditMode,
}) => {
	const popOverID = `popOver: ${task.id}`;
	const buttonRef = useRef<HTMLButtonElement>(null);
	const popoverRef = useRef<HTMLDivElement>(null);
	//Prevent flickering as the popover position is changed
	const [isHidden, setIsHidden] = useState(true);
	const [deleteTask] = useDeleteTaskMutation();
	const onTrashButtonClicked = (task: Task) => {
		deleteTask(task.id).catch((err: unknown) => {
			if (err instanceof Error) {
				console.error(`Error removing tasks:${err}`);
			}
		});
	};
	const onConfirmClicked = () => {
		handleExitEditMode();
	};

	const handlePopoverToggle = (event: React.SyntheticEvent<HTMLDivElement>) => {
		const popoverElement = popoverRef.current;
		const buttonElement = buttonRef.current;

		const nativeToggleEvent = event.nativeEvent as ToggleEvent;

		if (
			popoverElement &&
			buttonElement &&
			nativeToggleEvent.newState === "open"
		) {
			const buttonRect = buttonElement.getBoundingClientRect();

			popoverElement.style.top = `${(
				buttonRect.bottom + window.scrollY
			).toString()}px`;
			popoverElement.style.left = `${(
				buttonRect.left +
					buttonRect.width / 2 -
					popoverElement.offsetWidth / 2 +
					window.scrollX
			).toString()}px`;
			setIsHidden(false);
		} else {
			setIsHidden(true);
		}
	};

	return (
		<>
			<div
				className="
          flex flex-row items-center gap-0
        "
			>
				<button
					ref={buttonRef}
					popoverTarget={popOverID}
					type="button"
					className="text-lg"
				>
					<BsThreeDots className="text-blue-950 dark:text-white" />
				</button>
				<button
					type="button"
					className="text-sm pl-2 text-green-700 dark:text-green-400"
					hidden={!editable}
					onClick={onConfirmClicked}
				>
					<FaCheck />
				</button>
			</div>
			<div
				ref={popoverRef}
				hidden={isHidden}
				id={popOverID}
				popover="auto"
				className="
          absolute align-middle
          text-xs dark:text-white
          dark:bg-dark-background-c bg-blue-100
          border-2 border-gray-300 dark:border-gray-200
          p-1 rounded
        "
				style={{ inset: "unset" }}
				onToggle={handlePopoverToggle}
			>
				<button
					onClick={() => {
						onTrashButtonClicked(task);
					}}
					type="button"
				>
					Delete
				</button>
			</div>
		</>
	);
};

export default TaskComponent;
