"use client";

import React from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import VisaWizardForm, {
  VisaRequestFormValues,
} from "../components/VisaRequest";

export default function VisaRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // e.g. "1" or "2"
  const rowId = params.id;
  const encodedRow = searchParams.get("row");

  let rowData: VisaRequestFormValues | null = null;
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

  // Final submit => just log or do an API call, then navigate back
  function handleSubmit(values: VisaRequestFormValues) {
    console.log(`Editing Visa row #${rowId}`, values);
    alert("Visa request updated! (dummy example)");
    router.push("/requests/visarequest");
  }

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Editing Visa Request Row #{rowId}</h2>

      <VisaWizardForm initialValues={rowData} onSubmit={handleSubmit} />
    </div>
  );
}
