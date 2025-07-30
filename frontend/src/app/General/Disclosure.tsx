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
}

export const CustomDisclosure = ({
  title,
  children,
  ...props
}: CustomDisclosureProps) => {
  return (
    <Disclosure {...props} className="group">
      <Heading>
        <Button slot="trigger" className="w-full text-left">
          <div className="flex flex-row items-center gap-1 p-1">
            <div className="transition-transform duration-300 ease-in-out group-data-[expanded]:rotate-90">
              <MdOutlineArrowForwardIos />
            </div>
            {title}
          </div>
        </Button>
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
