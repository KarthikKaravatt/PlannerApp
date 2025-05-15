import { removeTask } from "@/services/api";
import type {
	FILTER_OPTION,
	SORT_OPTION,
	TaskListOptionsProp,
} from "@/types/taskList";
import type { ChangeEvent } from "react";

const TaskListOptions: React.FC<TaskListOptionsProp> = ({
	data,
	setData,
	filterState,
	setFilterState,
	setSortState,
}) => {
	const onFilterButtonClick = () => {
		const filterOptions: FILTER_OPTION[] = ["ALL", "INCOMPLETE", "COMPLETE"];
		setFilterState((prev) => {
			const currentIndex = filterOptions.indexOf(prev);
			const nexIndex = (currentIndex + 1) % filterOptions.length;
			return filterOptions[nexIndex];
		});
	};
	const onClearButtonClick = () => {
		Array.from(data).map(([, value]) => {
			if (value.completed) {
				removeTask(value.id)
					.then(() => {
						setData((prevData) => {
							const newData = new Map(prevData);
							newData.delete(value.id);
							for (const [, task] of newData.entries()) {
								if (task.orderIndex > value.orderIndex) {
									value.orderIndex -= 1;
								}
							}
							return newData;
						});
					})
					.catch((error: unknown) => {
						if (error instanceof Error) {
							console.error(`Error removing completed Tasks:${error}`);
						} else {
							console.error("Error removing completed Tasks:Uknown error");
						}
					});
			}
		});
	};
	const onSortOrderChanged = (event: ChangeEvent<HTMLSelectElement>) => {
		const sortChoice = event.target.value as SORT_OPTION;
		setSortState(sortChoice);
	};
	return (
		<div className="flex gap-1">
			<button
				type="button"
				className="border-1 p-1"
				onClick={onFilterButtonClick}
			>
				Filter:{filterState}
			</button>
			<button
				type="button"
				className="border-1 p-1"
				onClick={onClearButtonClick}
			>
				Clear completed
			</button>
			<div className="p-1 border-1">
				<span className="p-1">Sort:</span>
				<select
					name="sort"
					onChange={(event) => {
						onSortOrderChanged(event);
					}}
					className="p-1"
				>
					<option value={"CUSTOM"}>Custom</option>
					<option value={"DATE"}>Date</option>
					<option value={"NAME"}>Name</option>
				</select>
			</div>
		</div>
	);
};

export default TaskListOptions;
