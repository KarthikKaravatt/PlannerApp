import { createFileRoute } from "@tanstack/react-router";

import { useState, type ChangeEvent } from "react";

import { v4 as uuidv4 } from "uuid";

export const Route = createFileRoute("/planner/")({
  component: RouteComponent,
});

interface TaskProp {
  label: string;
  completed: boolean;
  id: string;
}

function RouteComponent() {
  const initialTasksData: [string, TaskProp][] = [
    { label: "Task 1", completed: false },
    { label: "Task 2", completed: false },
    { label: "Task 3", completed: false },
  ].map((taskBase) => {
    const id = uuidv4();
    return [id, { ...taskBase, id }];
  });
  const initialTasks: Map<string, TaskProp> = new Map(initialTasksData);
  const [tasks, setTasks] = useState<Map<string, TaskProp>>(initialTasks);
  const [inputTask, setInputTask] = useState<string>("");
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

interface TaskComponentProps {
  item: TaskProp;
  setTasks: React.Dispatch<React.SetStateAction<Map<string, TaskProp>>>;
}

const TaskComponent: React.FC<TaskComponentProps> = ({ item, setTasks }) => {
  const onCheckedChange = (
    key: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const isChecked = event.target.checked;
    setTasks((prev) => {
      const newTaskMap = new Map(prev);
      const task = prev.get(key);
      if (task !== undefined) {
        const updatedTask: TaskProp = {
          ...task,
          completed: isChecked,
        };
        newTaskMap.set(key, updatedTask);
      }
      return newTaskMap;
    });
  };
  return (
    <li key={item.id}>
      <input
        type="checkbox"
        checked={item.completed}
        onChange={(event) => onCheckedChange(item.id, event)}
      />
      {item.label}
    </li>
  );
};
