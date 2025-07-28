import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => (
    <div className="dark:text-white flex h-screen items-center justify-center">
      <p>Welcome to PlannerApp</p>
    </div>
  ),
});
