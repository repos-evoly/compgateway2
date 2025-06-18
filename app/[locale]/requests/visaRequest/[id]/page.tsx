// app/visarequests/[id]/page.tsx   ⇦ adjust the path if yours is different
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import { getVisaRequestById } from "../services";
import type { VisaRequestApiItem, VisaRequestFormValues } from "../types";
import VisaWizardForm from "../components/VisaRequest";

import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

export default function SingleVisaRequestPage() {
  const { id } = useParams(); // e.g. /visarequests/123  → id = "123"
  const numericId = Number(id);

  /*──────────────────────────── Data + UI state ───────────────────────────*/
  const [requestData, setRequestData] = useState<VisaRequestApiItem | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [readOnly] = useState(true); // render form in read-only mode

  /*──────────────────────────── Modal state ───────────────────────────────*/
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  /*──────────────────────────── Fetch single item ─────────────────────────*/
  useEffect(() => {
    if (Number.isNaN(numericId)) {
      setModalTitle("خطأ في الرابط");
      setModalMessage("المعرّف غير صالح.");
      setModalSuccess(false);
      setModalOpen(true);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await getVisaRequestById(numericId);
        setRequestData(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "حدث خطأ غير معروف.";
        setModalTitle("فشل جلب الطلب");
        setModalMessage(msg);
        setModalSuccess(false);
        setModalOpen(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [numericId]);

  /*──────────────────────────── Modal handlers ────────────────────────────*/
  const closeModal = () => setModalOpen(false);
  const confirmModal = () => setModalOpen(false);

  /*──────────────────────────── Early states ──────────────────────────────*/
  if (loading) return <div className="p-4">Loading…</div>;
  if (!requestData) return null; // error already handled by modal

  /*──────────────────────────── Map API → form shape ─────────────────────*/
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

  /*──────────────────────────── Submit (edit) stub ───────────────────────*/
  const handleSubmit = (vals: VisaRequestFormValues) => {
    console.log("Edit not implemented. Values:", vals);
  };

  /*──────────────────────────── Render ────────────────────────────────────*/
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">
        Visa Request Details — ID {numericId}
      </h1>

      <VisaWizardForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        readOnly={readOnly}
      />

      {/*──────── Error / Success Modal ────────*/}
      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
        onClose={closeModal}
        onConfirm={confirmModal}
      />
    </div>
  );
}
