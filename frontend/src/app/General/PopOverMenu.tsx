import type React from "react";
import { Button, Dialog, DialogTrigger, Popover } from "react-aria-components";
import { BsThreeDots } from "react-icons/bs";
import { CustomTooltip } from "./CustomToolTip.tsx";

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
      <CustomTooltip message={hoverMessage ?? ""}>
        <Button isDisabled={isDisabled ?? false}>
          <BsThreeDots />
        </Button>
      </CustomTooltip>
      <Popover className="shadow-lg transition duration-100 ease-in data-[entering]:opacity-0 data-[exiting]:opacity-0">
        <Dialog className="flex flex-col gap-y-0.5 rounded-md border-1 border-gray-300 bg-sky-100 p-0.5 text-sm text-blue-950 dark:border-none dark:border-white dark:bg-dark-background-sub-c dark:text-white">
          {children}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
};
