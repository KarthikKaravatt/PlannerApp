import { useDragAndDrop } from "@/hooks/taslkList/useDragAndDrop";
import { useMoreOptions } from "@/hooks/taslkList/useMoreOptions";
import { useTaskDueDate } from "@/hooks/taslkList/useTaskDueDate";
import { taskComponentReducer } from "@/reducers/taskReducer";
import { useUpdateTaskMutation } from "@/redux/api/apiSlice";
import type { Task } from "@/schemas/taskList";
import type {} from "@/types/taskList";
import type {
	TaskComponentAction,
	TaskComponentState,
} from "@/types/taskReducer";
import { logError } from "@/util/console.ts";
import { DateTime } from "luxon";
import { useReducer, useRef, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaCheck } from "react-icons/fa6";
import { AutoResizeTextArea } from "../General/AutoResizeTextArea.tsx";

export interface TaskProp {
	item: Task;
}
export const TaskComponent: React.FC<TaskProp> = ({ item: task }) => {
	const dateFormat = "dd LLL";
	const formatedDate = (() => {
		if (task.kind === "withDate") {
			if (DateTime.fromISO(task.dueDate).isValid) {
				return DateTime.fromISO(task.dueDate).toFormat(dateFormat);
			}
			return DateTime.now().toFormat(dateFormat);
		}
		return "";
	})();
	const initalTaskComponentState: TaskComponentState = {
		inputTaskName: task.label,
		editable: false,
		isLoading: false,
		formatedDate: formatedDate,
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
        dark:bg-dark-background-c bg-sky-100 
        ${state.isLoading ? "dark:text-gray-300" : "dark:text-white"}
        ${state.isLoading ? "text-gray-400" : "text-blue-950"}
        dark:border-white border-gray-300 
        border-1
        rounded-lg
        shadow
      `}
		>
			<div
				draggable={!state.editable}
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
				<InputField task={task} state={state} dispatch={dispatch} />
				<DueDateDisplay task={task} state={state} dispatch={dispatch} />
				<MoreOptions task={task} state={state} dispatch={dispatch} />
			</div>
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
				if (err instanceof Error) {
					logError("Failed to update task completion:", err);
				}
			});
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			handleClick();
		}
	};

	const isInteractive = !(state.editable || isLoading) || state.isLoading;

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
          ${state.editable ? "opacity-0" : "opacity-100"}
          w-4.5 h-3.5 
          ${task.completed ? "bg-green-500" : "dark:bg-dark-background-c"} 
          rounded-full border-2 
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
		<AutoResizeTextArea
			value={state.editable ? state.inputTaskName : task.label}
			className={`
        w-full outline-none leading-4.5
        ${state.editable ? "caret-gray-400" : "caret-transparent"}
      `}
			readOnly={!state.editable}
			onDoubleClick={() => {
				dispatch({ type: "MUTATE_INPUT", payload: task.label });
				dispatch({ type: "MUTATE_EDITABLE", payload: true });
			}}
			onChange={(event) => {
				dispatch({ type: "MUTATE_INPUT", payload: event.target.value });
			}}
		/>
	);
};
interface DueDateProp {
	task: Task;
	state: TaskComponentState;
	dispatch: React.ActionDispatch<[action: TaskComponentAction]>;
}
const DueDateDisplay: React.FC<DueDateProp> = ({ task, state, dispatch }) => {
	const dateInputRef = useRef<HTMLInputElement>(null);
	const { isLoading, inputDate, onDateButtonClicked } = useTaskDueDate(
		task,
		state,
		dispatch,
	);
	const handleButtonClick = () => {
		//BUG: Positioning is not aligned with the button on Firefox
		dateInputRef.current?.showPicker();
	};
	//TODO: task due in the current week should only display the day of the week
	//TODO: change colour based on how soon it's due
	if (state.formatedDate === "") {
		return <></>;
	}

	return (
		<>
			<div
				className={`
          ${isLoading ? "dark:text-gray-300" : "dark:text-white"}
          ${isLoading ? "text-gray-400" : "text-blue-950"}
          ${state.editable ? "opacity-0" : "opacity-100"}
          text-xs
          w-15
        `}
			>
				<button type="button" onClick={handleButtonClick}>
					{state.formatedDate}
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
	const popOverId = `popOver: ${task.id}`;
	const buttonRef = useRef<HTMLButtonElement>(null);
	const popoverRef = useRef<HTMLDivElement>(null);
	//Prevent flickering as the popover position is changed
	const [isHidden, setIsHidden] = useState(true);
	const {
		isLoading,
		handleConfirmButtonClick,
		handleDeleteButtonClick,
		handleAddDateButtonClicked,
		handleRemoveButtonDateClicked,
	} = useMoreOptions(task, state, dispatch);

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
					window.scrollX -
					//Offset
					70
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
          flex flex-row items-center
        "
			>
				<button
					ref={buttonRef}
					popoverTarget={popOverId}
					type="button"
					hidden={state.editable}
				>
					<BsThreeDots className="text-blue-950 dark:text-white" />
				</button>
				<button
					type="button"
					className={`"
            ${isLoading || state.isLoading ? "text-gray-400" : "text-green-700 dark:text-green-400 "}
          "`}
					hidden={!state.editable}
					onClick={handleConfirmButtonClick}
				>
					<FaCheck />
				</button>
			</div>
			<div
				ref={popoverRef}
				hidden={isHidden}
				id={popOverId}
				popover="auto"
				className="
          flex flex-col     
          justify-center
          text-blue-950 dark:text-white
          dark:bg-dark-background-c bg-blue-100
          border-2 border-gray-300 dark:border-gray-200
          rounded
          p-0.5
        "
				style={{ inset: "unset" }}
				onToggle={handlePopoverToggle}
			>
				<button type="button" onClick={handleAddDateButtonClicked}>
					Add Date
				</button>
				<hr />
				<button type="button" onClick={handleRemoveButtonDateClicked}>
					Remove Date
				</button>
				<hr />
				<button onClick={handleDeleteButtonClick} type="button">
					Delete
				</button>
				<hr />
			</div>
		</>
	);
};
