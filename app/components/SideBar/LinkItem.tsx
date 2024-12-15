import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Divider from "./Divider";
import { useGlobalContext } from "@/app/context/GlobalContext";

type SidebarItem = {
  id: number;
  path: string; // Navigation path
  label: string; // Translation key for the label
  icon: React.FC<React.SVGProps<SVGSVGElement>>; // Icon component
  children?: SidebarItem[]; // Submenu items (if any)
  isLocaleToggle?: boolean; // Marks the item as a locale toggle
};

type LinkItemProps = {
  item: SidebarItem; // Sidebar item object
  t: (key: string) => string; // Translation function
  sidebarOpen: boolean; // Sidebar state (open or collapsed)
  submenuOpen: number | null; // Currently open submenu ID
  toggleSubmenu: (id: number) => void; // Function to toggle submenu
  currentLocale: string; // Current locale
  toggleLocale?: () => void; // Function to toggle locale
};

const LinkItem: React.FC<LinkItemProps> = ({
  item,
  t,
  sidebarOpen,
  submenuOpen,
  toggleSubmenu,
  currentLocale,
  toggleLocale,
}) => {
  const pathname = usePathname();
  const { setHeaderTitleLabel } = useGlobalContext();

  const isActive = pathname === `/${currentLocale}${item.path}`;
  const hasChildren = item.children && item.children.length > 0;

  // Render Divider
  if (item.label === "divider") return <Divider key={item.id} />;

  // Locale Toggle
  if (item.isLocaleToggle) {
    return (
      <div
        className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-info-dark"
        onClick={toggleLocale}
      >
        <div className="w-6 h-6 flex items-center justify-center">
          <item.icon className="w-5 h-5" />
        </div>
        {sidebarOpen && (
          <span className="text-sm transition-all duration-300">
            {currentLocale === "ar" ? "English" : "العربية"}
          </span>
        )}
      </div>
    );
  }

  // Parent and Child Items
  return (
    <>
      {/* Parent Item */}
      <div
        className={`flex items-center justify-between p-2 rounded cursor-pointer ${
          isActive
            ? "bg-info-dark text-white"
            : "hover:bg-info-dark hover:text-white"
        }`}
        onClick={() => {
          if (hasChildren) toggleSubmenu(item.id);
          else setHeaderTitleLabel(item.label);
        }}
      >
        <div className="flex items-center gap-3">
          {hasChildren && !sidebarOpen ? (
            // Render only the up/down arrow if the sidebar is closed
            submenuOpen === item.id ? (
              <FaChevronUp className="w-5 h-5" />
            ) : (
              <FaChevronDown className="w-5 h-5" />
            )
          ) : (
            // Render parent icon when the sidebar is open or item has no children
            <div className="w-6 h-6 flex items-center justify-center">
              <item.icon className="w-5 h-5" />
            </div>
          )}
          {sidebarOpen && (
            <span className="text-sm transition-all duration-300">
              {t(item.label)}
            </span>
          )}
        </div>
        {sidebarOpen && hasChildren && (
          <div>
            {submenuOpen === item.id ? (
              <FaChevronUp className="w-4 h-4" />
            ) : (
              <FaChevronDown className="w-4 h-4" />
            )}
          </div>
        )}
      </div>

      {/* Submenu Items */}
      {submenuOpen === item.id && hasChildren && (
        <div className="flex flex-col gap-2">
          {item.children?.map((child) => {
            const isChildActive = pathname === `/${currentLocale}${child.path}`;
            return (
              <Link
                key={child.id}
                href={`/${currentLocale}${child.path}`}
                className={`flex items-center gap-3 p-2 rounded ${
                  isChildActive
                    ? "bg-info-dark text-white"
                    : "hover:bg-info-dark hover:text-white"
                }`}
                onClick={() => setHeaderTitleLabel(child.label)}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <child.icon className="w-5 h-5" />
                </div>
                {sidebarOpen && (
                  <span className="text-sm transition-all duration-300">
                    {t(child.label)}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
};

export default LinkItem;
