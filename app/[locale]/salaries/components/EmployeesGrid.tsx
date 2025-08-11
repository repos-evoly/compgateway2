"use client";

import React, { JSX } from "react";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import type { DataGridColumn, T } from "@/types";

export type EmployeesGridProps = {
  mode: "view" | "edit";
  /** Accept anything; we’ll cast internally for CrudDataGrid’s T[] */
  rows: unknown[];
  columns: DataGridColumn[]; // if your codebase uses DataGridColumn<T>[], that’s fine too
  loading?: boolean;
  /** Rendered in the grid header (CrudDataGridHeader -> childrens) */
  actions?: React.ReactNode;
};

export default function EmployeesGrid({
  rows,
  columns,
  loading = false,
  actions,
}: EmployeesGridProps): JSX.Element {
  return (
    <CrudDataGrid
      data={rows as T[]} // <— cast here to satisfy CrudDataGridProps
      columns={columns}
      showActions={false}
      showSearchBar={false}
      showAddButton={false}
      haveChildrens={Boolean(actions)}
      childrens={actions}
      noPagination
      currentPage={1}
      totalPages={1}
      onPageChange={() => {}}
      canEdit={false}
      loading={loading}
    />
  );
}
