import { useGetTasksQuery } from "@/features/api/apiSlice";
import type { Task } from "@/schemas/taskList";
import type { FILTER_OPTION, SORT_OPTION } from "@/types/taskList";
import { DateTime } from "luxon";
import { useState } from "react";
import TaskComponent from "./Task";
import InputTask from "./TaskListInput";
import TaskListOptions from "./TaskListOptions";

const TaskListComponent: React.FC = () => {
	const [filterOption, setFilterOption] = useState<FILTER_OPTION>("ALL");
	const [sortOption, setSortOption] = useState<SORT_OPTION>("CUSTOM");
	const {
		data: tasks = [],
		isLoading,
		isSuccess,
		isError,
		error,
	} = useGetTasksQuery();
	if (isLoading) {
		return <p>Loading</p>;
	}
	if (isSuccess) {
		return (
			<div className="p-2 flex flex-col">
				<TaskListOptions
					filterState={filterOption}
					setFilterState={setFilterOption}
					setSortState={setSortOption}
				/>
				<InputTask />
				<VisibleTasks
					filteredList={getFinalList(tasks, filterOption, sortOption)}
				/>
			</div>
		);
	}
	if (isError) {
		console.log(error);
		return <p>error.status</p>;
	}
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

interface ViibleTasksProp {
	filteredList: Task[];
}

const VisibleTasks: React.FC<ViibleTasksProp> = ({ filteredList }) => {
	return (
		<ul className="flex flex-col gap-0.5">
			{filteredList.map((item) => (
				<TaskComponent key={item.id} item={item} />
			))}
		</ul>
	);
};

export default TaskListComponent;
