import { useGetTasksQuery } from "@/redux/api/apiSlice";
import type { FilterOption, SortOption } from "@/types/taskList";
import { logError } from "@/util/console.ts";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { TaskComponent } from "./TaskComponent.tsx";
import { TaskListInput } from "./TaskListInput.tsx";
import { TaskListOptions } from "./TaskListOptions.tsx";
import { ListBox, ListBoxItem } from "react-aria-components";
import { selectTasksFilterAndSort } from "@/redux/api/selectors.ts";
import { useSelector } from "react-redux";
import type { RootState } from "../store.ts";

export const TaskListComponent: React.FC = () => {
	const [filterOption, setFilterOption] = useState<FilterOption>("ALL");
	const [sortOption, setSortOption] = useState<SortOption>(() => {
		const selection = localStorage.getItem("SORT_OPTION") as SortOption | null;
		if (!selection) {
			localStorage.setItem("SORT_OPTION", "CUSTOM");
			return "CUSTOM";
		}
		return selection;
	});
	return (
		<div className="p-2 flex flex-col items-center gap-1 h-full w-full">
			<TaskListOptions
				filterState={filterOption}
				setFilterState={setFilterOption}
				sortOrder={sortOption}
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
	const { isLoading, isSuccess, isError, error } = useGetTasksQuery();
	const filteredList = useSelector((state: RootState) =>
		selectTasksFilterAndSort(state, sortOption, filterOption),
	);
	if (isLoading || !filteredList) {
		return <FaSpinner className="text-blue950 dark:text-white" />;
	}
	if (isSuccess) {
		return (
			<ListBox className="w-full" aria-label="Tasks">
				{filteredList.map((task) => (
					<ListBoxItem
						key={task.id}
						textValue={`Completed:${String(task.completed)} Task:${task.label} ${task.kind === "withDate" ? `DueDate:${task.dueDate}` : ""}`}
					>
						<TaskComponent key={task.id} task={task} />
					</ListBoxItem>
				))}
			</ListBox>
		);
	}
	if (isError) {
		logError("Error fetching tasks", error as Error);
		return <p>Error: Failed to fetch tasks</p>;
	}
};
