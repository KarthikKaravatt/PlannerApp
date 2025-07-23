import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AutoResizeTextArea } from "../AutoResizeTextArea.tsx";

describe("AutoResizeTextArea", () => {
  it("renders with placeholder text", () => {
    const testValue = "Enter your text here";
    render(<AutoResizeTextArea placeholder={testValue} />);

    const textarea = screen.getByPlaceholderText(testValue);
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveClass("resize-none", "overflow-hidden");
  });

  it("displays the provided value", () => {
    render(<AutoResizeTextArea value="Hello World" readOnly />);

    const textarea = screen.getByDisplayValue("Hello World");
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue("Hello World");
  });

  it("calls onChange when text is entered", () => {
    const handleChange = vi.fn();

    render(
      <AutoResizeTextArea
        value=""
        onChange={handleChange}
        placeholder="Type something"
      />,
    );

    const textarea = screen.getByPlaceholderText("Type something");
    fireEvent.change(textarea, { target: { value: "New text" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("has the correct default props", () => {
    render(<AutoResizeTextArea />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("rows", "1");
  });
});
