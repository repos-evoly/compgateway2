"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ForeignTransfersForm, {
  ForeignTransfersFormValues,
} from "../components/ForeignTransfersForm";

export default function ForeignTransfersDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const rowId = params.id; // e.g. "1" or "2"
  const encodedRow = searchParams.get("row");

  let rowData: ForeignTransfersFormValues | null = null;
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

  // On wizard final submit => do some logic => go back
  function handleSubmit(values: ForeignTransfersFormValues) {
    console.log(`Editing foreign transfer ID=${rowId}`, values);
    alert("Foreign transfer updated (dummy)!");
    router.push("/requests/foreignTransfers");
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        Editing Foreign Transfer #{rowId}
      </h2>

      <ForeignTransfersForm initialValues={rowData} onSubmit={handleSubmit} />
    </div>
  );
}
