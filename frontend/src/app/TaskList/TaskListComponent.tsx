import { useGetTasksQuery } from "@/redux/api/apiSlice";
import type { Task } from "@/schemas/taskList";
import type { FILTER_OPTION, SORT_OPTION } from "@/types/taskList";
import { DateTime } from "luxon";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import TaskComponent from "./Task";
import InputTask from "./TaskListInput";
import TaskListOptions from "./TaskListOptions";

const TaskListComponent: React.FC = () => {
	const [filterOption, setFilterOption] = useState<FILTER_OPTION>("ALL");
	const [sortOption, setSortOption] = useState<SORT_OPTION>("CUSTOM");
	return (
		<div className="text-sm p-2 flex flex-col items-center gap-1 h-full w-full">
			<TaskListOptions
				filterState={filterOption}
				setFilterState={setFilterOption}
				setSortState={setSortOption}
			/>
			<InputTask />
			<VisibleTasks sortOption={sortOption} filterOption={filterOption} />
		</div>
	);
};

interface ViibleTasksProp {
	filterOption: FILTER_OPTION;
	sortOption: SORT_OPTION;
}

const VisibleTasks: React.FC<ViibleTasksProp> = ({
	filterOption,
	sortOption,
}) => {
	const {
		data: tasks = [],
		isLoading,
		isSuccess,
		isError,
		error,
	} = useGetTasksQuery();
	if (isLoading) {
		return <FaSpinner className="text-blue950 dark:text-white" />;
	}
	if (isSuccess) {
		const filteredList = getFinalList(tasks, filterOption, sortOption);
		//TODO: Adding new tasks makes the page larger. This means the tasks
		//options component is not visible anymore. Need a way of making this
		//component scrollable and not the page, need a way of having a limit of
		//tasks that are displayed.
		return (
			<ul className="overflow-scroll w-full">
				{filteredList.map((item) => (
					<li key={item.id}>
						<TaskComponent item={item} />
					</li>
				))}
			</ul>
		);
	}
	if (isError) {
		console.log(error);
		return <p>Error: Failed to fetch tasks</p>;
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

export default TaskListComponent;
