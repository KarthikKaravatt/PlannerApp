import {
	useDeleteTaskMutation,
	useSwapTaskOrderMutation,
	useUpdateTaskMutation,
} from "@/features/api/apiSlice";
import type { Task } from "@/schemas/taskList";
import {
	type CheckBoxProp,
	DRAG_ITEM_ID_KEY,
	type DueDateProp,
	type MoreOptionsProp,
	type TaskProp,
} from "@/types/taskList";
import { DateTime } from "luxon";
import { type ChangeEvent, type DragEvent, useRef, useState } from "react";

const TaskComponent: React.FC<TaskProp> = ({ item: task }) => {
	const [updateTask, { isLoading: isUpdateLoading }] = useUpdateTaskMutation();
	const [label, setLabel] = useState(task.label);
	const [editable, setEditable] = useState(false);
	const [swapTasks] = useSwapTaskOrderMutation();

	const onDragStart = (item: Task, event: DragEvent<HTMLSpanElement>) => {
		event.dataTransfer.setData(DRAG_ITEM_ID_KEY, item.id);
	};
	const onDragOver = (event: DragEvent<HTMLSpanElement>) => {
		event.preventDefault();
	};
	const onDrop = (event: DragEvent<HTMLSpanElement>) => {
		event.preventDefault();
		const swapIDString = event.dataTransfer.getData(DRAG_ITEM_ID_KEY);
		if (swapIDString !== "") {
			swapTasks({ id1: task.id, id2: swapIDString }).catch((err: unknown) => {
				if (err instanceof Error) {
					console.error(`Error swapping tasks${err}`);
				}
			});
		}
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
	return (
		<div
			className={`
      flex items-center 
      dark:bg-dark-background-c 
      ${isUpdateLoading ? "dark:text-gray-300" : "dark:text-white"}
      bg-sky-100 
      ${isUpdateLoading ? "text-gray-400" : "text-blue-950"}
      dark:border-white
      border-gray-300 
      border-2
      shadow
      rounded-lg 
      h-10 w-75`}
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
					draggable={true}
					onDoubleClick={() => {
						setEditable(true);
					}}
					type="text"
					onChange={(event) => {
						setLabel(event.target.value);
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

	const handleClick = async () => {
		if (editable || isLoading) {
			return;
		}
		try {
			await updateTask({ ...task, completed: !task.completed }).unwrap();
		} catch (err) {
			console.error("Failed to update task completion:", err);
		}
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			void handleClick();
		}
	};

	const isInteractive = !editable && !isLoading;

	return (
		<>
			<div
				onClick={isInteractive ? () => void handleClick() : undefined}
				className={`w-5.5 h-4.5 
                    ${task.completed ? "bg-green-500" : "dark:bg-dark-background-c"} 
                    rounded-full text-xl border-2 
                    ${task.completed ? "border-green-900" : "border-gray-500"}
                    ${isInteractive ? "cursor-pointer" : "cursor-default"}
                    ${isLoading ? "opacity-50" : ""}`}
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
					className="w-5 h-5"
				>
					<div className="flex flex-row items-center gap-0.5">
						<div className="w-1 h-1 rounded-full bg-blue-950 dark:bg-white" />
						<div className="w-1 h-1 rounded-full bg-blue-950 dark:bg-white" />
						<div className="w-1 h-1 rounded-full bg-blue-950 dark:bg-white" />
					</div>
				</button>
				{/* Kind of cool basically a rectangle rotated 45 degrees with
          only the bottom and right border*/}
				<button
					type="button"
					className="w-5 h-5.5"
					hidden={!editable}
					onClick={onConfirmClicked}
				>
					<div
						className="
            relative inline-block 
            w-4 h-4 
            overflow-hidden
            "
					>
						<div
							className="
              absolute 
              top-[0.25em] left-[0.4em] w-[0.25em] h-[0.5em] 
              dark:border-green-500 border-green-700 
              border-b-[0.1em] border-r-[0.1em] border-solid 
              transform rotate-45"
						>
							{}
						</div>
					</div>
				</button>
			</div>
			<div
				ref={popoverRef}
				hidden={isHidden}
				id={popOverID}
				popover="auto"
				className="
          absolute align-middle
          text-xs
          dark:text-white
          dark:bg-dark-background-c
          bg-blue-100
          border-2
          border-gray-300
          dark:border-gray-200
          p-1 rounded"
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
