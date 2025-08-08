"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import CheckbookForm from "../components/CheckbookForm";
import { TCheckbookValues, TCheckbookFormValues } from "../types";
import { getCheckbookRequestById, updateCheckBookById } from "../services";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import LoadingPage from "@/app/components/reusable/Loading";

/**
 * Detail/Edit page for a single checkbook request.
 * When accessed by /checkbook/[id], we show the record in read-only mode or editable mode.
 */
const CheckbookDetailPage: React.FC = () => {
  const t = useTranslations("checkForm");
  const { id } = useParams(); // The ID in the URL: /checkbook/123
  const router = useRouter();

  // Local state for the fetched record
  const [checkbookData, setCheckbookData] = useState<TCheckbookValues | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
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
        setModalSuccess(false);
        setModalOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchById();
  }, [id, t]);

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
    representativeId: checkbookData.representativeId ?? "",
    branch: checkbookData.branch ?? "",
    date: checkbookData.date ?? "",
    bookContaining: checkbookData.bookContaining ?? "",
    status: checkbookData.status ?? "",
    reason: checkbookData.reason ?? "",
  };

  // Handle form submission for updates
  const handleFormSubmit = async (updatedItem: TCheckbookFormValues) => {
    if (isSubmitting || !id) return;

    setIsSubmitting(true);

    try {
      const result = await updateCheckBookById(id.toString(), updatedItem);

      // Update local state with the returned data
      setCheckbookData(result);

      setModalTitle(t("successTitle"));
      setModalMessage(
        t("updateSuccessMessage") || "Checkbook request updated successfully!"
      );
      setModalSuccess(true);
      setModalOpen(true);
    } catch (error) {
      const msg = error instanceof Error ? error.message : t("genericError");
      setModalTitle(t("errorTitle"));
      setModalMessage(msg);
      setModalSuccess(false);
      setModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    // Navigate back to the checkbook list
    router.push("/requests/checkbook");
  };

  const handleModalClose = () => {
    setModalOpen(false);

    // If it was a successful update, optionally redirect back to the list
    if (modalSuccess) {
      // You can uncomment this if you want to redirect after successful update
      // router.push("/requests/checkbook");
    }
  };

  const isReadOnly = checkbookData.status !== "Pending";

  return (
    <div className="p-4">
      <CheckbookForm
        initialData={initialValues}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        readOnly={isReadOnly}
        isSubmitting={isSubmitting}
      />
      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
        onConfirm={handleModalClose}
      />
    </div>
  );
};

export default CheckbookDetailPage;
