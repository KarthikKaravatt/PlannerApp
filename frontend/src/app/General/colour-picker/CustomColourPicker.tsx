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
}

export function CustomColorPicker({
  label,
  children,
  ...props
}: MyColorPickerProps) {
  return (
    <ColorPicker {...props}>
      <DialogTrigger>
        <Button className={"w-5 h-5"}>
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
              </>
            )}
          </Dialog>
        </Popover>
      </DialogTrigger>
    </ColorPicker>
  );
}
