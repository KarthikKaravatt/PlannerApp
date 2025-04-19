import { createFileRoute } from "@tanstack/react-router";

import { type ChangeEvent, useEffect, useState } from "react";

import { v4 as uuidv4 } from "uuid";

export const Route = createFileRoute("/planner/")({
	component: TaskListComponent,
});

interface TaskProp {
	label: string;
	completed: boolean;
	id: string;
}
const initialTasksData: [string, TaskProp][] = [
	{ label: "Task 1", completed: false },
	{ label: "Task 2", completed: false },
	{ label: "Task 3", completed: false },
].map((taskBase) => {
	const id = uuidv4();
	return [id, { ...taskBase, id }];
});

function TaskListComponent() {
	const [tasks, setTasks] = useState<Map<string, TaskProp>>(() => {
		const mapString = window.localStorage.getItem("Tasks");
		if (mapString !== null) {
			try {
				const mapArray: [string, TaskProp][] = JSON.parse(mapString);
				return new Map(mapArray);
			} catch (error) {
				return new Map<string, TaskProp>(initialTasksData);
			}
		}
		return new Map<string, TaskProp>(initialTasksData);
	});
	const [inputTask, setInputTask] = useState<string>("");
	const onInputChanged = (event: ChangeEvent<HTMLInputElement>) => {
		setInputTask(event.target.value);
	};
	useEffect(() => {
		const mapString = JSON.stringify(Array.from(tasks));
		window.localStorage.setItem("Tasks", mapString);
	}, [tasks]);
	const onAddButtonClick = () => {
		setTasks((prev) => {
			const newTaskMap = new Map(prev);
			if (inputTask.trim().length !== 0) {
				const id = uuidv4();
				newTaskMap.set(id, {
					label: inputTask,
					completed: false,
					id: id,
				});
				setInputTask("");
			}
			return newTaskMap;
		});
	};
	return (
		<div>
			<ul>
				{Array.from(tasks).map(([_, item]) => (
					<TaskComponent key={item.id} item={item} setTasks={setTasks} />
				))}
			</ul>
			<button className="border-1" type="button" onClick={onAddButtonClick}>
				Add task
			</button>
			<input
				className="border-1 border-l-0"
				placeholder="Task name"
				onChange={onInputChanged}
				value={inputTask}
			/>
		</div>
	);
}

interface TaskComponentProps {
	item: TaskProp;
	setTasks: React.Dispatch<React.SetStateAction<Map<string, TaskProp>>>;
}

const TaskComponent: React.FC<TaskComponentProps> = ({ item, setTasks }) => {
	const onCheckedChange = (
		key: string,
		event: ChangeEvent<HTMLInputElement>,
	) => {
		const isChecked = event.target.checked;
		setTasks((prev) => {
			const newTaskMap = new Map(prev);
			const task = prev.get(key);
			if (task !== undefined) {
				const updatedTask: TaskProp = {
					...task,
					completed: isChecked,
				};
				newTaskMap.set(key, updatedTask);
			}
			return newTaskMap;
		});
	};
	const onTrashButtonClicked = (key: string) => {
		setTasks((prev) => {
			const newTasksMap = new Map(prev);
			newTasksMap.delete(key);
			return newTasksMap;
		});
	};
	return (
		<li key={item.id} className="flex flex-row gap-2">
			<input
				type="checkbox"
				checked={item.completed}
				onChange={(event) => onCheckedChange(item.id, event)}
			/>
			{item.label}
			<button type="button" onClick={(_) => onTrashButtonClicked(item.id)}>
				🗑️
			</button>
		</li>
	);
};
