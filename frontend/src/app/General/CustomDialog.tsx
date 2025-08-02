import {
  Button,
  Dialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import type { IconType } from "react-icons/lib";
import { CustomTooltip } from "./CustomToolTip.tsx";

export const CustomDialog = ({
  toolTipMessage,
  dialogMessage,
  heading,
  triggerIcon: TriggerIcon,
  onPressAllow,
}: {
  toolTipMessage?: string;
  dialogMessage: string;
  heading: string;
  triggerIcon: IconType;
  onPressAllow: () => void;
}) => {
  const buttonBaseClassName =
    "p-1 transition duration-150 ease-in hover:scale-110 text-blue-950 dark:text-white";
  return (
    <DialogTrigger>
      {toolTipMessage ? (
        <CustomTooltip message={toolTipMessage}>
          <Button className={buttonBaseClassName}>
            <TriggerIcon />
          </Button>
        </CustomTooltip>
      ) : (
        <Button className={buttonBaseClassName}>
          <TriggerIcon />
        </Button>
      )}
      <ModalOverlay
        isDismissable
        className="group fixed inset-0 z-20 flex items-center justify-center text-blue-950 backdrop-blur-xs transition duration-150 ease-in data-[entering]:backdrop-blur-none data-[exiting]:backdrop-blur-none dark:text-white"
      >
        <Modal>
          <Dialog
            role="alertdialog"
            className=" w-fit rounded-md border-2 border-red-600 bg-blue-100 p-2 transition-opacity duration-150 ease-in group-data-[entering]:opacity-0  group-data-[exiting]:opacity-0 dark:bg-dark-background-c"
          >
            <Heading className="font-bold dark:text-red-600" slot="title">
              {heading}
            </Heading>
            <p>{dialogMessage}</p>
            <div className=" flex flex-row gap-2 pt-2">
              <Button
                slot={"close"}
                className={`${buttonBaseClassName} rounded-md bg-blue-200 dark:bg-dark-background-sub-c`}
              >
                Deny
              </Button>
              <Button
                slot={"close"}
                className={`${buttonBaseClassName} rounded-md bg-red-200 dark:bg-red-950`}
                onPress={onPressAllow}
              >
                Allow
              </Button>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
};
