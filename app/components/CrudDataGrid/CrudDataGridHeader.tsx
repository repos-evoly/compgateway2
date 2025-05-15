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
      className={`flex items-center ${
        !childrens ? "justify-between" : "gap-4 h-max"
      } bg-info-dark p-2 h-16 rounded rounded-b-none`}
    >
      <div className="flex items-center gap-4 h-full">
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

      {childrens && childrens}
    </div>
  );
};

export default CrudDataGridHeader;
