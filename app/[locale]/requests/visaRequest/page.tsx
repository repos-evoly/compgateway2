"use client";

import React, { useState } from "react";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";
import { useTranslations } from "next-intl";

import VisaWizardForm, {
  VisaRequestFormValues,
} from "./components/VisaRequest";

export default function VisaRequestListPage() {
  const t = useTranslations("visaRequest");

  // 1) Dummy data with full fields, including id
  const [data, setData] = useState<VisaRequestFormValues[]>([
    {
      id: 1,
      branch: "Main Branch",
      date: "2023-09-01",
      accountHolderName: "John Doe",
      accountNumber: "ACC-1001",
      nationalId: 1234567890,
      phoneNumberLinkedToNationalId: "0912345678",
      cbl: "CBL123",
      cardMovementApproval: "Yes",
      cardUsingAcknowledgment: "Aware",
      foreignAmount: 2000,
      localAmount: 5000,
      pldedge: "Agreed",
    },
    {
      id: 2,
      branch: "Downtown",
      date: "2023-09-15",
      accountHolderName: "Alice Smith",
      accountNumber: "ACC-2002",
      nationalId: 9876543210,
      phoneNumberLinkedToNationalId: "0923456789",
      cbl: "CBL456",
      cardMovementApproval: "No",
      cardUsingAcknowledgment: "Yes",
      foreignAmount: 1000,
      localAmount: 3000,
      pldedge: "Signed",
    },
  ]);

  /**
   * 2) We transform each row to ensure no fields are `undefined`.
   *    If any field is `undefined`, we convert it to `null`.
   *    This keeps CrudDataGridProps<T> happy (T can't have `undefined`).
   */
  const gridData = data.map((item) => ({
    // Spread all
    ...item,
    // Convert any `undefined` => `null`. Examples:
    nationalId: item.nationalId ?? null,
    foreignAmount: item.foreignAmount ?? null,
    localAmount: item.localAmount ?? null,
    // Add or convert other fields if they can be undefined as well
  }));

  // 3) Columns for the grid
  const columns = [
    { key: "branch", label: t("branch") },
    { key: "date", label: t("date") },
    { key: "accountHolderName", label: t("accountHolderName") },
    { key: "accountNumber", label: t("accountNumber") },
  ];

  // Local "Add" form toggle
  const [showForm, setShowForm] = useState(false);

  // "Add" => open empty wizard
  const handleAddClick = () => {
    setShowForm(true);
  };

  // On wizard submit => add to local array
  const handleFormSubmit = (values: VisaRequestFormValues) => {
    console.log("Submitted data (ADD):", values);
    // Generate a new id
    const newId = data.length > 0 ? Math.max(...data.map((d) => d.id)) + 1 : 1;
    const newRow: VisaRequestFormValues = { ...values, id: newId };
    setData((prev) => [...prev, newRow]);
    setShowForm(false);
  };

  // Simple pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1;

  return (
    <div className="p-4">
      {showForm ? (
        // Render the multi-step wizard for "Add"
        <VisaWizardForm onSubmit={handleFormSubmit} />
      ) : (
        // Otherwise show the grid
        <CrudDataGrid
          data={gridData} // Now no `undefined` values
          columns={columns}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showAddButton
          onAddClick={handleAddClick}
        />
      )}
    </div>
  );
}
