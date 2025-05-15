"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";

import ForeignTransfersForm, {
  ForeignTransfersFormValues,
} from "./components/ForeignTransfersForm";

export default function ForeignTransfersListPage() {
  const t = useTranslations("foreignTransfers");

  // 1) Local dummy data with full fields
  const [data, setData] = useState<ForeignTransfersFormValues[]>([
    {
      id: 1,
      toBank: "Bank A",
      branch: "Main Branch",
      residentSupplierName: "John Supplier",
      residentSupplierNationality: "Libyan",
      nonResidentSupplierPassportNumber: 9876543,
      placeOfIssue: "Tripoli",
      dateOfIssue: "2023-08-01",
      nonResidentSupplierNationality: "Egyptian",
      nonResidentAddress: "Cairo Street",

      transferAmount: 10000,
      toCountry: "Egypt",
      beneficiaryName: "Ali Person",
      beneficiaryAddress: "Somewhere in Cairo",
      externalBankName: "Cairo Bank",
      externalBankAddress: "Cairo Main St",
      transferToAccountNumber: 123456789,
      transferToAddress: "Same as above",
      accountholderName: "Ali Person",
      permenantAddress: "Permanent Street 1",
      purposeOfTransfer: "Business Payment",
    },
    {
      id: 2,
      toBank: "Bank B",
      branch: "Downtown",
      residentSupplierName: "Alice Supplier",
      residentSupplierNationality: "Libyan",
      nonResidentSupplierPassportNumber: 1234567,
      placeOfIssue: "Benghazi",
      dateOfIssue: "2023-07-15",
      nonResidentSupplierNationality: "Tunisian",
      nonResidentAddress: "Tunis City",

      transferAmount: 5000,
      toCountry: "Tunisia",
      beneficiaryName: "Tunis Person",
      beneficiaryAddress: "Tunis Street",
      externalBankName: "Tunis Bank",
      externalBankAddress: "Tunis Av",
      transferToAccountNumber: 987654321,
      transferToAddress: "Another place",
      accountholderName: "Tunis Person",
      permenantAddress: "Permanent Street 2",
      purposeOfTransfer: "Personal Payment",
    },
  ]);

  // 2) We transform or pass entire data so double-click has all fields
  //    If some fields can be undefined, convert them to null so CrudDataGrid won't complain
  const gridData = data.map((item) => ({
    ...item,
    // The columns we want to display in the grid
    branch: item.branch,
    toBank: item.toBank,
    transferAmount: item.transferAmount,
  }));

  // 3) Grid columns
  const columns = [
    { key: "branch", label: t("branch") },
    { key: "toBank", label: t("toBank") },
    { key: "transferAmount", label: t("transferAmount") },
  ];

  // local "Add" toggle
  const [showForm, setShowForm] = useState(false);

  // On wizard submit => add new row
  function handleFormSubmit(values: ForeignTransfersFormValues) {
    console.log("ForeignTransfers Add =>", values);
    // Assign a new ID
    const newId = data.length > 0 ? Math.max(...data.map((d) => d.id)) + 1 : 1;
    const newRow = { ...values, id: newId };
    setData((prev) => [...prev, newRow]);
    setShowForm(false);
  }



  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1;

  return (
    <div className="p-4">
      {showForm ? (
        <ForeignTransfersForm onSubmit={handleFormSubmit} />
      ) : (
        <CrudDataGrid
          data={gridData}
          columns={columns}
          showAddButton
          onAddClick={() => setShowForm(true)}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
