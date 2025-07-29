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
import { MdDragIndicator } from "react-icons/md";
import { type DraggableItem, DraggableList } from "@/app/General/DraggableList";
import {
  useGetCompleteTaskOrderQuery,
  useGetCompleteTasksQuery,
  useGetIncompleteTaskOrderQuery,
  useGetIncompleteTasksQuery,
  useMoveTaskOrderMutation,
} from "@/redux/taskApiSlice.ts";
import { useRemoveTaskListMutation } from "@/redux/taskListApiSlice.ts";
import type { Task, TaskOrder } from "@/schemas/task";
import type { FilterOption, SortOption } from "@/types/taskList";
import { logError } from "@/util/console.ts";
import { CustomTooltip } from "../General/CustomToolTip.tsx";
import { TaskComponent } from "./TaskComponent.tsx";
import { TaskListInput } from "./TaskListInput.tsx";
import { TaskListOptions } from "./TaskListOptions.tsx";
import { CustomDisclosure } from "../General/Disclosure.tsx";

interface TaskListComponentProps {
  listName: string;
  listId: string;
}

export const TaskListComponent: React.FC<TaskListComponentProps> = ({
  listName,
  listId,
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
  return (
    <div className="flex h-full w-1/4 shrink-0 flex-col gap-1 p-2">
      <div className="flex">
        <p className=" w-full pl-1 text-left font-bold text-blue-950 dark:text-white ">
          {listName}
        </p>
        <TaskListDeleteListDiaLog listId={listId} />
      </div>
      <TaskListOptions
        taskListId={listId}
        filterState={filterOption}
        setFilterState={setFilterOption}
        sortOrder={sortOption}
        setSortState={setSortOption}
      />
      <TaskListInput taskListId={listId} />
      <VisibleTasks
        listId={listId}
        sortOption={sortOption}
        filterOption={filterOption}
      />
      <CompletedTasks listId={listId} />
    </div>
  );
};

interface CompltedTasksProps {
  listId: string;
}

const CompletedTasks = ({ listId }: CompltedTasksProps) => {
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
  return (
    <CustomDisclosure title="Completed">
      {taskOrderData.map((t) => {
        const task = tasksData[t.id];
        if (task) {
          return (
            <TaskComponent key={task.id} task={task} taskListId={listId} />
          );
        }
      })}
    </CustomDisclosure>
  );
};
const TaskListDeleteListDiaLog: React.FC<{ listId: string }> = ({ listId }) => {
  const [removeTaskList] = useRemoveTaskListMutation();
  return (
    <DialogTrigger>
      <CustomTooltip message="Delete task list">
        <Button className="justify-end p-1 transition duration-150 ease-in hover:scale-110">
          <FaRegTrashCan />
        </Button>
      </CustomTooltip>
      <Modal className=" fixed inset-0 flex items-center justify-center text-blue-950 dark:text-white ">
        <Dialog
          className=" w-3/4 rounded-xl border-2 border-gray-300 bg-blue-100 p-2 dark:border-gray-800 dark:bg-dark-background-c "
          role="alertdialog"
        >
          {({ close }) => (
            <>
              <Heading className="text-lg font-bold text-red-500" slot="title">
                Delete task list
              </Heading>
              <p>
                {
                  "This will delete this task list and all tasks associated with it"
                }
              </p>
              <div className="flex gap-2">
                <Button
                  className={
                    "bg-blue-200 dark:bg-dark-background-sub-c p-1 rounded-md"
                  }
                  onPress={close}
                >
                  Cancel
                </Button>
                <Button
                  className={"bg-red-200 dark:bg-red-950 p-1 rounded-md"}
                  onPress={() => {
                    removeTaskList(listId).catch(() => {
                      logError("Error deleting task list");
                    });
                    close();
                  }}
                >
                  Delete
                </Button>
              </div>
            </>
          )}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
};

interface VibleTasksProp {
  listId: string;
  filterOption: FilterOption;
  sortOption: SortOption;
}

const VisibleTasks: React.FC<VibleTasksProp> = ({
  listId,
  filterOption,
  sortOption,
}) => {
  const {
    data: tasks,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetIncompleteTasksQuery(listId);
  const {
    data: order,
    isLoading: isOrderLoading,
    isSuccess: isOrderSuccess,
    isError: isOrderError,
    error: orderError,
  } = useGetIncompleteTaskOrderQuery(listId);
  const [moveTask /*{ isLoading: isMovingTask }*/] = useMoveTaskOrderMutation();
  const handleReorder = (
    draggedId: string,
    targetId: string,
    position: "before" | "after",
  ) => {
    if (!(sortOption === "CUSTOM" && filterOption === "ALL")) {
      return;
    }

    moveTask({
      id1: draggedId,
      id2: targetId,
      pos: position === "before" ? "Before" : "After",
      listId: listId,
    }).catch((err: unknown) => {
      if (err instanceof Error) {
        logError("Error moving task", err);
      }
    });
  };
  if (isLoading || isOrderLoading) {
    return <FaSpinner className="text-blue950 animate-spin dark:text-white" />;
  }
  if (isError || isOrderError) {
    logError("Error fetching tasks", error as Error);
    logError("Error fetching tasks order", orderError as Error);
    return <p>Error: Failed to fetch tasks or task order</p>;
  }
  if (isSuccess && isOrderSuccess && tasks && order) {
    const finalList = getFinalList(tasks, order, sortOption);
    const draggableItems: DraggableItem[] = finalList.map((task) => ({
      id: task.id,
    }));

    return (
      <DraggableList
        className="overflow-auto"
        items={draggableItems}
        onReorder={handleReorder}
        isDisabled={sortOption !== "CUSTOM"}
        aria-label="Tasks"
        renderItem={(item, _isDragging) => (
          <div className="flex flex-row items-center">
            <DragIndicator />
            {(() => {
              const task = tasks[item.id];
              if (task) {
                return (
                  <TaskComponent
                    taskListId={listId}
                    key={item.id}
                    task={task}
                  />
                );
              }
            })()}
          </div>
        )}
      />
    );
  }
};

// HACK: Have to do this otherwise it doesn't get memoized by the compiler for
// some reason
const DragIndicator = () => {
  return (
    <div className="flex cursor-move items-center p-1" draggable={true}>
      <MdDragIndicator />
    </div>
  );
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
  return sortedList.filter((t) => !t.completed);
}
