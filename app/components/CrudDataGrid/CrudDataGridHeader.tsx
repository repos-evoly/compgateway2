import React, { ReactNode } from "react";
import AddButton from "./AddButton";
import SearchWithDropdown from "./SearchWithDropdown";
import { useTranslations } from "next-intl";

type CrudDataGridHeaderProps = {
  children?: ReactNode; // Optional children for flexible content
  onSearch?: (value: string) => void; // Optional
  onDropdownSelect?: (value: string) => void; // Optional
  dropdownOptions?: string[]; // Optional
  showAddButton?: boolean;
  onAddClick?: () => void;
  showSearchBar?: boolean;
};

const CrudDataGridHeader: React.FC<CrudDataGridHeaderProps> = ({
  children,
  onSearch,
  onDropdownSelect,
  dropdownOptions = [],
  showAddButton = true,
  onAddClick,
  showSearchBar = true,
}) => {
  const t = useTranslations("crudDataGrid");

  return (
    <div className="flex items-center justify-between bg-info-dark p-2 h-16 rounded">
      {/* Flexible Children Section */}
      <div className="flex-1 flex justify-between items-center px-4">
        {children}
      </div>

      {/* Add Button */}
      {showAddButton && onAddClick && (
        <AddButton onClick={onAddClick} label={t("addButton")} />
      )}

      {/* Search Bar */}
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
