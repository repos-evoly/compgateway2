"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import CertifiedBankStatementForm from "../components/CertifiedBankStatementForm";
import { getCertifiedBankStatementById, updateCertifiedBankStatement } from "../services";
import type { CertifiedBankStatementRequestWithID, CertifiedBankStatementRequest } from "../types";
import LoadingPage from "@/app/components/reusable/Loading";

export default function CertifiedBankStatementDetailPage() {
  const router = useRouter();
  const params = useParams<{ locale: string; id: string }>();
  const locale = params?.locale ?? "ar";
  const rowId = parseInt((params?.id as string) ?? "", 10);

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

  async function handleSubmit(values: CertifiedBankStatementRequestWithID) {
    try {
      // Remove the id field for the update payload
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...updatePayload } = values;
      await updateCertifiedBankStatement(rowId, updatePayload as CertifiedBankStatementRequest);

      alert("Certified Bank Statement updated successfully!");
      router.push(`/${locale}/requests/certifiedBankStatement`);
    } catch (error) {
      console.error("Failed to update statement:", error);
      alert("Failed to update Certified Bank Statement!");
    }
  }

  if (loading) {
    return <LoadingPage />;
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
        readOnly={rowData.status === undefined ? false : rowData.status === "pending"}
      />
    </div>
  );
}
