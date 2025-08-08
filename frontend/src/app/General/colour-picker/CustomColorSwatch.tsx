import { ColorSwatch, type ColorSwatchProps } from "react-aria-components";

export function CustomColorSwatch(props: ColorSwatchProps) {
  return (
    <ColorSwatch
      {...props}
      style={({ color }) => ({
        background: `linear-gradient(${color}, ${color}),
          repeating-conic-gradient(#CCC 0% 25%, white 0% 50%) 50% / 16px 16px`,
      })}
    />
  );
}
