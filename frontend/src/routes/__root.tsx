// import { ThemeSwitcher } from "@/app/ThemeSwitcher";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
	component: () => (
		<>
			{/* <header */}
			{/* 	className=" */}
			{/*      flex justify-end */}
			{/*      bg-blue-100 dark:bg-dark-background-c */}
			{/*      backdrop-blur-sm */}
			{/*      " */}
			{/* > */}
			{/* 	<ThemeSwitcher /> */}
			{/* </header> */}
			<Outlet />
			<TanStackRouterDevtools />
		</>
	),
});
