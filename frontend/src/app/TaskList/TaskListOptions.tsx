import { useClearCompletedTasksMutation } from "@/redux/api/apiSlice";
import type { FilterOption, SortOption } from "@/types/taskList";
import { logError } from "@/util/console";
import {
	Button,
	ListBox,
	ListBoxItem,
	Popover,
	Select,
	SelectValue,
} from "react-aria-components";
import { RiArrowDropDownLine } from "react-icons/ri";

export interface TaskListOptionsProp {
	taskListId: string;
	filterState: FilterOption;
	setFilterState: React.Dispatch<React.SetStateAction<FilterOption>>;
	sortOrder: SortOption;
	setSortState: React.Dispatch<React.SetStateAction<SortOption>>;
}
export const TaskListOptions: React.FC<TaskListOptionsProp> = ({
	taskListId,
	filterState,
	setFilterState,
	sortOrder,
	setSortState,
}) => {
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
		clearTasks(taskListId).catch((err: unknown) => {
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
			<Button
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
			</Button>

			<Button
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
			</Button>
			<div
				className="
			       flex flex-1 flex-col 
			       items-center justify-center 
			       rounded-md border border-gray-300 
			       shadow-sm
			     "
			>
				<Select
					defaultSelectedKey={sortOrder}
					aria-label="Select sort option"
					onSelectionChange={(event) => {
						if (event) {
							onSortOrderChanged(event.toString());
						}
					}}
				>
					<Button>
						<div className="flex items-center">
							<SelectValue />
							<RiArrowDropDownLine />
						</div>
					</Button>
					<Popover
						className="
            rounded-md p-1 
            bg-sky-100 dark:bg-dark-background-c 
            text-blue-950 dark:text-white
            outline-2 outline-gray-300
            "
					>
						<ListBox className={"text-xs"}>
							<ListBoxItem textValue="Custom sort order option" id={"CUSTOM"}>
								Custom
							</ListBoxItem>
							<ListBoxItem textValue="Date sort order option" id={"DATE"}>
								Date
							</ListBoxItem>
							<ListBoxItem textValue="Name sort order option" id={"NAME"}>
								Name
							</ListBoxItem>
						</ListBox>
					</Popover>
				</Select>
			</div>
		</div>
	);
};
