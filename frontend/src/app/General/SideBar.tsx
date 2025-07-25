import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";

interface SideBarProps {
  children: React.ReactNode;
  title: string;
  textColor: string;
}

export const SideBar: React.FC<SideBarProps> = ({
  children,
  title,
  textColor,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="h-screen">
      <DialogTrigger onOpenChange={(isOpen) => setOpen(isOpen)}>
        <Button onClick={() => setOpen(true)}>
          <GiHamburgerMenu className={`${textColor} m-2 text-lg`} />
        </Button>
        <ModalOverlay
          isDismissable={true}
          className={`${open ? "backdrop-blur-xs" : ""} fixed inset-0 z-20 transition duration-200 ease-in`}
        >
          <Modal className="left-0 h-full w-fit border-l border-l-[var(--border-color)] bg-sky-100 shadow-xl transition duration-200 ease-in outline-none data-[entering]:opacity-0 data-[exiting]:opacity-0 dark:bg-dark-background-c ">
            <Dialog className={`${textColor} p-1`}>
              <div className="flex flex-row gap-1">
                <Button slot="close">
                  <IoMdClose />
                </Button>
                <Heading className="font-bold" slot="title">
                  {title}
                </Heading>
              </div>
              {children}
            </Dialog>
          </Modal>
        </ModalOverlay>
      </DialogTrigger>
    </div>
  );
};
