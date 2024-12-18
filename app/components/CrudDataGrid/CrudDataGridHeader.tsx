import React from "react";
import AddButton from "./AddButton";
import SearchWithDropdown from "./SearchWithDropdown";
import { useTranslations } from "next-intl";

type CrudDataGridHeaderProps = {
  onSearch?: (value: string) => void; // Optional
  onDropdownSelect?: (value: string) => void; // Optional
  dropdownOptions?: string[]; // Optional
  showAddButton?: boolean;
  onAddClick?: () => void;
  showSearchBar?: boolean;
  haveChildrens?: boolean; // New prop to determine custom children rendering
  childrens?: React.ReactNode; // Optional custom children
};

const CrudDataGridHeader: React.FC<CrudDataGridHeaderProps> = ({
  onSearch,
  onDropdownSelect,
  dropdownOptions = [], // Default empty array
  showAddButton = true,
  onAddClick,
  showSearchBar = true,
  haveChildrens = false,
  childrens,
}) => {
  const t = useTranslations("crudDataGrid");

  if (haveChildrens && childrens) {
    return (
      <div className="flex items-center justify-between bg-info-dark p-2 h-16 rounded">
        {childrens}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between bg-info-dark p-2 h-16 rounded rounded-b-none">
      {showAddButton && onAddClick && (
        <AddButton onClick={onAddClick} label={t("addButton")} />
      )}
      {/* Conditional Search Bar */}
      {showSearchBar && onSearch && onDropdownSelect && (
        <SearchWithDropdown
          placeholder={t("searchPlaceholder")}
          dropdownOptions={dropdownOptions}
          onSearch={onSearch}
          onDropdownSelect={onDropdownSelect}
        />
      )}
    </div>
  );
};

export default CrudDataGridHeader;
