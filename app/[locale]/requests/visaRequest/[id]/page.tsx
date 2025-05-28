"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import { getVisaRequestById } from "../services";
import type { VisaRequestApiItem, VisaRequestFormValues } from "../types";
import VisaWizardForm from "../components/VisaRequest";

export default function SingleVisaRequestPage() {
  const { id } = useParams(); // e.g. "123"
  const numericId = Number(id);

  // We'll store the fetched single item in state
  const [requestData, setRequestData] = useState<VisaRequestApiItem | null>(
    null
  );

  // For demonstration, we'll show the form in read-only mode, so you can see
  // all fields disabled. If you want it always editable, set this to `false`.
  const [readOnly] = useState(true);

  // Fetch on mount (or if `id` changes)
  useEffect(() => {
    if (Number.isNaN(numericId)) return; // or handle invalid id
    getVisaRequestById(numericId)
      .then((data) => {
        setRequestData(data);
      })
      .catch((err) => {
        console.error("Failed to fetch single visa request:", err);
      });
  }, [numericId]);

  if (!requestData) {
    return <div>Loading...</div>;
  }

  // Convert the fetched item to the shape for our form
  const initialValues: VisaRequestFormValues = {
    branch: requestData.branch,
    date: requestData.date,
    accountHolderName: requestData.accountHolderName,
    accountNumber: requestData.accountNumber,
    nationalId: requestData.nationalId,
    phoneNumberLinkedToNationalId: requestData.phoneNumberLinkedToNationalId,
    cbl: requestData.cbl,
    cardMovementApproval: requestData.cardMovementApproval,
    cardUsingAcknowledgment: requestData.cardUsingAcknowledgment,
    foreignAmount: requestData.foreignAmount,
    localAmount: requestData.localAmount,
    pldedge: requestData.pldedge,
  };

  // If you want to handle "edit" logic, pass an onSubmit that calls update:
  function handleSubmit(vals: VisaRequestFormValues) {
    console.log("Submitted form with updated data => ", vals);
    // Potentially call an updateVisaRequest(numericId, vals) here...
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">
        Visa Request Details (ID: {numericId})
      </h1>

      {/* Pass readOnly to see disabled fields and modified wizard buttons */}
      <VisaWizardForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        readOnly={readOnly}
      />
    </div>
  );
}
