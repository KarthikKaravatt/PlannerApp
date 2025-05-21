import TaskListComponent from "@/app/TaskList/TaskListComponent";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/planner/")({
	component: Planner,
});

function Planner() {
	return (
		<>
			<TaskListComponent />
		</>
	);
}
