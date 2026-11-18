"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import OnePayForm from "../components/OnePayForm";
import type { OnePayTransfer } from "../types";

export default function AddOnePayTransferPage() {
  const t = useTranslations("onePayTransfer");
  const locale = useLocale();
  const router = useRouter();
  const [createdTransfer, setCreatedTransfer] =
    useState<OnePayTransfer | null>(null);

  const returnToList = () => {
    setCreatedTransfer(null);
    router.push(`/${locale}/transfers/onepay`);
  };

  return (
    <div className="p-2 sm:p-4">
      <OnePayForm onCreated={setCreatedTransfer} />

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
