import {
	useGetTaskOrderQuery,
	useGetTasksQuery,
	useMoveTaskOrderMutation,
} from "@/redux/api/apiSlice";
import type { Task, TaskOrder } from "@/schemas/taskList";
import type { FilterOption, SortOption } from "@/types/taskList";
import { logError } from "@/util/console.ts";
import { parseAbsoluteToLocal } from "@internationalized/date";
import { useCallback, useState } from "react";
import {
	Button,
	GridList,
	GridListItem,
	useDragAndDrop,
} from "react-aria-components";
import { FaSpinner } from "react-icons/fa";
import { MdDragIndicator } from "react-icons/md";
import { TaskComponent } from "./TaskComponent.tsx";
import { TaskListInput } from "./TaskListInput.tsx";
import { TaskListOptions } from "./TaskListOptions.tsx";

interface TaskListComponentProps {
	listName: string;
	listId: string;
}

export const TaskListComponent: React.FC<TaskListComponentProps> = ({
	listName,
	listId,
}) => {
	const [isEditingTask, setEditingTaskId] = useState<boolean>(false);
	const [filterOption, setFilterOption] = useState<FilterOption>("ALL");
	const [sortOption, setSortOption] = useState<SortOption>(() => {
		const selection = localStorage.getItem("SORT_OPTION") as SortOption | null;
		if (!selection) {
			localStorage.setItem("SORT_OPTION", "CUSTOM");
			return "CUSTOM";
		}
		return selection;
	});
	const handleTaskEditableStateChange = useCallback((isEditing: boolean) => {
		setEditingTaskId(isEditing);
	}, []);
	return (
		<div className="p-2 flex flex-col items-center gap-1 h-full w-full">
			<p>{listName}</p>
			<TaskListOptions
				taskListId={listId}
				filterState={filterOption}
				setFilterState={setFilterOption}
				sortOrder={sortOption}
				setSortState={setSortOption}
			/>
			<TaskListInput taskListId={listId} />
			<VisibleTasks
				listId={listId}
				isEditingTask={isEditingTask}
				onTaskEditableStateChange={handleTaskEditableStateChange}
				sortOption={sortOption}
				filterOption={filterOption}
			/>
		</div>
	);
};

interface ViibleTasksProp {
	listId: string;
	filterOption: FilterOption;
	sortOption: SortOption;
	isEditingTask: boolean;
	onTaskEditableStateChange: (isEditing: boolean) => void;
}
//HACK: Bug in react aria
//https://github.com/adobe/react-spectrum/issues/4674
function stopSpaceOnInput(e: React.KeyboardEvent) {
	const target = e.target as HTMLElement;
	if (
		target.tagName === "INPUT" ||
		target.tagName === "TEXTAREA" ||
		target.isContentEditable
	) {
		e.stopPropagation();
	}
}

const VisibleTasks: React.FC<ViibleTasksProp> = ({
	listId,
	filterOption,
	sortOption,
	isEditingTask,
	onTaskEditableStateChange,
}) => {
	const {
		data: tasks,
		isLoading,
		isSuccess,
		isError,
		error,
	} = useGetTasksQuery(listId);
	const {
		data: order,
		isLoading: isOrderLoading,
		isSuccess: isOrderSuccess,
		isError: isOrderError,
		error: orderError,
	} = useGetTaskOrderQuery(listId);
	//TODO: Visualize the tasks is moving somehow
	const [moveTask /*{ isLoading: isMovingTask }*/] = useMoveTaskOrderMutation();
	const { dragAndDropHooks } = useDragAndDrop({
		isDisabled: isEditingTask,
		getItems: (keys) =>
			[...keys].map((key) => {
				return { "text/plain": key.toString() };
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
					listId: listId,
				}).catch((err: unknown) => {
					if (err instanceof Error) {
						logError("Error moving task", err);
					}
				});
			} else if (e.target.dropPosition === "after") {
				moveTask({
					id1: Array.from(e.keys)[0].toString(),
					id2: e.target.key.toString(),
					pos: "After",
					listId: listId,
				}).catch((err: unknown) => {
					if (err instanceof Error) {
						logError("Error moving task", err);
					}
				});
			}
		},
	});
	if (isLoading || isOrderLoading) {
		return <FaSpinner className="text-blue950 dark:text-white" />;
	}
	if (isError || isOrderError) {
		logError("Error fetching tasks", error as Error);
		logError("Error fetching tasks order", orderError as Error);
		return <p>Error: Failed to fetch tasks or task order</p>;
	}
	if (isSuccess && isOrderSuccess) {
		const finalList = getFinalList(tasks, order, filterOption, sortOption);
		return (
			<div className="w-full" onKeyDownCapture={stopSpaceOnInput}>
				<GridList
					keyboardNavigationBehavior="tab"
					items={finalList}
					className={"w-full"}
					aria-label="Tasks"
					dragAndDropHooks={dragAndDropHooks}
					selectionMode="single"
				>
					{(task) => (
						<GridListItem
							textValue={`
                  Task Label: ${task.label}
                  Completed: ${String(task.completed)}
                  ${task.kind === "withDate" ? task.dueDate : ""}
                `}
							className="data-[dragging]:opacity-60"
						>
							<div className="flex flex-row">
								<TaskComponent
									taskListId={listId}
									key={task.id}
									task={task}
									onEditableStateChange={onTaskEditableStateChange}
								/>
								<Button slot="drag" aria-label="Drag item">
									<MdDragIndicator />
								</Button>
							</div>
						</GridListItem>
					)}
				</GridList>
			</div>
		);
	}
};

function getFinalList(
	data: Record<string, Task | undefined>,
	order: TaskOrder[],
	filterState: FilterOption,
	sortState: SortOption,
): Task[] {
	const tasksArray = Object.values(data).filter((t) => t !== undefined);
	const sortByDate = (a: Task, b: Task) => {
		if (a.kind === "withDate" && b.kind === "withDate") {
			const aDate = parseAbsoluteToLocal(a.dueDate);
			const bDate = parseAbsoluteToLocal(b.dueDate);
			return aDate.compare(bDate);
		}
		if (a.kind === "withoutDate" || b.kind === "withDate") {
			return 1;
		}
		return -1;
	};

	const sortByName = (a: Task, b: Task) => {
		return a.label.localeCompare(b.label);
	};
	const sortedList = (() => {
		// biome-ignore lint/style/useDefaultSwitchClause: enum for all cases
		switch (sortState) {
			case "CUSTOM": {
				//order is immutable
				const sortedOrder = Array.from(order).sort(
					(a, b) => a.orderIndex - b.orderIndex,
				);
				const finalList = sortedOrder.map((t) => {
					const result = tasksArray.find((task) => task.id === t.id);
					//BUG: Race condition between tasks and taskOrder
					//HACK: This fixes the race condition but its not ideal
					if (result === undefined) {
						return {
							id: t.id,
							label: "",
							completed: false,
							kind: "withoutDate",
						} satisfies Task;
					}
					return result;
				});
				return finalList;
			}
			case "DATE": {
				return tasksArray.sort((a, b) => sortByDate(a, b));
			}
			case "NAME": {
				return tasksArray.sort((a, b) => sortByName(a, b));
			}
		}
	})();
	// biome-ignore lint/style/useDefaultSwitchClause: enum for all cases
	switch (filterState) {
		case "ALL": {
			return sortedList;
		}
		case "INCOMPLETE": {
			return sortedList.filter((t) => !t.completed);
		}
		case "COMPLETE": {
			return sortedList.filter((t) => t.completed);
		}
	}
}
