import {
  LOCAL_STORAGE_TASKS,
  type FILTER_STATE,
  type SORT_STATE,
  type Task,
} from "@/types/taskList";
import { useEffect, useState, type ChangeEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import TaskComponent from "./Task";
import { DateTime } from "luxon";
import TaskListOptions from "./TaskListOptions";

const INITAL_TASK_DATA: [string, Task][] = [
  { label: "Task 1", completed: false, date: DateTime.now() },
  { label: "Task 2", completed: false, date: DateTime.now() },
  { label: "Task 3", completed: false, date: DateTime.now() },
].map((taskBase) => {
  const id = uuidv4();
  return [id, { ...taskBase, id }];
});

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Map<string, Task>>(GetStoredMap());
  const [inputTask, setInputTask] = useState<string>("");
  const [filterState, setFilterState] = useState<FILTER_STATE>("ALL");
  const [sortState, setSortState] = useState<SORT_STATE>("NAME");
  const onInputChanged = (event: ChangeEvent<HTMLInputElement>) => {
    setInputTask(event.target.value);
  };
  const onAddButtonClick = () => {
    setTasks((prev) => {
      const newTaskMap = new Map(prev);
      if (inputTask.trim().length !== 0) {
        const id = uuidv4();
        newTaskMap.set(id, {
          label: inputTask,
          completed: false,
          id: id,
          date: DateTime.now(),
        });
        setInputTask("");
      }
      return newTaskMap;
    });
  };
  const filteredList = Array.from(tasks.values())
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
        case "CUSTOM":
          //TODO: Implement this
          return 0;
        case "DATE":
          return a.date.toMillis() - b.date.toMillis();
        case "NAME":
          return a.label.localeCompare(b.label);
      }
    });
  useEffect(() => {
    const mapString = JSON.stringify(Array.from(tasks));
    window.localStorage.setItem(LOCAL_STORAGE_TASKS, mapString);
  }, [tasks]);
  return (
    <div>
      <TaskListOptions
        filterState={filterState}
        setFilterState={setFilterState}
        setTasks={setTasks}
        setSortState={setSortState}
      />
      <ul>
        {filteredList.map((item) => {
          return (
            <TaskComponent key={item.id} item={item} setTasks={setTasks} />
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
      const transformedArray: [string, Task][] = parsedArray.map(
        ([key, taskData]) => {
          const dateString = taskData?.date;
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
      return new Map<string, Task>(INITAL_TASK_DATA);
    }
  }
  return new Map<string, Task>(INITAL_TASK_DATA);
}

export default TaskList;
