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
      <Button isDisabled={isDisabled}>
        <BsThreeDots />
      </Button>
      <Popover>
        <Dialog className="bg-sky-100 text-sm gap-y-0.5 flex flex-col p-0.5 text-blue-950 rounded-md">
          {children}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
};
