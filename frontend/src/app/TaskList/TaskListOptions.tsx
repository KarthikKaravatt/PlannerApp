import {
  Button,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
} from "react-aria-components";
import { RiArrowDropDownLine } from "react-icons/ri";
import { useClearCompletedTasksMutation } from "@/redux/taskApiSlice";
import type { SortOption } from "@/types/taskList";
import { logError } from "@/util/console";

export const TaskListOptions = ({
  taskListId,
  sortOrder,
  setSortState,
}: {
  taskListId: string;
  sortOrder: SortOption;
  setSortState: React.Dispatch<React.SetStateAction<SortOption>>;
}) => {
  const [clearTasks, { isLoading }] = useClearCompletedTasksMutation();

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
    localStorage.setItem(`${taskListId}:SORT_OPTION`, sortChoice.toString());
    setSortState(sortChoice);
  };
  return (
    <div className=" flex w-full items-stretch justify-between gap-1 text-blue-950 dark:text-white ">
      <OptionsButton isLoading={isLoading} onClick={onClearButtonClick}>
        Clear
      </OptionsButton>
      <div
        className={`${isLoading ? "opacity-50" : "opacity-100"} flex flex-1 flex-col items-center justify-center rounded-md border border-gray-300 shadow-lg transition duration-150 ease-in hover:scale-110 dark:border-none dark:bg-dark-background-sub-c`}
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
          <Popover className=" rounded-md bg-sky-100 p-1 text-blue-950 outline-2 outline-gray-300 dark:bg-dark-background-c dark:text-white ">
            <ListBox className={"text-md"}>
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
const OptionsButton = ({
  isLoading,
  children,
  onClick,
}: {
  isLoading: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <Button
      isDisabled={isLoading}
      className={`${isLoading ? "opacity-50" : "opacity-100"} flex flex-1 flex-col items-center justify-center rounded-md border border-gray-300 text-center shadow-lg transition duration-150 ease-in hover:scale-105 dark:border-none dark:bg-dark-background-sub-c`}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};
