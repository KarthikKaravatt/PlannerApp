import { useClearCompletedTasksMutation } from "@/features/api/apiSlice";
import type {
	FILTER_OPTION,
	SORT_OPTION,
	TaskListOptionsProp,
} from "@/types/taskList";
import type { ChangeEvent } from "react";

const TaskListOptions: React.FC<TaskListOptionsProp> = ({
	filterState,
	setFilterState,
	setSortState,
}) => {
	//TODO: Use loading state
	const [clearTasks] = useClearCompletedTasksMutation();
	const onFilterButtonClick = () => {
		const filterOptions: FILTER_OPTION[] = ["ALL", "INCOMPLETE", "COMPLETE"];
		setFilterState((prev) => {
			const currentIndex = filterOptions.indexOf(prev);
			const nexIndex = (currentIndex + 1) % filterOptions.length;
			return filterOptions[nexIndex];
		});
	};
	const onClearButtonClick = () => {
		clearTasks().catch((err: unknown) => {
			if (err instanceof Error) {
				console.error(`Error clearing completed tasks:${err}`);
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
