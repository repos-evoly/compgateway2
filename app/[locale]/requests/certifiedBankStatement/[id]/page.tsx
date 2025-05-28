"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import CertifiedBankStatementForm from "../components/CertifiedBankStatementForm";
import { getCertifiedBankStatementById } from "../services";
import type { CertifiedBankStatementRequestWithID } from "../types";

export default function CertifiedBankStatementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const rowId = parseInt(params.id as string, 10);

  const [rowData, setRowData] =
    useState<CertifiedBankStatementRequestWithID | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rowId) {
      setLoading(false);
      return;
    }
    async function fetchStatement() {
      try {
        const result = await getCertifiedBankStatementById(rowId);
        setRowData(result);
      } catch (error) {
        console.error("Failed to fetch statement by ID:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStatement();
  }, [rowId]);

  function handleSubmit(values: CertifiedBankStatementRequestWithID) {
    console.log(`Editing statement row #${rowId}`, values);
    alert("Certified Bank Statement updated (dummy)!");
    router.push("/requests/certifiedBankStatement");
  }

  if (loading) {
    return <div className="p-4">Loading statement data...</div>;
  }

  if (!rowData) {
    return (
      <div className="p-4">
        <h2>No record found for ID {rowId}!</h2>
      </div>
    );
  }

  // Pass readOnly => disables inputs & hides final submit
  return (
    <div className="p-4">
      <CertifiedBankStatementForm
        initialValues={rowData}
        onSubmit={handleSubmit}
        readOnly
      />
    </div>
  );
}
