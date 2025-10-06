"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

import GroupTransferForm from "../components/GroupTransferForm";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";

const AddGroupTransferPage = () => {
  /* -------------------------------------------------------- */
  /*                     Translations                         */
  /* -------------------------------------------------------- */
  const t = useTranslations("groupTransferForm");

  /* -------------------------------------------------------- */
  /*                       Router                             */
  /* -------------------------------------------------------- */
  const router = useRouter();
  const locale = useLocale();

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
      {/* Group transfer form in "create" mode (empty initialData) */}
      <GroupTransferForm initialData={{}} onSuccess={handleTransferCreated} />

      {/* Success modal */}
      <ErrorOrSuccessModal
        isOpen={modalOpen}
        isSuccess
        title={modalTitle}
        message={modalMessage}
        onClose={() => {
          setModalOpen(false);
          router.push(`/${locale}/transfers/group-transfer`);
        }}
        onConfirm={() => {
          setModalOpen(false);
          router.push(`/${locale}/transfers/group-transfer`);
        }}
      />
    </div>
  );
};

export default AddGroupTransferPage;
