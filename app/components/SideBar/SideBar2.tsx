"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { sidebarItems } from "./SideBarItemsArray";
import { useTranslations } from "next-intl";
import { FaBars, FaTimes } from "react-icons/fa";
import Divider from "./Divider";
import LinkItem from "./LinkItem";

/**
 * A purely frontend Sidebar:
 * - Toggle open/close in desktop
 * - Slide in/out in mobile
 * - Show/hide submenus
 * - No cookies, logout, or user roles
 */
const Sidebar = () => {
  const pathname = usePathname();
  const t = useTranslations("sidebarItems");

  // Determine current locale
  const currentLocale = pathname.startsWith("/ar") ? "ar" : "en";
  const isRtl = currentLocale === "ar";

  // States for responsiveness
  const [sidebarOpen, setSidebarOpen] = useState(true); // Desktop expand/collapse
  const [mobileView, setMobileView] = useState(false); // Are we on mobile screen?
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Mobile menu visible?
  const [submenuOpen, setSubmenuOpen] = useState<number | null>(null);

  // On mount or resize => detect mobile
  useEffect(() => {
    const checkMobileView = () => {
      if (window.innerWidth < 768) {
        setMobileView(true);
        setSidebarOpen(false); // On mobile => hide sidebar by default
      } else {
        setMobileView(false);
        setSidebarOpen(true); // On desktop => show sidebar
        setMobileMenuOpen(false);
      }
    };
    checkMobileView();

    window.addEventListener("resize", checkMobileView);
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  /**
   * Keep a CSS variable --sidebar-width
   * This helps a layout container do something like:
   *   max-width: calc(100vw - var(--sidebar-width))
   */
  useEffect(() => {
    if (mobileView) {
      // On mobile, the sidebar is "off-canvas"
      document.documentElement.style.setProperty("--sidebar-width", "0rem");
    } else {
      // On desktop, use 16rem if open, else 4rem
      document.documentElement.style.setProperty(
        "--sidebar-width",
        sidebarOpen ? "16rem" : "4rem"
      );
    }
  }, [mobileView, sidebarOpen]);

  // Toggle sidebar
  const toggleSidebar = () => {
    if (mobileView) {
      setMobileMenuOpen((prev) => !prev);
    } else {
      setSidebarOpen((prev) => !prev);
    }
  };

  // Toggle a submenu
  const toggleSubmenu = (id: number) => {
    setSubmenuOpen((prev) => (prev === id ? null : id));
  };

  // Toggle locale (placeholder if you want to switch language)
  const toggleLocale = () => {
    const newLocale = currentLocale === "ar" ? "en" : "ar";
    const newPath = `/${newLocale}${pathname.replace(/^\/(en|ar)/, "")}`;
    window.location.assign(newPath);
  };

  // ----------------------
  // LOGOUT HANDLER
  // ----------------------
  function handleLogout() {
    // Remove cookies by setting Max-Age=0 or expires in the past
    document.cookie = "accessToken=; max-age=0; path=/;";
    document.cookie = "refreshToken=; max-age=0; path=/;";
    document.cookie = "kycToken=; max-age=0; path=/;";

    // Refresh the page (or redirect, up to you)
    window.location.reload();
  }

  // Mobile menu button (hamburger / X)
  // const mobileMenuButton = (
  //   <button
  //     onClick={toggleSidebar}
  //     className={`md:hidden fixed z-50 top-4 ${
  //       isRtl ? "right-4" : "left-4"
  //     } bg-secondary-dark p-2 rounded-md text-white`}
  //     aria-label="Toggle menu"
  //   >
  //     {mobileMenuOpen ? (
  //       <FaTimes className="w-5 h-5" />
  //     ) : (
  //       <FaBars className="w-5 h-5" />
  //     )}
  //   </button>
  // );

  // Desktop sidebar
  const desktopSidebar = (
    <div
      className={`
        bg-secondary-dark text-white h-screen
        transition-all duration-300 ease-in-out text-sm flex-shrink-0
        ${sidebarOpen ? "w-64" : "w-16"}
      `}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="text-gray-300 hover:text-white"
          >
            <FaBars className="w-6 h-6" />
          </button>
          {/* Sidebar Header title  (desktop) */}
          {sidebarOpen && (
            <span className="text-lg font-semibold leading-tight break-words max-w-[11rem]">
              {t("title")}
            </span>
          )}
        </div>
      </div>
      <Divider />

      {/* Sidebar Items */}
      <nav className="flex flex-col p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
        {sidebarItems.map((item, idx) => {
          if (item.label === "logout") {
            // Render a custom button for logout
            return (
              <div key={`sidebar-item-${idx}`} className="py-1">
                <button
                  onClick={handleLogout}
                  className={`
                    flex items-center gap-2 w-full py-2 px-3 rounded-md 
                    text-sm font-medium text-gray-300 hover:text-white 
                    hover:bg-info-dark transition-colors
                  `}
                >
                  {/* item.icon can be a React component function or null */}
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span
                    className={`whitespace-nowrap ${
                      sidebarOpen ? "opacity-100" : "opacity-0 invisible w-0"
                    } transition-all duration-300`}
                  >
                    {t(item.label)}
                  </span>
                </button>
              </div>
            );
          } else {
            // Normal link item
            return (
              <div key={`sidebar-item-${idx}`}>
                <LinkItem
                  item={item}
                  t={t}
                  sidebarOpen={sidebarOpen}
                  submenuOpen={submenuOpen}
                  toggleSubmenu={toggleSubmenu}
                  currentLocale={currentLocale}
                  toggleLocale={item.isLocaleToggle ? toggleLocale : undefined}
                />
              </div>
            );
          }
        })}
      </nav>
    </div>
  );

  // Mobile sidebar
  const mobileSidebar = (
    <div
      className={`
        fixed inset-y-0 bg-secondary-dark text-white h-screen z-40
        w-64 transition-transform duration-300 ease-in-out
        ${
          isRtl
            ? mobileMenuOpen
              ? "translate-x-0 right-0"
              : "translate-x-full right-0"
            : mobileMenuOpen
            ? "translate-x-0 left-0"
            : "-translate-x-full left-0"
        }
      `}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 mt-6">
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold whitespace-nowrap">
            {t("title")}
          </span>
        </div>
      </div>
      <Divider />

      {/* Sidebar Items */}
      <nav className="flex flex-col p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
        {sidebarItems.map((item, idx) => {
          if (item.label === "logout") {
            // Custom button for logout
            return (
              <div key={`mobile-sidebar-item-${idx}`} className="py-1">
                <button
                  onClick={handleLogout}
                  className={`
                    flex items-center gap-2 w-full py-2 px-3 rounded-md 
                    text-sm font-medium text-gray-300 hover:text-white 
                    hover:bg-secondary-light transition-colors
                  `}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span className="whitespace-nowrap">{t(item.label)}</span>
                </button>
              </div>
            );
          } else {
            // Normal link item
            return (
              <div key={`mobile-sidebar-item-${idx}`}>
                <LinkItem
                  item={item}
                  t={t}
                  sidebarOpen={true}
                  submenuOpen={submenuOpen}
                  toggleSubmenu={toggleSubmenu}
                  currentLocale={currentLocale}
                  toggleLocale={item.isLocaleToggle ? toggleLocale : undefined}
                />
              </div>
            );
          }
        })}
      </nav>
    </div>
  );

  // Overlay for mobile
  const mobileOverlay = mobileMenuOpen && (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
      onClick={() => setMobileMenuOpen(false)}
    />
  );

  return (
    <>
      {/* Mobile Burger Button */}
      {mobileView && (
        <button
          onClick={toggleSidebar}
          className={`md:hidden fixed z-50 top-4 ${
            isRtl ? "right-4" : "left-4"
          } bg-secondary-dark p-2 rounded-md text-white`}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <FaTimes className="w-5 h-5" />
          ) : (
            <FaBars className="w-5 h-5" />
          )}
        </button>
      )}
      {mobileView && mobileOverlay}

      {/* Choose which sidebar to render */}
      {mobileView ? mobileSidebar : desktopSidebar}
    </>
  );
};

export default Sidebar;
