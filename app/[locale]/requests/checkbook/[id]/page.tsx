"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import CheckbookForm from "../components/CheckbookForm";
import { TCheckbookValues, TCheckbookFormValues } from "../types";
import { getCheckbookRequestById } from "../services";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import LoadingPage from "@/app/components/reusable/Loading";

/**
 * Detail/Edit page for a single checkbook request.
 * When accessed by /checkbook/[id], we show the record in read-only mode.
 */
const CheckbookDetailPage: React.FC = () => {
  const t = useTranslations("checkForm");
  const { id } = useParams(); // The ID in the URL: /checkbook/123

  // Local state for the fetched record
  const [checkbookData, setCheckbookData] = useState<TCheckbookValues | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // Fetch the checkbook request by ID on mount
  useEffect(() => {
    const fetchById = async () => {
      try {
        if (!id) return;
        const result = await getCheckbookRequestById(id.toString());
        setCheckbookData(result);
      } catch (error) {
        const msg = error instanceof Error ? error.message : t("genericError");
        setModalTitle(t("errorTitle"));
        setModalMessage(msg);
        setModalOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchById();
  }, [id, t]); // ← added t

  // We'll show a loading indicator if data is not yet fetched
  if (loading) {
    return <LoadingPage />;
  }

  // If there's an error or no data
  if (!checkbookData) {
    return (
      <div className="p-4">
        <p className="text-red-500">{t("noItemFound")}</p>
      </div>
    );
  }

  // Convert our TCheckbookValues into TCheckbookFormValues
  // (the form expects only certain fields)
  const initialValues: TCheckbookFormValues = {
    fullName: checkbookData.fullName ?? "",
    address: checkbookData.address ?? "",
    accountNumber: checkbookData.accountNumber ?? "",
    pleaseSend: checkbookData.pleaseSend ?? "",
    branch: checkbookData.branch ?? "",
    date: checkbookData.date ?? "",
    bookContaining: checkbookData.bookContaining ?? "",
    status: checkbookData.status ?? "",
  };

  // For demonstration, do nothing special on form submit/cancel.
  const handleFormSubmit = (updatedItem: TCheckbookFormValues) => {
    console.log("Submitted updated item:", updatedItem);
  };

  const handleFormCancel = () => {
    console.log("Cancelled form");
  };

  return (
    <div className="p-4">
      <CheckbookForm
        initialData={initialValues}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        readOnly={true} // <---- Make the form read-only
      />
      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={false}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
        onConfirm={() => {
          setModalOpen(false);
        }}
      />
    </div>
  );
};

export default CheckbookDetailPage;
