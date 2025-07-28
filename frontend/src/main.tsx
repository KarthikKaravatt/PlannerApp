import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDom from "react-dom/client";

import { routeTree } from "./routeTree.gen.ts";

import "./styles.css";
import { Provider } from "react-redux";
import { store } from "./app/store.ts";
import { ThemeProvider } from "./contexts/themeContext.tsx";
import { reportWebVitals } from "./reportWebVitals.ts";

if (import.meta.env.DEV) {
  const reactScan = await import("react-scan")
  reactScan.scan({
    enabled: true,
  });
}

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
  const root = ReactDom.createRoot(rootElement);
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

await reportWebVitals();
