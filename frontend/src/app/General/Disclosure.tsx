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
    <Disclosure {...props} className={"group"}>
      <Heading>
        <Button slot="trigger">
          <div className="flex flex-row items-center">
            <div className="transition-transform duration-200 ease-in group-data-[expanded]:rotate-90">
              <MdOutlineArrowForwardIos />
            </div>
            {title}
          </div>
        </Button>
      </Heading>
      <DisclosurePanel>{children}</DisclosurePanel>
    </Disclosure>
  );
};
