import { createFileRoute } from "@tanstack/react-router";
import { Checkbox } from "react-aria-components";
import { FaCheck } from "react-icons/fa6";

export const Route = createFileRoute("/")({
  component: () => (
    <div className="flex h-screen flex-col items-center justify-center dark:text-white">
      <p>Welcome to PlannerApp</p>
      <Checkbox className={"flex flex-row items-center gap-1 border-2"}>
        <FaCheck />
        LOL
      </Checkbox>
    </div>
  ),
});
