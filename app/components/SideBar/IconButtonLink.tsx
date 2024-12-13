import { useRouter } from "next/router";
import { FC, JSX, MouseEvent } from "react";

type IconButtonLinkPropsType = {
  label: string;
  func: (event: MouseEvent<HTMLButtonElement>) => void; // Properly typed event
  Icon: FC<React.SVGProps<SVGSVGElement>>;
  sidebarOpen: boolean; // Directly pass the sidebar state as a prop
};

const IconButtonLink = ({
  label,
  func,
  Icon,
  sidebarOpen,
}: IconButtonLinkPropsType): JSX.Element => {
  const { locale } = useRouter();

  return (
    <button
      onClick={(e) => func(e)}
      aria-label={label}
      className="flex items-center gap-2 p-2 rounded hover:bg-gray-200 transition duration-200"
    >
      <Icon className="w-6 h-6 text-gray-600" />
      {sidebarOpen && (
        <span className="text-gray-800 text-sm" lang={locale}>
          {label}
        </span>
      )}
    </button>
  );
};

export default IconButtonLink;
