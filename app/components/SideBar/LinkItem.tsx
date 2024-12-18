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
        <div className="w-6 h-6 flex items-center justify-center shrink-0">
          <item.icon className="w-5 h-5" />
        </div>
        <div
          className={`transition-opacity duration-300 ${
            sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
          }`}
        >
          <span className="text-sm">
            {currentLocale === "ar" ? "English" : "العربية"}
          </span>
        </div>
      </div>
    );
  }

  // Parent Item
  if (hasChildren) {
    return (
      <>
        <div
          className={`flex items-center justify-between p-2 rounded cursor-pointer ${
            isActive
              ? "bg-info-dark text-white"
              : "hover:bg-info-dark hover:text-white"
          }`}
          onClick={() => toggleSubmenu(item.id)}
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
              <item.icon className="w-5 h-5" />
            </div>
            <div
              className={`transition-opacity duration-300 ${
                sidebarOpen
                  ? "opacity-100 w-auto"
                  : "opacity-0 w-0 overflow-hidden"
              }`}
            >
              <span className="text-sm whitespace-nowrap">{t(item.label)}</span>
            </div>
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

        {/* Submenu Items */}
        {submenuOpen === item.id && (
          <div className="flex flex-col">
            {item.children?.map((child) => {
              const isChildActive =
                pathname === `/${currentLocale}${child.path}`;
              return (
                <Link
                  key={child.id}
                  href={`/${currentLocale}${child.path}`}
                  className={`flex items-center p-2 gap-3 rounded ${
                    isChildActive
                      ? "bg-info-dark text-white"
                      : "hover:bg-info-dark hover:text-white"
                  }`}
                  onClick={() => setHeaderTitleLabel(child.label)}
                >
                  <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    <child.icon className="w-5 h-5" />
                  </div>
                  <div
                    className={`transition-opacity duration-300 ${
                      sidebarOpen
                        ? "opacity-100 w-auto"
                        : "opacity-0 w-0 overflow-hidden"
                    }`}
                  >
                    <span className="text-sm whitespace-nowrap">
                      {t(child.label)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </>
    );
  }

  // Non-parent Item (Direct Link)
  return (
    <Link
      href={`/${currentLocale}${item.path}`}
      className={`flex items-center p-2 rounded ${
        isActive
          ? "bg-info-dark text-white"
          : "hover:bg-info-dark hover:text-white"
      }`}
      onClick={() => setHeaderTitleLabel(item.label)}
    >
      <div className="w-6 h-6 flex items-center justify-center shrink-0">
        <item.icon className="w-5 h-5 rounded-md" />
      </div>
      <div
        className={`transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
        }`}
      >
        <span className="text-sm whitespace-nowrap">{t(item.label)}</span>
      </div>
    </Link>
  );
};

export default LinkItem;
