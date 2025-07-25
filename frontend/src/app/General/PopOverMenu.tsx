import type React from "react";
import { Button, Dialog, DialogTrigger, Popover } from "react-aria-components";
import { BsThreeDots } from "react-icons/bs";
import { Tooltip } from "./ToolTip.tsx";

interface PopOverMenuProps {
  children: React.ReactNode;
  hoverMessage?: string;
  isDisabled?: boolean;
}

export const PopOverMenu: React.FC<PopOverMenuProps> = ({
  hoverMessage,
  children,
  isDisabled,
}) => {
  return (
    <DialogTrigger>
      <Tooltip message={hoverMessage ?? ""}>
        <Button isDisabled={isDisabled ?? false}>
          <BsThreeDots />
        </Button>
      </Tooltip>
      <Popover>
        <Dialog className="flex flex-col gap-y-0.5 rounded-md border-1 border-gray-300 bg-sky-100 p-0.5 text-sm text-blue-950 dark:border-white dark:bg-dark-background-c dark:text-white">
          {children}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
};
