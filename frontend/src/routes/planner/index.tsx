import { createFileRoute } from "@tanstack/react-router";
import { Button } from "react-aria-components";
import { FaSpinner } from "react-icons/fa6";
import { TaskListComponent } from "@/app/TaskList/TaskListComponent";
import { TaskListSideBar } from "@/app/TaskList/TaskListSideBar";
import { useGetTaskListQuery } from "@/redux/api/apiSlice";
import { logError } from "@/util/console";
export const Route = createFileRoute("/planner/")({
  component: Planner,
});

function Planner() {
  return (
    <>
      <div className="w-full h-screen text-blue-950 dark:text-white">
        <div className="w-full h-full flex flex-row overflow-x-auto">
          <TaskListSideBar />
          <TaskLists className="flex flex-row shrink-0 w-320 md:w-450" />
        </div>
      </div>
    </>
  );
}

interface TaskListsProps {
  className?: string;
}
const TaskLists: React.FC<TaskListsProps> = ({ className }) => {
  const { data, isLoading, isSuccess, refetch } = useGetTaskListQuery();
  if (isLoading) {
    return <FaSpinner />;
  }
  if (!isSuccess) {
    return (
      <>
        <div className="flex flex-col justify-center items-center">
          <p>Error loading task list data, press button to retry</p>
          <Button
            className="
            bg-blue-200 font-bold
            p-1 rounded-md
          "
            onClick={() => {
              refetch().catch(() => {
                logError("Error fetching task list data");
              });
            }}
          >
            Retry
          </Button>
        </div>
      </>
    );
  }
  return (
    <div className={className}>
      {data.map((list) => {
        return (
          <TaskListComponent
            key={list.id}
            listId={list.id}
            listName={list.name}
          />
        );
      })}
    </div>
  );
};
