import React from "react";
import Link from "next/link";

type SidebarLinkProps = {
  href: string; // The target URL for navigation
  isActive: boolean; // Determines if the link is active
  isDivider: boolean; // Determines if this is a divider
  onClick?: () => void; // Optional handler for custom interactions
  children: React.ReactNode; // Content inside the link (e.g., icon and label)
};

const SidebarLink: React.FC<SidebarLinkProps> = ({
  href,
  isActive,
  isDivider,
  onClick,
  children,
}) => {
  const baseClasses =
    "flex items-center w-full cursor-pointer rounded transition duration-200";
  const activeClasses = isActive ? "bg-green-500 text-white" : "text-gray-600";
  const hoverClasses = !isDivider ? "hover:bg-green-500 hover:text-white" : "";
  const paddingClasses = !isDivider
    ? "p-2 min-h-[40px] w-[99%]"
    : "w-full h-[1px] bg-gray-300";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${baseClasses} ${activeClasses} ${hoverClasses} ${paddingClasses}`}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
};

export default SidebarLink;
