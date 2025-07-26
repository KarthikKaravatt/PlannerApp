import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => (
    <div className="flex items-center justify-center h-screen">
      <p>Welcome to PlannerApp</p>
    </div>
  ),
});
