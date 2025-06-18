"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import { sidebarItems } from "./SideBarItemsArray";
import { useTranslations } from "next-intl";
import { FaBars, FaTimes } from "react-icons/fa";
import Divider from "./Divider";
import LinkItem from "./LinkItem";
import SidebarSkeleton from "./SidebarSkeleton";

/* --------------------------------------------------
 * Helpers
 * -------------------------------------------------- */
const getCookieValue = (key: string): string | undefined =>
  typeof document !== "undefined"
    ? document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${key}=`))
        ?.split("=")[1]
    : undefined;

const decodeCookieArray = (value: string | undefined): ReadonlySet<string> => {
  if (!value) return new Set<string>();
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as string[];
    return new Set(parsed);
  } catch {
    return new Set<string>();
  }
};

type SidebarItem = (typeof sidebarItems)[number];

/* --------------------------------------------------
 * Component
 * -------------------------------------------------- */
const Sidebar = () => {
  const pathname = usePathname();
  const t = useTranslations("sidebarItems");

  /* ---------- locale ----------------------------- */
  const currentLocale = pathname.startsWith("/ar") ? "ar" : "en";
  const isRtl = currentLocale === "ar";

  /* ---------- responsive / ui -------------------- */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileView, setMobileView] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState<number | null>(null);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkMobileView = () => {
      if (window.innerWidth < 768) {
        setMobileView(true);
        setSidebarOpen(false);
      } else {
        setMobileView(false);
        setSidebarOpen(true);
        setMobileMenuOpen(false);
      }
    };
    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  /* ---------- dynamic css var -------------------- */
  useEffect(() => {
    if (mobileView) {
      document.documentElement.style.setProperty("--sidebar-width", "0rem");
    } else {
      document.documentElement.style.setProperty(
        "--sidebar-width",
        sidebarOpen ? "16rem" : "4rem"
      );
    }
  }, [mobileView, sidebarOpen]);

  /* ---------- auth / feature flags --------------- */
  const permissionsSet = useMemo(
    () => decodeCookieArray(getCookieValue("permissions")),
    []
  );
  const categoriesSet = useMemo(
    () => decodeCookieArray(getCookieValue("enabledTransactionCategories")),
    []
  );

  useEffect(() => {
    if (permissionsSet.size > 0 || categoriesSet.size > 0) {
      setReady(true);
    }
  }, [permissionsSet, categoriesSet]);

  /* ---------- visibility engine ------------------ */
  // keep previous import line with useCallback

  /* ---------- visibility engine ------------------ */
  const isItemVisible = useCallback(
    (item: SidebarItem): boolean => {
      const { permissions, enabledTransactionCategories } = item;

      const permOk =
        !permissions?.length || permissions.every((p) => permissionsSet.has(p));

      const catOk =
        !enabledTransactionCategories?.length ||
        enabledTransactionCategories.some((c) => categoriesSet.has(c));

      return permOk && catOk;
    },
    [permissionsSet, categoriesSet]
  );

  const filterItems = useCallback(
    (items: readonly SidebarItem[]): SidebarItem[] => {
      return items
        .map((item) => {
          const filteredChildren = item.children?.length
            ? filterItems(item.children as SidebarItem[])
            : [];
          const visibleSelf = isItemVisible(item);
          if (!visibleSelf && filteredChildren.length === 0) return null;
          return { ...item, children: filteredChildren };
        })
        .filter(Boolean) as SidebarItem[];
    },
    [isItemVisible]
  );

  const visibleItems = useMemo(() => filterItems(sidebarItems), [filterItems]);

  /* ---------- handlers --------------------------- */
  const toggleSidebar = () => {
    if (mobileView) setMobileMenuOpen((prev) => !prev);
    else setSidebarOpen((prev) => !prev);
  };

  const toggleSubmenu = (id: number) => {
    setSubmenuOpen((prev) => (prev === id ? null : id));
  };

  const toggleLocale = () => {
    const newLocale = currentLocale === "ar" ? "en" : "ar";
    const newPath = `/${newLocale}${pathname.replace(/^\/(en|ar)/, "")}`;
    window.location.assign(newPath);
  };

  function handleLogout() {
    document.cookie = "accessToken=; max-age=0; path=/;";
    document.cookie = "refreshToken=; max-age=0; path=/;";
    document.cookie = "kycToken=; max-age=0; path=/;";
    window.location.reload();
  }

  /* ------------------------------------------------
   * Render blocks
   * ------------------------------------------------ */

  /* ---------- show skeleton until cookies decoded ---------- */
  if (!ready) {
    return (
      <SidebarSkeleton
        sidebarOpen={sidebarOpen}
        mobileView={mobileView}
        mobileMenuOpen={mobileMenuOpen}
        isRtl={isRtl}
        toggleSidebar={toggleSidebar}
      />
    );
  }

  // ------------------------------------------------
  // Real sidebar (unchanged from your implementation)
  // ------------------------------------------------

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
        {visibleItems.map((item, idx) =>
          item.label === "logout" ? (
            <div key={`sidebar-item-${idx}`} className="py-1">
              <button
                onClick={handleLogout}
                className={`
                  flex items-center gap-2 w-full py-2 px-3 rounded-md 
                  text-sm font-medium text-gray-300 hover:text-white 
                  hover:bg-info-dark transition-colors
                `}
              >
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
          ) : (
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
          )
        )}
      </nav>
    </div>
  );

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
        {visibleItems.map((item, idx) =>
          item.label === "logout" ? (
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
          ) : (
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
          )
        )}
      </nav>
    </div>
  );

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
