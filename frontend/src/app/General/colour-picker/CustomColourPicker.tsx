import type { ColorPickerProps } from "react-aria-components";
import {
  Button,
  ColorPicker,
  Dialog,
  DialogTrigger,
  Popover,
} from "react-aria-components";
import { CustomColorArea } from "./CusotmColourArea.tsx";
import { CustomColorSwatch } from "./CustomColorSwatch.tsx";
import { CustomColorSlider } from "./CustomColourSlider.tsx";

interface MyColorPickerProps extends ColorPickerProps {
  label?: string;
  children?: React.ReactNode;
  onConfirm?: () => void;
}

export function CustomColorPicker({
  label,
  children,
  onConfirm,
  ...props
}: MyColorPickerProps) {
  return (
    <ColorPicker {...props}>
      <DialogTrigger>
        <Button className={"w-3.5 h-3.5"}>
          <CustomColorSwatch className={"w-full h-full"} />
          <span>{label}</span>
        </Button>
        <Popover
          className="rounded-md border border-gray-300 bg-sky-100 p-0.5 transition-opacity duration-100 ease-in dark:border-none dark:bg-dark-background-sub-c entering:opacity-0 exiting:opacity-0"
          placement="bottom start"
        >
          <Dialog className="flex flex-col gap-1 bg-none p-1">
            {children || (
              <>
                <CustomColorArea
                  colorSpace="hsb"
                  xChannel="saturation"
                  yChannel="brightness"
                />
                <CustomColorSlider colorSpace="hsb" channel="hue" />
                {onConfirm && (
                  <Button
                    slot={"close"}
                    onPress={() => {
                      onConfirm();
                    }}
                    className={
                      "dark:bg-dark-background-sub-c dark:text-white bg-sky-100 text-shadow-blue-950"
                    }
                  >
                    Confirm
                  </Button>
                )}
              </>
            )}
          </Dialog>
        </Popover>
      </DialogTrigger>
    </ColorPicker>
  );
}
