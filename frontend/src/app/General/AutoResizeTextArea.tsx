import { useEffect, useRef } from "react";

interface AutoResizeTextInputProps
	extends React.ComponentPropsWithoutRef<"textarea"> {
	value: string;
}
const AutoResizeTextInput: React.FC<AutoResizeTextInputProps> = ({
	value,
	onChange,
	readOnly,
	className,
	onDoubleClick,
}) => {
	const textAreaRef = useRef<HTMLTextAreaElement>(null);
	useEffect(() => {
		const textArea = textAreaRef.current;
		if (textArea && value) {
			//Recalculate scroll height
			textArea.style.height = "auto";
			//apply proper height
			textArea.style.height = `${textArea.scrollHeight.toString()}px`;
		}
	});
	return (
		<textarea
			onDoubleClick={onDoubleClick}
			readOnly={readOnly}
			// Default is like 3 for some reason
			rows={1}
			onChange={onChange}
			value={value}
			ref={textAreaRef}
			className={`resize-none ${className ?? ""}`}
		/>
	);
};

export default AutoResizeTextInput;
