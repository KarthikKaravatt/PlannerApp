import { parseAbsoluteToLocal } from "@internationalized/date";
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTrigger,
  Heading,
  Modal,
} from "react-aria-components";
import { FaSpinner } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import {
  useGetCompleteTaskOrderQuery,
  useGetCompleteTasksQuery,
  useGetIncompleteTaskOrderQuery,
  useGetIncompleteTasksQuery,
} from "@/redux/taskApiSlice.ts";
import { useRemoveTaskListMutation } from "@/redux/taskListApiSlice.ts";
import type { Task, TaskOrder } from "@/schemas/task";
import type { FilterOption, SortOption } from "@/types/taskList";
import { logError } from "@/util/console.ts";
import { CustomTooltip } from "../General/CustomToolTip.tsx";
import { TaskDisclosure } from "./TaskDisclosure.tsx";
import { TaskListInput } from "./TaskListInput.tsx";
import { TaskListOptions } from "./TaskListOptions.tsx";
import { CustomDialog } from "../General/CustomDialog.tsx";

export const TaskListComponent = ({
  listName,
  listId,
}: {
  listName: string;
  listId: string;
}) => {
  const [filterOption, setFilterOption] = useState<FilterOption>(() => {
    const filterOptionCached = localStorage.getItem(
      `${listId}:FILTER_OPTION`,
    ) as FilterOption | null;
    if (filterOptionCached) {
      return filterOptionCached;
    }
    localStorage.setItem(`${listId}:FILTER_OPTION`, "ALL");
    return "ALL";
  });
  const [sortOption, setSortOption] = useState<SortOption>(() => {
    const selection = localStorage.getItem(
      `${listId}:SORT_OPTION`,
    ) as SortOption | null;
    if (!selection) {
      localStorage.setItem(`${listId}:SORT_OPTION`, "CUSTOM");
      return "CUSTOM";
    }
    return selection;
  });
  const [removeTaskList] = useRemoveTaskListMutation();
  return (
    <div className="flex h-full w-1/4 shrink-0 flex-col gap-1 p-2">
      <div className="flex">
        <p className=" w-full pl-1 text-left font-bold text-blue-950 dark:text-white ">
          {listName}
        </p>
        <CustomDialog
          toolTipMessage="Delete task list"
          dialogMessage="The task list and all its tasks will be deleted"
          heading="Delete Task List"
          triggerIcon={FaRegTrashCan}
          onPressAllow={() => removeTaskList(listId)}
        />
        {/* <TaskListDeleteListDiaLog listId={listId} /> */}
      </div>
      <TaskListOptions
        taskListId={listId}
        setFilterState={setFilterOption}
        sortOrder={sortOption}
        setSortState={setSortOption}
      />
      <TaskListInput taskListId={listId} />
      <div className="overflow-auto shadow-lg dark:shadow-black">
        <VisibleTasks listId={listId} sortOption={sortOption} />
        <CompletedTasks listId={listId} sortOption={sortOption} />
      </div>
    </div>
  );
};

const CompletedTasks = ({
  listId,
  sortOption,
}: {
  listId: string;
  sortOption: SortOption;
}) => {
  const {
    data: taskOrderData,
    isLoading: isOrderLoading,
    isSuccess: isOrderSuccess,
  } = useGetCompleteTaskOrderQuery(listId);
  const {
    data: tasksData,
    isLoading: isTasksLoading,
    isSuccess: isTasksSuccess,
  } = useGetCompleteTasksQuery(listId);
  const isLoading =
    isOrderLoading || isTasksLoading || !(taskOrderData && tasksData);
  const isSuccess = isOrderSuccess || isTasksSuccess;
  if (isLoading) {
    return <FaSpinner className="animate-spin" />;
  }
  if (!isSuccess) {
    return <p>Error loading completed tasks</p>;
  }
  const finalList = getFinalList(tasksData, taskOrderData, sortOption);
  return (
    <TaskDisclosure
      title="Completed"
      tasks={finalList}
      listId={listId}
      sortOption={sortOption}
    />
  );
};
const VisibleTasks = ({
  listId,
  sortOption,
}: {
  listId: string;
  sortOption: SortOption;
}) => {
  const {
    data: tasks,
    isLoading,
    isSuccess,
    isError,
  } = useGetIncompleteTasksQuery(listId);
  const {
    data: order,
    isLoading: isOrderLoading,
    isSuccess: isOrderSuccess,
    isError: isOrderError,
  } = useGetIncompleteTaskOrderQuery(listId);
  if (isLoading || isOrderLoading) {
    return <FaSpinner className="text-blue950 animate-spin dark:text-white" />;
  }
  if (isError || isOrderError) {
    logError("Error fetching tasks");
    return <p>Error: Failed to fetch tasks or task order</p>;
  }
  if (isSuccess && isOrderSuccess && tasks && order) {
    const finalList = getFinalList(tasks, order, sortOption);
    return (
      <TaskDisclosure
        title="Incomplete"
        tasks={finalList}
        listId={listId}
        isIncompleteTasks={true}
        sortOption={sortOption}
      />
    );
  }
};

function getFinalList(
  data: Record<string, Task>,
  order: TaskOrder[],
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
    switch (sortState) {
      case "CUSTOM": {
        // To avoid having undefined tasks if there is a race condition between
        // order and the list item. Also using a map for fast lookup
        const taskMap = new Map(tasksArray.map((task) => [task.id, task]));
        return order.reduce<Task[]>((acc, orderItem) => {
          const task = taskMap.get(orderItem.id);
          if (task) {
            acc.push(task);
          }
          return acc;
        }, []);
      }
      case "DATE": {
        return tasksArray.sort((a, b) => sortByDate(a, b));
      }
      case "NAME": {
        return tasksArray.sort((a, b) => sortByName(a, b));
      }
    }
  })();
  return sortedList;
}
