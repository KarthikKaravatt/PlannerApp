import { useClearCompletedTasksMutation } from "@/redux/api/apiSlice";
import type { FilterOption, SortOption } from "@/types/taskList";
import { logError } from "@/util/console";

export interface TaskListOptionsProp {
	filterState: FilterOption;
	setFilterState: React.Dispatch<React.SetStateAction<FilterOption>>;
	sortOrder: SortOption;
	setSortState: React.Dispatch<React.SetStateAction<SortOption>>;
}
export const TaskListOptions: React.FC<TaskListOptionsProp> = ({
	filterState,
	setFilterState,
	sortOrder,
	setSortState,
}) => {
	//TODO: some kind of loading state
	const [clearTasks] = useClearCompletedTasksMutation();
	const onFilterButtonClick = () => {
		const filterOptions: FilterOption[] = ["ALL", "INCOMPLETE", "COMPLETE"];
		setFilterState((prev) => {
			const currentIndex = filterOptions.indexOf(prev);
			const nextIndex = (currentIndex + 1) % filterOptions.length;
			return filterOptions[nextIndex];
		});
	};

	const onClearButtonClick = () => {
		clearTasks().catch((err: unknown) => {
			if (err instanceof Error) {
				logError("Error clearing completed tasks:", err);
			} else {
				logError("An unknown error occurred while clearing tasks");
			}
		});
	};

	const onSortOrderChanged = (value: string) => {
		const sortChoice = value as SortOption;
		localStorage.setItem("SORT_OPTION", sortChoice.toString());
		setSortState(sortChoice);
	};
	return (
		<div
			className="
        flex items-stretch justify-between
        w-full gap-1
        text-blue-950 dark:text-white
      "
		>
			<button
				type="button"
				className="
          flex flex-1 flex-col
          items-center justify-center
          rounded-md shadow-sm
          border border-gray-300
          text-center
        "
				onClick={onFilterButtonClick}
			>
				{filterState[0] + filterState.slice(1).toLocaleLowerCase()}
			</button>

			<button
				type="button"
				className="
          flex flex-1 flex-col 
          items-center justify-center 
          rounded-md border border-gray-300 
          text-center shadow-sm 
        "
				onClick={onClearButtonClick}
			>
				Clear
			</button>

			<div
				className="
          flex flex-1 flex-col 
          items-center justify-center 
          rounded-md border border-gray-300 
          shadow-sm
        "
			>
				<select
					id="sort-select"
					value={sortOrder}
					name="sort"
					onChange={(event) => {
						onSortOrderChanged(event.target.value);
					}}
					className="
              block rounded-md 
              border-gray-300 
              dark:bg-dark-background-c
              text-center
              w-full         
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
