import { TaskListComponent } from "@/app/TaskList/TaskListComponent";
import { useGetTaskListQuery } from "@/redux/api/apiSlice";
import { createFileRoute } from "@tanstack/react-router";
import { FaSpinner } from "react-icons/fa6";

export const Route = createFileRoute("/planner/")({
	component: Planner,
});

function Planner() {
	return (
		<>
			<div className="text-sm flex items-center justify-center w-full h-full">
				<div className="w-full h-full">
					<TaskLists />
				</div>
			</div>
		</>
	);
}

const TaskLists: React.FC = () => {
	const { data, isLoading, isSuccess } = useGetTaskListQuery();
	if (isLoading) {
		return <FaSpinner />;
	}
	if (isSuccess) {
		return (
			<>
				{data.map((list) => {
					return (
						<TaskListComponent
							key={list.id}
							listId={list.id}
							listName={list.name}
						/>
					);
				})}
			</>
		);
	}
};
