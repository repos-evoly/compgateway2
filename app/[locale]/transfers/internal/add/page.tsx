"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import InternalForm from "../components/InternalForm";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

const AddInternalTransferPage = () => {
  /* -------------------------------------------------------- */
  /*                     Translations                         */
  /* -------------------------------------------------------- */
  const t = useTranslations("internalTransferForm");

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
  const handleTransferCreated = () => {
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
      {/* Internal form in “create” mode (empty initialData) */}
      <InternalForm initialData={{}} onSuccess={handleTransferCreated} />

      {/* Success modal */}
      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess
        title={modalTitle}
        message={modalMessage}
        onClose={() => {
          setModalOpen(false);
          router.push(".."); // ← back to /internalTransfer
        }}
        onConfirm={() => {
          setModalOpen(false);
          router.push("..");
        }}
      />
    </div>
  );
};

export default AddInternalTransferPage;
