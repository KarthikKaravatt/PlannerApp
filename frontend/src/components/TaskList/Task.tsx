import type { Task } from "@/schemas/taskList";
import { changeTask, removeTask, swapTasks } from "@/services/api";
import { DRAG_ITEM_ID_KEY, type TaskProp } from "@/types/taskList";
import { DateTime } from "luxon";
import type { ChangeEvent, DragEvent } from "react";

const TaskComponent: React.FC<TaskProp> = ({ setData, item, sortOption }) => {
	const onCheckedChange = (
		task: Task,
		event: ChangeEvent<HTMLInputElement>,
	) => {
		const isChecked = event.target.checked;
		const newTask: Task = { ...task, completed: isChecked };
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
	};
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
	return (
		<li key={item.id} className="flex flex-row gap-2">
			<input
				type="checkbox"
				checked={item.completed}
				onChange={(event) => {
					onCheckedChange(item, event);
				}}
			/>
			<input
				type="text"
				onChange={(event) => {
					onLabelChanged(item, item.id, event);
				}}
				value={item.label}
			/>
			<span
				draggable={true}
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
				↕️
			</span>
			<input
				type="datetime-local"
				value={DateTime.fromISO(item.dueDate).toFormat("yyyy-MM-dd'T'HH:mm")}
				onChange={(event) => {
					onDateButtonClicked(item, event);
				}}
			/>
			<button
				type="button"
				onClick={() => {
					onTrashButtonClicked(item);
				}}
			>
				🗑️
			</button>
		</li>
	);
};

export default TaskComponent;
