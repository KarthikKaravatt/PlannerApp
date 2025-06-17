import { AutoResizeTextArea } from "@/app/General/AutoResizeTextArea";
import { SideBar } from "@/app/General/SideBar";
import { TaskListComponent } from "@/app/TaskList/TaskListComponent";
import {
	useAddNewTaskListMutation,
	useGetTaskListQuery,
} from "@/redux/api/apiSlice";
import { logError } from "@/util/console";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "react-aria-components";
import { FaSpinner } from "react-icons/fa6";
export const Route = createFileRoute("/planner/")({
	component: Planner,
});

function Planner() {
	return (
		<>
			<div className="w-full h-screen text-blue-950 dark:text-white">
				<div className="w-full h-full flex flex-row overflow-x-auto">
					<ListSideBar />
					<TaskLists className="flex flex-row min-w-250" />
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

const ListSideBar: React.FC = () => {
	//TODO: add a loading state
	const [addTaskList] = useAddNewTaskListMutation();
	const [newListName, setNewListName] = useState("");
	return (
		<>
			<SideBar>
				<div className="flex w-50">
					<AutoResizeTextArea
						value={newListName}
						onChange={(event) => {
							const newValue = event.target.value.replace(/\s+/g, " ");
							setNewListName(
								newValue.length > 25 ? newValue.slice(0, 25) : newValue,
							);
						}}
						placeholder="Add new task list"
						className="border-1 border-gray-300 rounded-r-none rounded-md m-1 p-1 mr-0"
					/>
					<Button
						type="button"
						className={
							"text-sm bg-blue-200 rounded-l-none rounded-md m-1 p-1 ml-0"
						}
						onClick={() => {
							addTaskList({ name: newListName })
								.then(() => {
									setNewListName("");
								})
								.catch((err: unknown) => {
									if (err instanceof Error) {
										logError("Error adding task list", err);
									}
								});
						}}
					>
						Add
					</Button>
				</div>
			</SideBar>
		</>
	);
};
