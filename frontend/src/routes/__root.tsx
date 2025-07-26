import { createRootRoute, Outlet } from "@tanstack/react-router";
// import { lazy, Suspense } from "react";
// import { FaSpinner } from "react-icons/fa6";

// const ThemeSwitcher = lazy(() =>
//   import("@/app/ThemeSwitcher").then((module) => ({
//     default: module.ThemeSwitcher,
//   })),
// );

export const Route = createRootRoute({
  component: () => (
    <>
      {/* <header className=" flex justify-end bg-blue-100 backdrop-blur-sm dark:bg-dark-background-c "> */}
      {/*   <Suspense */}
      {/*     fallback={ */}
      {/*       <div className="p-2"> */}
      {/*         <FaSpinner className="animate-spin" /> */}
      {/*       </div> */}
      {/*     } */}
      {/*   > */}
      {/*     <ThemeSwitcher /> */}
      {/*   </Suspense> */}
      {/* </header> */}
      <Outlet />
    </>
  ),
});
