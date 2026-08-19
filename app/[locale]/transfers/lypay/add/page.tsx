"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import LyPayForm from "../components/LyPayForm";
import type { LyPayTransfer } from "../types";

export default function AddLyPayTransferPage() {
  const t = useTranslations("lyPayTransfer");
  const locale = useLocale();
  const router = useRouter();
  const [createdTransfer, setCreatedTransfer] =
    useState<LyPayTransfer | null>(null);

  const returnToList = () => {
    setCreatedTransfer(null);
    router.push(`/${locale}/transfers/lypay`);
  };

  return (
    <div className="p-2 sm:p-4">
      <LyPayForm onCreated={setCreatedTransfer} />

      <ErrorOrSuccessModal
        isOpen={createdTransfer !== null}
        isSuccess
        title={t("messages.createdTitle")}
        message={t("messages.createdMessage", {
          reference: createdTransfer?.referenceNo ?? "",
        })}
        onClose={returnToList}
        onConfirm={returnToList}
        okLabel={t("common.ok")}
        confirmLabel={t("common.confirm")}
        closeAriaLabel={t("common.close")}
      />
    </div>
  );
}
