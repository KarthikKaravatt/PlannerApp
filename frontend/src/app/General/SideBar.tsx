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
  return (
    <DialogTrigger>
      <Button>
        <GiHamburgerMenu className={`${textColor} m-2 text-lg`} />
      </Button>
      <ModalOverlay
        isDismissable={true}
        className="z-20 fixed inset-0 backdrop-blur-xs"
      >
        <Modal className=" fixed top-0 bottom-0 left-0 w-fit border-l border-l-[var(--border-color)] bg-sky-100 shadow-xl outline-none dark:bg-dark-background-c ">
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
  );
};
