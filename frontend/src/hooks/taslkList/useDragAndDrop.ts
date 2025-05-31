import { useSwapTaskOrderMutation } from "@/redux/api/apiSlice";
import type { Task } from "@/schemas/taskList";
import { DRAG_ITEM_ID_KEY } from "@/types/taskList";
import type { DragEvent } from "react";

export const useDragAndDrop = (task: Task) => {
	const [swapTasks] = useSwapTaskOrderMutation();

	const onDragStart = (item: Task, event: DragEvent<HTMLSpanElement>) => {
		event.dataTransfer.setData(DRAG_ITEM_ID_KEY, item.id);
	};
	const onDragOver = (event: DragEvent<HTMLSpanElement>) => {
		event.preventDefault();
	};
	const onDrop = (event: DragEvent<HTMLSpanElement>) => {
		event.preventDefault();
		const swapIdString = event.dataTransfer.getData(DRAG_ITEM_ID_KEY);
		if (swapIdString !== "") {
			swapTasks({ id1: task.id, id2: swapIdString }).catch((err: unknown) => {
				if (err instanceof Error) {
					console.error(`Error swapping tasks${err}`);
				}
			});
		}
	};
	return {
		onDragStart,
		onDragOver,
		onDrop,
	};
};
