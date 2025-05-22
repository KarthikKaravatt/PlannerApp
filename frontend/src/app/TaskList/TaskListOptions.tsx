import { useClearCompletedTasksMutation } from "@/features/api/apiSlice";
import type {
	FILTER_OPTION,
	SORT_OPTION,
	TaskListOptionsProp,
} from "@/types/taskList";
import type { ChangeEvent } from "react";
import { FaFilter } from "react-icons/fa6";
import { MdClearAll } from "react-icons/md";

const TaskListOptions: React.FC<TaskListOptionsProp> = ({
	filterState,
	setFilterState,
	setSortState,
}) => {
	const [clearTasks] = useClearCompletedTasksMutation(); // Kept as original

	const onFilterButtonClick = () => {
		const filterOptions: FILTER_OPTION[] = ["ALL", "INCOMPLETE", "COMPLETE"];
		setFilterState((prev) => {
			const currentIndex = filterOptions.indexOf(prev);
			const nextIndex = (currentIndex + 1) % filterOptions.length;
			return filterOptions[nextIndex];
		});
	};

	const onClearButtonClick = () => {
		clearTasks().catch((err: unknown) => {
			if (err instanceof Error) {
				console.error(`Error clearing completed tasks: ${err.message}`);
			} else {
				console.error("An unknown error occurred while clearing tasks");
			}
		});
	};

	const onSortOrderChanged = (event: ChangeEvent<HTMLSelectElement>) => {
		const sortChoice = event.target.value as SORT_OPTION;
		setSortState(sortChoice);
	};

	return (
		<div
			className="
        flex
        w-75
        items-stretch justify-between
        gap-2 pb-2
        text-xs
        dark:text-white
      "
		>
			<button
				type="button"
				className="
          flex flex-1 flex-col
          items-center justify-center
          rounded-md
          border border-gray-300
          p-2
          text-center
          shadow-sm
        "
				onClick={onFilterButtonClick}
			>
				<FaFilter className="mb-0.5 h-4 w-4" />
				{filterState[0] + filterState.slice(1).toLocaleLowerCase()}
			</button>

			<button
				type="button"
				className="
          flex flex-1 flex-col 
          items-center justify-center 
          rounded-md border border-gray-300 
          p-2 
          text-center shadow-sm 
        "
				onClick={onClearButtonClick}
			>
				<MdClearAll className="mb-0.5 h-4 w-4" />
				Clear
			</button>

			<div
				className="
          flex flex-1 flex-col 
          items-stretch justify-center 
          rounded-md border border-gray-300 
          p-2 shadow-sm
        "
			>
				<select
					id="sort-select"
					name="sort"
					onChange={onSortOrderChanged}
					className="
            block w-full rounded-md 
            border-gray-300 
            dark:bg-dark-background-c
            py-1.5 text-center 
            "
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
