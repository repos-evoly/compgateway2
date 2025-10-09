"use client";

import React from "react";
import AddButton from "./AddButton";
import SearchWithDropdown from "./SearchWithDropdown";
import { useTranslations } from "next-intl";
import type { CrudDataGridHeaderProps } from "@/types";

const CrudDataGridHeader: React.FC<CrudDataGridHeaderProps> = ({
  onSearch,
  onDropdownSelect,
  dropdownOptions = [],
  showAddButton = true,
  addButtonLabel,
  onAddClick,
  showSearchBar = true,
  childrens,
  showDropdown,
  showSearchInput,
}) => {
  const t = useTranslations("crudDataGrid");

  // Fallback no-op functions
  const safeOnSearch = showSearchInput && onSearch ? onSearch : () => {};
  const safeOnDropdownSelect =
    showDropdown && onDropdownSelect ? onDropdownSelect : () => {};

  const finalAddLabel = addButtonLabel ?? t("addButton");

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center ${
        !childrens ? "sm:justify-between" : "sm:gap-4"
      } bg-info-dark p-3 sm:p-4 rounded rounded-b-none`}
    >
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
        {showAddButton && onAddClick && (
          <AddButton onClick={onAddClick} label={finalAddLabel} />
        )}

        {showSearchBar && (
          <SearchWithDropdown
            placeholder={t("searchPlaceholder")}
            dropdownOptions={showDropdown ? dropdownOptions : []}
            onSearch={safeOnSearch}
            onDropdownSelect={safeOnDropdownSelect}
            showSearchInput={showSearchInput}
            showDropdown={showDropdown}
          />
        )}
      </div>

      {childrens && <div className="w-full sm:w-auto">{childrens}</div>}
    </div>
  );
};

export default CrudDataGridHeader;
