import { DRAG_ITEM_ID_KEY, type TaskProp } from "@/types/taskList";
import { DateTime } from "luxon";
import type { ChangeEvent, DragEvent } from "react";

const TaskComponent: React.FC<TaskProp> = ({ item, sortOption, dispatch }) => {
  const onCheckedChange = (
    key: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const isChecked = event.target.checked;
    dispatch({
      type: "CHANGE_TASK_COMPLETION",
      taskID: key,
      completed: isChecked,
    });
  };
  const onTrashButtonClicked = (key: string) => {
    dispatch({ type: "REMOVE_TASK", taskID: key });
  };
  const onLabelChanged = (id: string, event: ChangeEvent<HTMLInputElement>) => {
    const newTaskLabel = event.target.value;
    if (newTaskLabel.trim().length === 0) {
      dispatch({ type: "REMOVE_TASK", taskID: id });
    } else {
      dispatch({ type: "RENAME_TASK", taskID: id, newName: newTaskLabel });
    }
  };
  const onDateButtonClicked = (
    id: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const date = DateTime.fromFormat(event.target.value, "yyyy-MM-dd'T'HH:mm");
    if (date.isValid) {
      dispatch({ type: "UPDATE_DATE", id: id, date: date });
    }
  };
  const onDragStart = (event: DragEvent<HTMLSpanElement>) => {
    if (sortOption === "CUSTOM") {
      event.dataTransfer.setData(DRAG_ITEM_ID_KEY, item.id);
    }
  };
  const onDragOver = (event: DragEvent<HTMLSpanElement>) => {
    if (sortOption === "CUSTOM") {
      event.preventDefault();
    }
  };
  const onDrop = (event: DragEvent<HTMLSpanElement>) => {
    if (sortOption === "CUSTOM") {
      event.preventDefault();
      const swapIDString = event.dataTransfer.getData(DRAG_ITEM_ID_KEY);
      if (swapIDString !== "") {
        dispatch({
          type: "SWAP_TASK_ORDER",
          taskID_A: item.id,
          taskID_B: swapIDString,
        });
      } else {
        console.warn("Swap index string is empty");
      }
    }
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
      <span
        draggable={true}
        onDragStart={(event) => onDragStart(event)}
        onDragOver={(event) => onDragOver(event)}
        onDrop={(event) => onDrop(event)}
      >
        ↕️
      </span>
      <input
        type="datetime-local"
        value={item.date?.toFormat("yyyy-MM-dd'T'HH:mm") ?? ""}
        onChange={(event) => onDateButtonClicked(item.id, event)}
      />
      <button type="button" onClick={(_) => onTrashButtonClicked(item.id)}>
        🗑️
      </button>
    </li>
  );
};

export default TaskComponent;
