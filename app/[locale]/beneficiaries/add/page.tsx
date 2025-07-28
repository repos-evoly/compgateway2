"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import BeneficiaryForm from "../components/BeneficiaryForm";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

const AddBeneficiaryPage = () => {
  /* -------------------------------------------------------- */
  /*                     Translations                         */
  /* -------------------------------------------------------- */
  const t = useTranslations("beneficiaries");

  /* -------------------------------------------------------- */
  /*                       Router                             */
  /* -------------------------------------------------------- */
  const router = useRouter();

  /* -------------------------------------------------------- */
  /*                        Modals                            */
  /* -------------------------------------------------------- */
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalMessage, setModalMessage] = useState<string>("");

  /* -------------------------------------------------------- */
  /*                Handler – after successful save           */
  /* -------------------------------------------------------- */
  const handleBeneficiaryCreated = () => {
    /**
     * Show a one-shot success dialog, then push back
     * to the list after the user closes it.
     */
    setModalTitle(t("createSuccessTitle"));
    setModalMessage(t("createSuccessMsg"));
    setModalOpen(true);
  };

  /* -------------------------------------------------------- */
  /*                       Render                             */
  /* -------------------------------------------------------- */
  return (
    <div className="bg-white rounded p-2">
      {/* Beneficiary form in "create" mode (empty initialData) */}
      <BeneficiaryForm initialData={{}} onSuccess={handleBeneficiaryCreated} />

      {/* Success modal */}
      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess
        title={modalTitle}
        message={modalMessage}
        onClose={() => {
          setModalOpen(false);
          router.push(".."); // ← back to /beneficiaries
        }}
        onConfirm={() => {
          setModalOpen(false);
          router.push("..");
        }}
      />
    </div>
  );
};

export default AddBeneficiaryPage; 