//HACK: Bug in react aria
//https://github.com/adobe/react-spectrum/issues/4674
export function stopSpaceOnInput(e: React.KeyboardEvent) {
  const target = e.target as HTMLElement;
  if (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  ) {
    e.stopPropagation();
  }
}
