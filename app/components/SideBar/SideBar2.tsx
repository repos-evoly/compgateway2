// "use client";

// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import { usePathname } from "next/navigation";
// import { sidebarItems } from "./SideBarItemsArray";
// import { useTranslations } from "next-intl";
// import { FaBars, FaTimes } from "react-icons/fa";
// import Divider from "./Divider";
// import LinkItem from "./LinkItem";
// import SidebarSkeleton from "./SidebarSkeleton";

// /* --------------------------------------------------
//  * Helpers
//  * -------------------------------------------------- */
// const getCookieValue = (key: string): string | undefined =>
//   typeof document !== "undefined"
//     ? document.cookie
//         .split("; ")
//         .find((row) => row.startsWith(`${key}=`))
//         ?.split("=")[1]
//     : undefined;

// const decodeCookieArray = (value: string | undefined): ReadonlySet<string> => {
//   if (!value) return new Set<string>();
//   try {
//     return new Set(JSON.parse(decodeURIComponent(value)));
//   } catch {
//     return new Set<string>();
//   }
// };

// type SidebarItem = (typeof sidebarItems)[number];

// /* --------------------------------------------------
//  * Sidebar
//  * -------------------------------------------------- */
// const Sidebar = () => {
//   const pathname = usePathname();
//   const t = useTranslations("sidebarItems");

//   /* ---------- locale ----------------------------- */
//   const currentLocale = pathname.startsWith("/ar") ? "ar" : "en";
//   const isRtl = currentLocale === "ar";

//   /* ---------- responsive / ui -------------------- */
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [mobileView, setMobileView] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [submenuOpen, setSubmenuOpen] = useState<number | null>(null);

//   useEffect(() => {
//     const checkMobileView = () => {
//       if (window.innerWidth < 768) {
//         setMobileView(true);
//         setSidebarOpen(false);
//       } else {
//         setMobileView(false);
//         setSidebarOpen(true);
//         setMobileMenuOpen(false);
//       }
//     };
//     checkMobileView();
//     window.addEventListener("resize", checkMobileView);
//     return () => window.removeEventListener("resize", checkMobileView);
//   }, []);

//   /* ---------- dynamic css var -------------------- */
//   useEffect(() => {
//     if (mobileView) {
//       document.documentElement.style.setProperty("--sidebar-width", "0rem");
//     } else {
//       document.documentElement.style.setProperty(
//         "--sidebar-width",
//         sidebarOpen ? "16rem" : "4rem"
//       );
//     }
//   }, [mobileView, sidebarOpen]);

//   /* ---------- permissions from cookies ----------- */
//   const permissionsSet = useMemo(
//     () => decodeCookieArray(getCookieValue("permissions")),
//     []
//   );

//   /* ---------- filter items ----------------------- */
//   const isItemVisible = useCallback(
//     (item: SidebarItem): boolean =>
//       !item.permissions?.length ||
//       item.permissions.every((perm) => permissionsSet.has(perm)),
//     [permissionsSet]
//   );

//   const filterItems = useCallback(
//     (items: readonly SidebarItem[]): SidebarItem[] =>
//       items
//         .map((item) => {
//           const children =
//             item.children?.length &&
//             filterItems(item.children as SidebarItem[]);
//           const visible = isItemVisible(item);
//           if (!visible && (!children || children.length === 0)) return null;
//           return { ...item, children: children ?? [] };
//         })
//         .filter(Boolean) as SidebarItem[],
//     [isItemVisible]
//   );

//   const visibleItems = useMemo(() => filterItems(sidebarItems), [filterItems]);

//   /* ---------- skeleton control ------------------- */
//   const [ready, setReady] = useState(false);
//   useEffect(() => {
//     /* first client tick → cookies (if any) already parsed */
//     setReady(true);
//   }, []);

//   if (!ready) {
//     return (
//       <SidebarSkeleton
//         sidebarOpen={sidebarOpen}
//         mobileView={mobileView}
//         mobileMenuOpen={mobileMenuOpen}
//         isRtl={isRtl}
//         toggleSidebar={() =>
//           mobileView ? setMobileMenuOpen((p) => !p) : setSidebarOpen((p) => !p)
//         }
//       />
//     );
//   }

//   /* ---------- handlers --------------------------- */
//   const toggleSidebar = () => {
//     if (mobileView) setMobileMenuOpen((prev) => !prev);
//     else setSidebarOpen((prev) => !prev);
//   };

//   const toggleSubmenu = (id: number) =>
//     setSubmenuOpen((prev) => (prev === id ? null : id));

//   const toggleLocale = () => {
//     const newLocale = currentLocale === "ar" ? "en" : "ar";
//     const newPath = `/${newLocale}${pathname.replace(/^\/(en|ar)/, "")}`;
//     window.location.assign(newPath);
//   };

//   const COOKIE_NAMES = [
//     "accessToken",
//     "refreshToken",
//     "kycToken",
//     "statementAccounts",
//     "companyCode",
//     "permissions",
//     "servicePackageId",
//     "enabledTransactionCategories",
//   ] as const; // ensures this is a readonly tuple of string literals

//   const CLEAR_OPTS = "max-age=0; path=/;";

//   const handleLogout = (): void => {
//     COOKIE_NAMES.forEach((name) => {
//       document.cookie = `${name}=; ${CLEAR_OPTS}`;
//     });

//     window.location.reload();
//   };

//   /* ------------------------------------------------
//    * Desktop sidebar
//    * ------------------------------------------------ */
//   const desktopSidebar = (
//     <div
//       className={`
//         bg-secondary-dark text-white h-screen
//         transition-all duration-300 text-sm flex-shrink-0
//         ${sidebarOpen ? "w-64" : "w-16"}
//       `}
//     >
//       {/* Sidebar Header */}
//       <div className="flex items-center gap-4 p-4">
//         <button onClick={toggleSidebar} className="text-gray-300">
//           <FaBars className="w-6 h-6" />
//         </button>
//         {sidebarOpen && (
//           <span className="text-lg font-semibold break-words max-w-[11rem]">
//             {t("title")}
//           </span>
//         )}
//       </div>
//       <Divider />

//       <nav className="flex flex-col p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
//         {visibleItems.map((item, idx) =>
//           item.label === "logout" ? (
//             <div key={`sidebar-item-${idx}`} className="py-1">
//               <button
//                 onClick={handleLogout}
//                 className="flex items-center gap-2 w-full py-2 px-3 rounded-md text-sm text-gray-300 hover:text-white hover:bg-info-dark"
//               >
//                 {item.icon && <item.icon className="w-4 h-4" />}
//                 <span
//                   className={`whitespace-nowrap ${
//                     sidebarOpen ? "opacity-100" : "opacity-0 invisible w-0"
//                   } transition-all`}
//                 >
//                   {t(item.label)}
//                 </span>
//               </button>
//             </div>
//           ) : (
//             <div key={`sidebar-item-${idx}`}>
//               <LinkItem
//                 item={item}
//                 t={t}
//                 sidebarOpen={sidebarOpen}
//                 submenuOpen={submenuOpen}
//                 toggleSubmenu={toggleSubmenu}
//                 currentLocale={currentLocale}
//                 toggleLocale={item.isLocaleToggle ? toggleLocale : undefined}
//               />
//             </div>
//           )
//         )}
//       </nav>
//     </div>
//   );

//   /* ------------------------------------------------
//    * Mobile sidebar
//    * ------------------------------------------------ */
//   const mobileSidebar = (
//     <div
//       className={`
//         fixed inset-y-0 z-40 w-64 bg-secondary-dark text-white
//         transition-transform duration-300
//         ${
//           isRtl
//             ? mobileMenuOpen
//               ? "translate-x-0 right-0"
//               : "translate-x-full right-0"
//             : mobileMenuOpen
//             ? "translate-x-0 left-0"
//             : "-translate-x-full left-0"
//         }
//       `}
//     >
//       <div className="flex items-center gap-4 p-4 mt-6">
//         <span className="text-lg font-semibold">{t("title")}</span>
//       </div>
//       <Divider />
//       <nav className="flex flex-col p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
//         {visibleItems.map((item, idx) =>
//           item.label === "logout" ? (
//             <div key={`mobile-sidebar-item-${idx}`} className="py-1">
//               <button
//                 onClick={handleLogout}
//                 className="flex items-center gap-2 w-full py-2 px-3 rounded-md text-sm text-gray-300 hover:text-white hover:bg-secondary-light"
//               >
//                 {item.icon && <item.icon className="w-4 h-4" />}
//                 <span className="whitespace-nowrap">{t(item.label)}</span>
//               </button>
//             </div>
//           ) : (
//             <div key={`mobile-sidebar-item-${idx}`}>
//               <LinkItem
//                 item={item}
//                 t={t}
//                 sidebarOpen={true}
//                 submenuOpen={submenuOpen}
//                 toggleSubmenu={toggleSubmenu}
//                 currentLocale={currentLocale}
//                 toggleLocale={item.isLocaleToggle ? toggleLocale : undefined}
//               />
//             </div>
//           )
//         )}
//       </nav>
//     </div>
//   );

//   /* Overlay for mobile */
//   const mobileOverlay = mobileMenuOpen && (
//     <div
//       className="fixed inset-0 z-30 bg-black/50"
//       onClick={() => setMobileMenuOpen(false)}
//     />
//   );

//   return (
//     <>
//       {/* Mobile Burger Button */}
//       {mobileView && (
//         <button
//           onClick={toggleSidebar}
//           className={`md:hidden fixed z-50 top-4 ${
//             isRtl ? "right-4" : "left-4"
//           } bg-secondary-dark p-2 rounded-md text-white`}
//           aria-label="Toggle menu"
//         >
//           {mobileMenuOpen ? (
//             <FaTimes className="w-5 h-5" />
//           ) : (
//             <FaBars className="w-5 h-5" />
//           )}
//         </button>
//       )}
//       {mobileView && mobileOverlay}

//       {/* Choose which sidebar to render */}
//       {mobileView ? mobileSidebar : desktopSidebar}
//     </>
//   );
// };

// export default Sidebar;

"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  type TransitionEvent,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { sidebarItems } from "./SideBarItemsArray";
import { useTranslations } from "next-intl";
import { FaBars, FaTimes, FaBell } from "react-icons/fa";
import Divider from "./Divider";
import LinkItem from "./LinkItem";
import SidebarSkeleton from "./SidebarSkeleton";
import NotificationPanel, { Notification } from "./NotificationPanel";

const COMPANY_BASE_PATH = "/Companygw";

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
    return new Set(JSON.parse(decodeURIComponent(value)));
  } catch {
    return new Set<string>();
  }
};

type SidebarItem = (typeof sidebarItems)[number];

/* --------------------------------------------------
 * Sidebar
 * -------------------------------------------------- */
const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("sidebarItems");

  /* ---------- locale ----------------------------- */
  const basePath = pathname.startsWith("/Companygw") ? "/Companygw" : "";
  const relativePath = basePath
    ? pathname.slice(basePath.length) || "/"
    : pathname || "/";
  const normalizedPath = relativePath.startsWith("/")
    ? relativePath
    : `/${relativePath}`;
  const currentLocale = normalizedPath.startsWith("/en") ? "en" : "ar";
  const isRtl = currentLocale === "ar";

  /* ---------- responsive / ui -------------------- */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileView, setMobileView] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState<number | null>(null);

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

  /* ---------- permissions from cookies ----------- */
  const permissionsSet = useMemo(
    () => decodeCookieArray(getCookieValue("permissions")),
    []
  );

  /* ---------- filter items ----------------------- */
  const isItemVisible = useCallback(
    (item: SidebarItem): boolean =>
      !item.permissions?.length ||
      item.permissions.every((perm) => permissionsSet.has(perm)),
    [permissionsSet]
  );

  const filterItems = useCallback(
    (items: readonly SidebarItem[]): SidebarItem[] =>
      items
        .map((item) => {
          const children =
            item.children?.length &&
            filterItems(item.children as SidebarItem[]);
          const visible = isItemVisible(item);
          if (!visible && (!children || children.length === 0)) return null;
          return { ...item, children: children ?? [] };
        })
        .filter(Boolean) as SidebarItem[],
    [isItemVisible]
  );

  const visibleItems = useMemo(() => filterItems(sidebarItems), [filterItems]);

  /* ---------- notifications (front‑end only) ----- */
  const [notifications, setNotifications] = useState<Notification[]>([]); // start empty
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const toggleNotifications = () => setShowNotifications((p) => !p);

  const handleMarkAsRead = (index: number) => {
    setNotifications((prev) => {
      const updated = [...prev];
      if (updated[index]) updated[index].isRead = true;
      return updated;
    });
  };

  /* ---------- skeleton control ------------------- */
  const [ready, setReady] = useState(false);
  useEffect(() => {
    /* first client tick → cookies (if any) already parsed */
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <SidebarSkeleton
        sidebarOpen={sidebarOpen}
        mobileView={mobileView}
        mobileMenuOpen={mobileMenuOpen}
        isRtl={isRtl}
        toggleSidebar={() =>
          mobileView ? setMobileMenuOpen((p) => !p) : setSidebarOpen((p) => !p)
        }
      />
    );
  }

  /* ---------- handlers --------------------------- */
  const toggleSidebar = () => {
    if (mobileView) setMobileMenuOpen((prev) => !prev);
    else {
      setSidebarOpen((prev) => {
        const newVal = !prev;
        if (!newVal) setShowNotifications(false);
        return newVal;
      });
    }
  };

  const toggleSubmenu = (id: number) =>
    setSubmenuOpen((prev) => (prev === id ? null : id));

  const toggleLocale = () => {
    const newLocale = currentLocale === "ar" ? "en" : "ar";
    const remainder = normalizedPath.replace(/^\/(en|ar)/, "") || "/";
    const suffix = remainder === "/" ? "" : remainder;
    const relative = `/${newLocale}${suffix}`;
    const fullPath = `${basePath}${relative}`.replace(/\/+/g, "/");

    const nextPath = fullPath.startsWith("/") ? fullPath : `/${fullPath}`;
    const year = 60 * 60 * 24 * 365;
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${year};`;

    const paramsString = searchParams.toString();
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const urlWithQuery = paramsString ? `${nextPath}?${paramsString}` : nextPath;
    const finalUrl = hash ? `${urlWithQuery}${hash}` : urlWithQuery;
    router.replace(finalUrl);
  };

  const COOKIE_NAMES = [
    "acceessToken", // legacy typo cookie kept for safety during logout
    "accessToken",
    "refreshToken",
    "kycToken",
    "statementAccounts",
    "companyCode",
    "permissions",
    "servicePackageId",
    "enabledTransactionCategories",
  ] as const; // ensures this is a readonly tuple of string literals

  const cookiePaths = Array.from(
    new Set(
      [basePath || undefined, COMPANY_BASE_PATH, "/"].filter(
        (path): path is string => Boolean(path)
      )
    )
  );
  const isHttps =
    typeof window !== "undefined" && window.location.protocol === "https:";

  const clearCookie = (name: (typeof COOKIE_NAMES)[number]) => {
    cookiePaths.forEach((path) => {
      const commonAttrs = [
        `path=${path}`,
        "max-age=0",
        "SameSite=Lax",
        isHttps ? "secure" : undefined,
      ]
        .filter(Boolean)
        .join("; ");

      document.cookie = `${name}=; ${commonAttrs}`;
      document.cookie = `${name}=; expires=${new Date(0).toUTCString()}; ${commonAttrs}`;
    });
  };

  const handleLogout = async (): Promise<void> => {
    const logoutEndpoint = `${COMPANY_BASE_PATH}/api/auth/logout`;

    try {
      await fetch(logoutEndpoint, { method: "POST", credentials: "include" });
    } catch (error) {
      console.error("Failed to notify backend about logout:", error);
      try {
        await fetch(`/api/auth/logout`, { method: "POST", credentials: "include" });
      } catch (fallbackError) {
        console.error("Fallback logout request also failed:", fallbackError);
      }
    }

    COOKIE_NAMES.forEach(clearCookie);

    const loginPath = `${COMPANY_BASE_PATH}/auth/login`;
    window.location.replace(loginPath);
  };

  /* ------------------------------------------------
   * Desktop sidebar
   * ------------------------------------------------ */
  const desktopSidebar = (
    <div
      className={`
        bg-secondary-dark text-white min-h-screen lg:h-screen
        transition-all duration-300 text-sm flex-shrink-0 relative flex flex-col
        ${sidebarOpen ? "w-64" : "w-16"}
      `}
      onTransitionEnd={(e: TransitionEvent<HTMLDivElement>) => {
        if (e.propertyName === "width" && !sidebarOpen) {
          setShowNotifications(false);
        }
      }}
    >
      {/* Sidebar Header */}
      <div className="flex items-center gap-4 p-4 relative">
        <button onClick={toggleSidebar} className="text-gray-300">
          <FaBars className="w-6 h-6" />
        </button>
        {sidebarOpen && (
          <span className="text-lg font-semibold break-words max-w-[11rem]">
            {t("title")}
          </span>
        )}

        {/* Notification Bell */}
        {sidebarOpen && (
          <div className="ml-auto relative">
            <button
              onClick={toggleNotifications}
              className="text-gray-300 hover:text-white relative"
            >
              <FaBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <NotificationPanel
              notifications={notifications}
              show={showNotifications}
              isRTL={isRtl}
              onMarkAsRead={handleMarkAsRead}
              onNotificationsChange={setNotifications}
            />
          </div>
        )}
      </div>
      <Divider />

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {visibleItems.map((item, idx) =>
          item.label === "logout" ? (
            <div key={`sidebar-item-${idx}`} className="py-1">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full py-2 px-3 rounded-md text-sm text-gray-300 hover:text-white hover:bg-info-dark"
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span
                  className={`whitespace-nowrap ${
                    sidebarOpen ? "opacity-100" : "opacity-0 invisible w-0"
                  } transition-all`}
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

  /* ------------------------------------------------
   * Mobile sidebar
   * ------------------------------------------------ */
  const mobileSidebar = (
    <div
      className={`
        fixed inset-y-0 z-40 w-64 bg-secondary-dark text-white flex flex-col
        transition-transform duration-300
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
      <div className="flex items-center justify-between p-4 mt-6">
        <span className="text-lg font-semibold">{t("title")}</span>
        <button
          onClick={toggleNotifications}
          className="text-gray-300 hover:text-white relative"
        >
          <FaBell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
      <NotificationPanel
        notifications={notifications}
        show={showNotifications}
        isRTL={isRtl}
        onMarkAsRead={handleMarkAsRead}
        onNotificationsChange={setNotifications}
      />
      <Divider />
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {visibleItems.map((item, idx) =>
          item.label === "logout" ? (
            <div key={`mobile-sidebar-item-${idx}`} className="py-1">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full py-2 px-3 rounded-md text-sm text-gray-300 hover:text-white hover:bg-secondary-light"
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

  /* Overlay for mobile */
  const mobileOverlay = mobileMenuOpen && (
    <div
      className="fixed inset-0 z-30 bg-black/50"
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
