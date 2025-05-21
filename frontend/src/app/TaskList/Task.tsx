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

const TaskComponent: React.FC<TaskProp> = ({ item }) => {
	const [editable, setEditable] = useState(false);
	const [label, setLabel] = useState(item.label);
	//TODO: Use loading state
	const [swapTasks] = useSwapTaskOrderMutation();

	const onDragStart = (event: DragEvent<HTMLSpanElement>) => {
		event.dataTransfer.setData(DRAG_ITEM_ID_KEY, item.id);
	};
	const onDragOver = (event: DragEvent<HTMLSpanElement>) => {
		event.preventDefault();
	};
	const onDrop = (event: DragEvent<HTMLSpanElement>) => {
		//
		event.preventDefault();
		const swapIDString = event.dataTransfer.getData(DRAG_ITEM_ID_KEY);
		if (swapIDString !== "") {
			swapTasks({ id1: item.id, id2: swapIDString }).catch((err: unknown) => {
				if (err instanceof Error) {
					console.error(`Error swapping tasks${err}`);
				}
			});
		}
	};
	return (
		<div
			className="
      flex items-center 
      dark:bg-dark-background-c dark:text-white 
      bg-blue-200 text-blue-950
      dark:border-gray-50
      border-blue-950 
      border-1
      rounded-lg h-10"
		>
			<li
				draggable={true}
				key={item.id}
				className="flex flex-row gap-2 items-center pr-2 pl-2"
				onDragStart={(event) => {
					onDragStart(event);
				}}
				onDragOver={(event) => {
					onDragOver(event);
				}}
				onDrop={(event) => {
					onDrop(event);
				}}
			>
				<CheckBox editable={editable} task={item} />
				<input
					readOnly={!editable}
					draggable={true}
					onDoubleClick={() => {
						setEditable(true);
					}}
					type="text"
					onChange={(event) => {
						setLabel(event.target.value);
					}}
					value={label}
				/>
				<DueDateDisplay editable={editable} task={item} />
				<MoreOptions
					label={label}
					editable={editable}
					task={item}
					setEditable={setEditable}
				/>
			</li>
		</div>
	);
};

const CheckBox: React.FC<CheckBoxProp> = ({ task, editable }) => {
	const [isClicked, setIsClicked] = useState(task.completed);
	const [updateTask] = useUpdateTaskMutation();
	const onClick = () => {
		if (editable) return;
		updateTask({ ...task, completed: !isClicked })
			.then(() => {
				setIsClicked((prev) => {
					return !prev;
				});
			})
			.catch((err: unknown) => {
				if (err instanceof Error) {
					console.error(`Error updating completion of task:${err}`);
				}
			});
	};
	const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onClick();
		}
	};

	return (
		<>
			<div
				onClick={onClick}
				className={`w-4.5 h-4.5 
            ${isClicked ? "bg-green-500" : "dark:bg-dark-background-c"} 
            rounded-full text-xl border-2 
            ${isClicked ? "border-green-900" : "border-gray-500"}`}
				tabIndex={0}
				onKeyDown={(event) => {
					onKeyDown(event);
				}}
				role="button"
			/>
		</>
	);
};

const DueDateDisplay: React.FC<DueDateProp> = ({ task, editable }) => {
	const dateInputRef = useRef<HTMLInputElement>(null);
	const taskDueDate = DateTime.fromISO(task.dueDate);
	//TODO: Use loading state here
	const dateFormat = "dd LLL";
	const [formatedDate, setFormatedDate] = useState(() => {
		if (taskDueDate.isValid) {
			return DateTime.fromISO(task.dueDate).toFormat(dateFormat);
		}
		return "Invalid";
	});
	const [updateTask] = useUpdateTaskMutation();
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
			<div className="text-gray-400 text-xs p-2">
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
	label,
	setEditable,
	editable,
}) => {
	const popOverID = `popOver: ${task.id}`;
	const buttonRef = useRef<HTMLButtonElement>(null);
	const popoverRef = useRef<HTMLDivElement>(null);
	//Prevent flickering as the popover position is changed
	const [isHidden, setIsHidden] = useState(true);
	//TODO: Add loading states to this
	const [deleteTask] = useDeleteTaskMutation();
	const [updateTask] = useUpdateTaskMutation();
	const onTrashButtonClicked = (task: Task) => {
		//TODO: Make this optimistic
		deleteTask(task.id).catch((err: unknown) => {
			if (err instanceof Error) {
				console.error(`Error removing tasks:${err}`);
			}
		});
	};
	const onConfirmClicked = () => {
		updateTask({ ...task, label: label })
			.then(() => {
				setEditable(false);
			})
			.catch((err: unknown) => {
				if (err instanceof Error) {
					console.error(`Error removing tasks:${err}`);
				}
			});
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
						<div className="w-1 h-1 rounded-full bg-gray-400" />
						<div className="w-1 h-1 rounded-full bg-gray-400" />
						<div className="w-1 h-1 rounded-full bg-gray-400" />
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
              border-solid border-green-500 border-b-[0.1em] border-r-[0.1em] 
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
          text-gray-400 text-xs
          dark:bg-dark-background-c
          bg-blue-300
          border-1 
          border-gray-400
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
