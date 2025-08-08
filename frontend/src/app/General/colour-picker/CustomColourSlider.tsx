import {
  ColorSlider,
  type ColorSliderProps,
  ColorThumb,
  SliderTrack,
} from "react-aria-components";

interface MyColorSliderProps extends ColorSliderProps {
  label?: string;
}

export function CustomColorSlider({ label, ...props }: MyColorSliderProps) {
  return (
    <ColorSlider className={"grid w-full grid-cols-1"} {...props}>
      <SliderTrack
        className={"h-5"}
        style={({ defaultStyle }) => ({
          background: `${defaultStyle.background},
            repeating-conic-gradient(#CCC 0% 25%, white 0% 50%) 50% / 16px 16px`,
        })}
      >
        <ColorThumb
          className={
            " top-[50%] w-4 h-4 rounded-full border-2 border-white box-border"
          }
        />
      </SliderTrack>
    </ColorSlider>
  );
}
