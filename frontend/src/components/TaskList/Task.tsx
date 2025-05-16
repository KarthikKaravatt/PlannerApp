import type { Task } from "@/schemas/taskList";
import { changeTask, removeTask, swapTasks } from "@/services/api";
import {
	type CheckBoxProp,
	DRAG_ITEM_ID_KEY,
	type TaskProp,
} from "@/types/taskList";
import { DateTime } from "luxon";
import { type ChangeEvent, type DragEvent, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const TaskComponent: React.FC<TaskProp> = ({ setData, item, sortOption }) => {
	const onTrashButtonClicked = (task: Task) => {
		removeTask(task.id)
			.then(() => {
				setData((prevData) => {
					const newData = new Map(prevData);
					newData.delete(task.id);
					for (const [, curTask] of newData.entries()) {
						if (curTask.orderIndex > task.orderIndex) {
							task.orderIndex -= 1;
						}
					}
					return newData;
				});
			})
			.catch((error: unknown) => {
				if (error instanceof Error) {
					console.error(`Error removing Task ${task.id}: ${error}`);
				} else {
					console.error(`Error removing Task ${task.id}: Uknown error`);
				}
			});
	};
	const onLabelChanged = (
		item: Task,
		id: string,
		event: ChangeEvent<HTMLInputElement>,
	) => {
		//TODO: make this more efficient currently a request is made every time it
		//changes
		const newTaskLabel = event.target.value;
		const newTask: Task = { ...item, label: newTaskLabel };
		if (newTaskLabel.trim().length === 0) {
			removeTask(id)
				.then(() => {
					setData((prevData) => {
						const newData = new Map(prevData);
						newData.delete(id);
						return newData;
					});
				})
				.catch((error: unknown) => {
					if (error instanceof Error) {
						console.error(`Error removing Task ${id}: ${error}`);
					} else {
						console.error(`Error removing Task ${id}: Uknown error`);
					}
				});
		} else {
			changeTask(newTask)
				.then(() => {
					setData((prevData) => {
						const newData = new Map(prevData);
						prevData.set(id, newTask);
						return newData;
					});
				})
				.catch((error: unknown) => {
					if (error instanceof Error) {
						console.error(`Error chaning Task: ${id}: ${error}`);
					} else {
						console.error(`Error chaning Task: ${id}: Uknown error`);
					}
				});
		}
	};
	const onDateButtonClicked = (
		item: Task,
		event: ChangeEvent<HTMLInputElement>,
	) => {
		const date = DateTime.fromFormat(event.target.value, "yyyy-MM-dd'T'HH:mm");
		const newTask: Task = {
			...item,
			dueDate: date.isValid ? date.toISO() : item.dueDate,
		};
		if (date.isValid) {
			changeTask(newTask)
				.then(() => {
					setData((prevData) => {
						const newData = new Map(prevData);
						prevData.set(item.id, newTask);
						return newData;
					});
				})
				.catch((error: unknown) => {
					if (error instanceof Error) {
						console.error(`Error chaning Task ${item.id}: ${error}`);
					} else {
						console.error(`Error chaning Task ${item.id}: Uknown error`);
					}
				});
		}
	};
	const onDragStart = (event: DragEvent<HTMLSpanElement>) => {
		if (sortOption === "CUSTOM") {
			event.dataTransfer.setData(DRAG_ITEM_ID_KEY, item.id);
		}
	};
	const onDragOver = (event: DragEvent<HTMLSpanElement>) => {
		if (sortOption === "CUSTOM") {
			event.preventDefault();
		}
	};
	const onDrop = (event: DragEvent<HTMLSpanElement>) => {
		if (sortOption === "CUSTOM") {
			event.preventDefault();
			const swapIDString = event.dataTransfer.getData(DRAG_ITEM_ID_KEY);
			if (swapIDString !== "") {
				swapTasks(item.id, swapIDString)
					.then(() => {
						setData((prevData) => {
							const newData = new Map(prevData);
							const swapTask = newData.get(swapIDString);
							const curTask = newData.get(item.id);
							if (swapTask !== undefined && curTask !== undefined) {
								const updatedCurTask = {
									...curTask,
									orderIndex: swapTask.orderIndex,
								};
								const updatedSwapTask = {
									...swapTask,
									orderIndex: curTask.orderIndex,
								};
								newData.set(updatedSwapTask.id, updatedSwapTask);
								newData.set(updatedCurTask.id, updatedCurTask);
							}
							return newData;
						});
					})
					.catch((error: unknown) => {
						if (error instanceof Error) {
							console.error(`Errow swapping tasks:${error}`);
						} else {
							console.error("Uknown error sapping tasks");
						}
					});
			} else {
				console.warn("Swap index string is empty");
			}
		}
	};
	// Drag api is wired, this stops the input from being dragable
	const onDragStartInput = (event: DragEvent<HTMLInputElement>) => {
		event.preventDefault();
		event.stopPropagation();
	};
	return (
		<div className="flex items-center bg-[#151618] text-white rounded-lg h-10">
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
				<CheckBox setData={setData} task={item} />
				<input
					draggable={true}
					type="text"
					onChange={(event) => {
						onLabelChanged(item, item.id, event);
					}}
					onDragStart={(event) => {
						onDragStartInput(event);
					}}
					value={item.label}
				/>
				<DueDateDisplay task={item} onDateButtonClicked={onDateButtonClicked} />
				<MoreOptions onTrashButtonClicked={onTrashButtonClicked} task={item} />
			</li>
		</div>
	);
};

const CheckBox: React.FC<CheckBoxProp> = ({ setData, task }) => {
	const [isClicked, setIsClicked] = useState(task.completed);
	const onClick = () => {
		setIsClicked((prev) => {
			const newCompletion = !prev;
			const newTask: Task = { ...task, completed: newCompletion };
			changeTask(newTask)
				.then(() => {
					setData((prevData) => {
						const newData = new Map(prevData);
						newData.set(newTask.id, newTask);
						return newData;
					});
				})
				.catch((error: unknown) => {
					if (error instanceof Error) {
						console.error(`Error saving Task ${task.id}: ${error}`);
					} else {
						console.error(`Error saving Task ${task.id}: Uknown error`);
					}
				});
			return newCompletion;
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
            ${isClicked ? "bg-green-500" : "bg-[#151618]"} 
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

interface DueDateProp {
	task: Task;
	onDateButtonClicked: (
		item: Task,
		event: ChangeEvent<HTMLInputElement>,
	) => void;
}

const DueDateDisplay: React.FC<DueDateProp> = ({
	task,
	onDateButtonClicked,
}) => {
	const dateInputRef = useRef<HTMLInputElement>(null);
	const taskDueDate = DateTime.fromISO(task.dueDate);
	let formatedDate = "Invalid";
	const dateFormat = "dd LLL";
	if (taskDueDate.isValid) {
		formatedDate = DateTime.fromISO(task.dueDate).toFormat(dateFormat);
	}

	const handleButtonClick = () => {
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
					value={DateTime.fromISO(task.dueDate).toFormat("yyyy-MM-dd'T'HH:mm")}
					onChange={(event) => {
						onDateButtonClicked(task, event);
					}}
					hidden={true}
				/>
			</div>
		</>
	);
};
interface MoreOptionsProp {
	onTrashButtonClicked: (task: Task) => void;
	task: Task;
}
const MoreOptions: React.FC<MoreOptionsProp> = ({
	onTrashButtonClicked,
	task,
}) => {
	const popOverID = `popOver: ${task.id}`;
	const buttonRef = useRef<HTMLButtonElement>(null);
	const popoverRef = useRef<HTMLDivElement>(null);
	//Prevent flickering as the popover position is changed
	const [isHidden, setIsHidden] = useState(true);

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
			<button
				ref={buttonRef}
				popoverTarget={popOverID}
				type="button"
				className="w-5 h-5"
			>
				<div className="flex flex-row gap-0.5">
					<div className="w-1 h-1 rounded-full bg-gray-400 border-black" />
					<div className="w-1 h-1 rounded-full bg-gray-400 border-black" />
					<div className="w-1 h-1 rounded-full bg-gray-400 border-black" />
				</div>
			</button>
			<div
				ref={popoverRef}
				hidden={isHidden}
				id={popOverID}
				popover="auto"
				className="absolute text-xs border border-gray-400 shadow-lg p-1 bg-[#151618] text-gray-400 rounded"
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
