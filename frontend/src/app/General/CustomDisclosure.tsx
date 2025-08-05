import {
  Button,
  Disclosure,
  DisclosurePanel,
  type DisclosureProps,
  Heading,
} from "react-aria-components";
import { MdOutlineArrowForwardIos } from "react-icons/md";

interface CustomDisclosureProps extends Omit<DisclosureProps, "children"> {
  title?: string;
  children?: React.ReactNode;
  headingItems?: React.ReactNode;
}

export const CustomDisclosure = ({
  title,
  children,
  headingItems,
  ...props
}: CustomDisclosureProps) => {
  return (
    <Disclosure {...props} className="group w-full">
      <Heading className="">
        <div className="flex w-full items-center gap-1">
          <Button
            slot="trigger"
            className="transition-transform duration-300 ease-in-out group-data-[expanded]:rotate-90"
          >
            <MdOutlineArrowForwardIos />
          </Button>
          {title}
          <div className="ml-auto p-2">{headingItems}</div>
        </div>
      </Heading>
      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out group-data-[expanded]:grid-rows-[1fr]">
        <div className="min-h-0 overflow-hidden">
          <DisclosurePanel className="-translate-y-1 p-1 opacity-0 transition-all duration-200 ease-out group-data-[expanded]:translate-y-0 group-data-[expanded]:opacity-100 group-data-[expanded]:delay-100">
            {children}
          </DisclosurePanel>
        </div>
      </div>
    </Disclosure>
  );
};
