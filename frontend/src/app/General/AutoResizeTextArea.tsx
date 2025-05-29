import { useCallback, useEffect, useRef } from "react";

const AutoResizeTextInput: React.FC<
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
		const textArea = textAreaRef.current;
		if (textArea) {
			//Recalculate scroll height
			textArea.style.height = "auto";
			//apply proper height
			textArea.style.height = `${textArea.scrollHeight.toString()}px`;
		}
	}, []);
	//Initial resize
	// biome-ignore lint/correctness/useExhaustiveDependencies: as the string gets longer the text area has to get bigger
	useEffect(() => {
		resizeComponent();
	}, [value, resizeComponent]);

	// resize on display size change
	useEffect(() => {
		let timeoutId: number;
		const handleWindowResize = () => {
			clearTimeout(timeoutId);
			//debounce for performance
			timeoutId = window.setTimeout(() => {
				resizeComponent();
			}, 100);
		};
		window.addEventListener("resize", handleWindowResize);
		return () => {
			window.removeEventListener("resize", handleWindowResize);
		};
	}, [resizeComponent]);
	return (
		<textarea
			{...rest}
			onDoubleClick={onDoubleClick}
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

export default AutoResizeTextInput;
