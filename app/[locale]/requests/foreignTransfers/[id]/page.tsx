"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

import { getForeignTransferById } from "../services";
import type {
  ForeignTransfersFormValues,
  ForeignTransferDetailResponse,
} from "../types";
import ForeignTransfersForm from "../components/ForeignTransfersForm";
import LoadingPage from "@/app/components/reusable/Loading";

/**
 * A page to display/edit a single foreign transfer by ID.
 */
export default function ForeignTransfersDetailPage() {
  const { id } = useParams() || {};
  const router = useRouter();
  const t = useTranslations("foreignTransfers");

  const [initialValues, setInitialValues] =
    useState<ForeignTransfersFormValues | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Define the fetch logic inline
    (async function fetchDetail() {
      try {
        setLoading(true);
        setError(null);

        const data: ForeignTransferDetailResponse =
          await getForeignTransferById(String(id));

        // Map API fields to your form shape
        const formData: ForeignTransfersFormValues = {
          // example fields
          toBank: data.toBank,
          branch: data.branch,
          // ... etc.
        };

        setInitialValues(formData);
      } catch (err) {
        console.error("Failed to fetch foreign transfer detail:", err);
        const msg = err instanceof Error ? err.message : t("fetchDetailError");
        setError(msg);
        setModalOpen(true); // ← open modal
      } finally {
        setLoading(false);
      }
    })();
  }, [id, t]); // 'id' and 't' are used inside the effect

  function handleSubmit(updatedValues: ForeignTransfersFormValues) {
    console.log("Submitting updated foreign transfer =>", updatedValues);
    // Example: you might do a PUT request to update. Right now we just log and navigate back
    router.back();
  }

  if (loading) {
    return <LoadingPage />;
  }
  if (error) {
    return (
      <div className="p-4 text-red-600">
        {t("error")} {error}
      </div>
    );
  }
  if (!initialValues) {
    return null; // or a skeleton if needed
  }

  return (
    <div className="p-4">
      {/* The same form you use for "add," pre-filled with initialValues */}
      <ForeignTransfersForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        readOnly
      />
      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess={false}
        title={t("error")}
        message={error ?? t("fetchDetailError")}
        onClose={() => setModalOpen(false)}
        onConfirm={() => {
          setModalOpen(false);
        }}
      />
    </div>
  );
}
