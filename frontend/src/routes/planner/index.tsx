import { TaskListComponent } from "@/app/TaskList/TaskListComponent";
import { useGetTaskListQuery } from "@/redux/api/apiSlice";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "react-aria-components";
import { FaSpinner } from "react-icons/fa6";
import { GiHamburgerMenu } from "react-icons/gi";

export const Route = createFileRoute("/planner/")({
	component: Planner,
});

function Planner() {
	return (
		<>
			<div className="w-full h-screen overflow-y-hidden ">
				<div className="w-full h-full flex flex-row overflow-x-auto">
					<div className="min-w-5 h-full">
						<Button type="button">
							<GiHamburgerMenu className="mt-3 text-2xl" />
						</Button>
					</div>
					<TaskLists className="flex flex-row min-w-250 h-full grow" />
				</div>
			</div>
		</>
	);
}

interface TaskListsProps {
	className?: string;
}
const TaskLists: React.FC<TaskListsProps> = ({ className }) => {
	const { data, isLoading, isSuccess } = useGetTaskListQuery();
	if (isLoading) {
		return <FaSpinner />;
	}
	if (isSuccess) {
		return (
			<div className={className}>
				{data.map((list) => {
					return (
						<TaskListComponent
							key={list.id}
							listId={list.id}
							listName={list.name}
						/>
					);
				})}
			</div>
		);
	}
};
