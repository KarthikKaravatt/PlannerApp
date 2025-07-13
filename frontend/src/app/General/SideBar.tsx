import { useState } from "react";
import { Button } from "react-aria-components";
import { GiHamburgerMenu } from "react-icons/gi";

interface SideBarProps {
  children: React.ReactNode;
}

export const SideBar: React.FC<SideBarProps> = ({ children }) => {
  const [sideBarOpen, setSideBarOpen] = useState(false);
  return (
    //TODO: Maybe find a way to not use hidden here?
    <div className="flex h-full">
      <div
        className={`
        flex flex-col
      `}
      >
        <Button
          className={"self-start pb-1"}
          type="button"
          onClick={() => {
            setSideBarOpen((prev) => !prev);
          }}
        >
          <GiHamburgerMenu className="mt-2 text-2xl bg-blue-200 rounded-md ml-1 p-1" />
        </Button>
        <div hidden={!sideBarOpen}>{children}</div>
      </div>
    </div>
  );
};
