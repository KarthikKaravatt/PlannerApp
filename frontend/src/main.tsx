import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { scan } from "react-scan";

import { routeTree } from "./routeTree.gen";

import "./styles.css";
import { Provider } from "react-redux";
import { store } from "./app/store.ts";
import reportWebVitals from "./reportWebVitals.ts";
import { ThemeProvider } from "./app/ThemeContext.tsx";

scan({
	enabled: true,
});

const router = createRouter({
	routeTree,
	context: {},
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultStructuralSharing: true,
	defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<Provider store={store}>
				<ThemeProvider>
					<RouterProvider router={router} />
				</ThemeProvider>
			</Provider>
		</StrictMode>,
	);
}

reportWebVitals();
