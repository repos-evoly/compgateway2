"use client";

import React from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import CheckbookForm, { TCheckbookValues } from "../components/CheckbookForm";

export default function CheckbookDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // The ID from the path (not strictly needed if we just want row data from "row" query)
  const rowId = params.id;

  // 1) Retrieve encoded row data from the query
  const rowEncoded = searchParams.get("row");
  let rowData: TCheckbookValues | null = null;

  if (rowEncoded) {
    try {
      rowData = JSON.parse(decodeURIComponent(rowEncoded));
    } catch (error) {
      console.error("Failed to parse row data from query:", error);
    }
  }

  // 2) If no row data, show an error
  if (!rowData) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">No Row Data</h2>
        <p>Could not decode any row data from the URL query.</p>
      </div>
    );
  }

  // 3) Handle form submit
  const handleSubmit = (values: TCheckbookValues) => {
    console.log("Saving row ID =", rowId, "with data=", values);
    alert("Data saved (in memory).");
    router.push("/checkbook");
  };

  const handleCancel = () => {
    router.push("/checkbook");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Editing Checkbook ID #{rowId}</h2>
      <CheckbookForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        initialData={rowData}
      />
    </div>
  );
}
