"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import CertifiedBankStatementForm, {
  CertifiedBankStatementRequestWithID,
} from "../components/CertifiedBankStatementForm";

export default function CertifiedBankStatementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // e.g. "1" or "2"
  const rowId = params.id;
  const encodedRow = searchParams.get("row");

  let rowData: CertifiedBankStatementRequestWithID | null = null;
  if (encodedRow) {
    try {
      rowData = JSON.parse(decodeURIComponent(encodedRow));
    } catch (err) {
      console.error("Failed to parse row data:", err);
    }
  }

  if (!rowData) {
    return (
      <div className="p-4">
        <h2>No row data found in query param!</h2>
      </div>
    );
  }

  function handleSubmit(values: CertifiedBankStatementRequestWithID) {
    console.log(`Editing statement row #${rowId}`, values);
    alert("Certified Bank Statement updated (dummy)!");
    router.push("/requests/certifiedBankStatement");
  }

  return (
    <div className="p-4">
      <CertifiedBankStatementForm
        initialValues={rowData}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
