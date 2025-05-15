import type { Task } from "@/schemas/taskList";
import { addTask, getAllTasks } from "@/services/api";
import type { FILTER_OPTION, SORT_OPTION } from "@/types/taskList";
import { DateTime } from "luxon";
import { type ChangeEvent, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import TaskComponent from "./Task";
import TaskListOptions from "./TaskListOptions";

const TaskListComponent: React.FC = () => {
	const [data, setData] = useState<Map<string, Task>>(
		() => new Map<string, Task>(),
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>();
	const [inputTask, setInputTask] = useState<string>("");
	const [filterOption, setFilterOption] = useState<FILTER_OPTION>("ALL");
	const [sortOption, setSortOption] = useState<SORT_OPTION>("CUSTOM");
	const onInputChanged = (event: ChangeEvent<HTMLInputElement>) => {
		setInputTask(event.target.value);
	};
	const onAddButtonClick = () => {
		const task: Task = {
			id: uuidv4(),
			label: inputTask,
			completed: false,
			dueDate: DateTime.now().toISO(),
			orderIndex: data.size,
		};
		addTask(task)
			.then(() => {
				setData((prevData) => new Map(prevData).set(task.id, task));
			})
			.catch((error: unknown) => {
				if (error instanceof Error) {
					console.error(`Error adding Task ${task.id}: ${error}`);
				} else {
					console.error(`Error adding Task ${task.id}: Uknown error`);
				}
			});
		setInputTask("");
	};
	const filteredList = getFinalList(
		[...data.values()],
		filterOption,
		sortOption,
	);
	useEffect(() => {
		const fetchTasks = async () => {
			try {
				const tasks = await getAllTasks();
				const taskMap = tasks.reduce((acc, curr) => {
					const newDate = DateTime.fromISO(curr.dueDate);
					const newTask: Task = {
						id: curr.id,
						label: curr.label,
						completed: curr.completed,
						dueDate: newDate.isValid ? newDate.toISO() : DateTime.now().toISO(),
						orderIndex: curr.orderIndex,
					};
					acc.set(newTask.id, newTask);
					return acc;
				}, new Map<string, Task>());
				setData(taskMap);
			} catch (error) {
				console.log(error);
				setError("LOL");
			} finally {
				setLoading(false);
			}
		};
		fetchTasks().catch((error: unknown) => {
			if (error instanceof Error) {
				console.error(`Error fetching Tasks: ${error}`);
			} else {
				console.error("Error fetching Tasks: Uknown error");
			}
		});
	}, []);

	if (loading) {
		return <p>Loading</p>;
	}
	if (error) {
		return <p>Error</p>;
	}
	return (
		<div>
			<TaskListOptions
				data={data}
				setData={setData}
				filterState={filterOption}
				setFilterState={setFilterOption}
				setSortState={setSortOption}
			/>
			<ul>
				{filteredList.map((item) => (
					<TaskComponent
						setData={setData}
						key={item.id}
						item={item}
						sortOption={sortOption}
					/>
				))}
			</ul>
			<div className="flex gap-1">
				<button
					className="border-1 p-1"
					type="button"
					onClick={onAddButtonClick}
				>
					Add task
				</button>
				<input
					className="border-1 p-1"
					placeholder="Task name"
					onChange={onInputChanged}
					value={inputTask}
				/>
			</div>
		</div>
	);
};

function getFinalList(
	data: Task[],
	filterState: FILTER_OPTION,
	sortState: SORT_OPTION,
) {
	const filteredList = Array.from(data)
		.filter((task) => {
			switch (filterState) {
				case "COMPLETE":
					return task.completed;
				case "INCOMPLETE":
					return !task.completed;
				case "ALL":
					return true;
			}
		})
		.sort((a, b) => {
			const aDate = DateTime.fromISO(a.dueDate);
			const bDate = DateTime.fromISO(b.dueDate);
			switch (sortState) {
				case "CUSTOM": {
					const aIndex = a.orderIndex;
					const bIndex = b.orderIndex;
					let pos = aIndex - bIndex;
					if (aIndex === -1 && bIndex === -1) {
						pos = 0;
					} else if (aIndex === -1) {
						pos = 1;
					} else if (bIndex === -1) {
						pos = -1;
					}
					return pos;
				}
				case "DATE":
					return aDate.toMillis() - bDate.toMillis();
				case "NAME":
					return a.label.localeCompare(b.label);
			}
		});
	return filteredList;
}

export default TaskListComponent;
