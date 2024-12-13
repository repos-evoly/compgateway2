import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Divider from "./Divider";

type SidebarItem = {
  id: number; // Unique identifier
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
  const pathname = usePathname(); // Get the current pathname

  // Render Divider
  if (item.label === "divider") {
    return <Divider key={item.id} />;
  }

  // Render Locale Toggle
  if (item.isLocaleToggle) {
    return (
      <div
        className="flex items-center gap-4 p-2 rounded cursor-pointer hover:bg-success-light"
        onClick={toggleLocale}
      >
        <item.icon className="w-6 h-6" />
        {sidebarOpen && (
          <span className="text-sm">
            {currentLocale === "ar" ? "English" : "العربية"}
          </span>
        )}
      </div>
    );
  }

  const isActive = pathname === `/${currentLocale}${item.path}`;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <>
      {/* Parent Item */}
      {hasChildren ? (
        <div
          className={`flex items-center justify-between p-2 rounded cursor-pointer ${
            isActive
              ? "bg-success-light"
              : "hover:bg-success-light hover:text-white"
          }`}
          onClick={() => toggleSubmenu(item.id)}
        >
          <div className="flex items-center gap-4">
            <item.icon className="w-6 h-6" />
            {sidebarOpen && <span className="text-sm">{t(item.label)}</span>}
          </div>
          {sidebarOpen && (
            <div>
              {submenuOpen === item.id ? (
                <FaChevronUp className="w-4 h-4" />
              ) : (
                <FaChevronDown className="w-4 h-4" />
              )}
            </div>
          )}
        </div>
      ) : (
        <Link
          href={`/${currentLocale}${item.path}`}
          className={`flex items-center p-2 rounded ${
            isActive
              ? "bg-success-light"
              : "hover:bg-success-light hover:text-white"
          }`}
        >
          <div className="flex items-center gap-4">
            <item.icon className="w-6 h-6" />
            {sidebarOpen && <span className="text-sm">{t(item.label)}</span>}
          </div>
        </Link>
      )}

      {/* Submenu Items */}
      {submenuOpen === item.id && hasChildren && (
        <div className={`pl-${sidebarOpen ? 6 : 2}`}>
          {item.children?.map((child) => (
            <Link
              key={child.id}
              href={`/${currentLocale}${child.path}`}
              className={`flex items-center gap-4 p-2 rounded ${
                pathname === `/${currentLocale}${child.path}`
                  ? "bg-info-dark"
                  : "hover:bg-success-light hover:text-white"
              }`}
            >
              <child.icon className="w-5 h-5" />
              {sidebarOpen && <span className="text-sm">{t(child.label)}</span>}
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export default LinkItem;
