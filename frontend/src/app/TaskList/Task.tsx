import { useDragAndDrop } from "@/hooks/taslkList/useDragAndDrop";
import { useTaskDueDate } from "@/hooks/taslkList/useTaskDueDate";
import { taskComponentReducer } from "@/reducers/taskReducer";
import {
	useDeleteTaskMutation,
	useUpdateTaskMutation,
} from "@/redux/api/apiSlice";
import type { Task } from "@/schemas/taskList";
import type {} from "@/types/taskList";
import type {
	TaskComponentAction,
	TaskComponentState,
} from "@/types/taskReducer";
import { useReducer, useRef, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaCheck } from "react-icons/fa6";

export interface TaskProp {
	item: Task;
}
const TaskComponent: React.FC<TaskProp> = ({ item: task }) => {
	const initalTaskComponentState: TaskComponentState = {
		inputTaskName: task.label,
		editable: false,
		isLoading: false,
	};
	const [state, dispatch] = useReducer(
		taskComponentReducer,
		initalTaskComponentState,
	);
	//TODO: Swapping tasks is not ideal for custom ordering. You should be able
	//      drag tasks to new positions in the list makes more sense that way
	const { onDragStart, onDragOver, onDrop } = useDragAndDrop(task);
	return (
		<div
			className={`
        flex items-center 
        dark:bg-dark-background-c bg-sky-100 
        ${state.isLoading ? "dark:text-gray-300" : "dark:text-white"}
        ${state.isLoading ? "text-gray-400" : "text-blue-950"}
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
				<CheckBox task={task} state={state} dispatch={dispatch} />
				{/* BUG:: prevent text from overflowing
            Because this is an input text that is too long
            will overflow. Either use triple dots or wrap
            the text, splitting it into multiple lines.
        */}
				<InputField task={task} state={state} dispatch={dispatch} />
				<DueDateDisplay task={task} state={state} />
				<MoreOptions task={task} state={state} dispatch={dispatch} />
			</li>
		</div>
	);
};

interface CheckBoxProp {
	task: Task;
	state: TaskComponentState;
	dispatch: React.ActionDispatch<[action: TaskComponentAction]>;
}
const CheckBox: React.FC<CheckBoxProp> = ({ task, state, dispatch }) => {
	const [updateTask, { isLoading }] = useUpdateTaskMutation();
	const handleClick = () => {
		if (state.editable || isLoading || state.isLoading) {
			return;
		}
		dispatch({ type: "MUTATE_LOADING", payload: true });
		updateTask({ ...task, completed: !task.completed })
			.then(() => {
				dispatch({ type: "MUTATE_LOADING", payload: false });
			})
			.catch((err: unknown) => {
				dispatch({ type: "MUTATE_LOADING", payload: false });
				console.error("Failed to update task completion:", err);
			});
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			handleClick();
		}
	};

	const isInteractive = (!state.editable && !isLoading) || state.isLoading;

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
interface InputFieldProps {
	task: Task;
	state: TaskComponentState;
	dispatch: React.ActionDispatch<[action: TaskComponentAction]>;
}
const InputField: React.FC<InputFieldProps> = ({ task, state, dispatch }) => {
	return (
		<input
			className={`
            w-full 
            outline-none 
            ${!state.editable ? "dark:caret-dark-background-c" : "dark:caret-white"}
            ${!state.editable ? "caret-blue-100" : "caret-gray-400"}
          `}
			readOnly={!state.editable}
			onDoubleClick={() => {
				dispatch({ type: "MUTATE_INPUT", payload: task.label });
				dispatch({ type: "MUTATE_EDITABLE", payload: true });
			}}
			type="text"
			onChange={(event) => {
				dispatch({ type: "MUTATE_INPUT", payload: event.target.value });
			}}
			value={state.editable ? state.inputTaskName : task.label}
		/>
	);
};
interface DueDateProp {
	task: Task;
	state: TaskComponentState;
}
const DueDateDisplay: React.FC<DueDateProp> = ({ task, state }) => {
	const dateInputRef = useRef<HTMLInputElement>(null);
	const { isLoading, formatedDate, inputDate, onDateButtonClicked } =
		useTaskDueDate(task, state);
	const handleButtonClick = () => {
		//BUG: Positioning is not aligned with the button on Firefox
		dateInputRef.current?.showPicker();
	};
	//TODO: This should be optional not all tasks have a new data
	//TODO: task due in the current week should only display the day of the week
	//TODO: change colour based on how soon it's due

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
interface MoreOptionsProp {
	task: Task;
	state: TaskComponentState;
	dispatch: React.ActionDispatch<[action: TaskComponentAction]>;
}
const MoreOptions: React.FC<MoreOptionsProp> = ({ task, state, dispatch }) => {
	const [updateTask, { isLoading }] = useUpdateTaskMutation();
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
		if (task.label !== state.inputTaskName) {
			dispatch({ type: "MUTATE_LOADING", payload: true });
			updateTask({ ...task, label: state.inputTaskName })
				.then(() => {
					dispatch({ type: "MUTATE_LOADING", payload: false });
				})
				.catch((err: unknown) => {
					dispatch({ type: "MUTATE_INPUT", payload: task.label });
					dispatch({ type: "MUTATE_LOADING", payload: false });
					if (err instanceof Error) {
						console.error(`Error updating task: ${err}`);
					}
				});
		}
		dispatch({ type: "MUTATE_EDITABLE", payload: false });
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
					className={`"
            text-sm 
            ${isLoading || state.isLoading ? "text-gray-400" : "text-green-700 dark:text-green-400 "}
            pl-2
          "`}
					hidden={!state.editable}
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
