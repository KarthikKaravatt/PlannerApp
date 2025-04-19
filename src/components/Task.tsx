import type { Task, TaskProp } from "@/types/taskList";
import type { ChangeEvent } from "react";

const TaskComponent: React.FC<TaskProp> = ({ item, setTasks }) => {
  const onCheckedChange = (
    key: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const isChecked = event.target.checked;
    setTasks((prev) => {
      const newTaskMap = new Map(prev);
      const task = prev.get(key);
      if (task !== undefined) {
        const updatedTask: Task = {
          ...task,
          completed: isChecked,
        };
        newTaskMap.set(key, updatedTask);
      }
      return newTaskMap;
    });
  };
  const onTrashButtonClicked = (key: string) => {
    setTasks((prev) => {
      const newTasksMap = new Map(prev);
      newTasksMap.delete(key);
      return newTasksMap;
    });
  };
  const onLabelChanged = (id: string, event: ChangeEvent<HTMLInputElement>) => {
    setTasks((prev) => {
      const newTasks = new Map(prev);
      const task = newTasks.get(id);
      const newTaskLabel = event.target.value;
      if (newTaskLabel.trim().length === 0) {
        newTasks.delete(id);
      } else if (task !== undefined && newTaskLabel !== null) {
        newTasks.set(id, { ...task, label: newTaskLabel });
      }
      return newTasks;
    });
  };
  return (
    <li key={item.id} className="flex flex-row gap-2">
      <input
        type="checkbox"
        checked={item.completed}
        onChange={(event) => onCheckedChange(item.id, event)}
      />
      <input
        type="text"
        onChange={(event) => onLabelChanged(item.id, event)}
        value={item.label}
      />
      <button type="button" onClick={(_) => onTrashButtonClicked(item.id)}>
        🗑️
      </button>
    </li>
  );
};

export default TaskComponent;
