import type { Task } from "@/types/taskList";
import { useEffect, useState, type ChangeEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import TaskComponent from "./Task";

const initialTasksData: [string, Task][] = [
  { label: "Task 1", completed: false },
  { label: "Task 2", completed: false },
  { label: "Task 3", completed: false },
].map((taskBase) => {
  const id = uuidv4();
  return [id, { ...taskBase, id }];
});

function TaskList() {
  const [tasks, setTasks] = useState<Map<string, Task>>(() => {
    const mapString = window.localStorage.getItem("Tasks");
    if (mapString !== null) {
      try {
        const mapArray: [string, Task][] = JSON.parse(mapString);
        return new Map(mapArray);
      } catch (error) {
        return new Map<string, Task>(initialTasksData);
      }
    }
    return new Map<string, Task>(initialTasksData);
  });
  const [inputTask, setInputTask] = useState<string>("");
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
        });
        setInputTask("");
      }
      return newTaskMap;
    });
  };
  return (
    <div>
      <ul>
        {Array.from(tasks).map(([_, item]) => (
          <TaskComponent key={item.id} item={item} setTasks={setTasks} />
        ))}
      </ul>
      <button className="border-1" type="button" onClick={onAddButtonClick}>
        Add task
      </button>
      <input
        className="border-1 border-l-0"
        placeholder="Task name"
        onChange={onInputChanged}
        value={inputTask}
      />
    </div>
  );
}

export default TaskList;
