import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Tooltip from "@/app/components/reusable/Tooltip";
import Divider from "./Divider";
import { useGlobalContext } from "@/app/context/GlobalContext";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
type SidebarItem = {
  id: number;
  path: string;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  children?: SidebarItem[];
  isLocaleToggle?: boolean;
};

type LinkItemProps = {
  item: SidebarItem;
  t: (key: string) => string;
  sidebarOpen: boolean;
  submenuOpen: number | null;
  toggleSubmenu: (id: number) => void;
  currentLocale: string;
  toggleLocale?: () => void;

  labelClass?: string;
  buttonBaseClass?: string;
};

/* ------------------------------------------------------------------ */
/* Default shared styles                                              */
/* ------------------------------------------------------------------ */
const fallbackLabelCls = "break-words leading-tight text-[13px]";
const fallbackButtonCls = `
  flex items-center gap-3 w-full p-2 rounded
  text-gray-300 hover:text-white hover:bg-info-dark
  transition-colors
`;

/* ------------------------------------------------------------------ */
/* Helper to render icon (shows tooltip when sidebar is collapsed)    */
/* ------------------------------------------------------------------ */
const IconBox: React.FC<{
  sidebarOpen: boolean;
  tooltip: string;
  isRtl: boolean;
  children: React.ReactNode;
}> = ({ sidebarOpen, tooltip, isRtl, children }) => (
  <div className="w-6 h-6 flex items-center justify-center shrink-0">
    {sidebarOpen ? (
      children
    ) : (
      <Tooltip tooltip={tooltip} position={isRtl ? "left" : "right"}>
        {children}
      </Tooltip>
    )}
  </div>
);

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
const LinkItem: React.FC<LinkItemProps> = ({
  item,
  t,
  sidebarOpen,
  submenuOpen,
  toggleSubmenu,
  currentLocale,
  toggleLocale,
  labelClass = fallbackLabelCls,
  buttonBaseClass = fallbackButtonCls,
}) => {
  const pathname = usePathname();
  const basePath = pathname.startsWith("/Companygw") ? "/Companygw" : "";
  const relativePath = basePath
    ? pathname.slice(basePath.length) || "/"
    : pathname || "/";
  const normalizedPath = relativePath.startsWith("/")
    ? relativePath
    : `/${relativePath}`;

  const { setHeaderInfo } = useGlobalContext();

  const isRtl = currentLocale === "ar";
  const isActive = normalizedPath === `/${currentLocale}${item.path}`;
  const hasChildren = item.children && item.children.length > 0;

  /* -------------------------------------------------------------- */
  /* Early-exit for divider                                         */
  /* -------------------------------------------------------------- */
  if (item.label === "divider") return <Divider key={item.id} />;

  /* -------------------------------------------------------------- */
  /* Locale toggle                                                  */
  /* -------------------------------------------------------------- */
  if (item.isLocaleToggle) {
    const localeText = isRtl ? "English" : "العربية";

    return (
      <div
        className={`${buttonBaseClass} cursor-pointer`}
        onClick={toggleLocale}
      >
        <IconBox sidebarOpen={sidebarOpen} tooltip={localeText} isRtl={isRtl}>
          <item.icon className="w-5 h-5" />
        </IconBox>

        {sidebarOpen && <span className={labelClass}>{localeText}</span>}
      </div>
    );
  }

  /* -------------------------------------------------------------- */
  /* Parent item with children                                      */
  /* -------------------------------------------------------------- */
  if (hasChildren) {
    /* child indentation: RTL → pr-10 | LTR → pl-10 when sidebar open.
       collapsed sidebar → no extra spacing (fixes X-scroll issue). */
    const childIndentClass = sidebarOpen && (isRtl ? "pr-10" : "pl-10");

    return (
      <>
        {/* Parent row -------------------------------------------- */}
        <div
          className={`
            ${buttonBaseClass} justify-between cursor-pointer
            ${isActive ? "bg-info-dark text-white" : ""}
          `}
          onClick={() => toggleSubmenu(item.id)}
        >
          <div className="flex items-center gap-3">
            <IconBox
              sidebarOpen={sidebarOpen}
              tooltip={t(item.label)}
              isRtl={isRtl}
            >
              <item.icon className="w-5 h-5" />
            </IconBox>

            {sidebarOpen && <span className={labelClass}>{t(item.label)}</span>}
          </div>

          {sidebarOpen &&
            (submenuOpen === item.id ? (
              <FaChevronUp className="w-4 h-4 shrink-0" />
            ) : (
              <FaChevronDown className="w-4 h-4 shrink-0" />
            ))}
        </div>

        {/* Children list ---------------------------------------- */}
        {submenuOpen === item.id && (
          <div className="flex flex-col">
            {item.children!.map((child) => {
            const childActive =
              normalizedPath === `/${currentLocale}${child.path}`;

              return (
                <Link
                  key={child.id}
                  href={`/${currentLocale}${child.path}`}
                  className={`
                    ${buttonBaseClass}
                    ${childIndentClass ? childIndentClass : ""}
                    ${childActive ? "bg-info-dark text-white" : ""}
                  `}
                  onClick={() =>
                    setHeaderInfo({ label: child.label, icon: <child.icon /> })
                  }
                >
                  <IconBox
                    sidebarOpen={sidebarOpen}
                    tooltip={t(child.label)}
                    isRtl={isRtl}
                  >
                    <child.icon className="w-5 h-5" />
                  </IconBox>

                  {sidebarOpen && (
                    <span className={labelClass}>{t(child.label)}</span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </>
    );
  }

  /* -------------------------------------------------------------- */
  /* Simple link (no children)                                      */
  /* -------------------------------------------------------------- */
  return (
    <Link
      href={`/${currentLocale}${item.path}`}
      className={`
        ${buttonBaseClass}
        ${isActive ? "bg-info-dark text-white" : ""}
      `}
      onClick={() => setHeaderInfo({ label: item.label, icon: <item.icon /> })}
    >
      <IconBox sidebarOpen={sidebarOpen} tooltip={t(item.label)} isRtl={isRtl}>
        <item.icon className="w-5 h-5" />
      </IconBox>

      {sidebarOpen && <span className={labelClass}>{t(item.label)}</span>}
    </Link>
  );
};

export default LinkItem;
