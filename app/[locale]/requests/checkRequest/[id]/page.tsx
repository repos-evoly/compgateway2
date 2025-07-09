"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import CheckRequestForm from "../components/CheckRequestForm";
import { getCheckRequestById, updateCheckRequestById } from "../services";
import { TCheckRequestValues, TCheckRequestFormValues } from "../types";
import ErrorOrSuccessModal from "@/app/auth/components/ErrorOrSuccessModal";
import LoadingPage from "@/app/components/reusable/Loading";

const CheckRequestDetailPage = () => {
  const { id } = useParams(); // /checkrequest/[id]
  const t = useTranslations("CheckRequest");
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [checkData, setCheckData] = useState<TCheckRequestValues | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalSuccess, setModalSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
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

    fetchData();
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

  // Convert the API shape -> form shape
  const initialFormValues: TCheckRequestFormValues = {
    branch: checkData.branch,
    branchNum: checkData.branchNum,
    /** Convert date string to a JS Date for the form */
    date: new Date(checkData.date),
    customerName: checkData.customerName,
    cardNum: checkData.cardNum,
    accountNum: checkData.accountNum,
    beneficiary: checkData.beneficiary,
    lineItems: checkData.lineItems.map((li) => ({
      dirham: li.dirham,
      lyd: li.lyd,
    })),
    status: checkData.status,
  };

  // Handle form submission for updates
  const handleFormSubmit = async (updatedItem: TCheckRequestFormValues) => {
    if (isSubmitting || !id) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await updateCheckRequestById(id.toString(), updatedItem);
      
      // Update local state with the returned data
      setCheckData(result);
      
      setModalTitle(t("successTitle"));
      setModalMessage(t("updateSuccessMessage") || "Check request updated successfully!");
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
    // Navigate back to the check request list
    router.push("/requests/checkrequest");
  };

  const handleModalClose = () => {
    setModalOpen(false);
    
    // If it was a successful update, optionally redirect back to the list
    if (modalSuccess) {
      // You can uncomment this if you want to redirect after successful update
      // router.push("/requests/checkrequest");
    }
  };

  const isReadOnly = checkData.status !== "Pending";

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