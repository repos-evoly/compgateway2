/* ──────────────────────────────────────────────────────────────── */
/* SidebarSkeleton.tsx                                             */
/* ----------------------------------------------------------------*/
/* Shimmer skeleton that fills the entire sidebar:                  */
/* • Taller placeholder rows (≈48 px)                               */
/* • More rows (30) + divider breaks                                */
/* • Works for both expanded/collapsed desktop and mobile drawer    */
/* ----------------------------------------------------------------*/

import { FaBars } from "react-icons/fa";

type Props = {
  sidebarOpen: boolean;
  mobileView: boolean;
  mobileMenuOpen: boolean;
  isRtl: boolean;
  toggleSidebar: () => void;
};

/* ---------- tiny helper components ----------------------------- */
const Bar = ({ w = "w-full" }: { w?: string }) => (
  <div
    className={`h-5 rounded bg-gray-500/40 ${w} animate-pulse`} /* taller row */
  />
);

const IconDot = () => (
  <div className="h-5 w-5 rounded bg-gray-500/40 animate-pulse flex-shrink-0" />
);

const DividerLine = () => <div className="h-px bg-gray-600 my-3" />;

/* ---------- Skeleton ------------------------------------------- */
export default function SidebarSkeleton({
  sidebarOpen,
  mobileView,
  mobileMenuOpen,
  isRtl,
  toggleSidebar,
}: Props) {
  /* ----- desktop layout --------------------------------------- */
  const desktop = (
    <div
      className={`
        bg-secondary-dark text-white min-h-screen lg:h-screen
        flex-shrink-0 flex flex-col
        transition-all
        ${sidebarOpen ? "w-64" : "w-16"}
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-4 p-4">
        <button onClick={toggleSidebar}>
          <FaBars className="w-6 h-6 text-gray-400" />
        </button>
        {sidebarOpen && <Bar w="w-40" />}
      </div>
      <DividerLine />

      {/* Placeholder rows */}
      <nav className="flex-1 overflow-hidden px-4">
        <ul className="space-y-4">
          {Array.from({ length: 30 }).map((_, idx) => (
            <li key={idx}>
              {idx === 7 || idx === 15 || idx === 23 ? ( // divider breaks
                <DividerLine />
              ) : sidebarOpen ? (
                <div className="flex items-center gap-4">
                  <IconDot />
                  <Bar w="w-36" />
                </div>
              ) : (
                <IconDot />
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );

  /* ----- mobile (drawer) layout ------------------------------- */
  const mobile = (
    <div
      className={`
        fixed inset-y-0 z-40 w-64 bg-secondary-dark text-white
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
        flex flex-col
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-4 p-4 mt-6">
        <Bar w="w-40" />
      </div>
      <DividerLine />

      {/* Placeholder rows */}
      <nav className="flex-1 overflow-hidden px-4">
        <ul className="space-y-4">
          {Array.from({ length: 30 }).map((_, idx) => (
            <li key={idx}>
              {idx === 7 || idx === 15 || idx === 23 ? (
                <DividerLine />
              ) : (
                <div className="flex items-center gap-4">
                  <IconDot />
                  <Bar w="w-40" />
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );

  return mobileView ? mobile : desktop;
}
