"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import RepresentativesForm from "../components/RepresentativesForm";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

export default function AddRepresentativePage() {
  const t = useTranslations("representatives");
  const router = useRouter();
  const locale = useLocale();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const handleFormSubmit = async (success: boolean, message: string) => {
    setModalOpen(true);
    setModalSuccess(success);
    setModalTitle(success ? t("successTitle") : t("errorTitle"));
    setModalMessage(message);

    if (success) {
      // Navigate back to representatives list after successful creation
      setTimeout(() => {
        router.push(`/${locale}/representatives`);
      }, 1500);
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/representatives`);
  };

  return (
    <div>
      <RepresentativesForm
        initialData={null}
        onSubmit={handleFormSubmit}
        onCancel={handleCancel}
      />

      <ErrorOrSuccessModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isSuccess={modalSuccess}
        title={modalTitle}
        message={modalMessage}
      />
    </div>
  );
}
