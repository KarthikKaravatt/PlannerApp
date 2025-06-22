import { useCallback, useEffect, useRef } from "react";
import { TextArea } from "react-aria-components";

export const AutoResizeTextArea: React.FC<
  React.ComponentPropsWithoutRef<"textarea">
> = ({
  value,
  onChange,
  readOnly,
  className,
  onDoubleClick,
  placeholder,
  ...rest
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  // Linter complains this needs a useCallback but pretty sure the compiler
  // picks up on it anyways :/
  const resizeComponent = useCallback(() => {
    if (!textAreaRef.current) {
      return;
    }
    if (value === undefined) {
      return;
    }
    const textArea = textAreaRef.current;
    //Recalculate scroll height
    textArea.style.height = "auto";
    //apply proper height
    textArea.style.height = `${textArea.scrollHeight.toString()}px`;
  }, [value]);
  resizeComponent();
  useEffect(() => {
    if (!textAreaRef.current) {
      return;
    }
    const observer = new ResizeObserver(() => {
      resizeComponent();
    });
    observer.observe(textAreaRef.current);
    return () => {
      observer.disconnect();
    };
  }, [resizeComponent]);
  return (
    <TextArea
      {...rest}
      onDoubleClick={(event) => {
        if (onDoubleClick) {
          onDoubleClick(event);
          const textArea = textAreaRef.current;
          if (textArea) {
            const textEnd = textArea.textLength;
            textArea.setSelectionRange(textEnd, textEnd);
          }
        }
      }}
      placeholder={placeholder}
      readOnly={readOnly}
      // Default is like 3 for some reason
      rows={1}
      onChange={onChange}
      value={value}
      ref={textAreaRef}
      className={`overflow-hidden resize-none ${className ?? ""}`}
    />
  );
};
