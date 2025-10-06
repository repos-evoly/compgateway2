"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import CheckRequestForm from "../components/CheckRequestForm";
import { getCheckRequestById, updateCheckRequestById } from "../services";
import type { TCheckRequestValues, TCheckRequestFormValues } from "../types";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import LoadingPage from "@/app/components/reusable/Loading";

const CheckRequestDetailPage: React.FC = () => {
  const params = useParams<{ locale: string; id: string }>(); // /[locale]/requests/checkrequest/[id]
  const locale = params?.locale ?? "ar";
  const id = params?.id;
  const t = useTranslations("CheckRequest");
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [checkData, setCheckData] = useState<TCheckRequestValues | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalMessage, setModalMessage] = useState<string>("");
  const [modalSuccess, setModalSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async (): Promise<void> => {
      try {
        const item = await getCheckRequestById(id.toString());
        setCheckData(item);
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

    void fetchData();
  }, [id, t]);

  if (loading) {
    return <LoadingPage />;
  }

  if (!checkData) {
    return (
      <div className="p-4">
        <p className="text-red-500">{t("noItemFound")}</p>
      </div>
    );
  }

  // Convert API shape -> form shape (include phone and branchNum)
  const initialFormValues: TCheckRequestFormValues = {
    branch: checkData.branch,
    branchNum: checkData.branchNum ?? "",
    date: new Date(checkData.date), // form expects a real Date
    customerName: checkData.customerName,
    cardNum: checkData.cardNum,
    accountNum: checkData.accountNum,
    beneficiary: checkData.beneficiary,
    phone: checkData.phone ?? "", // REQUIRED in TCheckRequestFormValues
    representativeId: checkData.representativeId,
    lineItems: checkData.lineItems.map((li) => ({
      dirham: li.dirham,
      lyd: li.lyd,
    })),
    status: checkData.status,
    reason: checkData.reason || "",
  };

  // Handle form submission for updates
  const handleFormSubmit = async (
    updatedItem: TCheckRequestFormValues
  ): Promise<void> => {
    if (isSubmitting || !id) return;

    setIsSubmitting(true);

    try {
      const result = await updateCheckRequestById(id.toString(), updatedItem);

      // Update local state with the returned data
      setCheckData(result);

      setModalTitle(t("successTitle"));
      setModalMessage(
        t("updateSuccessMessage") || "Check request updated successfully!"
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

  const handleFormCancel = (): void => {
    router.push(`/${locale}/requests/checkrequest`);
  };

  const handleModalClose = (): void => {
    setModalOpen(false);
    if (modalSuccess) {
      // router.push("/requests/checkrequest");
    }
  };

  const isReadOnly: boolean = checkData.status !== "Pending";

  return (
    <div className="p-4">
      <CheckRequestForm
        initialValues={initialFormValues}
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

export default CheckRequestDetailPage;
