import { ThemeSwitcher } from "@/app/ThemeSwitcher";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
	component: () => (
		<>
			<header
				className="
        p-4 h-15
        flex justify-end sticky 
        top-0 z-50 
        bg-blue-100 dark:bg-dark-background-c
        backdrop-blur-sm
        "
			>
				<ThemeSwitcher />
			</header>
			<Outlet />
			<TanStackRouterDevtools />
		</>
	),
});
