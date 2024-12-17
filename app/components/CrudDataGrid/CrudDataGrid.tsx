import React from "react";
import CrudDataGridHeader from "./CrudDataGridHeader";
import CrudDataGridBody from "./CrudDataGridBody";

type Action = { name: string; icon: React.ReactNode; tip: string };

// Base props
type BaseProps = {
  data: { [key: string]: string | number }[];
  columns: { key: string; label: string }[]; // Update: Columns now include key and label
  showSearchBar?: boolean;
  showActions?: boolean;
  showAddButton?: boolean;
};

// Conditional props for `showSearchBar`
type SearchBarProps =
  | {
      showSearchBar: true;
      onSearch: (value: string) => void;
      onDropdownSelect: (value: string) => void;
      dropdownOptions: string[];
    }
  | {
      showSearchBar?: false;
      onSearch?: never;
      onDropdownSelect?: never;
      dropdownOptions?: never;
    };

// Conditional props for `showActions`
type ActionsProps =
  | {
      showActions: true;
      actions: Action[];
    }
  | {
      showActions?: false;
      actions?: never;
    };

// Conditional props for `showAddButton`
type AddButtonProps =
  | {
      showAddButton: true;
      onAddClick: () => void;
    }
  | {
      showAddButton?: false;
      onAddClick?: never;
    };

// Combine all props
export type CrudDataGridProps = BaseProps &
  SearchBarProps &
  ActionsProps &
  AddButtonProps;

const CrudDataGrid: React.FC<CrudDataGridProps> = ({
  data,
  columns,
  showSearchBar = false,
  onSearch,
  onDropdownSelect,
  dropdownOptions = [],
  showActions = false,
  actions,
  showAddButton = false,
  onAddClick,
}) => {
  const handleActionClick = (rowIndex: number, action: string) => {
    console.log(`Action '${action}' clicked for row ${rowIndex}`);
  };

  return (
    <div className="border border-gray-300 rounded-md shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        <CrudDataGridHeader
          onSearch={onSearch}
          onDropdownSelect={onDropdownSelect}
          dropdownOptions={dropdownOptions}
          showAddButton={showAddButton}
          onAddClick={onAddClick}
          showSearchBar={showSearchBar}
        />
      </div>

      {/* Body */}
      <div className="bg-white">
        <CrudDataGridBody
          columns={columns} // Pass updated columns with keys and labels
          data={data}
          showActions={showActions}
          actions={actions}
          onActionClick={handleActionClick}
        />
      </div>
    </div>
  );
};

export default CrudDataGrid;
