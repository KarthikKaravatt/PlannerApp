import { useState } from "react";
import { Button, Input, parseColor, TextField } from "react-aria-components";
import { CiEdit } from "react-icons/ci";
import { FaCheck, FaSpinner } from "react-icons/fa6";
import {
  useAddTagMutation,
  useGetTagsQuery,
  useModifyTagMutation,
} from "@/redux/tagApiSlice";
import { useGetTaskTagsQuery } from "@/redux/taskApiSlice";
import type { Colour, Tag } from "@/schemas/tag";
import { oklchToRgb, rgbToOklch } from "@/util/rgb-to-okclh";
import { AutoResizeTextArea } from "../General/AutoResizeTextArea.tsx";
import { CustomColorPicker } from "../General/colour-picker/CustomColourPicker.tsx";

export const TAG_MAX_LENGTH = 15;

export const TagDisplay = ({
  listId,
  taskId,
}: {
  listId: string;
  taskId: string;
}) => {
  const {
    data: tags,
    isLoading: isLoadingTags,
    isError: isErrorTags,
  } = useGetTagsQuery();
  const {
    data: taskTags,
    isLoading: isLoadingTaskTags,
    isError: isErrorTaskTags,
  } = useGetTaskTagsQuery({ listId: listId, taskId: taskId });
  //TODO: Loading state
  const [addTag] = useAddTagMutation();
  const isLoading = isLoadingTags || isLoadingTaskTags;
  const isError = isErrorTags || isErrorTaskTags;
  const [inputColour, setInputColour] = useState(
    parseColor("rgb(255, 255, 255)"),
  );
  const [inputTagName, setInputTagName] = useState("");
  const handleAddTag = () => {
    if (inputTagName.length === 0) {
      //TODO: Maybe use a toast here
      return;
    }
    const rgb = inputColour.toFormat("rgb");
    const colour = rgbToOklch({
      r: rgb.getChannelValue("red"),
      g: rgb.getChannelValue("green"),
      b: rgb.getChannelValue("blue"),
    }) satisfies Colour;
    addTag({ name: inputTagName, colour: colour });
  };
  if (isLoading) {
    return <FaSpinner className="animate-spin" />;
  }
  if (isError || !tags || !taskTags) {
    //TODO: Not sure if I want to display error information to the user?
    if (!tags) {
      return <p>Error loading tags</p>;
    }
    if (!taskTags) {
      return <p>Error loading task tags</p>;
    }
  }

  return (
    <div className="p-1">
      <div className="flex flex-row items-center gap-1 pb-1">
        <AutoResizeTextArea
          className="w-35"
          value={inputTagName}
          onChange={(event) => {
            setInputTagName(
              event.target.value.replace("/\s+g", "").slice(0, TAG_MAX_LENGTH),
            );
          }}
          placeholder="tag name"
        ></AutoResizeTextArea>
        <CustomColorPicker value={inputColour} onChange={setInputColour} />
        <Button
          onPress={handleAddTag}
          className="rounded-md bg-blue-200 p-0.5 pr-1.5 pl-1.5 text-blue-950 dark:bg-white dark:text-black"
        >
          Add
        </Button>
      </div>
      <div className="flex flex-col">
        {tags.map((t) => {
          return <TagComponent key={t.id} tag={t} />;
        })}
      </div>
    </div>
  );
};

const TagComponent = ({ tag }: { tag: Tag }) => {
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
