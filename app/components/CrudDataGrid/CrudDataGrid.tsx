"use client";
import React, { useState } from "react";
import CrudDataGridHeader from "./CrudDataGridHeader";
import CrudDataGridBody from "./CrudDataGridBody";

type Action = { name: string; icon: React.ReactNode; tip: string };

type BaseProps = {
  data: { [key: string]: string | number | boolean }[];
  columns: { key: string; label: string }[];
  showSearchBar?: boolean;
  showActions?: boolean;
  showAddButton?: boolean;
  haveChildrens?: boolean;
  childrens?: React.ReactNode;
  isModal?: boolean;
  modalComponent?: React.ReactNode;
  isComponent?: boolean;
  componentToRender?: React.ReactNode;
};

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

type ActionsProps =
  | {
      showActions: true;
      actions: Action[];
    }
  | {
      showActions?: false;
      actions?: never;
    };

type AddButtonProps =
  | {
      showAddButton: true;
      onAddClick: () => void;
    }
  | {
      showAddButton?: false;
      onAddClick?: never;
    };

type CrudDataGridProps = BaseProps &
  SearchBarProps &
  ActionsProps &
  AddButtonProps & {
    isModal?: boolean;
    modalComponent?: React.ReactNode;
    onModalOpen?: (
      rowIndex: number,
      row: { [key: string]: string | number | boolean }
    ) => void;
    isComponent?: boolean;
    componentToRender?: React.ReactNode;
    onComponentRender?: (
      rowIndex: number,
      row: { [key: string]: string | number | boolean }
    ) => void;
  };

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
  haveChildrens = false,
  childrens,
  isModal,
  modalComponent,
  onModalOpen,
  isComponent,
  componentToRender,
  onComponentRender,
}) => {
  const [activeRow, setActiveRow] = useState<number | null>(null);

  const handleActionClick = (rowIndex: number, action: string) => {
    console.log(`Action '${action}' clicked for row ${rowIndex}`);
  };

  const handleModalOpen = (
    rowIndex: number,
    row: { [key: string]: string | number | boolean }
  ) => {
    setActiveRow(rowIndex);
    if (onModalOpen) onModalOpen(rowIndex, row);
  };

  const handleComponentRender = (
    rowIndex: number,
    row: { [key: string]: string | number | boolean }
  ) => {
    setActiveRow(rowIndex);
    if (onComponentRender) onComponentRender(rowIndex, row);
  };

  return (
    <div className="border border-gray-300 rounded-md shadow-sm overflow-hidden">
      {/* Debugging activeRow */}
      {activeRow !== null && (
        <div className="bg-yellow-100 text-yellow-900 p-2">
          Active Row Index: {activeRow}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        <CrudDataGridHeader
          onSearch={onSearch}
          onDropdownSelect={onDropdownSelect}
          dropdownOptions={dropdownOptions}
          showAddButton={showAddButton}
          onAddClick={onAddClick}
          showSearchBar={showSearchBar}
          haveChildrens={haveChildrens}
          childrens={childrens}
        />
      </div>

      {/* Body */}
      <div className="bg-white">
        <CrudDataGridBody
          columns={columns}
          data={data}
          showActions={showActions}
          actions={actions}
          onActionClick={handleActionClick}
          isModal={isModal}
          modalComponent={modalComponent}
          onModalOpen={handleModalOpen}
          isComponent={isComponent}
          componentToRender={componentToRender}
          onComponentRender={handleComponentRender}
        />
      </div>
    </div>
  );
};

export default CrudDataGrid;
