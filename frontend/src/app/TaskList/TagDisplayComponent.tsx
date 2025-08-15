import { memo, useState } from "react";
import { Button, Checkbox, parseColor } from "react-aria-components";
import { BiCheckCircle, BiCircle } from "react-icons/bi";
import { CiEdit, CiPickerEmpty } from "react-icons/ci";
import { FaCheck, FaSpinner } from "react-icons/fa6";
import {
  useAddTagMutation,
  useGetTagsQuery,
  useModifyTagMutation,
} from "@/redux/tagApiSlice";
import {
  useAddTaskTagMutation,
  useGetTaskTagsQuery,
} from "@/redux/taskApiSlice";
import type { Colour, Tag } from "@/schemas/tag";
import { oklchToRgb, rgbToOklch } from "@/util/rgb-to-okclh";
import { AutoResizeTextArea } from "../General/AutoResizeTextArea.tsx";
import { CustomColorPicker } from "../General/colour-picker/CustomColourPicker.tsx";

export const TAG_MAX_LENGTH = 10;

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
  //TODO: Loading state
  const isLoading = isLoadingTags;
  const isError = isErrorTags;
  if (isLoading) {
    return <FaSpinner className="animate-spin" />;
  }
  if (isError || !tags) {
    //TODO: Not sure if I want to display error information to the user?
    if (!tags) {
      return <p>Error loading tags</p>;
    }
  }

  return (
    <div className="flex w-fit flex-col gap-1">
      <TagInput />
      <div className="flex h-40 flex-col overflow-auto">
        {tags.map((t) => {
          return (
            <TagComponent key={t.id} tag={t} listId={listId} taskId={taskId} />
          );
        })}
      </div>
    </div>
  );
};
const TagInput = () => {
  const [addTag, { isLoading }] = useAddTagMutation();
  const [inputColour, setInputColour] = useState(
    parseColor("rgb(255, 255, 255)").toFormat("rgb"),
  );
  const [inputTagName, setInputTagName] = useState("");
  const handleAddTag = () => {
    if (inputTagName.length === 0) {
      //TODO: Maybe use a toast here
      return;
    }
    const colour = rgbToOklch({
      r: inputColour.getChannelValue("red"),
      g: inputColour.getChannelValue("green"),
      b: inputColour.getChannelValue("blue"),
    }) satisfies Colour;
    addTag({ name: inputTagName, colour: colour });
  };
  return (
    <div className="flex flex-row items-center gap-1 p-1">
      <AutoResizeTextArea
        value={inputTagName}
        onChange={(event) => {
          setInputTagName(
            event.target.value.replace("/s+g", "").slice(0, TAG_MAX_LENGTH),
          );
        }}
        placeholder="tag name"
      />
      <div
        className={"h-5 w-5 border border-gray-300 dark:border-none"}
        style={{ color: inputColour.toString("rgb") }}
      >
        <CustomColorPicker
          triggerIcon={CiPickerEmpty}
          value={inputColour}
          onChange={(val) => setInputColour(() => val.toFormat("rgb"))}
        />
      </div>
      <Button
        className="rounded-md bg-blue-200 p-0.5 dark:bg-white dark:text-black"
        isDisabled={isLoading}
        onPress={handleAddTag}
      >
        Add
      </Button>
    </div>
  );
};

const TagComponent = memo(
  ({ tag, listId, taskId }: { tag: Tag; listId: string; taskId: string }) => (
    <TagComponentBase tag={tag} listId={listId} taskId={taskId} />
  ),
);

const TagComponentBase = ({
  tag,
  listId,
  taskId,
}: {
  tag: Tag;
  listId: string;
  taskId: string;
}) => {
  const {
    data: taskTags,
    isLoading: isLoadingTaskTags,
    isError: isErrorTaskTags,
  } = useGetTaskTagsQuery({ listId: listId, taskId: taskId });
  const [inputTagName, setInputTagName] = useState(tag.name);
  const [isEditable, setIsEditable] = useState(false);
  const [inputColour, setInputColour] = useState(() => {
    const rgb = oklchToRgb(tag.colour);
    const rgbString = `rgb(${rgb.r.toString()}, ${rgb.g.toString()}, ${rgb.b.toString()})`;
    return parseColor(rgbString);
  });
  //TODO:Loading state
  const [updateTag] = useModifyTagMutation();
  const [addTaskTag] = useAddTaskTagMutation();
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
  if (isLoadingTaskTags) {
    return <FaSpinner className="animate-spin" />;
  }
  if (isErrorTaskTags || !taskTags) {
    return <p>Error loading task tags</p>;
  }
  const taskTagsSet = new Set(taskTags.map((t) => t.id));
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: this is intractable
    <div
      className="m-1 flex flex-row items-center justify-between rounded-md "
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsEditable(false);
          handleUpdateTag();
        }
      }}
    >
      <div className=" flex flex-row items-center gap-1">
        <Checkbox>
          <Button
            onPress={() =>
              addTaskTag({ listId: listId, taskId: taskId, tagId: tag.id })
            }
          >
            {taskTagsSet.has(tag.id) ? (
              <BiCheckCircle className="text-xs" />
            ) : (
              <BiCircle className="text-xs" />
            )}
          </Button>
        </Checkbox>
        <AutoResizeTextArea
          className={"w-fit rounded-md"}
          onDoubleClick={() => setIsEditable(true)}
          readOnly={!isEditable}
          value={inputTagName}
          onChange={(event) => {
            setInputTagName(
              event.target.value.replace("/s+g", "").slice(0, TAG_MAX_LENGTH),
            );
          }}
        />
      </div>
      <div className="flex flex-row items-center gap-1">
        <div className="h-5 w-5">
          <CustomColorPicker
            onConfirm={() => handleUpdateTag()}
            value={inputColour}
            onChange={setInputColour}
          />
        </div>
        <Button
          onClick={() => {
            setIsEditable((prev) => !prev);
            handleUpdateTag();
          }}
        >
          {isEditable ? <FaCheck /> : <CiEdit />}
        </Button>
      </div>
    </div>
  );
};
