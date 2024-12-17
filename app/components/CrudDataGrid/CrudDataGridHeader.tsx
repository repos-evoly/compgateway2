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
};

const CrudDataGridHeader: React.FC<CrudDataGridHeaderProps> = ({
  onSearch,
  onDropdownSelect,
  dropdownOptions = [], // Default empty array
  showAddButton = true,
  onAddClick,
  showSearchBar = true,
}) => {
  const t = useTranslations("crudDataGrid");

  return (
    <div className="flex items-center justify-between bg-info-dark p-2 h-16 rounded">
      {/* Conditional Search Bar */}
      {showSearchBar && onSearch && onDropdownSelect && (
        <SearchWithDropdown
          placeholder={t("searchPlaceholder")}
          dropdownOptions={dropdownOptions}
          onSearch={onSearch}
          onDropdownSelect={onDropdownSelect}
        />
      )}

      {/* Add Button */}
      {showAddButton && onAddClick && (
        <AddButton onClick={onAddClick} label={t("addButton")} />
      )}
    </div>
  );
};

export default CrudDataGridHeader;
