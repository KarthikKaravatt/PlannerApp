import TaskList from "@/components/TaskList/TaskList";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/planner/")({
  component: Planner,
});

function Planner() {
  return (
    <>
      <TaskList />
    </>
  );
}
