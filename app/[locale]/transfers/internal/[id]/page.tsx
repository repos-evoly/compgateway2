"use client";

import React from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import InternalForm from "../components/InternalForm";
import { InternalFormValues } from "../types";

/**
 * The detail page: /transfers/internal/[id]
 * We do NOT import from data.ts here.
 * Instead, we parse the "row" query param.
 */
export default function InternalTransferDetailsPage() {
  const router = useRouter();
  const params = useParams(); // e.g. { id: "2" }
  const searchParams = useSearchParams(); // For query string

  const rowId = params.id; // The "id" portion of the path
  const rowParam = searchParams.get("row"); // The encoded JSON

  let rowData: InternalFormValues | null = null;
  if (rowParam) {
    try {
      rowData = JSON.parse(decodeURIComponent(rowParam));
    } catch (error) {
      console.error("Failed to parse row from query:", error);
    }
  }

  if (!rowData) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">No Row Data Provided</h2>
        <p>Could not find or parse row data in the URL query.</p>
      </div>
    );
  }

  // When the form is submitted, handle saving or just log
  const handleSubmit = (values: InternalFormValues) => {
    console.log("Edited row ID =", rowId, " => New Values:", values);
    alert("Row updated! (in your real app, do something else)");
    // Return to the list
    router.push("/transfers/internal");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Editing Transfer ID #{rowId}</h2>
      <InternalForm initialData={rowData} onSubmit={handleSubmit} />
    </div>
  );
}
