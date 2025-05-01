import type { TaskListAction, TaskListState } from "@/types/taskList";

export function taskListReducer(
  state: TaskListState,
  action: TaskListAction,
): TaskListState {
  const taskList = new Map(state.taskList);
  let order = [...state.order];
  switch (action.type) {
    case "ADD_TASK": {
      const task = action.task;
      taskList.set(task.id, task);
      order.push(task.id);
      return { taskList: taskList, order: order };
    }
    case "REMOVE_TASK": {
      const id = action.taskID;
      taskList.delete(id);
      order = order.filter((i) => i !== id);
      return { taskList: taskList, order: order };
    }
    case "CLEAR_COMPLETED": {
      const filteredMap = new Map(
        Array.from(taskList).filter(([_, task]) => {
          return !task.completed;
        }),
      );
      const filteredOrder = order.filter((id) => !filteredMap.has(id));
      return { taskList: filteredMap, order: filteredOrder };
    }
    case "CHANGE_TASK_COMPLETION": {
      const id = action.taskID;
      const completed = action.completed;
      const task = taskList.get(id);
      if (task !== undefined) {
        taskList.set(id, { ...task, completed: completed });
      } else {
        console.warn(`Task:${id} is not in the map`);
      }
      return { taskList: taskList, order: order };
    }
    case "RENAME_TASK": {
      const id = action.taskID;
      const name = action.newName;
      const task = taskList.get(id);
      if (task !== undefined) {
        taskList.set(id, { ...task, label: name });
      } else {
        console.warn(`Task:${id} is not in the map`);
      }
      return { taskList: taskList, order: order };
    }
    case "SWAP_TASK_ORDER": {
      const taskID_A = action.taskID_A;
      const taskID_B = action.taskID_B;
      const indexA = order.indexOf(taskID_A);
      const indexB = order.indexOf(taskID_B);
      if (indexA !== -1 || indexB !== -1) {
        const temp = taskID_A;
        order[indexA] = taskID_B;
        order[indexB] = temp;
      } else {
        console.warn("Tasks not inside order array");
      }
      return { taskList: taskList, order: order };
    }
    case "UPDATE_DATE": {
      const date = action.date;
      const id = action.id;
      const task = taskList.get(id);
      if (task !== undefined) {
        taskList.set(id, { ...task, date: date });
      } else {
        console.warn(`Task:${id} is not in the map`);
      }
      return { taskList: taskList, order: order };
    }
  }
}

export default taskListReducer;
