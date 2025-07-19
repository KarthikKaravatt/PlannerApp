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
    <div className="w-full h-screen text-blue-950 dark:text-white">
      <div className="w-full h-full flex flex-row overflow-x-auto relative">
        <div className="sticky left-0  backdrop-blur-xs shadow-blue-200">
          <TaskListSideBar />
        </div>
        <TaskLists className="flex flex-row shrink-0 w-320 md:w-450" />
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
    return <FaSpinner className="animate-spin" />;
  }
  if (!isListDataSuccess || !isListOrderDataSuccess) {
    return (
      <div className="flex flex-col justify-center items-center">
        <p>Error loading task list data, press button to retry</p>
        <Button
          className="
            bg-blue-200 font-bold
            p-1 rounded-md
          "
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
