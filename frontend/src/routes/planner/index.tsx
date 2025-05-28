import TaskListComponent from "@/app/TaskList/TaskListComponent";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/planner/")({
	component: Planner,
});

function Planner() {
	return (
		<>
			<div className="text-sm flex items-center justify-center w-full h-full">
				<div className="w-full h-full overflow-scroll">
					<TaskListComponent />
				</div>
			</div>
		</>
	);
}
