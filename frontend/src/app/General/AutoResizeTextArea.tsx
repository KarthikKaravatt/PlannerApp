import { useCallback, useEffect, useRef } from "react";
import { TextArea } from "react-aria-components";

export const AutoResizeTextArea: React.FC<
  React.ComponentPropsWithoutRef<"textarea">
> = ({
  value,
  onChange,
  onSelect,
  readOnly,
  className,
  onDoubleClick,
  placeholder,
  style,
  ...rest
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const cursorRef = useRef<number | null>(null);

  const resizeComponent = useCallback(() => {
    if (!textAreaRef.current) {
      return;
    }
    if (value === undefined) {
      return;
    }
    const textArea = textAreaRef.current;
    textArea.style.height = "auto";
    textArea.style.height = `${textArea.scrollHeight.toString()}px`;
  }, [value]);

  const handleOnChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!onChange) {
      return;
    }

    const { value: rawValue, selectionStart } = event.target;
    const currentValue = value;

    //TODO: Maybe perform this here?
    //Assume normalisation
    const normalizedNewValue = rawValue.replace(/\s+/g, " ");

    // clac cursor position after normalisation
    const textBeforeCursor = rawValue.slice(0, selectionStart);
    const normalizedTextBeforeCursor = textBeforeCursor.replace(/\s+/g, " ");
    const charsRemoved =
      textBeforeCursor.length - normalizedTextBeforeCursor.length;
    const newCursorPosition = selectionStart - charsRemoved;

    // correct dom to prevent cursor form jumping
    if (normalizedNewValue === currentValue) {
      if (textAreaRef.current) {
        textAreaRef.current.value = currentValue;
        textAreaRef.current.setSelectionRange(
          newCursorPosition,
          newCursorPosition,
        );
      }
    } else {
      cursorRef.current = newCursorPosition;
    }
    onChange(event);
  };

  useEffect(() => {
    if (!value) {
      return;
    }
    if (textAreaRef.current && cursorRef.current !== null) {
      textAreaRef.current.setSelectionRange(
        cursorRef.current,
        cursorRef.current,
      );
      cursorRef.current = null;
    }
  }, [value]);

  useEffect(() => {
    if (!value) {
      return;
    }
    resizeComponent();
  }, [value, resizeComponent]);

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
      rows={1}
      onChange={handleOnChange}
      onSelect={(event) => {
        if (onSelect) {
          onSelect(event);
        }
      }}
      value={value}
      ref={textAreaRef}
      className={`${className ?? ""} resize-none overflow-hidden`}
    />
  );
};
