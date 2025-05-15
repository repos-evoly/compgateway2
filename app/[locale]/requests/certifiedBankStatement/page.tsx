"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";

import CertifiedBankStatementForm, {
  CertifiedBankStatementRequestWithID,
} from "./components/CertifiedBankStatementForm";

export default function CertifiedBankStatementPage() {
  const t = useTranslations("bankStatement");

  // 1) Local dummy data
  const [data, setData] = useState<CertifiedBankStatementRequestWithID[]>([
    {
      id: 1,
      accountHolderName: "John Doe",
      authorizedOnTheAccountName: "Jane Doe",
      accountNumber: 123456789,
      serviceRequests: {
        reactivateIdfaali: false,
        deactivateIdfaali: false,
        resetDigitalBankPassword: true,
        resendMobileBankingPin: false,
        changePhoneNumber: false,
      },
      oldAccountNumber: 111111,
      newAccountNumber: 222222,
      statementRequest: {
        currentAccountStatement: { arabic: true, english: false },
        visaAccountStatement: false,
        fromDate: "2023-08-01",
        toDate: "2023-08-15",
        accountStatement: false,
        journalMovement: false,
        nonFinancialCommitment: false,
      },
    },
    {
      id: 2,
      accountHolderName: "Alice Smith",
      authorizedOnTheAccountName: "Jack Smith",
      accountNumber: undefined,
      serviceRequests: {
        reactivateIdfaali: false,
        deactivateIdfaali: true,
        resetDigitalBankPassword: false,
        resendMobileBankingPin: false,
        changePhoneNumber: false,
      },
      oldAccountNumber: 333333,
      newAccountNumber: 444444,
      statementRequest: {
        currentAccountStatement: { arabic: false, english: true },
        visaAccountStatement: true,
        fromDate: "2023-09-01",
        toDate: "2023-09-10",
        accountStatement: true,
        journalMovement: true,
        nonFinancialCommitment: false,
      },
    },
  ]);

  // 2) Convert any `undefined` => `null` for CrudDataGrid
  const gridData = data.map((row) => ({
    ...row,
    // If some fields can be undefined, convert them:
    accountHolderName: row.accountHolderName ?? null,
    accountNumber: row.accountNumber ?? null,
  }));

  // 3) Grid columns
  const columns = [
    { key: "accountHolderName", label: t("accountHolderName") },
    { key: "accountNumber", label: t("accountNumber") },
  ];

  // local "Add" form toggle
  const [showForm, setShowForm] = useState(false);

  function handleAddClick() {
    setShowForm(true);
  }

  // On wizard submit => add new row
  function handleFormSubmit(values: CertifiedBankStatementRequestWithID) {
    console.log("Submitted data =>", values);
    // generate new ID
    const newId = data.length > 0 ? Math.max(...data.map((d) => d.id)) + 1 : 1;
    const newRow = { ...values, id: newId };
    setData((prev) => [...prev, newRow]);
    setShowForm(false);
  }

  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1;

  return (
    <div className="p-6">
      {showForm ? (
        // Render the wizard with empty data => Add
        <CertifiedBankStatementForm onSubmit={handleFormSubmit} />
      ) : (
        <CrudDataGrid
          data={gridData}
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
