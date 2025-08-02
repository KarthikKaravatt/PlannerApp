import {
  Button,
  Dialog,
  DialogTrigger,
  Menu,
  MenuItem,
  type MenuItemProps,
  type MenuItemRenderProps,
  type MenuProps,
  MenuTrigger,
  type MenuTriggerProps,
  Popover,
} from "react-aria-components";
import type { IconType } from "react-icons";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import { CustomTooltip } from "./CustomToolTip.tsx";

interface PopOverMenuProps {
  children: React.ReactNode;
  hoverMessage: string;
  isDisabled?: boolean;
  menuIcon: IconType;
}

export const CustomMenu: React.FC<PopOverMenuProps> = ({
  hoverMessage,
  children,
  menuIcon: MenuIcon,
  isDisabled,
}) => {
  return (
    <DialogTrigger>
      <CustomTooltip message={hoverMessage}>
        <Button isDisabled={isDisabled ?? false}>
          <MenuIcon />
        </Button>
      </CustomTooltip>
      <Popover className="shadow-lg transition duration-100 ease-in data-[entering]:opacity-0 data-[exiting]:opacity-0">
        <Dialog className="flex flex-col gap-y-0.5 rounded-md border-1 border-gray-300 bg-sky-100 p-0.5 text-sm text-blue-950 dark:border-none dark:border-white dark:bg-dark-background-sub-c dark:text-white">
          {children}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
};
interface CustomMenuButtonProps<T>
  extends MenuProps<T>,
    Omit<MenuTriggerProps, "children"> {
  label?: string;
  icon?: IconType;
  hoverMessage?: string;
}

export function CustomMenuButton<T extends object>({
  label,
  icon: Icon,
  hoverMessage,
  children,
  ...props
}: CustomMenuButtonProps<T>) {
  const MenuButton = () => {
    const buttonContent = Icon ? <Icon>{label}</Icon> : label;
    return <Button>{buttonContent}</Button>;
  };
  return (
    <MenuTrigger {...props}>
      {hoverMessage ? (
        <CustomTooltip message={hoverMessage}>
          <MenuButton />
        </CustomTooltip>
      ) : (
        <MenuButton />
      )}
      <Popover className="shadow-lg transition duration-100 ease-in data-[entering]:opacity-0 data-[exiting]:opacity-0">
        <Menu
          className="flex flex-col items-center gap-y-0.5 rounded-md border-1 border-gray-300 bg-sky-100 text-sm text-blue-950 dark:border-none dark:border-white dark:bg-dark-background-sub-c dark:text-white"
          {...props}
        >
          {children}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}

export function CustomMenuItem(
  props: Omit<MenuItemProps<object>, "children" | "textValue"> & {
    children?: React.ReactNode;
    textValue?: string;
  },
) {
  const textValue =
    props.textValue ||
    (typeof props.children === "string" ? props.children : undefined);

  const menuItemProps = {
    ...props,
    ...(textValue !== undefined ? { textValue } : {}),
  } as MenuItemProps<object>;

  return (
    <MenuItem
      className="h-full w-full flex-row rounded-sm p-1 text-center hover:bg-blue-950 hover:text-white dark:hover:bg-white dark:hover:text-black"
      {...menuItemProps}
    >
      {(renderProps: MenuItemRenderProps) => (
        <>
          {props.children}
          {renderProps.hasSubmenu && <MdOutlineArrowForwardIos />}
        </>
      )}
    </MenuItem>
  );
}
