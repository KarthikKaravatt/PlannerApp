import { useState } from "react";
import { Button, Input, parseColor, TextField } from "react-aria-components";
import { CiEdit } from "react-icons/ci";
import { FaCheck } from "react-icons/fa6";
import { useModifyTagMutation } from "@/redux/tagApiSlice";
import type { Colour, Tag } from "@/schemas/tag";
import { oklchToRgb, rgbToOklch } from "@/util/rgb-to-okclh";
import { CustomColorPicker } from "../General/colour-picker/CustomColourPicker.tsx";

export const TAG_MAX_LENGTH = 15;

export const TagComponent = ({ tag }: { tag: Tag }) => {
  const [inputTagName, setInputTagName] = useState(tag.name);
  const [isEditable, setIsEditable] = useState(false);
  const [inputColour, setInputColour] = useState(() => {
    const rgb = oklchToRgb(tag.colour);
    const rgbString = `rgb(${rgb.r.toString()}, ${rgb.g.toString()}, ${rgb.b.toString()})`;
    return parseColor(rgbString);
  });
  //TODO:Loading state
  const [updateTag] = useModifyTagMutation();
  const handleUpdateTag = () => {
    const newRgb = inputColour.toFormat("rgb");
    const colour = rgbToOklch({
      r: newRgb.getChannelValue("red"),
      g: newRgb.getChannelValue("green"),
      b: newRgb.getChannelValue("blue"),
    }) satisfies Colour;
    const payload: Omit<Tag, "id"> = { name: inputTagName, colour: colour };
    const rgb = oklchToRgb(tag.colour);
    const rgbString = `rgb(${rgb.r.toString()}, ${rgb.g.toString()}, ${rgb.b.toString()})`;
    updateTag({ id: tag.id, tagPayload: payload }).catch(() => {
      setInputTagName(tag.name);
      setInputColour(parseColor(rgbString));
    });
  };
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: this is intractable
    <div
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsEditable(false);
          handleUpdateTag();
        }
      }}
      className="flex items-center gap-1.5"
    >
      <TextField aria-label="tag name">
        <Input
          className={`${!isEditable ? "caret-transparent outline-none" : ""} w-40`}
          onDoubleClick={() => setIsEditable(true)}
          readOnly={!isEditable}
          value={inputTagName}
          onChange={(event) => {
            setInputTagName(
              event.target.value.replace("/\s+g", "").slice(0, TAG_MAX_LENGTH),
            );
          }}
        />
      </TextField>
      <CustomColorPicker
        onConfirm={() => handleUpdateTag()}
        value={inputColour}
        onChange={setInputColour}
      />
      <Button
        onClick={() => {
          setIsEditable((prev) => !prev);
          handleUpdateTag();
        }}
      >
        {isEditable ? <FaCheck /> : <CiEdit />}
      </Button>
    </div>
  );
};
