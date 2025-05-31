import { useGetTasksQuery } from "@/redux/api/apiSlice";
import type { Task } from "@/schemas/taskList";
import type { FilterOption, SortOption } from "@/types/taskList";
import { DateTime } from "luxon";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { TaskComponent } from "./TaskComponent.tsx";
import { TaskListInput } from "./TaskListInput.tsx";
import { TaskListOptions } from "./TaskListOptions.tsx";

export const TaskListComponent: React.FC = () => {
	const [filterOption, setFilterOption] = useState<FilterOption>("ALL");
	const [sortOption, setSortOption] = useState<SortOption>("CUSTOM");
	return (
		<div className="p-2 flex flex-col items-center gap-1 h-full w-full">
			<TaskListOptions
				filterState={filterOption}
				setFilterState={setFilterOption}
				setSortState={setSortOption}
			/>
			<TaskListInput />
			<VisibleTasks sortOption={sortOption} filterOption={filterOption} />
		</div>
	);
};

interface ViibleTasksProp {
	filterOption: FilterOption;
	sortOption: SortOption;
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
		console.error(error);
		return <p>Error: Failed to fetch tasks</p>;
	}
};

function getFinalList(
	data: Task[],
	filterState: FilterOption,
	sortState: SortOption,
) {
	const sortByCustomOrder = (a: Task, b: Task) => {
		const aIndex = a.orderIndex;
		const bIndex = b.orderIndex;

		if (aIndex === -1 && bIndex === -1) {
			return 0;
		}
		if (aIndex === -1) {
			return 1;
		}
		if (bIndex === -1) {
			return -1;
		}

		return aIndex - bIndex;
	};

	const sortByDate = (a: Task, b: Task) => {
		if (a.kind === "withDate" && b.kind === "withDate") {
			const aDate = DateTime.fromISO(a.dueDate);
			const bDate = DateTime.fromISO(b.dueDate);
			return aDate.toMillis() - bDate.toMillis();
		}
		if (a.kind === "withoutDate" || b.kind === "withDate") {
			return 1;
		}
		return -1;
	};

	const sortByName = (a: Task, b: Task) => {
		return a.label.localeCompare(b.label);
	};
	const filteredList = Array.from(data)
		.filter((task) => {
			// biome-ignore lint/style/useDefaultSwitchClause: Using an enum
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
			// biome-ignore lint/style/useDefaultSwitchClause: Using an enum
			switch (sortState) {
				case "CUSTOM": {
					return sortByCustomOrder(a, b);
				}
				case "DATE": {
					return sortByDate(a, b);
				}
				case "NAME":
					return sortByName(a, b);
			}
		});
	return filteredList;
}
