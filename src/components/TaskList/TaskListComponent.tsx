import {
  type FILTER_OPTION,
  LOCAL_STORAGE_TASKS,
  LOCAL_STORAGE_TASKS_CUSTOM_SORT,
  type SORT_OPTION,
  type Task,
  type TaskListState,
} from "@/types/taskList";
import { DateTime } from "luxon";
import { type ChangeEvent, useEffect, useReducer, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import TaskComponent from "./Task";
import TaskListOptions from "./TaskListOptions";
import taskListReducer from "./TaskListReducer";

const TaskListComponent: React.FC = () => {
  const initalTasks = GetStoredMap();
  const initalSortOrder = getSortOrder(initalTasks);
  const [tasksState, dispatch] = useReducer(taskListReducer, {
    taskList: initalTasks,
    order: initalSortOrder,
  });
  const [inputTask, setInputTask] = useState<string>("");
  const [filterOption, setFilterOption] = useState<FILTER_OPTION>("ALL");
  const [sortOption, setSortOption] = useState<SORT_OPTION>("CUSTOM");
  const onInputChanged = (event: ChangeEvent<HTMLInputElement>) => {
    setInputTask(event.target.value);
  };
  // Add a task
  const onAddButtonClick = () => {
    const task: Task = {
      id: uuidv4(),
      label: inputTask,
      completed: false,
      date: DateTime.now(),
    };
    dispatch({ type: "ADD_TASK", task: task });
    setInputTask("");
  };
  // Determine what tasks are displayed based on filters
  const filteredList = getFinalList(tasksState, filterOption, sortOption);

  useEffect(() => {
    const mapString = JSON.stringify(Array.from(tasksState.taskList));
    window.localStorage.setItem(LOCAL_STORAGE_TASKS, mapString);
  }, [tasksState.taskList]);
  useEffect(() => {
    const sortOrderString = JSON.stringify(tasksState.order);
    window.localStorage.setItem(
      LOCAL_STORAGE_TASKS_CUSTOM_SORT,
      sortOrderString,
    );
  }, [tasksState.order]);
  return (
    <div>
      <TaskListOptions
        filterState={filterOption}
        dispatch={dispatch}
        setFilterState={setFilterOption}
        setSortState={setSortOption}
      />
      <ul>
        {filteredList.map((item) => {
          return (
            <TaskComponent
              key={item.id}
              item={item}
              sortOption={sortOption}
              dispatch={dispatch}
            />
          );
        })}
      </ul>
      <div className="flex gap-1">
        <button
          className="border-1 p-1"
          type="button"
          onClick={onAddButtonClick}
        >
          Add task
        </button>
        <input
          className="border-1 p-1"
          placeholder="Task name"
          onChange={onInputChanged}
          value={inputTask}
        />
      </div>
    </div>
  );
};

function GetStoredMap(): Map<string, Task> {
  const mapString = window.localStorage.getItem(LOCAL_STORAGE_TASKS);
  if (mapString !== null) {
    try {
      const parsedArray: [string, Task][] = JSON.parse(mapString);
      // DateTime is serialised into a string, convert each task back to
      // using the DateTime object
      const transformedArray: [string, Task][] = parsedArray.map(
        ([key, taskData]) => {
          const dateString = taskData?.date;
          // fallback value
          let validDate = DateTime.now();
          if (typeof dateString === "string") {
            const parsedDate = DateTime.fromISO(dateString);
            if (parsedDate.isValid) {
              validDate = parsedDate;
            } else {
              console.warn(
                `Invalid date string found in localStorage:${LOCAL_STORAGE_TASKS} for task ${key}: ${dateString}`,
              );
            }
          } else {
            console.warn(
              `Invalid date string found in localStorage for task ${key}`,
            );
          }
          return [key, { ...taskData, id: key, date: validDate }];
        },
      );
      return new Map(transformedArray);
    } catch (error) {
      console.error(
        "Failed to parse or transform tasks from localStorage",
        error,
      );
      return new Map<string, Task>();
    }
  }
  return new Map<string, Task>();
}

function getFinalList(
  tasksState: TaskListState,
  filterState: FILTER_OPTION,
  sortState: SORT_OPTION,
) {
  const filteredList = Array.from(tasksState.taskList.values())
    .filter((task) => {
      switch (filterState) {
        case "COMPLETE":
          return task.completed;
        case "INCOMPLETE":
          return !task.completed;
        case "ALL":
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortState) {
        case "CUSTOM": {
          const aIndex = tasksState.order.indexOf(a.id);
          const bIndex = tasksState.order.indexOf(b.id);
          let pos = aIndex - bIndex;
          if (aIndex === -1 && bIndex === -1) {
            pos = 0;
          } else if (aIndex === -1) {
            pos = 1;
          } else if (bIndex === -1) {
            pos = -1;
          }
          return pos;
        }
        case "DATE":
          return a.date.toMillis() - b.date.toMillis();
        case "NAME":
          return a.label.localeCompare(b.label);
      }
    });
  return filteredList;
}

function getSortOrder(tasks: Map<string, Task>): string[] {
  const taskString = window.localStorage.getItem(
    LOCAL_STORAGE_TASKS_CUSTOM_SORT,
  );
  if (taskString !== null) {
    try {
      return JSON.parse(taskString) as string[];
    } catch (error) {
      console.error(
        `Unable to parse sort order from local storage:${LOCAL_STORAGE_TASKS_CUSTOM_SORT}`,
      );
      return Array.from(tasks).map(([id, _]) => id);
    }
  }
  return Array.from(tasks).map(([id, _]) => id);
}
export default TaskListComponent;
