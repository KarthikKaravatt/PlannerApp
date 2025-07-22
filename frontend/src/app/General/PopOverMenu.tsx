import type React from "react";
import { Button, Dialog, DialogTrigger, Popover } from "react-aria-components";
import { BsThreeDots } from "react-icons/bs";

interface PopOverMenuProps {
  children: React.ReactNode;
  isDisabled?: boolean;
}

export const PopOverMenu: React.FC<PopOverMenuProps> = ({
  children,
  isDisabled,
}) => {
  return (
    <DialogTrigger>
      <Button isDisabled={isDisabled ?? false}>
        <BsThreeDots />
      </Button>
      <Popover>
        <Dialog className="border-1 border-gray-300 dark:border-white bg-sky-100 dark:bg-dark-background-c text-sm gap-y-0.5 flex flex-col p-0.5 text-blue-950 dark:text-white rounded-md">
          {children}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
};
