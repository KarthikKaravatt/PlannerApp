import {
  ColorArea,
  type ColorAreaProps,
  ColorThumb,
} from "react-aria-components";

export function CustomColorArea(props: ColorAreaProps) {
  return (
    <ColorArea className={"w-40 h-40 shrink-0"} {...props}>
      <ColorThumb
        className={"w-4 h-4 rounded-full border-2 border-white box-border"}
      />
    </ColorArea>
  );
}
