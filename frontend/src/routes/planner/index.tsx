import { createFileRoute } from "@tanstack/react-router";
import { Button } from "react-aria-components";
import { FaSpinner } from "react-icons/fa6";
import { TaskListComponent } from "@/app/TaskList/TaskListComponent";
import { TaskListSideBar } from "@/app/TaskList/TaskListSideBar";
import {
  useGetTaskListOrderQuery,
  useGetTaskListsQuery,
} from "@/redux/apiSlice";
import { logError } from "@/util/console";
export const Route = createFileRoute("/planner/")({
  component: Planner,
});

function Planner() {
  return (
    <div className="h-screen w-full text-blue-950 dark:text-white">
      <div className="relative flex h-full w-full flex-row overflow-x-auto">
        <div className="sticky left-0 z-10 shadow-blue-200 backdrop-blur-xs">
          <TaskListSideBar />
        </div>
        <TaskLists className="flex w-320 shrink-0 flex-row md:w-450" />
      </div>
    </div>
  );
}

interface TaskListsProps {
  className?: string;
}
const TaskLists: React.FC<TaskListsProps> = ({ className }) => {
  const {
    data: listData,
    isLoading: isListDataLoading,
    isSuccess: isListDataSuccess,
    refetch: listDataRefetch,
  } = useGetTaskListsQuery();
  const {
    data: listOrderData,
    isLoading: isListOrderDataLoading,
    isSuccess: isListOrderDataSuccess,
    refetch: listDataOroderRefetch,
  } = useGetTaskListOrderQuery();
  if (isListDataLoading || isListOrderDataLoading) {
    return <FaSpinner className="absolute mt-50 ml-40 animate-spin" />;
  }
  if (
    !isListDataSuccess ||
    !isListOrderDataSuccess ||
    !listOrderData ||
    !listData
  ) {
    return (
      <div className="flex flex-col items-center justify-center">
        <p>Error loading task list data, press button to retry</p>
        <Button
          className=" rounded-md bg-blue-200 dark:bg-dark-background-sub-c p-1 font-bold "
          onClick={() => {
            listDataRefetch().catch(() => {
              logError("Error fetching task list data");
            });
            listDataOroderRefetch().catch(() => {
              logError("Error fetching task list data");
            });
          }}
        >
          Retry
        </Button>
      </div>
    );
  }
  return (
    <div className={className}>
      {listOrderData.map((listOrder) => {
        const list = listData[listOrder.id];
        if (list) {
          return (
            <TaskListComponent
              key={list.id}
              listId={list.id}
              listName={list.name}
            />
          );
        }
      })}
    </div>
  );
};
