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
  const pathname = usePathname(); // Get the current pathname

  const { setHeaderTitleLabel } = useGlobalContext();

  // Render Divider
  if (item.label === "divider") {
    return <Divider key={item.id} />;
  }

  // Render Locale Toggle
  if (item.isLocaleToggle) {
    return (
      <div
        className="flex items-center gap-4 p-2 rounded cursor-pointer hover:bg-info-dark"
        onClick={() => {
          toggleLocale?.(); // Only toggle the locale
        }}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />

        <span
          className={`text-sm transition-opacity duration-300 ${
            sidebarOpen ? "opacity-100" : "opacity-0 invisible"
          }`}
        >
          {currentLocale === "ar" ? "English" : "العربية"}
        </span>
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
              ? "bg-info-dark text-white"
              : "hover:bg-info-dark hover:text-white"
          }`}
          onClick={() => {
            if (hasChildren || item.isLocaleToggle) {
              toggleSubmenu(item.id); // Only toggle submenu for parent
            } else {
              setHeaderTitleLabel(item.label); // Save the untranslated label
            }
          }}
        >
          <div className="flex items-center gap-6">
            <item.icon
              className={`${
                sidebarOpen ? "w-6 h-6" : "w-5 h-5"
              } flex-shrink-0 transition-all duration-300`}
            />
            <span
              className={`text-sm break-words ${
                sidebarOpen ? "opacity-100" : "opacity-0 invisible"
              }`}
            >
              {t(item.label)}
            </span>
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
              ? "bg-info-dark text-white"
              : "hover:bg-info-dark hover:text-white"
          }`}
          onClick={() => {
            if (!item.isLocaleToggle) {
              setHeaderTitleLabel(item.label); // Save the label key
            }
          }}
        >
          <div className="flex items-center gap-4">
            <item.icon
              className={`${
                sidebarOpen ? "w-6 h-6" : "w-5 h-5"
              } flex-shrink-0 transition-all duration-300`}
            />
            <span
              className={`text-sm break-words ${
                sidebarOpen ? "opacity-100" : "opacity-0 invisible"
              }`}
            >
              {t(item.label)}
            </span>
          </div>
        </Link>
      )}

      {/* Submenu Items */}
      {submenuOpen === item.id && hasChildren && (
        <div className="pl-4">
          {item.children?.map((child) => {
            const isChildActive = pathname === `/${currentLocale}${child.path}`;
            return (
              <Link
                key={child.id}
                href={`/${currentLocale}${child.path}`}
                className={`flex items-center gap-4 p-2 rounded ${
                  isChildActive
                    ? "bg-info-dark text-white"
                    : "hover:bg-info-dark hover:text-white"
                }`}
                onClick={() => {
                  setHeaderTitleLabel(child.label); // Save the label key for child items
                }}
              >
                <child.icon className="w-5 h-5 flex-shrink-0" />

                <span
                  className={`text-sm break-words ${
                    sidebarOpen ? "opacity-100" : "opacity-0 invisible"
                  }`}
                >
                  {t(child.label)}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
};

export default LinkItem;
