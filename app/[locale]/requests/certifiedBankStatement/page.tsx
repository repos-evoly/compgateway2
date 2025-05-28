"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import CrudDataGrid from "@/app/components/CrudDataGrid/CrudDataGrid";

import CertifiedBankStatementForm from "./components/CertifiedBankStatementForm";
import { getCertifiedBankStatements } from "./services";
import { CertifiedBankStatementRequestWithID } from "./types"; // <-- from single source

export default function CertifiedBankStatementPage() {
  const t = useTranslations("bankStatement");

  // State for data from API
  const [data, setData] = useState<CertifiedBankStatementRequestWithID[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // "Add" form toggle
  const [showForm, setShowForm] = useState(false);

  const limit = 10;

  // Fetch data on mount / currentPage change
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getCertifiedBankStatements({
          page: currentPage,
          limit,
        });
        // e.g. res => { data, page, limit, totalPages, ... }
        setData(res.data);
        setTotalPages(res.totalPages);
      } catch (error) {
        console.error("Failed to fetch certified bank statements:", error);
      }
    }
    fetchData();
  }, [currentPage]);

  // Grid columns => Add more fields
  // We'll display e.g. accountHolderName, accountNumber, authorizedOnTheAccountName,
  // plus some of statementRequest fields. Adapt as needed.
  const columns = [
    { key: "accountHolderName", label: t("accountHolderName") },
    { key: "accountNumber", label: t("accountNumber") },
    {
      key: "authorizedOnTheAccountName",
      label: t("authorizedOnTheAccountName"),
    },
    // For statementRequest, we can show e.g. "fromDate" or "toDate"
    {
      key: "statementRequest.fromDate",
      label: t("fromDate"),
    },
    {
      key: "statementRequest.toDate",
      label: t("toDate"),
    },
  ];

  function handleAddClick() {
    setShowForm(true);
  }

  // On wizard submit => local add (no POST yet)
  function handleFormSubmit(values: CertifiedBankStatementRequestWithID) {
    console.log("Submitted data =>", values);
    // Generate new ID, or handle it differently if your API sets ID
    const newId = data.length > 0 ? Math.max(...data.map((d) => d.id)) + 1 : 1;
    setData((prev) => [...prev, { ...values, id: newId }]);
    setShowForm(false);
  }

  return (
    <div className="p-6">
      {showForm ? (
        <CertifiedBankStatementForm onSubmit={handleFormSubmit} />
      ) : (
        <CrudDataGrid
          data={data}
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
