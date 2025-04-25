import type { FILTER_STATE, Task } from "@/types/taskList";
import { useEffect, useState, type ChangeEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import TaskComponent from "./Task";
import { DateTime } from "luxon";

const INITAL_TASK_DATA: [string, Task][] = [
  { label: "Task 1", completed: false, date: DateTime.now() },
  { label: "Task 2", completed: false, date: DateTime.now() },
  { label: "Task 3", completed: false, date: DateTime.now() },
].map((taskBase) => {
  const id = uuidv4();
  return [id, { ...taskBase, id }];
});

function TaskList() {
  const [tasks, setTasks] = useState<Map<string, Task>>(() => {
    const mapString = window.localStorage.getItem("Tasks");
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
                  `Invalid date string found in localStorage for task ${key}: ${dateString}`,
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
  });
  const [inputTask, setInputTask] = useState<string>("");
  const [currFilterState, setCurrFilterState] = useState<FILTER_STATE>("ALL");
  const onInputChanged = (event: ChangeEvent<HTMLInputElement>) => {
    setInputTask(event.target.value);
  };
  useEffect(() => {
    const mapString = JSON.stringify(Array.from(tasks));
    window.localStorage.setItem("Tasks", mapString);
  }, [tasks]);
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
  const onFilterButtonClick = () => {
    const filterOptions: FILTER_STATE[] = ["ALL", "INCOMPLETE", "COMPLETE"];
    setCurrFilterState((prev) => {
      const currentIndex = filterOptions.indexOf(prev);
      const nexIndex = (currentIndex + 1) % filterOptions.length;
      return filterOptions[nexIndex];
    });
  };
  const onClearButtonClick = () => {
    setTasks(
      (prev) =>
        new Map(Array.from(prev).filter(([_, task]) => !task.completed)),
    );
  };
  const filteredList = Array.from(tasks.values()).filter((task) => {
    switch (currFilterState) {
      case "COMPLETE":
        return task.completed;
      case "INCOMPLETE":
        return !task.completed;
      case "ALL":
        return true;
    }
  });
  return (
    <div>
      <div className="flex gap-1">
        <button
          type="button"
          className="border-1 p-1"
          onClick={onFilterButtonClick}
        >
          Filter:{currFilterState}
        </button>
        <button
          type="button"
          className="border-1 p-1"
          onClick={onClearButtonClick}
        >
          Clear completed
        </button>
      </div>
      <ul>
        {Array.from(filteredList).map((item) => {
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
}

export default TaskList;
