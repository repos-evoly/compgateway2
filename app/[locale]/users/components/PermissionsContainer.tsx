"use client";

import type { ReactNode } from "react";
import { FiLock } from "react-icons/fi";
import type { CompanyPermissions } from "../types";

/* ---------- props ---------- */
type PermissionsContainerProps = {
  title: string;
  icon: ReactNode;
  /** permissions to render (already filtered if a search is active) */
  permissions: CompanyPermissions[];
  /** Formik values */
  values: Record<string, boolean>;
  /** Formik setFieldValue */
  setFieldValue: (field: string, value: unknown) => void;
  isArabic: boolean;
  /** map permission name → icon */
  iconMap: Record<string, ReactNode>;
  /** total permissions available in this group (used for counters) */
  totalCount: number;
  /** enabled permissions count for this group */
  enabledCount: number;
};

export default function PermissionsContainer({
  title,
  icon,
  permissions,
  values,
  setFieldValue,
  isArabic,
  iconMap,
  totalCount,
  enabledCount,
}: PermissionsContainerProps) {
  /* ---------- derived ---------- */
  const showTwoColumns = permissions.length > 5;

  /* ---------- classes ---------- */
  const rootClasses = `
    rounded-lg border border-gray-200 bg-white shadow-sm
    ${showTwoColumns ? "lg:col-span-2" : ""}
  `;

  const listClasses = showTwoColumns
    ? "grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto px-6 pt-4"
    : "h-full overflow-y-auto space-y-3 px-6 pt-4 pb-2";

  return (
    <div className={rootClasses.trim()}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-info-dark p-2 text-white">{icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">
              {totalCount} {isArabic ? "صلاحية" : "permissions"}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            enabledCount > 0
              ? "bg-info-main text-black"
              : "bg-info-main text-black"
          }`}
        >
          {enabledCount}/{totalCount}
        </span>
      </div>

      {/* Permissions list */}
      <div className={listClasses}>
        {permissions.map((perm, idx) => {
          const titleText = isArabic ? perm.nameAr : perm.nameEn;
          const checked = values[`perm_${perm.id}`];

          return (
            <div key={perm.id}>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  id={`perm_${perm.id}`}
                  checked={checked}
                  onChange={(e) =>
                    setFieldValue(`perm_${perm.id}`, e.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                />
                <div className="flex flex-1 items-center gap-2">
                  <div className="text-gray-500">
                    {iconMap[perm.nameEn] ?? <FiLock className="h-4 w-4" />}
                  </div>
                  <label
                    htmlFor={`perm_${perm.id}`}
                    className={`flex-1 cursor-pointer text-sm font-medium ${
                      checked ? "text-gray-900" : "text-gray-700"
                    }`}
                  >
                    {titleText}
                  </label>
                </div>
              </div>
              {/* keep divider only in single-column mode */}
              {!showTwoColumns && idx < permissions.length - 1 && (
                <hr className="mt-3 border-gray-200" />
              )}
            </div>
          );
        })}

        {permissions.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-500">
            {isArabic ? "لا توجد نتائج مطابقة" : "No matching permissions"}
          </p>
        )}
      </div>
    </div>
  );
}
