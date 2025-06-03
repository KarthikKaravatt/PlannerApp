import { useGetTasksQuery } from "@/redux/api/apiSlice";
import type { Task } from "@/schemas/taskList";
import type { FilterOption, SortOption } from "@/types/taskList";
import { logError } from "@/util/console.ts";
import { DateTime } from "luxon";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { TaskComponent } from "./TaskComponent.tsx";
import { TaskListInput } from "./TaskListInput.tsx";
import { TaskListOptions } from "./TaskListOptions.tsx";
import { ListBox, ListBoxItem } from "react-aria-components";

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
	const {
		data: tasks = [],
		isLoading,
		isSuccess,
		isError,
		error,
	} = useGetTasksQuery();
	const filteredList = getFinalList(tasks, filterOption, sortOption);
	// const { dragAndDropHooks } = useDragAndDrop({
	// 	getItems: (keys) => {
	// 		return [...keys].map((key) => {
	// 			const task = filteredList.find((t) => t.id === key);
	// 			return {
	// 				"text/plain": task ? task.label : "",
	// 			};
	// 		});
	// 	},
	//    onReorder(e){
	//      if(sortOption!== "CUSTOM"){
	//        return
	//      }
	//      const draggedTask = filteredList.find((t)=>t.id === [...e.keys][0])
	//      const targetTask = filteredList.find((t)=> t.id === e.target.key)
	//
	//    }
	// });
	if (isLoading) {
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
