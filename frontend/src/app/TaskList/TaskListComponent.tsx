import {
	useGetTasksQuery,
	useMoveTaskOrderMutation,
} from "@/redux/api/apiSlice";
import type { Task } from "@/schemas/taskList";
import type { FilterOption, SortOption } from "@/types/taskList";
import { logError } from "@/util/console.ts";
import { DateTime } from "luxon";
import { useState } from "react";
import { ListBox, ListBoxItem, useDragAndDrop } from "react-aria-components";
import { FaSpinner } from "react-icons/fa";
import { useListData } from "react-stately";
import { TaskComponent } from "./TaskComponent.tsx";
import { TaskListInput } from "./TaskListInput.tsx";
import { TaskListOptions } from "./TaskListOptions.tsx";

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
	//TODO: Visualize the tasks is moving somehow
	const [moveTask /*{ isLoading: isMovingTask }*/] = useMoveTaskOrderMutation();
	const filteredList = getFinalList(tasks, filterOption, sortOption);
	const list = useListData<Task>({
		initialItems: [],
		getKey: (item) => item.id,
	});
	const { dragAndDropHooks } = useDragAndDrop({
		getItems: (keys) =>
			[...keys].map((_key) => {
				//TODO: Implment this properly
				return { "text/plain": "LOL" };
			}),
		onReorder: (e) => {
			if (!(sortOption === "CUSTOM" && filterOption === "ALL")) {
				return;
			}
			if (e.target.dropPosition === "before") {
				moveTask({
					id1: Array.from(e.keys)[0].toString(),
					id2: e.target.key.toString(),
					pos: "Before",
				}).catch((err: unknown) => {
					if (err instanceof Error) {
						logError("Error moving task", err);
					}
				});
				list.moveBefore(e.target.key, e.keys);
			} else if (e.target.dropPosition === "after") {
				moveTask({
					id1: Array.from(e.keys)[0].toString(),
					id2: e.target.key.toString(),
					pos: "After",
				}).catch((err: unknown) => {
					if (err instanceof Error) {
						logError("Error moving task", err);
					}
				});
				list.moveAfter(e.target.key, e.keys);
			}
		},
	});
	if (isLoading) {
		return <FaSpinner className="text-blue950 dark:text-white" />;
	}
	if (isSuccess) {
		list.items = filteredList;
		return (
			<ListBox
				items={list.items}
				className="w-full"
				aria-label="Tasks"
				dragAndDropHooks={dragAndDropHooks}
				selectionMode="single"
			>
				{(task) => (
					<ListBoxItem textValue="LOL" className="data-[dragging]:opacity-60">
						<TaskComponent key={task.id} task={task} />
					</ListBoxItem>
				)}
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
