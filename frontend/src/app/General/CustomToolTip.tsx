import { Tooltip, TooltipTrigger } from "react-aria-components";

interface ToolTipProps {
  children: React.ReactElement;
  message: string;
}

export const CustomTooltip: React.FC<ToolTipProps> = ({ children, message }) => {
  return (
    <TooltipTrigger>
      {children}
      <Tooltip className="dark:text-black rounded-md bg-blue-950 p-1 text-sm text-white transition duration-100 ease-in data-[entering]:opacity-0 data-[exiting]:opacity-0 dark:bg-blue-50">
        {message}
      </Tooltip>
    </TooltipTrigger>
  );
};
